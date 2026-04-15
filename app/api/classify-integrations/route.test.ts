// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const createCompletionMock = vi.hoisted(() => vi.fn());

vi.mock("openai", () => {
  class MockOpenAI {
    chat = {
      completions: {
        create: createCompletionMock,
      },
    };
  }

  return {
    default: MockOpenAI,
  };
});

import { POST } from "@/app/api/classify-integrations/route";
import { resetRateLimits } from "@/lib/rate-limit";

function createRequest(integrations: string, ip = "127.0.0.1") {
  return new Request("http://localhost/api/classify-integrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify({ integrations }),
  });
}

describe("POST /api/classify-integrations", () => {
  beforeEach(() => {
    resetRateLimits();
    createCompletionMock.mockReset();
    process.env.OPENAI_API_KEY = "test-key";
  });

  it("returns an empty list for empty input", async () => {
    const response = await POST(createRequest(""));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.classifications).toEqual([]);
    expect(createCompletionMock).not.toHaveBeenCalled();
  });

  it("returns normalized AI classifications", async () => {
    createCompletionMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              classifications: [
                {
                  name: "Stripe",
                  complexity: "low",
                  reason: "Matches the Stripe payment reference.",
                },
              ],
            }),
          },
        },
      ],
    });

    const response = await POST(createRequest("Stripe"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.classifications).toEqual([
      {
        name: "Stripe",
        complexity: "low",
        hours: 7,
        reason: "Matches the Stripe payment reference.",
        source: "ai",
      },
    ]);
  });

  it("falls back to medium classifications when the AI call fails", async () => {
    createCompletionMock.mockRejectedValue(new Error("boom"));

    const response = await POST(createRequest("Stripe, HubSpot"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.classifications).toHaveLength(2);
    expect(payload.classifications[0].complexity).toBe("medium");
    expect(payload.classifications[0].hours).toBe(19);
  });

  it("rate limits repeated requests and still returns fallback classifications", async () => {
    createCompletionMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              classifications: [
                {
                  name: "Stripe",
                  complexity: "low",
                  reason: "Matches the Stripe payment reference.",
                },
              ],
            }),
          },
        },
      ],
    });

    for (let index = 0; index < 5; index += 1) {
      const response = await POST(createRequest("Stripe", "9.9.9.9"));
      expect(response.status).toBe(200);
    }

    const response = await POST(createRequest("Stripe", "9.9.9.9"));
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.classifications[0].complexity).toBe("medium");
    expect(payload.message).toMatch(/Rate limit/i);
  });
});
