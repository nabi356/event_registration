import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'eventra_super_secure_jwt_secret_key_2026_xyz987';

// Truncated HMAC length. Fixed-width so comparisons can always run in
// constant time without leaking length information.
const HMAC_LENGTH = 16;

// Prefixes are distinct so a scanned token can be routed to the right verifier
// without trial and error.
const DYNAMIC_PASS_PREFIX = 'EVTRA';
const EVENT_PASS_PREFIX = 'EVTRALT';

function signPayload(payload: string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('base64url')
    .substring(0, HMAC_LENGTH);
}

// Constant-time string comparison. Length is checked first because
// timingSafeEqual throws on mismatched buffer lengths, and a throw would
// surface as a 500 rather than a clean rejection.
function signaturesMatch(expected: string, received: string): boolean {
  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(received, 'utf8');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}


// Haversine distance in meters
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface DynamicPassTokenData {
  userId: string;
  eventId: string;
  enrollmentNo: string;
  window: number; // 10-second epoch window
  issuedAt: number;
  nonce: string;
}

// Generate server-signed rotating QR token valid for the 10-second window.
// The enrollment number is carried in the token itself so that verification
// can recompute the signature without a database lookup.
export function generateDynamicPassToken(
  userId: string,
  eventId: string,
  enrollmentNo: string
): { token: string; secondsRemaining: number } {
  const now = Date.now();
  const currentWindow = Math.floor(now / 10000); // 10s buckets
  const secondsRemaining = 10 - (Math.floor(now / 1000) % 10);
  const nonce = crypto.randomBytes(4).toString('hex');

  const payload = `${userId}:${eventId}:${enrollmentNo}:${currentWindow}:${nonce}`;
  const hmac = signPayload(payload);

  const token = `${DYNAMIC_PASS_PREFIX}:${userId}:${eventId}:${enrollmentNo}:${currentWindow}:${nonce}:${hmac}`;
  return { token, secondsRemaining };
}

// Validate a scanned QR token: signature first, then the 10-second window
// (allowing +/- 1 window for network jitter). The signature check comes first
// so a forged token can never be treated as merely "stale".
export function verifyDynamicPassToken(
  token: string
): { valid: boolean; reason?: string; data?: { userId: string; eventId: string; window: number } } {
  if (!token || !token.startsWith(`${DYNAMIC_PASS_PREFIX}:`)) {
    return { valid: false, reason: 'Invalid token format. Not an Eventra pass.' };
  }

  const parts = token.split(':');
  if (parts.length !== 7) {
    return { valid: false, reason: 'Malformed token structure.' };
  }

  const [, userId, eventId, enrollmentNo, windowStr, nonce, receivedHmac] = parts;
  const tokenWindow = parseInt(windowStr, 10);
  if (!Number.isFinite(tokenWindow)) {
    return { valid: false, reason: 'Malformed token window.' };
  }

  const expected = signPayload(`${userId}:${eventId}:${enrollmentNo}:${windowStr}:${nonce}`);
  if (!signaturesMatch(expected, receivedHmac)) {
    return { valid: false, reason: 'Invalid pass signature. Forged token rejected.' };
  }

  const currentWindow = Math.floor(Date.now() / 10000);

  // Check replay / expiration (allow tokenWindow === currentWindow or currentWindow - 1 for tight clock skew)
  if (Math.abs(currentWindow - tokenWindow) > 1) {
    return {
      valid: false,
      reason: 'Expired dynamic token presented. Replay or screenshot blocked.',
    };
  }

  return {
    valid: true,
    data: { userId, eventId, window: tokenWindow },
  };
}

export interface EventPassTokenData {
  userId: string;
  eventId: string;
  enrollmentNo: string;
  issuedAt: number;
  expiresAt: number;
}

// Generate a long-lived signed pass for an emailed ticket. Unlike the rotating
// on-screen QR this survives being rendered into an inbox, so it is bound to a
// single user + event and carries an explicit expiry instead of a 10s window.
export function generateEventPassToken(
  userId: string,
  eventId: string,
  enrollmentNo: string,
  validUntil: Date
): { token: string; issuedAt: Date; expiresAt: Date } {
  const issuedAt = new Date();
  const expiresAt = new Date(validUntil);
  const nonce = crypto.randomBytes(8).toString('hex');

  const issuedSec = Math.floor(issuedAt.getTime() / 1000);
  const expiresSec = Math.floor(expiresAt.getTime() / 1000);

  const payload = `${userId}:${eventId}:${enrollmentNo}:${issuedSec}:${expiresSec}:${nonce}`;
  const hmac = signPayload(payload);

  const token = `${EVENT_PASS_PREFIX}:${userId}:${eventId}:${enrollmentNo}:${issuedSec}:${expiresSec}:${nonce}:${hmac}`;
  return { token, issuedAt, expiresAt };
}

// Validate an emailed event pass: signature, then expiry. Returns the same
// shape as verifyDynamicPassToken so callers can treat both uniformly.
export function verifyEventPassToken(
  token: string
): { valid: boolean; reason?: string; data?: EventPassTokenData } {
  if (!token || !token.startsWith(`${EVENT_PASS_PREFIX}:`)) {
    return { valid: false, reason: 'Invalid token format. Not an Eventra email pass.' };
  }

  const parts = token.split(':');
  if (parts.length !== 8) {
    return { valid: false, reason: 'Malformed email pass structure.' };
  }

  const [, userId, eventId, enrollmentNo, issuedSec, expiresSec, nonce, receivedHmac] = parts;

  const payload = `${userId}:${eventId}:${enrollmentNo}:${issuedSec}:${expiresSec}:${nonce}`;
  if (!signaturesMatch(signPayload(payload), receivedHmac)) {
    return { valid: false, reason: 'Invalid pass signature. Forged email pass rejected.' };
  }

  const issuedAt = parseInt(issuedSec, 10) * 1000;
  const expiresAt = parseInt(expiresSec, 10) * 1000;
  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) {
    return { valid: false, reason: 'Malformed email pass timestamps.' };
  }

  // Guard against a pass minted with a clock that is ahead of the server's.
  const now = Date.now();
  if (issuedAt > now + 60 * 1000) {
    return { valid: false, reason: 'Email pass issued in the future. Clock skew rejected.' };
  }
  if (now > expiresAt) {
    return { valid: false, reason: 'Email pass has expired for this event.' };
  }

  return {
    valid: true,
    data: { userId, eventId, enrollmentNo, issuedAt, expiresAt },
  };
}

export interface VerifiedPassToken {
  valid: boolean;
  reason?: string;
  kind?: 'dynamic' | 'event';
  userId?: string;
  eventId?: string;
  window?: number;
}

// Dispatch a scanned token to the right verifier based on its prefix. Both
// types share the `EVTRA` root, so the more specific prefix is tested first.
export function verifyScannedPassToken(token: string): VerifiedPassToken {
  if (token && token.startsWith(`${EVENT_PASS_PREFIX}:`)) {
    const result = verifyEventPassToken(token);
    return result.valid
      ? { valid: true, kind: 'event', userId: result.data!.userId, eventId: result.data!.eventId }
      : { valid: false, reason: result.reason };
  }

  const result = verifyDynamicPassToken(token);
  return result.valid
    ? {
        valid: true,
        kind: 'dynamic',
        userId: result.data!.userId,
        eventId: result.data!.eventId,
        window: result.data!.window,
      }
    : { valid: false, reason: result.reason };
}
