/**
 * Biometric utilities for client-side neural face detection, real 68-point landmark liveness analysis,
 * and 128-dimensional deep metric embedding extraction using @vladmandic/face-api.
 *
 * Privacy Guarantees:
 * - Zero raw photo or video feeds are stored.
 * - Deep metric vector embedding (128 floats) is computed directly in local browser memory.
 */

type FaceApiType = typeof import('@vladmandic/face-api');
let faceApiModule: FaceApiType | null = null;
let modelsLoaded = false;
let modelsLoadingPromise: Promise<boolean> | null = null;

export async function getFaceApi(): Promise<FaceApiType | null> {
  if (typeof window === 'undefined') return null;
  if (!faceApiModule) {
    try {
      faceApiModule = await import('@vladmandic/face-api');
    } catch (err) {
      console.warn('Failed to dynamically load @vladmandic/face-api:', err);
      return null;
    }
  }
  return faceApiModule;
}

/**
 * Load neural network models from /models directory in public folder
 */
export async function loadBiometricModels(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (modelsLoaded) return true;
  if (modelsLoadingPromise) return modelsLoadingPromise;

  modelsLoadingPromise = (async () => {
    try {
      const faceapi = await getFaceApi();
      if (!faceapi) return false;

      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded = true;
      return true;
    } catch (err) {
      console.warn('Could not load neural face-api models from /models:', err);
      try {
        const faceapi = await getFaceApi();
        if (!faceapi) return false;
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        modelsLoaded = true;
        return true;
      } catch (e2) {
        console.warn('Fallback model load also failed:', e2);
        return false;
      }
    }
  })();

  return modelsLoadingPromise;
}

export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

/**
 * Which pipeline produced a 128-d vector.
 *
 * These two live in genuinely different vector spaces: 'neural' is a trained
 * face-api deep metric descriptor, 'heuristic' is the luminance-grid fallback
 * used while the model weights are still loading. Cosine similarity between the
 * two is meaningless, so the server compares like with like only.
 */
export type EmbeddingSource = 'neural' | 'heuristic';

export interface NeuralFaceAnalysis {
  detected: boolean;
  score: number;
  box: { x: number; y: number; width: number; height: number };
  landmarks?: any;
  eyeAspectRatio?: number;
  headYawRatio?: number;
  embedding?: number[];
  embeddingSource?: EmbeddingSource;
  isInsideOval?: boolean;
}

function dist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Calculate Eye Aspect Ratio (EAR) from 68 landmarks
 * Points 36-41 (left eye), 42-47 (right eye)
 */
export function calculateEyeAspectRatio(landmarks: any): number {
  if (!landmarks || !landmarks.positions) return 0.3;
  const pts = landmarks.positions;
  if (pts.length < 68) return 0.3;

  // Left eye
  const lDist1 = dist(pts[37], pts[41]);
  const lDist2 = dist(pts[38], pts[40]);
  const lWidth = dist(pts[36], pts[39]);
  const leftEAR = (lDist1 + lDist2) / (2.0 * (lWidth || 1));

  // Right eye
  const rDist1 = dist(pts[43], pts[47]);
  const rDist2 = dist(pts[44], pts[46]);
  const rWidth = dist(pts[42], pts[45]);
  const rightEAR = (rDist1 + rDist2) / (2.0 * (rWidth || 1));

  return Number(((leftEAR + rightEAR) / 2.0).toFixed(4));
}

/**
 * Calculate Head Yaw Ratio from nose tip (pt 30) relative to left jaw (pt 0) and right jaw (pt 16)
 * Forward = ~1.0 (+- 0.25). Turning left = > 1.6. Turning right = < 0.6.
 */
export function calculateHeadYawRatio(landmarks: any): number {
  if (!landmarks || !landmarks.positions) return 1.0;
  const pts = landmarks.positions;
  if (pts.length < 68) return 1.0;

  const noseTip = pts[30];
  const leftCheek = pts[0];
  const rightCheek = pts[16];

  const distToLeft = dist(noseTip, leftCheek);
  const distToRight = dist(noseTip, rightCheek);

  if (distToRight === 0) return 1.0;
  return Number((distToLeft / distToRight).toFixed(3));
}

/**
 * Run real neural face detection on an HTMLVideoElement or HTMLCanvasElement
 */
export async function analyzeFaceWithNeuralNet(
  input: HTMLVideoElement | HTMLCanvasElement,
  extractEmbedding: boolean = false
): Promise<NeuralFaceAnalysis> {
  const isReady = await loadBiometricModels();
  const faceapi = await getFaceApi();

  if (isReady && faceapi) {
    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
      const detectionQuery = faceapi.detectSingleFace(input, options).withFaceLandmarks();

      if (extractEmbedding) {
        const fullDetection = await (detectionQuery as any).withFaceDescriptor();
        if (fullDetection) {
          const { box } = fullDetection.detection;
          const landmarks = fullDetection.landmarks;
          const ear = calculateEyeAspectRatio(landmarks);
          const yaw = calculateHeadYawRatio(landmarks);
          const rawDesc = fullDetection.descriptor;
          const embedding = Array.from(rawDesc as Float32Array).map((n) => Number(n.toFixed(6)));

          return {
            detected: true,
            score: Number(fullDetection.detection.score.toFixed(3)),
            box: {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
            },
            landmarks,
            eyeAspectRatio: ear,
            headYawRatio: yaw,
            embedding,
            embeddingSource: 'neural',
          };
        }
      } else {
        const detection = await detectionQuery;
        if (detection) {
          const { box } = detection.detection;
          const landmarks = detection.landmarks;
          const ear = calculateEyeAspectRatio(landmarks);
          const yaw = calculateHeadYawRatio(landmarks);

          return {
            detected: true,
            score: Number(detection.detection.score.toFixed(3)),
            box: {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
            },
            landmarks,
            eyeAspectRatio: ear,
            headYawRatio: yaw,
          };
        }
      }
    } catch (err) {
      console.warn('Neural face detection error, falling back to pixel heuristics:', err);
    }
  }

  // Graceful fallback: Oval pixel density heuristic when models are loading
  if (input instanceof HTMLCanvasElement) {
    const fallback = detectFaceInOval(input);
    return {
      detected: fallback.detected,
      score: fallback.detected ? 0.85 : 0,
      box: fallback.box,
      embedding: extractEmbedding ? extractFaceEmbeddingFromCanvas(input, fallback.box) : undefined,
      embeddingSource: 'heuristic',
    };
  }

  return {
    detected: false,
    score: 0,
    box: { x: 0, y: 0, width: 0, height: 0 },
  };
}

/**
 * Resolve a 128-d enrollment/scan embedding from a live video frame, falling
 * back to the luminance-grid heuristic if the neural descriptor is unavailable.
 *
 * The returned `source` MUST travel with the vector to the server so it is only
 * ever compared against vectors from the same extractor.
 */
export async function extractBiometricEmbedding(
  video: HTMLVideoElement,
  fallbackCanvas: HTMLCanvasElement | null,
  cached?: number[] | null
): Promise<{ embedding: number[] | null; source: EmbeddingSource }> {
  const analysis = await analyzeFaceWithNeuralNet(video, true);

  if (analysis.embedding && analysis.embedding.length === 128) {
    return { embedding: analysis.embedding, source: analysis.embeddingSource || 'neural' };
  }

  if (cached && cached.length === 128) {
    return { embedding: cached, source: 'neural' };
  }

  if (fallbackCanvas) {
    fallbackCanvas.width = video.videoWidth || 640;
    fallbackCanvas.height = video.videoHeight || 480;
    const ctx = fallbackCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, fallbackCanvas.width, fallbackCanvas.height);
      const heuristic = extractFaceEmbeddingFromCanvas(fallbackCanvas, {
        x: fallbackCanvas.width * 0.25,
        y: fallbackCanvas.height * 0.2,
        width: fallbackCanvas.width * 0.5,
        height: fallbackCanvas.height * 0.6,
      });
      if (heuristic.length === 128) {
        return { embedding: heuristic, source: 'heuristic' };
      }
    }
  }

  return { embedding: null, source: 'neural' };
}

/**
 * Capture frame from video to canvas as JPEG base64
 */
export function captureFrameAsBase64(video: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return null;
  }
}

/**
 * Fallback pixel-based heuristic in oval guide
 */
export function detectFaceInOval(
  canvas: HTMLCanvasElement
): { detected: boolean; brightness: number; symmetry: number; box: { x: number; y: number; width: number; height: number } } {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { detected: false, brightness: 0, symmetry: 0, box: { x: 0, y: 0, width: 0, height: 0 } };

  const w = canvas.width;
  const h = canvas.height;
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

    if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 10) {
      skinPixels++;
    }
  }

  const avgLum = totalLum / totalPixels;
  const skinRatio = skinPixels / totalPixels;
  const detected = skinRatio > 0.16 && avgLum > 30 && avgLum < 240;

  return {
    detected,
    brightness: Math.round(avgLum),
    symmetry: Math.round(skinRatio * 100),
    box: { x: ovalX, y: ovalY, width: ovalW, height: ovalH },
  };
}

/**
 * 128-d fallback embedding generator if neural net descriptor unavailable
 */
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
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          patchSum += lum;
          count++;
        }
      }

      const avgLum = count > 0 ? patchSum / count : 128;
      embedding[idx] = (avgLum - 128) / 128;
    }
  }

  const norm = Math.sqrt(embedding.reduce((acc, val) => acc + val * val, 0));
  if (norm > 0) {
    return embedding.map((val) => Number((val / norm).toFixed(6)));
  }

  return embedding;
}
