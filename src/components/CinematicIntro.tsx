"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, ChevronRight } from 'lucide-react';

export function CinematicIntro() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Check if intro has already run in this session
    const hasSeenIntro = sessionStorage.getItem('eventra_intro_seen');
    if (!hasSeenIntro) {
      setIsVisible(true);
      setHasStarted(true);

      // Auto-dissolve into the page after 2.6 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 2600);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('eventra_intro_seen', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="eventra-cinematic-intro"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            filter: 'blur(8px)',
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[99999] bg-[#07060A] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
          onClick={handleDismiss}
        >
          {/* Volumetric Obsidian Ambient Lighting */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Ambient Ruby Flare */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.8, scale: 1.2 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-red-600/30 via-rose-700/20 to-transparent blur-[160px]"
            />

            {/* Ambient Dalí Gold Flare */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 0.6, scale: 1.1 }}
              transition={{ duration: 2.2, delay: 0.2, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-amber-500/25 via-yellow-600/15 to-transparent blur-[140px]"
            />

            {/* Cyber Glass Lattice Background */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #EF4444 1px, transparent 1px),
                  linear-gradient(to bottom, #EF4444 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Center Title Card Showcase */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xl mx-auto">
            
            {/* Animated Vault Shield Emblem */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: -25 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 240,
                damping: 22,
                delay: 0.15,
              }}
              className="relative mb-6"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-red-600 via-rose-700 to-red-900 border-2 border-red-500/60 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 fill-amber-400/20 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
              </div>

              {/* Pulsing Shockwave Ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.9 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: 'easeOut',
                }}
                className="absolute inset-0 rounded-3xl border-2 border-red-500/40"
              />
            </motion.div>

            {/* Title: E V E N T R A */}
            <motion.div
              initial={{ y: 25, opacity: 0, letterSpacing: '0.1em' }}
              animate={{ y: 0, opacity: 1, letterSpacing: '0.35em' }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.3,
              }}
              className="overflow-hidden"
            >
              <h1 className="text-4xl sm:text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-amber-200 tracking-[0.35em] drop-shadow-[0_0_35px_rgba(239,68,68,0.6)]">
                EVENTRA
              </h1>
            </motion.div>

            {/* Glowing Laser Divider Beam */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.6, ease: 'easeInOut' }}
              className="h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent my-4 shadow-[0_0_12px_#EF4444]"
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400/90 drop-shadow-sm"
            >
              Zero-Trust Campus Event Operations & Biometric Gate
            </motion.p>

            {/* Cinematic Laser Progress Bar */}
            <div className="w-56 h-1 rounded-full bg-white/[0.08] mt-8 overflow-hidden relative">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.8,
                  delay: 0.4,
                  ease: 'easeInOut',
                }}
                className="w-full h-full bg-gradient-to-r from-red-600 via-amber-400 to-rose-600 shadow-[0_0_12px_#F59E0B]"
              />
            </div>

            {/* Skip / Enter Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1.2 }}
              className="mt-6 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              <span>Click anywhere to enter</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
