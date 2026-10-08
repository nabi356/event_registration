"use client";

import React from 'react';
import { StudentHeader } from './StudentHeader';
import { EventsCarousel } from './EventsCarousel';
import { DigitalTicket3D } from './DigitalTicket3D';
import { SimulationControls } from './SimulationControls';

export function StudentView() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Student Profile & Greeting */}
      <StudentHeader />

      {/* Upcoming Events Carousel */}
      <EventsCarousel />

      {/* Active Digital Ticket & 3D Flip System */}
      <div className="mt-8">
        <div className="text-center mb-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-400 block mb-1">
            Active Digital Credential
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Campus Entry Token
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Zero-contact cryptographic entry pass with automated perimeter validation
          </p>
        </div>

        <DigitalTicket3D />

        {/* Hardware & Perimeter Diagnostic Console */}
        <SimulationControls />
      </div>
    </div>
  );
}
