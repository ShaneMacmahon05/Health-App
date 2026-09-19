// Deno-side mirror of the AI-generated plan shapes in types/plan.ts.
// Duplicated (not imported) deliberately: Supabase only bundles the
// supabase/functions directory when deploying, so an Edge Function can't
// reach outside it to the Expo app's types/ folder. Keep this in sync with
// types/plan.ts if either changes.

export type PlanActionCategory = "movement" | "nutrition" | "wellbeing";

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

export interface GeneratedWeeklyPlan {
  personalization_line: string;
  actions: GeneratedPlanAction[];
}
