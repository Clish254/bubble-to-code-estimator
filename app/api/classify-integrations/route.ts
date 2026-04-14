import OpenAI from "openai";

import {
  buildIntegrationPrompt,
  createFallbackClassifications,
  extractJsonObject,
  getClientIp,
  parseIntegrationInput,
  sanitizeClassification,
  toClassificationResponse,
} from "@/lib/integrations";
import { consumeRateLimit } from "@/lib/rate-limit";
import type { ClassificationResponse, IntegrationClassification } from "@/lib/types";

const MODEL = "gpt-4o-mini";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const integrationsInput =
    typeof body === "object" &&
    body !== null &&
    "integrations" in body &&
    typeof body.integrations === "string"
      ? body.integrations
      : "";

  const integrations = parseIntegrationInput(integrationsInput);

  if (!integrations.length) {
    return Response.json(toClassificationResponse([]));
  }

  const clientIp = getClientIp(request.headers);
  const rateKey = `classify-integrations:${clientIp}`;

  if (!consumeRateLimit(rateKey, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
    return Response.json(
      toClassificationResponse(
        createFallbackClassifications(
          integrations,
          "You're moving quickly, so we defaulted these to medium complexity for now."
        ),
        "Rate limit reached. Using the default medium estimate."
      ),
      { status: 429 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      toClassificationResponse(
        createFallbackClassifications(
          integrations,
          "The AI classifier is unavailable right now, so we used the default medium estimate."
        ),
        "OPENAI_API_KEY is not configured. Using the default medium estimate."
      )
    );
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: MODEL,
      stream: false,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You classify Bubble app integrations for a code rebuild estimator. Return JSON only. Complexity must be low, medium, or high. Reasons should be concise and practical.",
        },
        {
          role: "user",
          content: buildIntegrationPrompt(integrations),
        },
      ],
    });

    const content = extractCompletionText(completion) || "{}";
    const parsed = extractJsonObject(content) as {
      classifications?: Array<Partial<IntegrationClassification> & { name: string }>;
    };

    const normalized = normalizeClassificationResponse(
      integrations,
      parsed.classifications ?? []
    );

    return Response.json(toClassificationResponse(normalized));
  } catch {
    return Response.json(
      toClassificationResponse(
        createFallbackClassifications(
          integrations,
          "We couldn't verify this automatically, so we used the default medium estimate."
        ),
        "The AI classifier failed. Using the default medium estimate."
      )
    );
  }
}

function normalizeClassificationResponse(
  integrations: string[],
  classifications: Array<Partial<IntegrationClassification> & { name: string }>
): ClassificationResponse["classifications"] {
  const mapped = new Map(
    classifications.map((classification) => [
      classification.name.trim().toLowerCase(),
      sanitizeClassification(classification),
    ])
  );

  return integrations.map((integration) => {
    return (
      mapped.get(integration.toLowerCase()) ??
      sanitizeClassification({
        name: integration,
        complexity: "medium",
        reason: "Matched to the default medium bucket because the model returned an incomplete result.",
        source: "fallback",
      })
    );
  });
}

function extractCompletionText(completion: OpenAI.Chat.Completions.ChatCompletion) {
  const content = completion.choices[0]?.message?.content;

  return typeof content === "string" ? content : "";
}
