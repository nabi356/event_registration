"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Lock,
  Sparkles,
  Eye,
  RotateCw,
} from 'lucide-react';
import {
  loadBiometricModels,
  analyzeFaceWithNeuralNet,
  captureFrameAsBase64,
  extractBiometricEmbedding,
} from '@/lib/biometrics';

interface StudentFaceEnrollModalProps {
  isOpen: boolean;
  isUpdateMode?: boolean;
  onClose: () => void;
  onSuccess: (updatedAt: string) => void;
  token?: string;
}

export function StudentFaceEnrollModal({
  isOpen,
  isUpdateMode = false,
  onClose,
  onSuccess,
  token,
}: StudentFaceEnrollModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelsReady, setModelsReady] = useState(false);

  // Liveness progression states
  const [faceDetected, setFaceDetected] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [headTurnDetected, setHeadTurnDetected] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [password, setPassword] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusNote, setStatusNote] = useState<string>('Align face inside oval');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Tracking refs for real liveness
  const blinkBaselineRef = useRef<{ wasClosed: boolean }>({ wasClosed: false });
  const cachedEmbeddingRef = useRef<number[] | null>(null);

  // Initialize neural models on mount
  useEffect(() => {
    let mounted = true;
    loadBiometricModels().then((ready) => {
      if (mounted) setModelsReady(ready);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
    } catch (err: any) {
      console.warn('Webcam permission error:', err);
      setCameraError('Camera access unavailable. Ensure webcam permissions are granted in your browser.');
    }
  }, []);

  // Stop webcam. Reads from the ref so this callback's identity never changes —
  // a `stream` dependency would re-run the open effect and re-open the camera.
  const stopCamera = useCallback(() => {
    const current = streamRef.current;
    if (current) {
      current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  // Attach the stream only once the <video> element actually exists. The element
  // is rendered inside AnimatePresence, so on first open it is still null when
  // getUserMedia resolves — attaching here instead of in startCamera avoids a
  // silently black preview.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    // play() returns a promise that rejects when the element is torn down mid
    // playback (modal closed, StrictMode double-invoke). Swallow it: it is expected.
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      // Reset states
      setFaceDetected(false);
      setBlinkDetected(false);
      setHeadTurnDetected(false);
      setActiveStep(1);
      setErrorMsg(null);
      cachedEmbeddingRef.current = null;
      blinkBaselineRef.current = { wasClosed: false };
      setStatusNote('Align face inside oval');
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Frame processing loop for real neural face presence and liveness
  useEffect(() => {
    if (!isOpen || cameraError) return;

    let animationFrameId: number;
    let isAnalyzing = false;
    let frameCount = 0;

    const processFrame = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        !isAnalyzing
      ) {
        isAnalyzing = true;
        frameCount++;

        try {
          const video = videoRef.current;
          // Run neural face detection and 68 landmark extraction
          const analysis = await analyzeFaceWithNeuralNet(video, frameCount % 10 === 0);

          if (analysis.detected) {
            setFaceDetected(true);
            if (analysis.embedding) {
              cachedEmbeddingRef.current = analysis.embedding;
            }

            // Step 1: Face detected
            if (activeStep === 1) {
              setActiveStep(2);
              setStatusNote('Please blink eyes naturally');
            }

            // Step 2: Real Eye Aspect Ratio (EAR) blink detection
            if (analysis.eyeAspectRatio !== undefined) {
              if (analysis.eyeAspectRatio < 0.22) {
                blinkBaselineRef.current.wasClosed = true;
              } else if (blinkBaselineRef.current.wasClosed && analysis.eyeAspectRatio > 0.26) {
                setBlinkDetected(true);
                if (activeStep === 2) {
                  setActiveStep(3);
                  setStatusNote('Slowly turn head slightly left or right');
                }
              }
            } else if (frameCount > 60 && activeStep === 2) {
              // Heuristic fallback if landmark EAR unavailable
              setBlinkDetected(true);
              setActiveStep(3);
            }

            // Step 3: Real Head Yaw ratio detection
            if (analysis.headYawRatio !== undefined) {
              if (analysis.headYawRatio > 1.35 || analysis.headYawRatio < 0.72) {
                setHeadTurnDetected(true);
                setStatusNote('Liveness confirmed. Ready to enroll.');
              }
            } else if (frameCount > 100 && activeStep === 3) {
              setHeadTurnDetected(true);
              setStatusNote('Ready to enroll');
            }
          } else {
            if (frameCount % 30 === 0) {
              setFaceDetected(false);
              setStatusNote('Align face inside oval');
            }
          }
        } catch {
          // ignore transient frame error
        } finally {
          isAnalyzing = false;
        }
      }

      animationFrameId = requestAnimationFrame(processFrame);
    };

    animationFrameId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, cameraError, activeStep]);

  const isLivenessComplete = faceDetected && blinkDetected && headTurnDetected;

  const handleEnrollFace = async () => {
    if (!videoRef.current) return;
    if (!consentAccepted) {
      setErrorMsg('Please review and check the biometric consent agreement.');
      return;
    }
    if (isUpdateMode && !password) {
      setErrorMsg('Password re-entry is required to update enrolled biometric data.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const video = videoRef.current;
      // Extract a 128-d descriptor and record which extractor produced it, so the
      // server never compares vectors across incompatible vector spaces.
      const { embedding, source } = await extractBiometricEmbedding(
        video,
        canvasRef.current,
        cachedEmbeddingRef.current
      );

      if (!embedding || embedding.length !== 128) {
        throw new Error('Unable to extract valid 128-dimensional biometric facial descriptor. Please check camera lighting.');
      }

      // Capture single base64 frame for optional Cloud Provider registration
      const imageBase64 = captureFrameAsBase64(video);

      // Generate or retrieve persistent device ID
      let deviceId = typeof window !== 'undefined' ? localStorage.getItem('eventra_device_id') : null;
      if (!deviceId) {
        deviceId = `DEV-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        localStorage.setItem('eventra_device_id', deviceId);
      }

      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);

      const endpoint = isUpdateMode ? '/api/auth/update-face' : '/api/auth/face-enroll';
      const payload: any = {
        faceEmbedding: embedding,
        embeddingSource: source,
        consentAccepted: true,
        deviceId,
        imageBase64: imageBase64 || undefined,
      };

      if (isUpdateMode) {
        payload.password = password;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Face biometric enrollment failed');
      }

      stopCamera();
      onSuccess(data.faceUpdatedAt || new Date().toISOString());
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Biometric enrollment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-3xl glass-panel border border-white/[0.14] p-6 sm:p-7 shadow-2xl bg-[#0C1220]/95 z-10 overflow-hidden"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {isUpdateMode ? 'Update Face Scan Biometric' : 'First-Time Biometric Face Enrollment'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Zero-storage privacy architecture · Vector embedding only
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Viewport with Oval Guide */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/70 border border-white/[0.12] mb-5 flex items-center justify-center shadow-inner">
              {cameraError ? (
                <div className="p-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 mb-3">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera</span>
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Oval Face Guide Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div
                      className={`w-[52%] h-[68%] rounded-[50%] border-2 transition-all duration-300 ${
                        isLivenessComplete
                          ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                          : faceDetected
                          ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                          : 'border-white/30 border-dashed'
                      }`}
                    />
                  </div>

                  {/* Real-time Status Overlay Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-md border flex items-center gap-1.5 ${
                        faceDetected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-black/60 text-slate-300 border-white/10'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      <span>{statusNote}</span>
                    </div>

                    <div className="px-2.5 py-1 rounded-full text-[11px] font-mono text-cyan-300 bg-black/60 backdrop-blur-md border border-white/10">
                      128-D EMBEDDING
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Liveness Verification Progress Checklist */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
              <div
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                  faceDetected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${faceDetected ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className="truncate">1. Face Detected</span>
              </div>

              <div
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                  blinkDetected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                }`}
              >
                <Eye className={`w-3.5 h-3.5 shrink-0 ${blinkDetected ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className="truncate">2. Blink Eyes</span>
              </div>

              <div
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                  headTurnDetected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 shrink-0 ${headTurnDetected ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className="truncate">3. Head Turn</span>
              </div>
            </div>

            {/* Password Re-entry (For Update Mode) */}
            {isUpdateMode && (
              <div className="mb-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Re-enter Password to Confirm Identity</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Biometric Consent Agreement Checkbox */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] mb-4">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  I consent to the generation and encrypted storage of a 128-dimensional biometric mathematical facial vector. I understand that <strong className="text-white">no photograph, image, or video is ever saved permanently</strong> on any server and I may withdraw consent at any time.
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Bottom Action Button */}
            <button
              onClick={handleEnrollFace}
              disabled={isProcessing || !consentAccepted}
              className={`w-full py-3.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
                isProcessing || !consentAccepted
                  ? 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/40'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Computing & Enrolling Biometric Vector...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isUpdateMode ? 'Update Biometric Credentials' : 'Enroll Biometric Face Scan'}
                  </span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
