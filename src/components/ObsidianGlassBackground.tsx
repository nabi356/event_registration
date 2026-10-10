"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useEventSystem } from '@/context/EventSystemContext';

export function ObsidianGlassBackground() {
  const { theme } = useEventSystem();
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* ======================================================== */}
      {/* 1. Base Crystalline Obsidian Bedrock                     */}
      {/* ======================================================== */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isLight
            ? 'bg-gradient-to-br from-[#FAF8FC] via-[#F2EDF7] to-[#EAE4F2]'
            : 'bg-gradient-to-br from-[#060509] via-[#0B0910] to-[#040306]'
        }`}
      />

      {/* ======================================================== */}
      {/* 2. HIGHLY VISIBLE Cyber Grid & Dot Matrix Array          */}
      {/* ======================================================== */}
      {/* Primary Tech Grid (Clearly visible!) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLight ? 'opacity-[0.14]' : 'opacity-[0.22]'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isLight ? '#DC2626' : '#EF4444'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isLight ? '#DC2626' : '#EF4444'} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Major Secondary Coordinate Grid (160px x 160px) with Amber accents */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLight ? 'opacity-[0.08]' : 'opacity-[0.15]'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isLight ? '#D97706' : '#F59E0B'} 1.5px, transparent 1.5px),
            linear-gradient(to bottom, ${isLight ? '#D97706' : '#F59E0B'} 1.5px, transparent 1.5px)
          `,
          backgroundSize: '160px 160px',
        }}
      />

      {/* Luminous Intersection Dot Matrix */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLight ? 'opacity-[0.12]' : 'opacity-[0.25]'
        }`}
        style={{
          backgroundImage: `radial-gradient(circle, ${isLight ? '#DC2626' : '#F59E0B'} 1.2px, transparent 1.2px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ======================================================== */}
      {/* 3. Concentric Biometric Vault Radar Rings & Dials        */}
      {/* ======================================================== */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {/* Outer Rotating Vault Ring (880px) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 120, ease: 'linear' }}
          className={`w-[880px] h-[880px] rounded-full border-2 border-dashed transition-colors duration-500 ${
            isLight ? 'border-red-600/20' : 'border-red-500/25'
          }`}
        />

        {/* Middle Dalí Gold Ring (620px) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 80, ease: 'linear' }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full border transition-colors duration-500 ${
            isLight
              ? 'border-amber-600/25 shadow-[0_0_40px_rgba(217,119,6,0.1)]'
              : 'border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.15)]'
          }`}
          style={{
            borderWidth: '1.5px',
            borderStyle: 'solid',
          }}
        >
          {/* 4 Cardinal Radar Ticks */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-amber-400" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-amber-400" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-amber-400" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-amber-400" />
        </motion.div>

        {/* Inner Biometric Target Scanner Ring (380px) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 50, ease: 'linear' }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border-2 border-dotted transition-colors duration-500 ${
            isLight ? 'border-red-500/30' : 'border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
          }`}
        />
      </div>

      {/* ======================================================== */}
      {/* 4. Vivid Volumetric Nebulae & Ambient Prismatic Beams    */}
      {/* ======================================================== */}
      {/* Top-Left Money Heist Crimson Core Nebula */}
      <div
        className={`absolute -top-24 -left-24 w-[650px] h-[650px] rounded-full blur-[130px] transition-all duration-700 ${
          isLight
            ? 'bg-gradient-to-br from-red-600/20 via-rose-500/15 to-transparent'
            : 'bg-gradient-to-br from-red-600/40 via-rose-700/25 to-transparent'
        }`}
      />

      {/* Center-Right Dalí Gold Radiant Beam */}
      <div
        className={`absolute top-1/3 -right-20 w-[580px] h-[580px] rounded-full blur-[140px] transition-all duration-700 ${
          isLight
            ? 'bg-gradient-to-bl from-amber-500/18 via-yellow-500/12 to-transparent'
            : 'bg-gradient-to-bl from-amber-500/30 via-yellow-600/20 to-transparent'
        }`}
      />

      {/* Bottom-Center Deep Crimson & Purple Sheen */}
      <div
        className={`absolute -bottom-36 left-1/3 w-[620px] h-[620px] rounded-full blur-[150px] transition-all duration-700 ${
          isLight
            ? 'bg-gradient-to-tr from-rose-500/15 via-purple-400/10 to-transparent'
            : 'bg-gradient-to-tr from-red-700/30 via-purple-900/25 to-transparent'
        }`}
      />

      {/* ======================================================== */}
      {/* 5. Futuristic Cyber Telemetry Markers & Crosshairs       */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none p-8 font-mono text-[10px] tracking-widest hidden md:block">
        {/* Top Left Marker */}
        <div className={`absolute top-20 left-10 flex items-center gap-2 ${isLight ? 'text-red-700/40' : 'text-red-400/50'}`}>
          <span className="text-base font-bold">+</span>
          <span>GATE-01 // ZERO-TRUST ACTIVE</span>
        </div>

        {/* Top Right Marker */}
        <div className={`absolute top-20 right-10 flex items-center gap-2 ${isLight ? 'text-amber-700/40' : 'text-amber-400/50'}`}>
          <span>SYS-VAULT // 0x8F4A</span>
          <span className="text-base font-bold">+</span>
        </div>

        {/* Bottom Left Marker */}
        <div className={`absolute bottom-16 left-10 flex items-center gap-2 ${isLight ? 'text-slate-600/40' : 'text-slate-400/40'}`}>
          <span className="text-base font-bold">+</span>
          <span>BIOMETRIC-MESH // ENCRYPTED</span>
        </div>

        {/* Bottom Right Marker */}
        <div className={`absolute bottom-16 right-10 flex items-center gap-2 ${isLight ? 'text-red-700/40' : 'text-red-400/50'}`}>
          <span>TELEMETRY-STREAM // OK</span>
          <span className="text-base font-bold">+</span>
        </div>

        {/* High-Tech Corner Framing Brackets */}
        <div className={`absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 ${isLight ? 'border-red-600/30' : 'border-red-500/40'}`} />
        <div className={`absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 ${isLight ? 'border-red-600/30' : 'border-red-500/40'}`} />
        <div className={`absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 ${isLight ? 'border-red-600/30' : 'border-red-500/40'}`} />
        <div className={`absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 ${isLight ? 'border-red-600/30' : 'border-red-500/40'}`} />
      </div>

      {/* ======================================================== */}
      {/* 6. 3D Perspective Floor Grid at Bottom                   */}
      {/* ======================================================== */}
      <div
        className={`absolute bottom-0 inset-x-0 h-64 pointer-events-none transition-opacity duration-500 ${
          isLight ? 'opacity-[0.08]' : 'opacity-[0.18]'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isLight ? '#DC2626' : '#EF4444'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isLight ? '#DC2626' : '#EF4444'} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          transform: 'perspective(400px) rotateX(60deg)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, black 20%, transparent 90%)',
          WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 90%)',
        }}
      />
    </div>
  );
}
