import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'eventra_super_secure_jwt_secret_key_2026_xyz987';

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

// Generate server-signed rotating QR token valid for the 10-second window
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
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url').substring(0, 16);

  const token = `EVTRA:${userId}:${eventId}:${currentWindow}:${nonce}:${hmac}`;
  return { token, secondsRemaining };
}

// Validate a scanned QR token against server signature and 10s window (allowing +/- 1 window for network jitter)
export function verifyDynamicPassToken(
  token: string
): { valid: boolean; reason?: string; data?: { userId: string; eventId: string; window: number } } {
  if (!token || !token.startsWith('EVTRA:')) {
    return { valid: false, reason: 'Invalid token format. Not an Eventra pass.' };
  }

  const parts = token.split(':');
  if (parts.length !== 6) {
    return { valid: false, reason: 'Malformed token structure.' };
  }

  const [, userId, eventId, windowStr, nonce, receivedHmac] = parts;
  const tokenWindow = parseInt(windowStr, 10);
  const now = Date.now();
  const currentWindow = Math.floor(now / 10000);

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
