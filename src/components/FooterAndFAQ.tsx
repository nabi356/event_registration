"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  HelpCircle,
  ChevronDown,
  Clock,
  Camera,
  QrCode,
  MapPin,
  Lock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ElementType;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'deadline',
    category: 'Registration & Cutoffs',
    question: 'What happens when an event reaches its registration deadline?',
    answer:
      'Event registrations strictly close the instant the cutoff deadline is reached. To uphold venue fire-code capacity, strict campus security clearances, and automated pass distribution, no new registrations or pass claims are accepted after the deadline passes.',
    icon: Clock,
  },
  {
    id: 'biometrics',
    category: 'Zero-Trust Gate Check-in',
    question: 'How does the Zero-Trust Biometric Gate verify my identity?',
    answer:
      'The campus gate kiosk analyzes your facial geometry on-device and matches it against your encrypted 128-dimensional biometric mathematical descriptor in under 180ms. If an individual is not registered for the event or profile is un-enrolled, the terminal immediately displays "User Not Registered".',
    icon: Camera,
  },
  {
    id: 'qr-fallback',
    category: 'Digital Passes',
    question: 'Can I check in without facial biometrics using my ticket QR?',
    answer:
      'Yes. Biometric face enrollment is completely voluntary. If you choose not to register face biometrics or withdraw consent, simply click "Show Gate Entry QR" on your 3D digital pass and present the high-contrast barcode to the optical terminal scanner at the entrance.',
    icon: QrCode,
  },
  {
    id: 'geofence',
    category: 'Perimeter Security',
    question: 'How does geofencing prevent proxy check-ins and scalping?',
    answer:
      'Each campus event defines a high-precision GPS perimeter boundary (typically 50–100m). Dynamic entry tokens are geo-validated to confirm that the passholder is physically on-site, completely eliminating proxy check-ins or remote credential distribution.',
    icon: MapPin,
  },
  {
    id: 'privacy',
    category: 'Data Protection & Consent',
    question: 'How are my biometric embeddings and privacy protected?',
    answer:
      'Eventra never stores raw photos or video feeds. Only irreversibly hashed vector feature maps are saved. You maintain 100% control over your credentials and can withdraw biometric consent or permanently purge your facial embeddings at any time from your profile menu.',
    icon: Lock,
  },
];

export function FooterAndFAQ() {
  const { theme, setViewMode } = useEventSystem();
  const [openFaq, setOpenFaq] = useState<string | null>('deadline');
  const isLight = theme === 'light';

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full mt-16 space-y-16">
      {/* ======================================================== */}
      {/* 1. INTERACTIVE FAQ SECTION                               */}
      {/* ======================================================== */}
      <section className="relative w-full rounded-3xl p-6 sm:p-10 glass-panel border-2 border-red-500/30 shadow-2xl overflow-hidden">
        {/* Subtle Background Glow Accents */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-bold uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Knowledge Base & Operations FAQ</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            Everything you need to know regarding campus entry passes, registration deadlines, and zero-trust biometric gate protocols.
          </p>
        </div>

        {/* Accordion FAQ Grid */}
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ_DATA.map((faq) => {
            const isOpen = openFaq === faq.id;
            const Icon = faq.icon;

            return (
              <motion.div
                key={faq.id}
                initial={false}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? isLight
                      ? 'bg-white border-red-500/50 shadow-md ring-1 ring-red-500/20'
                      : 'bg-[#18121B] border-red-500/50 shadow-xl shadow-red-950/40 ring-1 ring-red-500/30'
                    : isLight
                    ? 'bg-white/70 hover:bg-white border-slate-200 hover:border-red-500/30'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-red-500/30'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md'
                          : isLight
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-white/[0.05] text-amber-400 border border-white/[0.1]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                        {faq.category}
                      </span>
                      <h3
                        className={`text-sm sm:text-base font-bold tracking-tight leading-snug ${
                          isLight ? 'text-black' : 'text-white'
                        }`}
                      >
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-red-600/20 text-red-500' : 'text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-red-500/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. OFFICIAL FOOTER WITH COPYRIGHT                        */}
      {/* ======================================================== */}
      <footer className="relative w-full rounded-3xl border-t-2 border-red-500/30 glass-panel p-8 sm:p-12 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 border border-amber-400/40 flex items-center justify-center text-white shadow-lg shadow-red-950/50">
                <Shield className="w-5 h-5 text-amber-300 fill-amber-300/20" />
              </div>
              <div>
                <span className={`text-xl font-black tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
                  EVENTRA
                </span>
                <span className="block text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                  Zero-Trust Campus Security
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              State-of-the-art campus event operations platform with hardware perimeter geofencing, sub-second biometric face validation, and high-entropy dynamic QR entry passes.
            </p>

            {/* Live Operational Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gate Terminals Nominal • 99.98% Zero-Trust Uptime</span>
            </div>
          </div>

          {/* Quick Links: Portals */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
              Campus Operations
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a href="#events" className="hover:text-red-500 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-red-500" />
                  <span>Browse Campus Events</span>
                </a>
              </li>
              <li>
                <a href="#ticket" className="hover:text-red-500 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-red-500" />
                  <span>3D Digital Entry Passes</span>
                </a>
              </li>
              <li>
                <a href="/management" className="hover:text-red-500 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-red-500" />
                  <span>Management Command Suite</span>
                </a>
              </li>
              <li>
                <a href="/student" className="hover:text-red-500 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-red-500" />
                  <span>Student Passholder Portal</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Compliance Specifications */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
              Zero-Trust Architecture
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-red-500/15 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vector Math:</span>
                  <span className="text-amber-500 font-semibold">128-D Euclidean Face Embeddings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kiosk Speed:</span>
                  <span className="text-emerald-500 font-semibold">&lt;180ms Verification</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cutoff Enforcer:</span>
                  <span className="text-red-500 font-semibold">Atomic Deadline Lock</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Privacy-first: Raw biometric imagery is never retained. Embeddings can be purged on demand.
              </p>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-10 pt-6 border-t-2 border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400 font-medium text-center sm:text-left">
            © 2026 Eventra Operations. All rights reserved. Campus Event Operations & Zero-Trust Check-in.
          </p>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span className="hover:text-red-500 transition-colors cursor-pointer">Security Policy</span>
            <span>·</span>
            <span className="hover:text-red-500 transition-colors cursor-pointer">Biometric Privacy</span>
            <span>·</span>
            <span className="hover:text-red-500 transition-colors cursor-pointer">FERPA Compliant</span>
            <span>·</span>
            <span className="hover:text-amber-500 transition-colors cursor-pointer">System Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
