// Server-side validation of the model's Structured Output, run even though
// the Responses API schema is already strict. Structured Outputs guarantees
// *shape* (right keys, right JSON types) - it does not guarantee sensible
// content (empty strings, duplicate titles, unreasonable lengths), so this
// is the last line of defense before anything reaches the database.

import type { GeneratedPlanAction, GeneratedWeeklyPlan } from "../_shared/plan.ts";

const ALLOWED_CATEGORIES = new Set(["movement", "nutrition", "wellbeing"]);

const MAX_LENGTHS = {
  personalization_line: 700,
  title: 120,
  target: 200,
  instructions: 900,
  why: 500,
  fallback: 400,
  success_definition: 300,
  based_on_item: 60,
} as const;

export class PlanValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanValidationError";
  }
}

function assertNonEmptyString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new PlanValidationError(`${field} must be a non-empty string`);
  }
  if (value.length > maxLength) {
    throw new PlanValidationError(`${field} is too long (max ${maxLength} characters)`);
  }
  return value;
}

function validateAction(raw: unknown, index: number): GeneratedPlanAction {
  if (typeof raw !== "object" || raw === null) {
    throw new PlanValidationError(`actions[${index}] is not an object`);
  }
  const action = raw as Record<string, unknown>;

  if (typeof action.category !== "string" || !ALLOWED_CATEGORIES.has(action.category)) {
    throw new PlanValidationError(`actions[${index}].category must be one of movement/nutrition/wellbeing`);
  }

  const title = assertNonEmptyString(action.title, `actions[${index}].title`, MAX_LENGTHS.title);
  const target = assertNonEmptyString(action.target, `actions[${index}].target`, MAX_LENGTHS.target);
  const instructions = assertNonEmptyString(
    action.instructions,
    `actions[${index}].instructions`,
    MAX_LENGTHS.instructions
  );
  const why = assertNonEmptyString(action.why, `actions[${index}].why`, MAX_LENGTHS.why);
  const fallback = assertNonEmptyString(action.fallback, `actions[${index}].fallback`, MAX_LENGTHS.fallback);
  const successDefinition = assertNonEmptyString(
    action.success_definition,
    `actions[${index}].success_definition`,
    MAX_LENGTHS.success_definition
  );

  if (!Array.isArray(action.based_on)) {
    throw new PlanValidationError(`actions[${index}].based_on must be an array`);
  }
  const basedOn = action.based_on.map((item, itemIndex) => {
    if (typeof item !== "string" || item.length > MAX_LENGTHS.based_on_item) {
      throw new PlanValidationError(`actions[${index}].based_on[${itemIndex}] is invalid`);
    }
    return item;
  });

  return {
    category: action.category as GeneratedPlanAction["category"],
    title,
    target,
    instructions,
    why,
    fallback,
    success_definition: successDefinition,
    based_on: basedOn,
  };
}

export function validateGeneratedPlan(raw: unknown): GeneratedWeeklyPlan {
  if (typeof raw !== "object" || raw === null) {
    throw new PlanValidationError("Generated plan is not an object");
  }
  const plan = raw as Record<string, unknown>;

  const personalizationLine = assertNonEmptyString(
    plan.personalization_line,
    "personalization_line",
    MAX_LENGTHS.personalization_line
  );

  if (!Array.isArray(plan.actions)) {
    throw new PlanValidationError("actions must be an array");
  }
  if (plan.actions.length < 3 || plan.actions.length > 5) {
    throw new PlanValidationError(`actions must contain 3-5 items, got ${plan.actions.length}`);
  }

  const actions = plan.actions.map((action, index) => validateAction(action, index));

  const seenTitles = new Set<string>();
  for (const action of actions) {
    const key = action.title.trim().toLowerCase();
    if (seenTitles.has(key)) {
      throw new PlanValidationError(`Duplicate action title: "${action.title}"`);
    }
    seenTitles.add(key);
  }

  return { personalization_line: personalizationLine, actions };
}
