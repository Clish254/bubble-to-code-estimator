const requestsByKey = new Map<string, number[]>();

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const current = requestsByKey.get(key) ?? [];
  const fresh = current.filter((timestamp) => now - timestamp < windowMs);

  if (fresh.length >= limit) {
    requestsByKey.set(key, fresh);
    return false;
  }

  fresh.push(now);
  requestsByKey.set(key, fresh);
  return true;
}

export function resetRateLimits() {
  requestsByKey.clear();
}
