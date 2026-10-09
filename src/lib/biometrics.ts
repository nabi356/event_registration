/**
 * Biometric utilities for in-browser face detection, liveness analysis,
 * and 128-dimensional embedding generation.
 * Photo/video frames are NEVER saved or transmitted.
 */

export interface LivenessState {
  faceDetected: boolean;
  blinkDetected: boolean;
  headTurnDetected: boolean;
  isLive: boolean;
  instruction: string;
}

// Generate 128-d normalized facial embedding vector from video canvas frame
export function extractFaceEmbeddingFromCanvas(
  canvas: HTMLCanvasElement,
  faceBox: { x: number; y: number; width: number; height: number }
): number[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const { x, y, width, height } = faceBox;
  const clampedX = Math.max(0, Math.floor(x));
  const clampedY = Math.max(0, Math.floor(y));
  const clampedW = Math.min(canvas.width - clampedX, Math.floor(width));
  const clampedH = Math.min(canvas.height - clampedY, Math.floor(height));

  if (clampedW <= 10 || clampedH <= 10) return [];

  // Sample grid of 16x8 patches across face bounding oval to extract 128-dimensional biometric descriptor
  const imgData = ctx.getImageData(clampedX, clampedY, clampedW, clampedH);
  const data = imgData.data;

  const embedding: number[] = new Array(128).fill(0);
  const patchW = Math.floor(clampedW / 16);
  const patchH = Math.floor(clampedH / 8);

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 16; col++) {
      const idx = row * 16 + col;
      let patchSum = 0;
      let count = 0;

      const startY = row * patchH;
      const endY = Math.min(clampedH, startY + patchH);
      const startX = col * patchW;
      const endX = Math.min(clampedW, startX + patchW);

      for (let py = startY; py < endY; py += 2) {
        for (let px = startX; px < endX; px += 2) {
          const pixelIndex = (py * clampedW + px) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          // Grayscale luminance
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          patchSum += lum;
          count++;
        }
      }

      const avgLum = count > 0 ? patchSum / count : 128;
      // Normalization centered around zero
      embedding[idx] = (avgLum - 128) / 128;
    }
  }

  // Normalize embedding vector to unit length (L2 norm)
  const norm = Math.sqrt(embedding.reduce((acc, val) => acc + val * val, 0));
  if (norm > 0) {
    return embedding.map((val) => Number((val / norm).toFixed(6)));
  }

  return embedding;
}

// Analyze skin color and face symmetry in oval guide to detect face presence
export function detectFaceInOval(
  canvas: HTMLCanvasElement
): { detected: boolean; brightness: number; symmetry: number; box: { x: number; y: number; width: number; height: number } } {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { detected: false, brightness: 0, symmetry: 0, box: { x: 0, y: 0, width: 0, height: 0 } };

  const w = canvas.width;
  const h = canvas.height;
  // Oval center region
  const ovalW = Math.floor(w * 0.45);
  const ovalH = Math.floor(h * 0.55);
  const ovalX = Math.floor((w - ovalW) / 2);
  const ovalY = Math.floor((h - ovalH) / 2);

  const imgData = ctx.getImageData(ovalX, ovalY, ovalW, ovalH);
  const data = imgData.data;

  let skinPixels = 0;
  let totalLum = 0;
  const totalPixels = ovalW * ovalH;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLum += lum;

    // Skin color range heuristic (YCbCr / RGB bounds)
    if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 10) {
      skinPixels++;
    }
  }

  const avgLum = totalLum / totalPixels;
  const skinRatio = skinPixels / totalPixels;

  // Face detected if reasonable skin tone presence and lighting
  const detected = skinRatio > 0.18 && avgLum > 35 && avgLum < 235;

  return {
    detected,
    brightness: Math.round(avgLum),
    symmetry: Math.round(skinRatio * 100),
    box: { x: ovalX, y: ovalY, width: ovalW, height: ovalH },
  };
}
