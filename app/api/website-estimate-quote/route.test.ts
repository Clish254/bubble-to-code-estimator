// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/website-estimate-quote/route";
import { resetRateLimits } from "@/lib/rate-limit";

function createRequest(body: unknown, ip = "127.0.0.1") {
  return new Request("http://localhost/api/website-estimate-quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/website-estimate-quote", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    process.env.WEBSITE_ESTIMATE_SLACK_WEBHOOK_URL =
      "https://hooks.slack.test/services/123";
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/website-estimate-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toMatch(/invalid request body/i);
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(
      createRequest({
        configuration: {},
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toMatch(/email is required/i);
  });

  it("returns 400 when email is invalid", async () => {
    const response = await POST(
      createRequest({
        email: "not-an-email",
        configuration: {},
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toMatch(/valid email/i);
  });

  it("recomputes the total and sends the payload to Slack", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 200,
      })
    );

    const response = await POST(
      createRequest({
        email: "hello@goodspeed.studio",
        configuration: {
          featurePages: 2,
          integrationPages: 0,
          caseStudyPages: 0,
          solutionPages: 0,
          competitorComparisonPages: 0,
          otherPages: 0,
          featureIndex: false,
          integrationIndex: false,
          caseStudyIndex: true,
          solutionIndex: false,
          competitorComparisonIndex: false,
        },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://hooks.slack.test/services/123",
      expect.objectContaining({
        method: "POST",
      })
    );

    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1];
    const webhookPayload = JSON.parse(String(requestInit?.body));

    expect(webhookPayload.text).toContain("hello@goodspeed.studio");
    expect(webhookPayload.text).toContain("$18,000");
    expect(JSON.stringify(webhookPayload.blocks)).toContain("Case study index");
  });

  it("returns 503 when the Slack webhook env var is missing", async () => {
    delete process.env.WEBSITE_ESTIMATE_SLACK_WEBHOOK_URL;

    const response = await POST(
      createRequest({
        email: "hello@goodspeed.studio",
        configuration: {},
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.message).toMatch(/not configured/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rate limits repeated submissions from the same IP", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 200,
      })
    );

    for (let index = 0; index < 5; index += 1) {
      const response = await POST(
        createRequest(
          {
            email: "hello@goodspeed.studio",
            configuration: {},
          },
          "8.8.8.8"
        )
      );

      expect(response.status).toBe(200);
    }

    const response = await POST(
      createRequest(
        {
          email: "hello@goodspeed.studio",
          configuration: {},
        },
        "8.8.8.8"
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.message).toMatch(/rate limit/i);
  });

  it("returns 502 when Slack rejects the webhook", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 500,
      })
    );

    const response = await POST(
      createRequest({
        email: "hello@goodspeed.studio",
        configuration: {},
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.message).toMatch(/slack webhook delivery failed/i);
  });
});
