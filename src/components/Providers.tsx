"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { EventSystemProvider, useEventSystem } from '@/context/EventSystemContext';
import { ToastContainer } from '@/components/ToastContainer';
import { RapidGateCheckInModal } from '@/components/ManagementDashboard/RapidGateCheckInModal';
import { EventFormModal } from '@/components/ManagementDashboard/EventFormModal';
import { ObsidianGlassBackground } from '@/components/ObsidianGlassBackground';
import { CinematicIntro } from '@/components/CinematicIntro';

const StudentFaceEnrollModal = dynamic(
  () => import('@/components/Biometrics/StudentFaceEnrollModal').then((m) => m.StudentFaceEnrollModal),
  { ssr: false }
);

const ManagementFaceScanGateModal = dynamic(
  () => import('@/components/Biometrics/ManagementFaceScanGateModal').then((m) => m.ManagementFaceScanGateModal),
  { ssr: false }
);

function GlobalModals() {
  const {
    isFaceEnrollModalOpen,
    setIsFaceEnrollModalOpen,
    faceEnrollUpdateMode,
    updateUserFaceState,
    isFaceScanGateModalOpen,
    setIsFaceScanGateModalOpen,
    events,
    selectedEvent,
    setSelectedEvent,
    refreshCheckIns,
    refreshSecurityTelemetry,
    isRapidGateModalOpen,
    setIsRapidGateModalOpen,
    isEventFormModalOpen,
    setIsEventFormModalOpen,
    eventToEdit,
    refreshEvents,
    token,
  } = useEventSystem();

  return (
    <>
      {/* First-time & Voluntary Face Biometric Enrollment Modal */}
      <StudentFaceEnrollModal
        isOpen={isFaceEnrollModalOpen}
        isUpdateMode={faceEnrollUpdateMode}
        onClose={() => setIsFaceEnrollModalOpen(false)}
        onSuccess={(updatedAt) => {
          updateUserFaceState(updatedAt);
        }}
        token={token || undefined}
      />

      {/* Management Live Face Scan Entry Gate Modal */}
      <ManagementFaceScanGateModal
        isOpen={isFaceScanGateModalOpen}
        events={events}
        selectedEvent={selectedEvent}
        onSelectEvent={setSelectedEvent}
        onClose={() => setIsFaceScanGateModalOpen(false)}
        onVerificationLogged={() => {
          refreshCheckIns();
          refreshSecurityTelemetry();
          refreshEvents();
        }}
      />

      {/* Management Rapid Gate Check-in Modal (QR or ID) */}
      <RapidGateCheckInModal
        isOpen={isRapidGateModalOpen}
        selectedEvent={selectedEvent}
        onClose={() => setIsRapidGateModalOpen(false)}
        onCheckInLogged={() => {
          refreshCheckIns();
          refreshSecurityTelemetry();
          refreshEvents();
        }}
      />

      {/* Management Event Creation & Editing Modal */}
      <EventFormModal
        isOpen={isEventFormModalOpen}
        eventToEdit={eventToEdit}
        onClose={() => setIsEventFormModalOpen(false)}
        onSaved={() => {
          refreshEvents();
        }}
        token={token || undefined}
      />

      {/* Global Notifications Toast Container */}
      <ToastContainer />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EventSystemProvider>
      {/* Global Futuristic Glassy Obsidian Dynamic Background */}
      <ObsidianGlassBackground />

      {/* Cinematic Title Card Entry Animation */}
      <CinematicIntro />

      {children}
      <GlobalModals />
    </EventSystemProvider>
  );
}
