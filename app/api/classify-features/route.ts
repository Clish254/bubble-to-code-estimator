import OpenAI from "openai";

import {
  buildFeaturePrompt,
  createFallbackFeatureClassification,
  extractJsonObject,
  normalizeFeaturesText,
  sanitizeFeatureClassification,
  toFeatureClassificationResponse,
} from "@/lib/features";
import { getClientIp } from "@/lib/integrations";
import { consumeRateLimit } from "@/lib/rate-limit";
import type { AppSizeOption, FeatureClassification } from "@/lib/types";

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

  const featuresInput =
    typeof body === "object" &&
    body !== null &&
    "features" in body &&
    typeof body.features === "string"
      ? body.features
      : "";

  const appSize = extractAppSize(body);
  const description = normalizeFeaturesText(featuresInput);

  if (!description) {
    return Response.json(toFeatureClassificationResponse(null));
  }

  const clientIp = getClientIp(request.headers);
  const rateKey = `classify-features:${clientIp}`;

  if (!consumeRateLimit(rateKey, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
    return Response.json(
      toFeatureClassificationResponse(
        createFallbackFeatureClassification(
          appSize,
          "You're moving quickly, so we used a baseline feature mix for now."
        ),
        "Rate limit reached. Using a baseline feature mix."
      ),
      { status: 429 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      toFeatureClassificationResponse(
        createFallbackFeatureClassification(
          appSize,
          "The AI assistant is unavailable right now, so we used a baseline feature mix."
        ),
        "OPENAI_API_KEY is not configured. Using a baseline feature mix."
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
            "You estimate feature scope for a Bubble-to-code rebuild. Return JSON only. Counts must be integers. Summaries should be plain English and under 20 words.",
        },
        {
          role: "user",
          content: buildFeaturePrompt(description, appSize),
        },
      ],
    });

    const content = extractCompletionText(completion) || "{}";
    const parsed = extractJsonObject(content) as {
      classification?: Partial<FeatureClassification>;
    };

    if (!parsed.classification) {
      return Response.json(
        toFeatureClassificationResponse(
          createFallbackFeatureClassification(
            appSize,
            "We couldn't parse the AI response, so we used a baseline feature mix."
          )
        )
      );
    }

    const normalized = sanitizeFeatureClassification(parsed.classification);

    return Response.json(toFeatureClassificationResponse(normalized));
  } catch {
    return Response.json(
      toFeatureClassificationResponse(
        createFallbackFeatureClassification(
          appSize,
          "We couldn't verify that automatically, so we used a baseline feature mix."
        ),
        "The AI assistant failed. Using a baseline feature mix."
      )
    );
  }
}

function extractAppSize(body: unknown): AppSizeOption | null {
  if (
    typeof body === "object" &&
    body !== null &&
    "appSize" in body &&
    (body.appSize === "mvp" || body.appSize === "mid" || body.appSize === "large")
  ) {
    return body.appSize;
  }
  return null;
}

function extractCompletionText(completion: OpenAI.Chat.Completions.ChatCompletion) {
  const content = completion.choices[0]?.message?.content;

  return typeof content === "string" ? content : "";
}
