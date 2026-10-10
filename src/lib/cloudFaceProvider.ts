/**
 * Server-side Face Recognition API Provider Integration
 * Supports Face++ (Megvii), Luxand.cloud, and AWS Rekognition.
 * All credentials are read from secure server-side environment variables.
 *
 * Every provider is optional. When none are configured the platform falls back
 * to the built-in in-browser @vladmandic/face-api neural descriptor.
 */

import {
  RekognitionClient,
  CreateCollectionCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
} from '@aws-sdk/client-rekognition';

export interface CloudEnrollResult {
  success: boolean;
  provider: 'facepp' | 'luxand' | 'aws' | 'face-api';
  faceToken?: string;
  error?: string;
}

export interface CloudVerifyResult {
  success: boolean;
  provider: 'facepp' | 'luxand' | 'aws' | 'face-api';
  matched: boolean;
  similarity?: number;
  faceToken?: string;
  error?: string;
}

export function getActiveFaceProviderName(): string {
  if (process.env.FACEPP_API_KEY && process.env.FACEPP_API_SECRET) {
    return 'facepp';
  }
  if (process.env.LUXAND_API_KEY) {
    return 'luxand';
  }
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return 'aws';
  }
  return process.env.FACE_RECOGNITION_PROVIDER || 'face-api';
}

/**
 * Whether the active provider does its matching from an uploaded image on the
 * server side (and therefore needs a captured frame). The built-in 'face-api'
 * provider works from the 128-d vector alone and never needs one.
 */
export function usesCloudImageProvider(provider: string = getActiveFaceProviderName()): boolean {
  return provider === 'facepp' || provider === 'luxand' || provider === 'aws';
}

/**
 * Enroll a face with the configured cloud provider
 */
export async function enrollFaceWithCloudProvider(
  imageBase64: string,
  personName: string
): Promise<CloudEnrollResult> {
  const provider = getActiveFaceProviderName();

  if (provider === 'facepp') {
    return enrollWithFacePP(imageBase64);
  } else if (provider === 'luxand') {
    return enrollWithLuxand(imageBase64, personName);
  } else if (provider === 'aws') {
    return enrollWithAWS(imageBase64, personName);
  }

  // Built-in deep neural provider handles embeddings directly
  return {
    success: true,
    provider: 'face-api',
  };
}

/**
 * Compare live face capture with enrolled face token / image
 */
export async function verifyFaceWithCloudProvider(
  liveImageBase64: string,
  enrolledFaceToken?: string
): Promise<CloudVerifyResult> {
  const provider = getActiveFaceProviderName();

  if (provider === 'facepp' && enrolledFaceToken) {
    return compareWithFacePP(liveImageBase64, enrolledFaceToken);
  } else if (provider === 'luxand') {
    return searchWithLuxand(liveImageBase64);
  } else if (provider === 'aws') {
    return searchWithAWS(liveImageBase64);
  }

  // Built-in neural provider has no server-side image view; the caller compares
  // embeddings directly. Never report a match here — an unverifiable scan must
  // fail closed, not open.
  return {
    success: true,
    provider: 'face-api',
    matched: false,
    error: 'Server-side image comparison unavailable for the built-in provider.',
  };
}

// ----------------- Face++ Implementation -----------------
async function enrollWithFacePP(imageBase64: string): Promise<CloudEnrollResult> {
  const apiKey = process.env.FACEPP_API_KEY;
  const apiSecret = process.env.FACEPP_API_SECRET;

  if (!apiKey || !apiSecret) {
    return {
      success: false,
      provider: 'facepp',
      error: 'Face++ API credentials missing in server environment (FACEPP_API_KEY / FACEPP_API_SECRET).',
    };
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const formData = new URLSearchParams();
    formData.append('api_key', apiKey);
    formData.append('api_secret', apiSecret);
    formData.append('image_base64', cleanBase64);

    const res = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await res.json();
    if (data.error_message) {
      return { success: false, provider: 'facepp', error: `Face++ Detect Error: ${data.error_message}` };
    }

    if (!data.faces || data.faces.length === 0) {
      return { success: false, provider: 'facepp', error: 'No face detected in submitted frame.' };
    }

    const faceToken = data.faces[0].face_token;
    return {
      success: true,
      provider: 'facepp',
      faceToken,
    };
  } catch (err: any) {
    return { success: false, provider: 'facepp', error: err.message || 'Face++ service error' };
  }
}

async function compareWithFacePP(
  liveImageBase64: string,
  enrolledFaceToken: string
): Promise<CloudVerifyResult> {
  const apiKey = process.env.FACEPP_API_KEY;
  const apiSecret = process.env.FACEPP_API_SECRET;

  if (!apiKey || !apiSecret) {
    return {
      success: false,
      provider: 'facepp',
      matched: false,
      error: 'Face++ credentials missing in server environment.',
    };
  }

  try {
    const cleanBase64 = liveImageBase64.replace(/^data:image\/\w+;base64,/, '');
    const formData = new URLSearchParams();
    formData.append('api_key', apiKey);
    formData.append('api_secret', apiSecret);
    formData.append('face_token1', enrolledFaceToken);
    formData.append('image_base64_2', cleanBase64);

    const res = await fetch('https://api-us.faceplusplus.com/facepp/v3/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await res.json();
    if (data.error_message) {
      return { success: false, provider: 'facepp', matched: false, error: data.error_message };
    }

    // Face++ returns confidence from 0 to 100
    const confidence = data.confidence || 0;
    // Standard recommended 1e-4 false acceptance threshold is around 70.0
    const threshold = (data.thresholds && data.thresholds['1e-4']) || 70.0;
    const isMatch = confidence >= threshold;

    return {
      success: true,
      provider: 'facepp',
      matched: isMatch,
      similarity: Number((confidence / 100).toFixed(4)),
    };
  } catch (err: any) {
    return { success: false, provider: 'facepp', matched: false, error: err.message };
  }
}

// ----------------- Luxand.cloud Implementation -----------------
async function enrollWithLuxand(imageBase64: string, personName: string): Promise<CloudEnrollResult> {
  const apiKey = process.env.LUXAND_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      provider: 'luxand',
      error: 'Luxand API token missing (LUXAND_API_KEY).',
    };
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('name', personName);
    formData.append('photos', blob, 'face.jpg');

    const res = await fetch('https://api.luxand.cloud/v2/person', {
      method: 'POST',
      headers: { token: apiKey },
      body: formData,
    });

    const data = await res.json();
    if (data.status === 'failure' || data.error) {
      return { success: false, provider: 'luxand', error: data.message || data.error };
    }

    return {
      success: true,
      provider: 'luxand',
      faceToken: String(data.id),
    };
  } catch (err: any) {
    return { success: false, provider: 'luxand', error: err.message };
  }
}

async function searchWithLuxand(liveImageBase64: string): Promise<CloudVerifyResult> {
  const apiKey = process.env.LUXAND_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      provider: 'luxand',
      matched: false,
      error: 'Luxand API token missing (LUXAND_API_KEY).',
    };
  }

  try {
    const cleanBase64 = liveImageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('photo', blob, 'scan.jpg');

    const res = await fetch('https://api.luxand.cloud/v2/person/search', {
      method: 'POST',
      headers: { token: apiKey },
      body: formData,
    });

    const matches = await res.json();
    if (Array.isArray(matches) && matches.length > 0) {
      const topMatch = matches[0];
      const similarity = topMatch.probability || topMatch.confidence || 0;
      return {
        success: true,
        provider: 'luxand',
        matched: similarity >= 0.7,
        similarity,
        faceToken: String(topMatch.id),
      };
    }

    return {
      success: true,
      provider: 'luxand',
      matched: false,
      similarity: 0,
    };
  } catch (err: any) {
    return { success: false, provider: 'luxand', matched: false, error: err.message };
  }
}

// ----------------- AWS Rekognition Implementation -----------------

let rekognitionClient: RekognitionClient | null = null;

function getRekognitionClient(): { client: RekognitionClient; error?: string } {
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      client: null as any,
      error:
        'AWS Rekognition credentials missing (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY).',
    };
  }

  if (!rekognitionClient) {
    rekognitionClient = new RekognitionClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return { client: rekognitionClient };
}

function getCollectionId(): string {
  return process.env.AWS_REKOGNITION_COLLECTION_ID || 'eventra-attendees';
}

/** Strip the data-URL prefix and decode to the Bytes buffer Rekognition expects. */
function toImageBytes(imageBase64: string): Uint8Array {
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  return new Uint8Array(Buffer.from(cleanBase64, 'base64'));
}

/**
 * Create the collection on first use. Safe to call repeatedly — an existing
 * collection is treated as success.
 */
async function ensureCollection(client: RekognitionClient): Promise<string | undefined> {
  try {
    await client.send(new CreateCollectionCommand({ CollectionId: getCollectionId() }));
    return undefined;
  } catch (err: any) {
    const name = err?.name || '';
    if (name === 'ResourceAlreadyExistsException' || err?.message?.includes('already exists')) {
      return undefined;
    }
    return err?.message || 'Unable to create Rekognition collection.';
  }
}

async function enrollWithAWS(imageBase64: string, personName: string): Promise<CloudEnrollResult> {
  const { client, error } = getRekognitionClient();
  if (!client) {
    return { success: false, provider: 'aws', error };
  }

  try {
    const collectionErr = await ensureCollection(client);
    if (collectionErr) {
      return { success: false, provider: 'aws', error: `AWS Rekognition: ${collectionErr}` };
    }

    const res = await client.send(
      new IndexFacesCommand({
        CollectionId: getCollectionId(),
        Image: { Bytes: toImageBytes(imageBase64) },
        ExternalImageId: personName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 255),
        MaxFaces: 1,
        QualityFilter: 'AUTO',
        DetectionAttributes: [],
      })
    );

    const record = res.FaceRecords?.[0]?.Face;
    if (!record?.FaceId) {
      return {
        success: false,
        provider: 'aws',
        error: 'AWS Rekognition detected no face in the submitted frame.',
      };
    }

    return {
      success: true,
      provider: 'aws',
      faceToken: record.FaceId,
    };
  } catch (err: any) {
    return { success: false, provider: 'aws', error: err.message || 'AWS Rekognition service error' };
  }
}

async function searchWithAWS(liveImageBase64: string): Promise<CloudVerifyResult> {
  const { client, error } = getRekognitionClient();
  if (!client) {
    return { success: false, provider: 'aws', matched: false, error };
  }

  try {
    const res = await client.send(
      new SearchFacesByImageCommand({
        CollectionId: getCollectionId(),
        Image: { Bytes: toImageBytes(liveImageBase64) },
        MaxFaces: 1,
        QualityFilter: 'AUTO',
        FaceMatchThreshold: 80,
      })
    );

    const top = res.FaceMatches?.[0];
    if (!top?.Face?.FaceId) {
      return {
        success: true,
        provider: 'aws',
        matched: false,
        similarity: 0,
      };
    }

    const similarity = Number(((top.Similarity || 0) / 100).toFixed(4));

    return {
      success: true,
      provider: 'aws',
      // Rekognition already applied the Threshold above, so any returned match passes.
      matched: true,
      similarity,
      faceToken: top.Face.FaceId,
    };
  } catch (err: any) {
    // InvalidImageException means no detectable face — a clean non-match, not a crash.
    const name = err?.name || '';
    if (name === 'InvalidImageException') {
      return {
        success: true,
        provider: 'aws',
        matched: false,
        similarity: 0,
        error: 'No face detected in submitted frame.',
      };
    }

    return { success: false, provider: 'aws', matched: false, error: err.message };
  }
}
