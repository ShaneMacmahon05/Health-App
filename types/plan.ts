// Shapes for the weekly plan system. Mirrors the split between the two
// migration tables (WeeklyPlan / PlanAction) and the AI's raw generated
// output (GeneratedWeeklyPlan / GeneratedPlanAction) before it's saved -
// see supabase/migrations/0002_weekly_plans.sql and
// supabase/functions/generate-weekly-plan.

export type PlanActionCategory = "movement" | "nutrition" | "wellbeing";

export type WeeklyPlanStatus = "active" | "completed" | "superseded";

// Row shape of public.weekly_plans.
export interface WeeklyPlan {
  id: string;
  user_id: string;
  plan_number: number;
  personalization_line: string;
  status: WeeklyPlanStatus;
  model: string;
  prompt_version: string;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: string;
  updated_at: string;
}

// Row shape of public.plan_actions.
export interface PlanAction {
  id: string;
  plan_id: string;
  category: PlanActionCategory;
  title: string;
  target: string;
  instructions: string;
  why: string;
  fallback: string;
  success_definition: string;
  based_on: string[];
  sort_order: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface WeeklyPlanWithActions extends WeeklyPlan {
  actions: PlanAction[];
}

// One action as OpenAI returns it, before it has a plan_id/sort_order/etc.
export interface GeneratedPlanAction {
  category: PlanActionCategory;
  title: string;
  target: string;
  instructions: string;
  why: string;
  fallback: string;
  success_definition: string;
  based_on: string[];
}

// The full Structured Output shape requested from the Responses API.
export interface GeneratedWeeklyPlan {
  personalization_line: string;
  actions: GeneratedPlanAction[];
}
