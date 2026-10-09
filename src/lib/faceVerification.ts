// Cosine similarity between two float vectors
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// In-memory rate limiting map for failed verification attempts
const failedScansMap = new Map<string, { count: number; lockedUntil: number }>();

export function checkRateLimit(key: string): { isLocked: boolean; secondsRemaining: number } {
  const record = failedScansMap.get(key);
  if (!record) return { isLocked: false, secondsRemaining: 0 };

  const now = Date.now();
  if (record.lockedUntil > now) {
    return {
      isLocked: true,
      secondsRemaining: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  // Reset if lockout period passed
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    failedScansMap.delete(key);
  }

  return { isLocked: false, secondsRemaining: 0 };
}

export function recordFailedScan(key: string): { isNowLocked: boolean } {
  const now = Date.now();
  const record = failedScansMap.get(key) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= 5) {
    // Lock out for 60 seconds
    record.lockedUntil = now + 60 * 1000;
    record.count = 0;
    failedScansMap.set(key, record);
    return { isNowLocked: true };
  }

  failedScansMap.set(key, record);
  return { isNowLocked: false };
}

export function clearRateLimit(key: string) {
  failedScansMap.delete(key);
}
