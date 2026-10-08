"use client";

import React from 'react';
import { ShieldAlert, MapPinOff, ClockAlert, Smartphone, CheckCheck } from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export function SecurityActivity() {
  const { securityActivity, checkedInCount } = useEventSystem();

  const stats = [
    {
      label: 'Location Failures',
      count: securityActivity.locationFailures,
      desc: 'Outside 50m perimeter',
      icon: MapPinOff,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Expired QR Attempts',
      count: securityActivity.expiredQrAttempts,
      desc: 'Replay protection caught',
      icon: ClockAlert,
      badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    },
    {
      label: 'Device Mismatches',
      count: securityActivity.deviceMismatches,
      desc: 'Hardware signature mismatch',
      icon: Smartphone,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      label: 'Successful Check-ins',
      count: checkedInCount,
      desc: 'Valid pass verifications',
      icon: CheckCheck,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6">
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Security Activity
          </h3>
          <p className="text-[11px] text-slate-400">
            Automated anomaly detection log
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Past 2h</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400 line-clamp-1">
                  {stat.label}
                </span>
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center border ${stat.badgeColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                  {stat.count.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                  {stat.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
