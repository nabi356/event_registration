"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ViewMode,
  GeoFenceStatus,
  DeviceLockStatus,
  EventItem,
  CheckInRecord,
  SecuritySettings,
  ToastMessage,
} from '@/lib/types';
import {
  MOCK_EVENTS,
  INITIAL_CHECKINS,
  INITIAL_METRICS,
  INITIAL_SECURITY_SETTINGS,
  INITIAL_SECURITY_ACTIVITY,
  RANDOM_STUDENT_NAMES,
  CURRENT_STUDENT,
} from '@/lib/mockData';

interface EventSystemContextType {
  // Navigation & View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Selected Active Event
  selectedEvent: EventItem;
  setSelectedEvent: (event: EventItem) => void;
  events: EventItem[];

  // Dynamic QR & Timer
  qrValue: string;
  qrCountdown: number; // 10 -> 0
  qrRefreshKey: number; // For animation pulse

  // Simulation parameters
  geoFenceStatus: GeoFenceStatus;
  setGeoFenceStatus: (status: GeoFenceStatus) => void;
  deviceLockStatus: DeviceLockStatus;
  setDeviceLockStatus: (status: DeviceLockStatus) => void;

  // Metrics
  totalRegistered: number;
  checkedInCount: number;
  capacityPercentage: string;

  // Security
  securitySettings: SecuritySettings;
  updateSecuritySetting: (key: keyof SecuritySettings, val: boolean) => void;
  securityActivity: {
    locationFailures: number;
    expiredQrAttempts: number;
    deviceMismatches: number;
  };

  // Live feed & Actions
  checkIns: CheckInRecord[];
  simulateCheckIn: () => void;
  simulateFailedCheckIn: () => void;
  resetDemoStats: () => void;

  // Toasts
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  addToast: (type: ToastMessage['type'], title: string, description: string) => void;

  // 3D Ticket Flip State
  isTicketFlipped: boolean;
  setIsTicketFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  flipTicket: () => void;
}

const EventSystemContext = createContext<EventSystemContextType | undefined>(undefined);

export function EventSystemProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('student');
  const [events] = useState<EventItem[]>(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<EventItem>(MOCK_EVENTS[0]); // AI & Future Technologies

  // Dynamic QR simulation
  const [qrCountdown, setQrCountdown] = useState<number>(10);
  const [qrValue, setQrValue] = useState<string>('EVENT-2026-STUDENT-8472-TIME-00100-ACTIVE');
  const [qrRefreshKey, setQrRefreshKey] = useState<number>(0);

  // Initialize dynamic timestamp on mount
  useEffect(() => {
    setQrValue(`EVENT-2026-STUDENT-8472-TIME-${Math.floor(Date.now() / 1000)}`);
  }, []);

  // Geo-Fence & Device verification simulation
  const [geoFenceStatus, setGeoFenceStatus] = useState<GeoFenceStatus>('verified');
  const [deviceLockStatus, setDeviceLockStatus] = useState<DeviceLockStatus>('verified');

  // Ticket Flip
  const [isTicketFlipped, setIsTicketFlipped] = useState<boolean>(false);
  const flipTicket = useCallback(() => {
    setIsTicketFlipped((prev) => !prev);
  }, []);

  // Metrics & Feed
  const [totalRegistered] = useState<number>(INITIAL_METRICS.totalRegistered);
  const [checkedInCount, setCheckedInCount] = useState<number>(INITIAL_METRICS.checkedIn);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>(INITIAL_CHECKINS);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    INITIAL_SECURITY_SETTINGS
  );
  const [securityActivity, setSecurityActivity] = useState(INITIAL_SECURITY_ACTIVITY);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: ToastMessage['type'], title: string, description: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setToasts((prev) => [...prev, { id, type, title, description, timestamp: Date.now() }]);

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 10-second QR interval countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          // Regenerate QR
          const newTimestamp = Math.floor(Date.now() / 1000);
          const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
          setQrValue(`EVENT-2026-STUDENT-8472-TIME-${newTimestamp}-${randomHex}`);
          setQrRefreshKey((k) => k + 1);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Computed capacity percentage
  const capacityPercentage = ((checkedInCount / totalRegistered) * 100).toFixed(1);

  // Security toggle handler
  const updateSecuritySetting = (key: keyof SecuritySettings, val: boolean) => {
    setSecuritySettings((prev) => ({ ...prev, [key]: val }));
    addToast(
      'info',
      'Security Policy Updated',
      `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} set to ${val ? 'Active' : 'Disabled'}`
    );
  };

  // Simulate Check-in action (Successful)
  const simulateCheckIn = useCallback(() => {
    const randomName =
      RANDOM_STUDENT_NAMES[Math.floor(Math.random() * RANDOM_STUDENT_NAMES.length)];
    const ticketNum = 10483 + Math.floor(Math.random() * 200);

    const newRecord: CheckInRecord = {
      id: `chk-${Date.now()}`,
      name: randomName,
      ticketId: `EVT-${ticketNum}`,
      timeAgo: 'Just now',
      timestamp: new Date(),
      status: 'verified',
    };

    setCheckedInCount((c) => c + 1);
    setCheckIns((prev) => [newRecord, ...prev.slice(0, 19)]);
    addToast('success', 'Check-in Verified', `${randomName} · Entry approved`);
  }, [addToast]);

  // Simulate Failed Check-in action
  const simulateFailedCheckIn = useCallback(() => {
    const reasons = [
      'Device session mismatch',
      'Geo-fence perimeter violation (180m away)',
      'Expired dynamic token presented',
    ];
    const chosenReason = reasons[Math.floor(Math.random() * reasons.length)];
    const ticketNum = 10470 + Math.floor(Math.random() * 50);

    const newRecord: CheckInRecord = {
      id: `chk-fail-${Date.now()}`,
      name: chosenReason.includes('Device') ? 'Unknown Device' : 'Unregistered Device',
      ticketId: `EVT-${ticketNum}`,
      timeAgo: 'Just now',
      timestamp: new Date(),
      status: 'flagged',
      reason: chosenReason,
    };

    if (chosenReason.includes('Device')) {
      setSecurityActivity((prev) => ({ ...prev, deviceMismatches: prev.deviceMismatches + 1 }));
    } else if (chosenReason.includes('Geo-fence')) {
      setSecurityActivity((prev) => ({ ...prev, locationFailures: prev.locationFailures + 1 }));
    } else {
      setSecurityActivity((prev) => ({ ...prev, expiredQrAttempts: prev.expiredQrAttempts + 1 }));
    }

    setCheckIns((prev) => [newRecord, ...prev.slice(0, 19)]);
    addToast('error', 'Check-in Blocked', chosenReason);
  }, [addToast]);

  const resetDemoStats = () => {
    setCheckedInCount(INITIAL_METRICS.checkedIn);
    setCheckIns(INITIAL_CHECKINS);
    setSecurityActivity(INITIAL_SECURITY_ACTIVITY);
    setGeoFenceStatus('verified');
    setDeviceLockStatus('verified');
    setIsTicketFlipped(false);
    addToast('info', 'Terminal Baseline Calibrated', 'Operational parameters restored to baseline');
  };

  return (
    <EventSystemContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedEvent,
        setSelectedEvent,
        events,
        qrValue,
        qrCountdown,
        qrRefreshKey,
        geoFenceStatus,
        setGeoFenceStatus,
        deviceLockStatus,
        setDeviceLockStatus,
        totalRegistered,
        checkedInCount,
        capacityPercentage,
        securitySettings,
        updateSecuritySetting,
        securityActivity,
        checkIns,
        simulateCheckIn,
        simulateFailedCheckIn,
        resetDemoStats,
        toasts,
        dismissToast,
        addToast,
        isTicketFlipped,
        setIsTicketFlipped,
        flipTicket,
      }}
    >
      {children}
    </EventSystemContext.Provider>
  );
}

export function useEventSystem() {
  const context = useContext(EventSystemContext);
  if (!context) {
    throw new Error('useEventSystem must be used within an EventSystemProvider');
  }
  return context;
}
