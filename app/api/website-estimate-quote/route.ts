import { getClientIp } from "@/lib/integrations";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  buildWebsiteEstimateSlackPayload,
  calculateWebsiteEstimate,
  isValidEstimateEmail,
  normalizeWebsiteEstimateInput,
} from "@/lib/website-estimator";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  if (!isRecord(body)) {
    return jsonError("Invalid request body.", 400);
  }

  const email =
    typeof body.email === "string"
      ? body.email.trim()
      : "";

  if (!email) {
    return jsonError("Email is required.", 400);
  }

  if (!isValidEstimateEmail(email)) {
    return jsonError("Enter a valid email address.", 400);
  }

  if (!("configuration" in body)) {
    return jsonError("Estimate configuration is required.", 400);
  }

  const configuration = normalizeWebsiteEstimateInput(body.configuration);

  if (!configuration) {
    return jsonError("Estimate configuration is invalid.", 400);
  }

  const clientIp = getClientIp(request.headers);
  const rateKey = `website-estimate-quote:${clientIp}`;

  if (!consumeRateLimit(rateKey, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
    return jsonError("Rate limit reached. Please try again shortly.", 429);
  }

  const webhookUrl = process.env.WEBSITE_ESTIMATE_SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return jsonError("Quote delivery is not configured right now.", 503);
  }

  const estimate = calculateWebsiteEstimate(configuration);
  const payload = buildWebsiteEstimateSlackPayload({
    email,
    configuration,
    estimate,
  });

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return jsonError("Slack webhook delivery failed.", 502);
    }

    return Response.json({ ok: true });
  } catch {
    return jsonError("Slack webhook delivery failed.", 502);
  }
}

function jsonError(message: string, status: number) {
  return Response.json(
    {
      ok: false,
      message,
    },
    { status }
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
