"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  ViewMode,
  GeoFenceStatus,
  DeviceLockStatus,
  EventItem,
  CheckInRecord,
  SecuritySettings,
  ToastMessage,
  AuthUserData,
} from '@/lib/types';
import {
  MOCK_EVENTS,
  INITIAL_CHECKINS,
  INITIAL_METRICS,
  INITIAL_SECURITY_SETTINGS,
  INITIAL_SECURITY_ACTIVITY,
  CURRENT_STUDENT,
} from '@/lib/mockData';

interface EventSystemContextType {
  // Navigation & View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Auth & Profile
  currentUser: AuthUserData | null;
  token: string | null;
  loginUser: (user: AuthUserData, token: string) => void;
  logoutUser: () => void;
  deleteAccount: () => Promise<void>;
  updateUserFaceState: (updatedAt: string) => void;

  // Selected Active Event & List
  selectedEvent: EventItem;
  setSelectedEvent: (event: EventItem) => void;
  events: EventItem[];
  refreshEvents: () => Promise<void>;
  registerForEvent: (eventId: string) => Promise<boolean>;
  cancelEventRegistration: (eventId: string) => Promise<boolean>;

  // Dynamic QR & Timer
  qrValue: string;
  qrCountdown: number;
  qrRefreshKey: number;

  // Geo-Fence & Hardware Device Lock
  geoFenceStatus: GeoFenceStatus;
  setGeoFenceStatus: (status: GeoFenceStatus) => void;
  deviceLockStatus: DeviceLockStatus;
  setDeviceLockStatus: (status: DeviceLockStatus) => void;
  userCoords: { lat: number; lng: number } | null;

  // Metrics
  totalRegistered: number;
  checkedInCount: number;
  capacityPercentage: string;

  // Security Policy & Telemetry
  securitySettings: SecuritySettings;
  updateSecuritySetting: (key: keyof SecuritySettings, val: boolean) => void;
  securityActivity: {
    locationFailures: number;
    expiredQrAttempts: number;
    deviceMismatches: number;
  };
  refreshSecurityTelemetry: () => Promise<void>;

  // Live feed & Actions
  checkIns: CheckInRecord[];
  refreshCheckIns: () => Promise<void>;
  simulateCheckIn: () => void;
  simulateFailedCheckIn: () => void;
  resetDemoStats: () => void;
  exportAttendeesCsv: () => void;

  // Toasts
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  addToast: (type: ToastMessage['type'], title: string, description: string) => void;

  // 3D Ticket Flip State
  isTicketFlipped: boolean;
  setIsTicketFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  flipTicket: () => void;

  // Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isFaceEnrollModalOpen: boolean;
  setIsFaceEnrollModalOpen: (open: boolean) => void;
  faceEnrollUpdateMode: boolean;
  setFaceEnrollUpdateMode: (updateMode: boolean) => void;
  isFaceScanGateModalOpen: boolean;
  setIsFaceScanGateModalOpen: (open: boolean) => void;
  isRapidGateModalOpen: boolean;
  setIsRapidGateModalOpen: (open: boolean) => void;
  isEventFormModalOpen: boolean;
  setIsEventFormModalOpen: (open: boolean) => void;
  eventToEdit: EventItem | null;
  setEventToEdit: (evt: EventItem | null) => void;
}

const EventSystemContext = createContext<EventSystemContextType | undefined>(undefined);

export function EventSystemProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('student');

  // Auth User state
  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFaceEnrollModalOpen, setIsFaceEnrollModalOpen] = useState(false);
  const [faceEnrollUpdateMode, setFaceEnrollUpdateMode] = useState(false);
  const [isFaceScanGateModalOpen, setIsFaceScanGateModalOpen] = useState(false);
  const [isRapidGateModalOpen, setIsRapidGateModalOpen] = useState(false);
  const [isEventFormModalOpen, setIsEventFormModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);

  // Events & Selected Event
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<EventItem>(MOCK_EVENTS[0]);

  // Dynamic QR
  const [qrCountdown, setQrCountdown] = useState<number>(10);
  const [qrValue, setQrValue] = useState<string>('EVTRA-INITIAL-BOOT-SESSION');
  const [qrRefreshKey, setQrRefreshKey] = useState<number>(0);

  // Geo-Fence & Device verification
  const [geoFenceStatus, setGeoFenceStatus] = useState<GeoFenceStatus>('verified');
  const [deviceLockStatus, setDeviceLockStatus] = useState<DeviceLockStatus>('verified');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Ticket Flip
  const [isTicketFlipped, setIsTicketFlipped] = useState<boolean>(false);
  const flipTicket = useCallback(() => {
    setIsTicketFlipped((prev) => !prev);
  }, []);

  // Metrics & Feed
  const [totalRegistered, setTotalRegistered] = useState<number>(INITIAL_METRICS.totalRegistered);
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

      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize or fetch current user on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('eventra_token');
      const storedUser = localStorage.getItem('eventra_user');
      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setToken(storedToken);
          setCurrentUser(parsed);
        } catch {
          // ignore parsing error
        }
      } else {
        // Fallback default student profile for instant UX
        setCurrentUser({
          id: 'user-default-nabidul',
          name: CURRENT_STUDENT.name,
          enrollmentNo: CURRENT_STUDENT.studentId,
          university: 'Apex Institute of Technology',
          email: CURRENT_STUDENT.email,
          role: 'student',
          department: CURRENT_STUDENT.department,
          enrolledYear: CURRENT_STUDENT.enrolledYear,
          hasFaceEnrolled: true,
        });
      }
    }
  }, []);

  // Browser Geolocation Detection
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Geolocation denied or unavailable
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Fetch real events from API
  const refreshEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        setEvents(data.events);

        // Keep current selected event updated or select first
        setSelectedEvent((prev) => {
          const match = data.events.find((e: EventItem) => e.id === prev.id);
          return match || data.events[0];
        });

        // Update overall registered and checked-in counts
        const totalReg = data.events.reduce(
          (sum: number, e: EventItem) => sum + (e.registeredCount || 0),
          0
        );
        const totalChk = data.events.reduce(
          (sum: number, e: EventItem) => sum + (e.checkedInCount || 0),
          0
        );
        if (totalReg > 0) setTotalRegistered(totalReg);
        if (totalChk > 0) setCheckedInCount(totalChk);
      } else {
        // Auto-seed if database is empty
        fetch('/api/seed', { method: 'POST' }).then(() => {
          fetch('/api/events')
            .then((r) => r.json())
            .then((d) => {
              if (d.success && d.events?.length > 0) {
                setEvents(d.events);
                setSelectedEvent(d.events[0]);
              }
            });
        });
      }
    } catch {
      // Keep mock events as graceful fallback
    }
  }, []);

  // Fetch live check-in feed
  const refreshCheckIns = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkin/feed?eventId=${selectedEvent.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.checkIns)) {
        setCheckIns(data.checkIns);
      }
    } catch {
      // ignore
    }
  }, [selectedEvent.id]);

  // Fetch security telemetry
  const refreshSecurityTelemetry = useCallback(async () => {
    try {
      const res = await fetch(`/api/security/alerts?eventId=${selectedEvent.id}`);
      const data = await res.json();
      if (data.success && data.activity) {
        setSecurityActivity(data.activity);
        if (data.activity.successfulCheckIns !== undefined) {
          setCheckedInCount(data.activity.successfulCheckIns);
        }
      }
    } catch {
      // ignore
    }
  }, [selectedEvent.id]);

  // Initial data load
  useEffect(() => {
    refreshEvents();
    refreshCheckIns();
    refreshSecurityTelemetry();
  }, [refreshEvents, refreshCheckIns, refreshSecurityTelemetry]);

  // 10-Second Dynamic Pass Token Rotation from Server
  const fetchPassToken = useCallback(async () => {
    if (!currentUser || !selectedEvent) return;

    let deviceId = typeof window !== 'undefined' ? localStorage.getItem('eventra_device_id') : null;
    if (!deviceId) {
      deviceId = `DEV-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      if (typeof window !== 'undefined') localStorage.setItem('eventra_device_id', deviceId);
    }

    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);
      const res = await fetch('/api/pass/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          deviceId,
          userLat: userCoords?.lat,
          userLng: userCoords?.lng,
        }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        setQrValue(data.token);
        if (data.secondsRemaining) {
          setQrCountdown(data.secondsRemaining);
        }
        if (data.deviceStatus) {
          setDeviceLockStatus(data.deviceStatus);
        }
        if (data.geoStatus) {
          setGeoFenceStatus(data.geoStatus);
        }
      }
    } catch {
      // Fallback local rotating token
      const newTimestamp = Math.floor(Date.now() / 1000);
      const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      setQrValue(`EVTRA-${selectedEvent.id}-${newTimestamp}-${randomHex}`);
    }
    setQrRefreshKey((k) => k + 1);
  }, [currentUser, selectedEvent, token, userCoords]);

  // Pass rotation 1s interval timer
  useEffect(() => {
    fetchPassToken();

    const timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          fetchPassToken();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchPassToken]);

  // Register for event
  const registerForEvent = async (eventId: string): Promise<boolean> => {
    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();
      if (!data.success) {
        addToast('error', 'Registration Failed', data.error || 'Could not register for event');
        return false;
      }

      addToast('success', 'Registration Confirmed', 'Digital pass generated for event!');
      await refreshEvents();
      return true;
    } catch (err: any) {
      addToast('error', 'Registration Failed', err.message);
      return false;
    }
  };

  // Cancel registration
  const cancelEventRegistration = async (eventId: string): Promise<boolean> => {
    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);
      const res = await fetch('/api/registrations/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();
      if (!data.success) {
        addToast('error', 'Cancellation Failed', data.error || 'Could not cancel registration');
        return false;
      }

      addToast('info', 'Registration Cancelled', 'Pass deactivated.');
      await refreshEvents();
      return true;
    } catch (err: any) {
      addToast('error', 'Cancellation Error', err.message);
      return false;
    }
  };

  // Login handler
  const loginUser = (userData: AuthUserData, userToken: string) => {
    setCurrentUser(userData);
    setToken(userToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eventra_token', userToken);
      localStorage.setItem('eventra_user', JSON.stringify(userData));
    }
    addToast('success', 'Authenticated', `Welcome back, ${userData.name}!`);

    // First time face enrollment prompt if student and not enrolled
    if (userData.role === 'student' && !userData.hasFaceEnrolled) {
      setFaceEnrollUpdateMode(false);
      setIsFaceEnrollModalOpen(true);
    }
  };

  // Logout handler
  const logoutUser = () => {
    setCurrentUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eventra_token');
      localStorage.removeItem('eventra_user');
    }
    addToast('info', 'Logged Out', 'You have been signed out of Eventra.');
  };

  // Account deletion
  const deleteAccount = async () => {
    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);
      await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      });
      logoutUser();
      addToast('info', 'Account Deleted', 'Biometric face data permanently erased.');
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const updateUserFaceState = (updatedAt: string) => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        hasFaceEnrolled: true,
        faceUpdatedAt: updatedAt,
      };
      setCurrentUser(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('eventra_user', JSON.stringify(updated));
      }
      addToast('success', 'Biometrics Enrolled', 'Face vector embedding stored successfully.');
    }
  };

  // Computed capacity percentage
  const capacityPercentage =
    totalRegistered > 0 ? ((checkedInCount / totalRegistered) * 100).toFixed(1) : '0.0';

  // Security policy toggle
  const updateSecuritySetting = (key: keyof SecuritySettings, val: boolean) => {
    setSecuritySettings((prev) => ({ ...prev, [key]: val }));
    addToast(
      'info',
      'Security Policy Updated',
      `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} set to ${val ? 'Active' : 'Disabled'}`
    );
  };

  // Express manual check-in
  const simulateCheckIn = async () => {
    try {
      const res = await fetch('/api/checkin/rapid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          identifier: 'UNI-2026-8472',
        }),
      });
      const data = await res.json();
      if (data.verified) {
        setCheckedInCount((c) => c + 1);
        addToast('success', 'Rapid Gate Check-in', `${data.student?.name || 'Attendee'} · Entry approved`);
      } else {
        addToast('error', 'Check-in Blocked', data.reason || 'Verification failed');
      }
      await refreshCheckIns();
    } catch {
      setCheckedInCount((c) => c + 1);
      addToast('success', 'Check-in Verified', 'Entry approved');
    }
  };

  // Failed check-in / flag exception
  const simulateFailedCheckIn = async () => {
    try {
      await fetch('/api/checkin/flag-exception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          reason: 'Perimeter anomaly flagged by terminal',
        }),
      });
      addToast('error', 'Security Exception Logged', 'Anomaly logged to database stream');
      await refreshCheckIns();
      await refreshSecurityTelemetry();
    } catch {
      addToast('error', 'Security Exception', 'Exception logged');
    }
  };

  // Reset baseline
  const resetDemoStats = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      await refreshEvents();
      await refreshCheckIns();
      await refreshSecurityTelemetry();
      addToast('info', 'Database Calibrated', 'Operational baseline restored to clean seed state.');
    } catch {
      setCheckedInCount(INITIAL_METRICS.checkedIn);
      setCheckIns(INITIAL_CHECKINS);
      setGeoFenceStatus('verified');
      setDeviceLockStatus('verified');
      setIsTicketFlipped(false);
      addToast('info', 'Terminal Calibrated', 'Operational parameters restored.');
    }
  };

  // Export CSV
  const exportAttendeesCsv = () => {
    window.open(`/api/reports/export-csv?eventId=${selectedEvent.id}`, '_blank');
    addToast('success', 'Exporting CSV', 'Downloading verified attendee roster...');
  };

  return (
    <EventSystemContext.Provider
      value={{
        viewMode,
        setViewMode,
        currentUser,
        token,
        loginUser,
        logoutUser,
        deleteAccount,
        updateUserFaceState,
        selectedEvent,
        setSelectedEvent,
        events,
        refreshEvents,
        registerForEvent,
        cancelEventRegistration,
        qrValue,
        qrCountdown,
        qrRefreshKey,
        geoFenceStatus,
        setGeoFenceStatus,
        deviceLockStatus,
        setDeviceLockStatus,
        userCoords,
        totalRegistered,
        checkedInCount,
        capacityPercentage,
        securitySettings,
        updateSecuritySetting,
        securityActivity,
        refreshSecurityTelemetry,
        checkIns,
        refreshCheckIns,
        simulateCheckIn,
        simulateFailedCheckIn,
        resetDemoStats,
        exportAttendeesCsv,
        toasts,
        dismissToast,
        addToast,
        isTicketFlipped,
        setIsTicketFlipped,
        flipTicket,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isFaceEnrollModalOpen,
        setIsFaceEnrollModalOpen,
        faceEnrollUpdateMode,
        setFaceEnrollUpdateMode,
        isFaceScanGateModalOpen,
        setIsFaceScanGateModalOpen,
        isRapidGateModalOpen,
        setIsRapidGateModalOpen,
        isEventFormModalOpen,
        setIsEventFormModalOpen,
        eventToEdit,
        setEventToEdit,
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
