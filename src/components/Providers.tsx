"use client";

import React from 'react';
import { EventSystemProvider, useEventSystem } from '@/context/EventSystemContext';
import { ToastContainer } from '@/components/ToastContainer';
import { StudentFaceEnrollModal } from '@/components/Biometrics/StudentFaceEnrollModal';
import { ManagementFaceScanGateModal } from '@/components/Biometrics/ManagementFaceScanGateModal';
import { RapidGateCheckInModal } from '@/components/ManagementDashboard/RapidGateCheckInModal';
import { EventFormModal } from '@/components/ManagementDashboard/EventFormModal';

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
      {children}
      <GlobalModals />
    </EventSystemProvider>
  );
}
