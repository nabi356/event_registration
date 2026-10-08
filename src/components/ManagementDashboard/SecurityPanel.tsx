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
      title: 'Strict Geo-Fence',
      description: 'Require attendees to be within 50m of venue.',
      icon: MapPin,
    },
    {
      key: 'dynamicQR',
      title: 'Dynamic QR',
      description: 'Refresh secure tickets every 10 seconds.',
      icon: QrCode,
    },
    {
      key: 'singleDeviceSession',
      title: 'Single Device Session',
      description: 'Restrict tickets to one active device signature.',
      icon: Smartphone,
    },
    {
      key: 'allowGuests',
      title: 'Allow Guest +1s',
      description: 'Allow registered attendees to bring one verified guest.',
      icon: UserPlus,
    },
  ];

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Check-in Security
            </h3>
            <p className="text-[11px] text-slate-400">
              Zero-trust perimeter enforcement rules
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
          Enforcing
        </span>
      </div>

      <div className="space-y-3">
        {toggleItems.map((item) => {
          const Icon = item.icon;
          const isChecked = securitySettings[item.key];

          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-3 pr-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                    isChecked
                      ? 'bg-blue-600/15 border-blue-500/30 text-blue-400'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Professional Custom Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                onClick={() => updateSecuritySetting(item.key, !isChecked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  isChecked ? 'bg-blue-600' : 'bg-slate-800'
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
