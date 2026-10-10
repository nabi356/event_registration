"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Zap,
  User,
  Ticket,
  Calendar,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import { EventItem } from '@/lib/types';
import { useEventSystem } from '@/context/EventSystemContext';

interface ManagementQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: EventItem | null;
  onVerificationLogged?: () => void;
}

interface VerificationResult {
  isAuthentic: boolean;
  verdict: 'GENUINE' | 'FAKE_FORGED' | 'ALREADY_CHECKED_IN' | 'EVENT_MISMATCH' | 'NOT_REGISTERED' | 'FAKE_USER';
  badgeText: string;
  reason?: string;
  attendee?: {
    name: string;
    enrollmentNo: string;
    email: string;
    university?: string;
  };
  event?: {
    id: string;
    name: string;
    venue: string;
  };
  ticketId?: string;
  seatTier?: string;
  checkInTime?: string;
  priorEntryTime?: string;
  rawToken?: string;
}

export function ManagementQRScannerModal({
  isOpen,
  onClose,
  selectedEvent,
  onVerificationLogged,
}: ManagementQRScannerModalProps) {
  const { events, token: authToken, refreshCheckIns, refreshSecurityTelemetry } = useEventSystem();

  // Mode: 'camera' or 'manual'
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        startScanningLoop();
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access or use the manual test tabs.'
          : 'Unable to start camera video stream. You can test using simulation or paste.'
      );
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Real-time Frame Decoding Loop using jsQR
  const startScanningLoop = () => {
    const scanFrame = () => {
      if (!isOpen || isProcessing) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleVerifyToken(code.data);
            return; // Pause scanning until user clicks "Scan Next"
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !verificationResult) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, verificationResult]);

  // Handle Token Verification against Backend API
  const handleVerifyToken = async (scannedToken: string) => {
    if (isProcessing || !scannedToken.trim()) return;

    setIsProcessing(true);
    stopCamera();

    try {
      const tokenHeader = authToken || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : '');
      const targetEventId = selectedEvent?.id || events[0]?.id;

      const res = await fetch('/api/checkin/verify-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenHeader ? `Bearer ${tokenHeader}` : '',
        },
        body: JSON.stringify({
          token: scannedToken.trim(),
          eventId: targetEventId,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Pass verification rejected by server.');
      }

      setVerificationResult(data);

      if (onVerificationLogged) {
        onVerificationLogged();
      }
      refreshCheckIns();
      refreshSecurityTelemetry();
    } catch (err: any) {
      setVerificationResult({
        isAuthentic: false,
        verdict: 'FAKE_FORGED',
        badgeText: 'VERIFICATION FAILED',
        reason: err.message || 'Pass failed security verification checks.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to Scan Next Pass
  const handleScanNext = () => {
    setVerificationResult(null);
    setManualInput('');
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  // One-Click Simulations for Administrators
  const handleSimulateRealPass = async () => {
    setIsProcessing(true);
    try {
      const tokenHeader = authToken || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : '');
      const targetEventId = selectedEvent?.id || events[0]?.id;

      // Request a genuine pass token from backend
      const res = await fetch('/api/pass/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenHeader ? `Bearer ${tokenHeader}` : '',
        },
        body: JSON.stringify({ eventId: targetEventId }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        await handleVerifyToken(data.token);
      } else {
        // Fallback: Test with known registered student ID
        await handleVerifyToken('UNI-2026-8472');
      }
    } catch {
      await handleVerifyToken('UNI-2026-8472');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateFakePass = () => {
    // Generate forged token with invalid HMAC signature
    const fakeToken = `EVTRA:fake_attacker_99:fake_evt_00:UNI-FAKE-9999:${Math.floor(Date.now() / 10000)}:abc123:INVALID_FORGED_HMAC_77`;
    handleVerifyToken(fakeToken);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl rounded-3xl glass-panel border-2 border-red-500/35 shadow-2xl p-6 sm:p-7 z-10 bg-[#120E16]/95 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-red-500/20 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 border border-amber-400/30 flex items-center justify-center text-white shadow-lg shadow-red-950/50">
                <QrCode className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  <span>Optical QR Pass Scanner</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-bold uppercase">
                    Real / Fake Verifier
                  </span>
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                  Active Gate: {selectedEvent?.name || events[0]?.name || 'Campus Gate 01'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          {!verificationResult && (
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/40 border border-red-500/20 mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('camera');
                  setCameraError(null);
                }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera Scanner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('manual');
                  stopCamera();
                }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Simulate / Paste Token</span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* VERIFICATION RESULT SCREEN (REAL VS FAKE DIAGNOSTICS)    */}
          {/* ======================================================== */}
          {verificationResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Giant Verdict Banner */}
              <div
                className={`p-6 rounded-2xl border-2 text-center relative overflow-hidden ${
                  verificationResult.isAuthentic && verificationResult.verdict === 'GENUINE'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-xl shadow-emerald-950/50'
                    : verificationResult.verdict === 'ALREADY_CHECKED_IN'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-xl shadow-amber-950/50'
                    : 'bg-rose-950/50 border-rose-500/80 text-rose-300 shadow-2xl shadow-rose-950/70'
                }`}
              >
                {/* Glow Backdrop */}
                <div
                  className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl pointer-events-none ${
                    verificationResult.isAuthentic && verificationResult.verdict === 'GENUINE'
                      ? 'bg-emerald-500/20'
                      : 'bg-rose-500/30'
                  }`}
                />

                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
                      verificationResult.isAuthentic && verificationResult.verdict === 'GENUINE'
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        : verificationResult.verdict === 'ALREADY_CHECKED_IN'
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                        : 'bg-rose-500/30 border border-rose-500/50 text-rose-400 animate-pulse'
                    }`}
                  >
                    {verificationResult.isAuthentic && verificationResult.verdict === 'GENUINE' ? (
                      <ShieldCheck className="w-8 h-8" />
                    ) : verificationResult.verdict === 'ALREADY_CHECKED_IN' ? (
                      <AlertTriangle className="w-8 h-8" />
                    ) : (
                      <ShieldAlert className="w-8 h-8" />
                    )}
                  </div>

                  <span className="text-[11px] font-mono uppercase tracking-widest font-bold block mb-1 opacity-80">
                    Cryptographic Verification Engine
                  </span>

                  <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                    {verificationResult.isAuthentic && verificationResult.verdict === 'GENUINE'
                      ? 'REAL PASS · VERIFIED AUTHENTIC'
                      : verificationResult.verdict === 'ALREADY_CHECKED_IN'
                      ? 'WARNING · PASS ALREADY SCANNED'
                      : 'SECURITY ALERT · FAKE / FORGED PASS'}
                  </h2>

                  <p className="text-xs mt-2 max-w-md mx-auto leading-relaxed opacity-90">
                    {verificationResult.reason ||
                      (verificationResult.isAuthentic
                        ? 'Digital signature validated with 100% authenticity against Eventra Zero-Trust Private Authority.'
                        : 'Cryptographic signature mismatch or token forged. Pass was rejected by campus gate security.')}
                  </p>
                </div>
              </div>

              {/* Verified Passholder & Event Credentials */}
              {verificationResult.attendee && (
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-red-500/20 space-y-2.5 text-xs text-slate-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block border-b border-white/[0.06] pb-1.5">
                    Verified Passholder Dossier
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Student Name:</span>
                      <span className="font-bold text-white text-sm">{verificationResult.attendee.name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Enrollment Number:</span>
                      <span className="font-mono text-amber-300 font-bold">{verificationResult.attendee.enrollmentNo}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Ticket Reference:</span>
                      <span className="font-mono text-red-400 font-bold">{verificationResult.ticketId || 'EVT-PASS'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Seat / Admission Tier:</span>
                      <span className="text-white font-medium">{verificationResult.seatTier || 'VIP Reserved'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons: Scan Next */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleScanNext}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Scan Next Pass</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* 1. LIVE CAMERA SCANNER VIEWPORT                          */}
              {/* ======================================================== */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-black border-2 border-red-500/40 shadow-inner flex items-center justify-center">
                    {/* Video Feed */}
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />

                    {/* Hidden canvas for image decoding */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* High-Tech HUD Viewfinder Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      {/* Targeting Box */}
                      <div className="relative w-56 h-56 border-2 border-red-500/60 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center">
                        {/* 4 Corner Markers */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                        {/* Animated Laser Scanning Beam */}
                        <motion.div
                          animate={{ y: [-90, 90, -90] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                          className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#EF4444]"
                        />

                        {/* Center Target Dot */}
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute" />
                      </div>
                    </div>

                    {/* Camera Status Overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2 z-20">
                        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Cryptographic HMAC Verification in Progress...
                        </span>
                      </div>
                    )}

                    {cameraError && (
                      <div className="absolute inset-0 bg-[#160E18]/95 p-6 flex flex-col items-center justify-center text-center z-20">
                        <Camera className="w-10 h-10 text-rose-400 mb-2" />
                        <span className="text-xs font-bold text-white mb-1">Camera Feed Inactive</span>
                        <p className="text-[11px] text-slate-400 max-w-xs">{cameraError}</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="mt-3 px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-xs font-bold text-white transition-colors cursor-pointer"
                        >
                          Retry Camera Access
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-center text-slate-400">
                    Align the student&apos;s digital ticket QR code within the targeting frame for automatic sub-second verification.
                  </p>
                </div>
              )}

              {/* ======================================================== */}
              {/* 2. MANUAL & SIMULATION VERIFICATION VIEW                 */}
              {/* ======================================================== */}
              {activeTab === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                      Paste Scanned QR Token or Ticket ID
                    </label>
                    <textarea
                      rows={3}
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Paste token string (e.g. EVTRA:..., EVTRALT:..., or EVT-2026-UNI8472-1234)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-red-500/20 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing || !manualInput.trim()}
                    onClick={() => handleVerifyToken(manualInput)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>Verify Authenticity</span>
                  </button>
                </div>
              )}

              {/* ======================================================== */}
              {/* 3. ONE-CLICK QUICK TEST SIMULATOR                        */}
              {/* ======================================================== */}
              <div className="mt-5 pt-4 border-t border-red-500/20">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-2 text-center">
                  Instant Test Harness (Test Real vs Fake Detection)
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleSimulateRealPass}
                    disabled={isProcessing}
                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300">Test Real Pass</div>
                      <div className="text-[10px] text-slate-400">Valid cryptographic signature</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateFakePass}
                    disabled={isProcessing}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition-all cursor-pointer flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-rose-300">Test Fake Pass</div>
                      <div className="text-[10px] text-slate-400">Forged HMAC counterfeit</div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
