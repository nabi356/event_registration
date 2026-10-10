"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, QrCode, Smartphone, UserPlus } from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';
import { SecuritySettings } from '@/lib/types';

export function SecurityPanel() {
  const { securitySettings, updateSecuritySetting } = useEventSystem();

  const toggleItems: {
    key: keyof SecuritySettings;
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      key: 'strictGeoFence',
      title: 'Perimeter Check',
      description: 'Require attendee device within 50m of venue.',
      icon: MapPin,
    },
    {
      key: 'dynamicQR',
      title: 'Anti-Screenshot QR',
      description: 'Refresh gate passes every 10 seconds.',
      icon: QrCode,
    },
    {
      key: 'singleDeviceSession',
      title: 'Single Device Lock',
      description: 'Lock tickets to one physical phone or browser.',
      icon: Smartphone,
    },
    {
      key: 'allowGuests',
      title: 'Guest Admission (+1)',
      description: 'Allow attendees to bring one accompanying guest.',
      icon: UserPlus,
    },
  ];

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6 border-red-500/20">
      <div className="flex items-center justify-between pb-4 border-b border-red-500/15 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">
              Gate Access Rules
            </h3>
            <p className="text-[11px] text-slate-400">
              Active security policies for entrance verification
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
          Active
        </span>
      </div>

      <div className="space-y-2.5">
        {toggleItems.map((item) => {
          const Icon = item.icon;
          const isChecked = securitySettings[item.key];

          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-red-500/10 hover:border-red-500/25 transition-colors"
            >
              <div className="flex items-center gap-3 pr-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                    isChecked
                      ? 'bg-red-600/20 border-red-500/40 text-amber-400'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Money Heist Custom Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                onClick={() => updateSecuritySetting(item.key, !isChecked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isChecked ? 'bg-gradient-to-r from-red-600 to-rose-600' : 'bg-slate-800'
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isChecked ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
