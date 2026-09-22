// Generates (or returns the already-saved copy of) a user's first weekly
// plan. Flow: verify the caller's Supabase session -> read their own
// onboarding_responses row -> call OpenAI with strict Structured Outputs ->
// validate -> save plan + actions atomically via the create_weekly_plan()
// RPC -> return the saved plan. See AGENTS.md / SCREEN_SPECS.md section 6
// for the product rules this prompt encodes, and
// supabase/migrations/0002_weekly_plans.sql for the storage/security model.
//
// Auth uses @supabase/server's withSupabase({ auth: "user" }) - the
// current Supabase-recommended wrapper for Edge Functions that require a
// signed-in caller. It verifies the request's JWT itself (verify_jwt stays
// at its default of true) before this handler ever runs, and hands back
// ctx.supabase (RLS-scoped to that same user) and ctx.userClaims (the
// verified identity). There is no manual client bootstrap and no
// service-role/admin client involved in normal plan generation.
//
// The mobile app must never call OpenAI directly - this function is the
// only thing that holds the OPENAI_API_KEY.

import { withSupabase } from "npm:@supabase/server@^1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

import type { GeneratedWeeklyPlan, PlanAction, WeeklyPlan } from "../_shared/plan.ts";
import { buildUserPrompt, SYSTEM_PROMPT, type OnboardingContext } from "./prompt.ts";
import { generatePlanCompletion, MODEL, OpenAIRequestError, PROMPT_VERSION } from "./openai.ts";
import { PlanValidationError, validateGeneratedPlan } from "./validate.ts";

const FIRST_PLAN_NUMBER = 1;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(code: string, message: string, status: number): Response {
  return jsonResponse({ error: message, code }, status);
}

interface PlanWithActions {
  plan: WeeklyPlan;
  actions: PlanAction[];
}

async function loadPlanWithActions(
  supabaseClient: SupabaseClient,
  userId: string,
  planNumber: number
): Promise<PlanWithActions | null> {
  const { data: plan, error: planError } = await supabaseClient
    .from("weekly_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("plan_number", planNumber)
    .maybeSingle();

  if (planError) {
    throw new Error(`Failed to read weekly_plans: ${planError.message}`);
  }
  if (!plan) return null;

  const { data: actions, error: actionsError } = await supabaseClient
    .from("plan_actions")
    .select("*")
    .eq("plan_id", plan.id)
    .order("sort_order", { ascending: true });

  if (actionsError) {
    throw new Error(`Failed to read plan_actions: ${actionsError.message}`);
  }

  return { plan, actions: actions ?? [] };
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (req.method !== "POST") {
      return errorResponse("method_not_allowed", "Use POST", 405);
    }

    // withSupabase({ auth: "user" }) has already verified the request's JWT
    // by the time this handler runs. ctx.supabase is scoped to that same
    // user (RLS applies to every query below, and auth.uid() inside
    // create_weekly_plan() resolves to this same id) - never a
    // service-role/admin client. The null check is defensive only; in
    // "user" mode ctx.userClaims is expected to always be populated.
    const supabaseClient: SupabaseClient = ctx.supabase;
    const userId = ctx.userClaims?.id;
    if (!userId) {
      return errorResponse("unauthenticated", "Invalid or expired session", 401);
    }

    // 1. If a first plan already exists, this request is a retry/duplicate -
    // return the saved plan rather than generating (and charging for) another.
    let existing: PlanWithActions | null;
    try {
      existing = await loadPlanWithActions(supabaseClient, userId, FIRST_PLAN_NUMBER);
    } catch (error) {
      console.error("Failed to check for existing plan", error);
      return errorResponse("database_error", "Could not check for an existing plan.", 500);
    }
    if (existing) {
      return jsonResponse({ plan: existing.plan, actions: existing.actions }, 200);
    }

    // 2. Read onboarding context (onboarding-v2 schema - see
    // supabase/migrations/20260918120000_onboarding_intake_v2.sql).
    // completed_at must be set - generation must never run against a
    // partial/in-progress onboarding row. The legacy fixed-flow columns
    // (preferred_activities, activity_other, goal_specific_question,
    // goal_specific_answers, goal_specific_other) are deliberately not
    // selected here - see prompt-v2 migration notes for why they still
    // exist in the table.
    const { data: onboarding, error: onboardingError } = await supabaseClient
      .from("onboarding_responses")
      .select(
        "primary_goal, primary_goal_other, focus_areas, existing_habits, existing_habits_other, activity_level, barriers, barrier_other, daily_time, habit_times, habit_time_other, movement_fit, movement_fit_other, strength_setup, strength_equipment, strength_equipment_other, strength_setup_other, food_challenges, food_challenge_other, sleep_challenges, sleep_challenge_other, routine_challenges, routine_challenge_other, stress_challenges, stress_challenge_other, focus_discovery_signals, constraints, constraints_detail, additional_context, completed_at"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (onboardingError) {
      console.error("Failed to read onboarding_responses", onboardingError.message);
      return errorResponse("database_error", "Could not read onboarding answers.", 500);
    }
    if (!onboarding || !onboarding.completed_at) {
      return errorResponse(
        "onboarding_incomplete",
        "Onboarding must be completed before a plan can be generated.",
        400
      );
    }

    const onboardingContext: OnboardingContext = {
      primary_goal: onboarding.primary_goal,
      primary_goal_other: onboarding.primary_goal_other,
      focus_areas: onboarding.focus_areas ?? [],
      existing_habits: onboarding.existing_habits ?? [],
      existing_habits_other: onboarding.existing_habits_other,
      activity_level: onboarding.activity_level,
      barriers: onboarding.barriers ?? [],
      barrier_other: onboarding.barrier_other,
      daily_time: onboarding.daily_time,
      habit_times: onboarding.habit_times ?? [],
      habit_time_other: onboarding.habit_time_other,
      movement_fit: onboarding.movement_fit,
      movement_fit_other: onboarding.movement_fit_other,
      strength_setup: onboarding.strength_setup,
      strength_equipment: onboarding.strength_equipment,
      strength_equipment_other: onboarding.strength_equipment_other,
      strength_setup_other: onboarding.strength_setup_other,
      food_challenges: onboarding.food_challenges,
      food_challenge_other: onboarding.food_challenge_other,
      sleep_challenges: onboarding.sleep_challenges,
      sleep_challenge_other: onboarding.sleep_challenge_other,
      routine_challenges: onboarding.routine_challenges,
      routine_challenge_other: onboarding.routine_challenge_other,
      stress_challenges: onboarding.stress_challenges,
      stress_challenge_other: onboarding.stress_challenge_other,
      focus_discovery_signals: onboarding.focus_discovery_signals,
      constraints: onboarding.constraints ?? [],
      constraints_detail: onboarding.constraints_detail,
      additional_context: onboarding.additional_context,
    };

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not configured");
      return errorResponse("server_misconfigured", "Plan generation is not available right now.", 500);
    }

    // 3. Generate.
    const userPrompt = buildUserPrompt(onboardingContext);
    let rawText: string;
    let inputTokens: number | null;
    let outputTokens: number | null;
    try {
      const result = await generatePlanCompletion(SYSTEM_PROMPT, userPrompt, apiKey);
      rawText = result.rawText;
      inputTokens = result.inputTokens;
      outputTokens = result.outputTokens;
    } catch (error) {
      if (error instanceof OpenAIRequestError) {
        console.error("OpenAI generation failed:", error.message);
        return errorResponse("generation_failed", "Couldn't generate your plan. Please try again.", 502);
      }
      console.error("Unexpected error calling OpenAI", error);
      return errorResponse("generation_failed", "Couldn't generate your plan. Please try again.", 502);
    }

    // 4. Parse + validate. A malformed/unsafe result is never saved - the
    // caller gets a clean retryable error instead of a generic fallback plan.
    let validated: GeneratedWeeklyPlan;
    try {
      const parsed = JSON.parse(rawText);
      validated = validateGeneratedPlan(parsed);
    } catch (error) {
      if (error instanceof PlanValidationError) {
        console.error("Generated plan failed validation:", error.message);
      } else {
        console.error("Generated plan was not valid JSON", error);
      }
      return errorResponse("generation_invalid", "Couldn't generate your plan. Please try again.", 502);
    }

    // 5. Save atomically. create_weekly_plan() is itself idempotent (unique
    // (user_id, plan_number) + an existing-row check), so a race with another
    // request for the same user resolves to one saved plan either way. See
    // the note in supabase/migrations/0002_weekly_plans.sql about the one
    // remaining theoretical race (two concurrent requests both reaching
    // OpenAI before either saves) - the database still guarantees only one
    // saved row either way, it just means at most one duplicate OpenAI call
    // in that rare case, not a duplicate saved plan.
    const actionsPayload = validated.actions.map((action, index) => ({
      ...action,
      sort_order: index,
    }));

    const { data: planId, error: rpcError } = await supabaseClient.rpc("create_weekly_plan", {
      p_plan_number: FIRST_PLAN_NUMBER,
      p_personalization_line: validated.personalization_line,
      p_model: MODEL,
      p_prompt_version: PROMPT_VERSION,
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_actions: actionsPayload,
    });

    if (rpcError || !planId) {
      console.error("Failed to save weekly plan", rpcError?.message);
      return errorResponse(
        "database_error",
        "Your plan was generated but couldn't be saved. Please try again.",
        500
      );
    }

    // 6. Return exactly what was saved (works whether this call created the
    // row or a concurrent duplicate request won the race).
    let saved: PlanWithActions | null;
    try {
      saved = await loadPlanWithActions(supabaseClient, userId, FIRST_PLAN_NUMBER);
    } catch (error) {
      console.error("Failed to reload saved plan", error);
      return errorResponse(
        "database_error",
        "Your plan was saved but couldn't be loaded. Please try again.",
        500
      );
    }
    if (!saved) {
      return errorResponse(
        "database_error",
        "Your plan was saved but couldn't be loaded. Please try again.",
        500
      );
    }

    return jsonResponse({ plan: saved.plan, actions: saved.actions }, 200);
  }),
};
