// Thin wrapper around a single OpenAI Responses API call, using strict
// Structured Outputs. No SDK dependency - fetch() is enough for one call
// shape, and avoids pulling an unrelated package into the Edge Function.

import { WEEKLY_PLAN_SCHEMA } from "./prompt.ts";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const REQUEST_TIMEOUT_MS = 55_000;

export const MODEL = "gpt-5.6-terra";
export const PROMPT_VERSION = "weekly-plan-v3";

export class OpenAIRequestError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "OpenAIRequestError";
  }
}

interface ResponsesApiResult {
  rawText: string;
  inputTokens: number | null;
  outputTokens: number | null;
}

// Pulls the JSON string out of a Responses API result. Structured Outputs
// puts it on the first "message" output item's "output_text" content part.
function extractOutputText(body: Record<string, unknown>): string {
  const output = body.output;
  if (!Array.isArray(output)) {
    throw new OpenAIRequestError("OpenAI response had no output array");
  }

  for (const item of output) {
    if (typeof item !== "object" || item === null) continue;
    const message = item as Record<string, unknown>;
    if (message.type !== "message" || !Array.isArray(message.content)) continue;

    for (const part of message.content) {
      if (typeof part !== "object" || part === null) continue;
      const contentPart = part as Record<string, unknown>;
      if (contentPart.type === "output_text" && typeof contentPart.text === "string") {
        return contentPart.text;
      }
    }
  }

  throw new OpenAIRequestError("OpenAI response had no output_text content");
}

export async function generatePlanCompletion(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<ResponsesApiResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        reasoning: { effort: "medium" },
        max_output_tokens: 4000,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "weekly_plan",
            schema: WEEKLY_PLAN_SCHEMA,
            strict: true,
          },
        },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new OpenAIRequestError("OpenAI request timed out");
    }
    throw new OpenAIRequestError("OpenAI request failed", error);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // Don't forward OpenAI's raw error body to the client - it can contain
    // more detail than we want to expose, and isn't useful to the app.
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      // ignore
    }
    console.error("OpenAI request failed", response.status, detail.slice(0, 500));
    throw new OpenAIRequestError(`OpenAI request failed with status ${response.status}`);
  }

  const body = (await response.json()) as Record<string, unknown>;

  if (body.status === "incomplete") {
    throw new OpenAIRequestError(`OpenAI response was incomplete: ${JSON.stringify(body.incomplete_details)}`);
  }
  if (body.status && body.status !== "completed") {
    throw new OpenAIRequestError(`OpenAI response had unexpected status: ${String(body.status)}`);
  }

  const rawText = extractOutputText(body);

  const usage = body.usage as Record<string, unknown> | undefined;
  const inputTokens = typeof usage?.input_tokens === "number" ? usage.input_tokens : null;
  const outputTokens = typeof usage?.output_tokens === "number" ? usage.output_tokens : null;

  return { rawText, inputTokens, outputTokens };
}
