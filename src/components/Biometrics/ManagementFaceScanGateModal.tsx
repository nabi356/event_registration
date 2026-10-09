"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  RefreshCw,
  X,
  Scan,
  ShieldCheck,
  User,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { EventItem } from '@/lib/types';
import {
  detectFaceInOval,
  extractFaceEmbeddingFromCanvas,
} from '@/lib/biometrics';

interface ManagementFaceScanGateModalProps {
  isOpen: boolean;
  events: EventItem[];
  selectedEvent: EventItem;
  onSelectEvent: (event: EventItem) => void;
  onClose: () => void;
  onVerificationLogged: () => void;
}

interface VerificationResult {
  verified: boolean;
  reason?: string;
  student?: {
    name: string;
    enrollmentNo: string;
    university: string;
    entryTime?: string;
    ticketId?: string;
  };
  event?: {
    name: string;
    venue: string;
  };
}

export function ManagementFaceScanGateModal({
  isOpen,
  events,
  selectedEvent,
  onSelectEvent,
  onClose,
  onVerificationLogged,
}: ManagementFaceScanGateModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [faceDetected, setFaceDetected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [presentedId, setPresentedId] = useState('');
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  // Start camera
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
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Management camera error:', err);
      setCameraError('Camera access unavailable. Please grant webcam permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setResult(null);
      setPresentedId('');
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Video frame detector
  useEffect(() => {
    if (!isOpen || cameraError) return;

    let animId: number;
    const checkFrame = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const analysis = detectFaceInOval(canvas);
          setFaceDetected(analysis.detected);
        }
      }
      animId = requestAnimationFrame(checkFrame);
    };

    animId = requestAnimationFrame(checkFrame);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, cameraError]);

  // Trigger Biometric Verification Scan
  const handleScanAttendee = async (simulateSpoof = false) => {
    if (!canvasRef.current || isScanning) return;

    setIsScanning(true);
    setResult(null);

    try {
      const canvas = canvasRef.current;
      const faceBox = {
        x: canvas.width * 0.25,
        y: canvas.height * 0.2,
        width: canvas.width * 0.5,
        height: canvas.height * 0.6,
      };

      const embedding = extractFaceEmbeddingFromCanvas(canvas, faceBox);

      const response = await fetch('/api/checkin/verify-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          faceEmbedding: embedding,
          livenessVerified: !simulateSpoof, // True unless simulating spoof
          presentedEnrollmentNo: presentedId.trim() || undefined,
          terminalId: 'Gate-Terminal-01',
        }),
      });

      const data = await response.json();

      setResult({
        verified: data.verified,
        reason: data.reason,
        student: data.student,
        event: data.event,
      });

      // Notify parent to refresh live check-in feed and metric counter
      onVerificationLogged();
    } catch (err: any) {
      setResult({
        verified: false,
        reason: err.message || 'Verification terminal communication failed',
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/[0.14] p-5 sm:p-7 shadow-2xl bg-[#0B101E]/95 z-10 overflow-y-auto max-h-[92vh]"
          >
            {/* Header: Title + Event Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-violet-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-950/40">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Face Scan Gate Entry
                    </h2>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
                      Gate 01 Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live biometric gate access validation & zero-trust person matching
                  </p>
                </div>
              </div>

              {/* Event Dropdown & Close */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="relative">
                  <button
                    onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:border-white/[0.2] text-xs font-medium text-slate-200 transition-all"
                  >
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    <span className="max-w-[140px] truncate">{selectedEvent.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isEventDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0F172A]/95 border border-white/[0.12] shadow-2xl backdrop-blur-xl p-1.5 z-50">
                      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Select Gate Event
                      </div>
                      {events.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => {
                            onSelectEvent(evt);
                            setIsEventDropdownOpen(false);
                            setResult(null);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                            selectedEvent.id === evt.id
                              ? 'bg-blue-600/20 text-blue-300 font-medium'
                              : 'text-slate-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <span className="truncate">{evt.name}</span>
                          <span className="text-[10px] text-slate-400">{evt.venue}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Content Layout: Camera Viewport + Control Area */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Camera Frame (7 cols) */}
              <div className="md:col-span-7">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/80 border border-white/[0.12] shadow-2xl flex items-center justify-center">
                  {cameraError ? (
                    <div className="p-4 text-center">
                      <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-300 mb-2">{cameraError}</p>
                      <button
                        onClick={startCamera}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs text-white"
                      >
                        Retry Camera
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

                      {/* Oval Biometric Guide HUD */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div
                          className={`w-[52%] h-[70%] rounded-[50%] border-2 transition-all duration-300 relative ${
                            result?.verified
                              ? 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                              : result && !result.verified
                              ? 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.5)]'
                              : faceDetected
                              ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                              : 'border-white/25 border-dashed'
                          }`}
                        >
                          {/* Corner Reticle Accents */}
                          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                        </div>
                      </div>

                      {/* Live Scanning Beam Animation */}
                      {isScanning && (
                        <motion.div
                          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]"
                          initial={{ top: '15%' }}
                          animate={{ top: '85%' }}
                          transition={{
                            repeat: Infinity,
                            repeatType: 'reverse',
                            duration: 1.2,
                            ease: 'easeInOut',
                          }}
                        />
                      )}

                      {/* Top Status HUD Badge */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-[11px]">
                        <span
                          className={`px-2.5 py-1 rounded-full font-medium backdrop-blur-md border flex items-center gap-1.5 ${
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
                          <span>{faceDetected ? 'Face Acquired' : 'Align Face'}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] text-cyan-300 bg-black/60 border border-white/10">
                          PERIMETER SECURE
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Dual Verification Optional Input (Enrollment ID Match) */}
                <div className="mt-3">
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Dual Verification ID (Optional Enrollment / Ticket ID)
                  </label>
                  <input
                    type="text"
                    value={presentedId}
                    onChange={(e) => setPresentedId(e.target.value)}
                    placeholder="e.g. UNI-2026-8472 (Optional match test)"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Trigger Buttons */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleScanAttendee(false)}
                    disabled={isScanning}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isScanning ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Scan className="w-3.5 h-3.5" />
                    )}
                    <span>{isScanning ? 'Verifying...' : 'Live Face Scan'}</span>
                  </button>

                  <button
                    onClick={() => handleScanAttendee(true)}
                    disabled={isScanning}
                    title="Simulate failed liveness check (photo/replay)"
                    className="py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-semibold text-slate-300 hover:text-rose-300 transition-all flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Test Spoof Reject</span>
                  </button>
                </div>
              </div>

              {/* Large Result Panel (5 cols) */}
              <div className="md:col-span-5 h-full flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Gate Verification Telemetry
                </span>

                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key={result.verified ? 'verified' : `unverified-${result.reason}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className={`flex-1 rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                        result.verified
                          ? 'bg-emerald-500/[0.12] border-emerald-500/40 shadow-xl shadow-emerald-950/40'
                          : 'bg-rose-500/[0.12] border-rose-500/40 shadow-xl shadow-rose-950/40'
                      }`}
                    >
                      {/* Top Status Icon & Tag */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
                              result.verified
                                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400'
                                : 'bg-rose-500/20 border-rose-400/50 text-rose-400'
                            }`}
                          >
                            {result.verified ? (
                              <CheckCircle2 className="w-7 h-7 stroke-[2.4]" />
                            ) : (
                              <XCircle className="w-7 h-7 stroke-[2.4]" />
                            )}
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              result.verified
                                ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-300'
                                : 'bg-rose-500/25 border-rose-400/40 text-rose-300'
                            }`}
                          >
                            {result.verified ? 'VERIFIED' : 'UNVERIFIED'}
                          </span>
                        </div>

                        {/* Title & Reason */}
                        <h3 className="text-lg font-bold text-white tracking-tight">
                          {result.verified ? 'Entry Approved' : 'Gate Access Denied'}
                        </h3>

                        {!result.verified && result.reason && (
                          <div className="mt-2.5 p-3 rounded-xl bg-black/40 border border-rose-500/30">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 block mb-0.5">
                              Exact Rejection Reason
                            </span>
                            <p className="text-xs font-semibold text-rose-200 leading-snug">
                              {result.reason}
                            </p>
                          </div>
                        )}

                        {/* Attendee Details Grid */}
                        {result.student && (
                          <div className="mt-4 space-y-2.5 text-xs border-t border-white/[0.08] pt-3">
                            <div>
                              <span className="text-[10px] uppercase text-slate-400 block">
                                Attendee Name
                              </span>
                              <span className="font-semibold text-white text-sm">
                                {result.student.name}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[10px] uppercase text-slate-400 block">
                                  Enrollment ID
                                </span>
                                <span className="font-mono text-slate-200">
                                  {result.student.enrollmentNo}
                                </span>
                              </div>

                              {result.student.entryTime && (
                                <div>
                                  <span className="text-[10px] uppercase text-slate-400 block">
                                    Entry Time
                                  </span>
                                  <span className="font-mono text-emerald-300">
                                    {result.student.entryTime}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div>
                              <span className="text-[10px] uppercase text-slate-400 block">
                                Institution
                              </span>
                              <span className="text-slate-300">
                                {result.student.university}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Notice */}
                      <div className="pt-3 border-t border-white/[0.06] text-[10px] text-slate-400 mt-4 flex items-center justify-between">
                        <span>Logged in Live Check-in stream</span>
                        <span className="font-mono">GATE-SYNC-OK</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                        <Scan className="w-6 h-6" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Ready for Biometric Entry
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">
                        Position attendee face in the camera oval and tap "Live Face Scan" to verify.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
