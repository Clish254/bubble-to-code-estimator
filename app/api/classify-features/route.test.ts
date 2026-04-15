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

import { POST } from "@/app/api/classify-features/route";
import { resetRateLimits } from "@/lib/rate-limit";

function createRequest(
  features: string,
  appSize: "mvp" | "mid" | "large" | null = "mid",
  ip = "127.0.0.1"
) {
  return new Request("http://localhost/api/classify-features", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify({ features, appSize }),
  });
}

describe("POST /api/classify-features", () => {
  beforeEach(() => {
    resetRateLimits();
    createCompletionMock.mockReset();
    process.env.OPENAI_API_KEY = "test-key";
  });

  it("returns a null classification for empty input", async () => {
    const response = await POST(createRequest(""));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.classification).toBeNull();
    expect(createCompletionMock).not.toHaveBeenCalled();
  });

  it("returns a sanitized AI classification", async () => {
    createCompletionMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              classification: {
                simple: 4,
                medium: 2,
                complex: 1,
                summary: "A balanced feature mix.",
              },
            }),
          },
        },
      ],
    });

    const response = await POST(
      createRequest("Users sign up, book appointments, and pay.")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.classification).toEqual({
      simple: 4,
      medium: 2,
      complex: 1,
      summary: "A balanced feature mix.",
      source: "ai",
    });
  });

  it("falls back to a baseline mix when the AI call fails", async () => {
    createCompletionMock.mockRejectedValue(new Error("boom"));

    const response = await POST(
      createRequest("Users sign up and pay.", "mid")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.classification).toEqual({
      simple: 5,
      medium: 3,
      complex: 1,
      summary: expect.stringMatching(/baseline/i),
      source: "fallback",
    });
    expect(payload.message).toMatch(/AI assistant failed/i);
  });

  it("falls back when the API key is missing", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(
      createRequest("Users sign up and pay.", "mvp")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.classification).toEqual({
      simple: 3,
      medium: 1,
      complex: 0,
      summary: expect.stringMatching(/AI assistant is unavailable/i),
      source: "fallback",
    });
    expect(createCompletionMock).not.toHaveBeenCalled();
  });

  it("rate limits repeated requests and still returns fallback classifications", async () => {
    createCompletionMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              classification: {
                simple: 3,
                medium: 2,
                complex: 1,
                summary: "A mix.",
              },
            }),
          },
        },
      ],
    });

    for (let index = 0; index < 5; index += 1) {
      const response = await POST(createRequest("Users sign up.", "mid", "8.8.8.8"));
      expect(response.status).toBe(200);
    }

    const response = await POST(createRequest("Users sign up.", "mid", "8.8.8.8"));
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.classification.source).toBe("fallback");
    expect(payload.message).toMatch(/Rate limit/i);
  });
});
