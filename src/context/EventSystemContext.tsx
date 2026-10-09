"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
  UserRegistration,
} from '@/lib/types';
import {
  INITIAL_SECURITY_SETTINGS,
  INITIAL_SECURITY_ACTIVITY,
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
  selectedEvent: EventItem | null;
  setSelectedEvent: (event: EventItem) => void;
  events: EventItem[];
  refreshEvents: () => Promise<void>;
  registerForEvent: (eventId: string) => Promise<boolean>;
  cancelEventRegistration: (eventId: string) => Promise<boolean>;

  // Student Real Registrations
  myRegistrations: UserRegistration[];
  refreshMyRegistrations: () => Promise<void>;

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
  const [viewMode, setViewModeState] = useState<ViewMode>('student');

  // Auth User state: NULL by default - NO fake defaults!
  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Student's real registrations from MongoDB
  const [myRegistrations, setMyRegistrations] = useState<UserRegistration[]>([]);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFaceEnrollModalOpen, setIsFaceEnrollModalOpen] = useState(false);
  const [faceEnrollUpdateMode, setFaceEnrollUpdateMode] = useState(false);
  const [isFaceScanGateModalOpen, setIsFaceScanGateModalOpen] = useState(false);
  const [isRapidGateModalOpen, setIsRapidGateModalOpen] = useState(false);
  const [isEventFormModalOpen, setIsEventFormModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);

  // Real Events from MongoDB
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Dynamic QR
  const [qrCountdown, setQrCountdown] = useState<number>(10);
  const [qrValue, setQrValue] = useState<string>('');
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

  // Metrics & Feed - 0 by default, updated from DB
  const [totalRegistered, setTotalRegistered] = useState<number>(0);
  const [checkedInCount, setCheckedInCount] = useState<number>(0);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
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

  // Strict Role-Based View Switching
  const setViewMode = useCallback(
    (mode: ViewMode) => {
      if (mode === 'management') {
        if (!currentUser || currentUser.role !== 'management') {
          addToast(
            'error',
            'Access Denied',
            'Management portal is restricted to verified administrators.'
          );
          return;
        }
      }
      setViewModeState(mode);
    },
    [currentUser, addToast]
  );

  // Initialize stored auth on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('eventra_token');
      const storedUser = localStorage.getItem('eventra_user');
      if (storedToken && storedUser) {
        try {
          const parsed: AuthUserData = JSON.parse(storedUser);
          setToken(storedToken);
          setCurrentUser(parsed);
          if (parsed.role === 'management') {
            setViewModeState('management');
          } else {
            setViewModeState('student');
          }
        } catch {
          // ignore corrupted local storage
        }
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
          // Geolocation unavailable
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Fetch real events from MongoDB API
  const refreshEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        setEvents(data.events);

        // Keep current selected event updated or select first
        setSelectedEvent((prev) => {
          if (prev) {
            const match = data.events.find((e: EventItem) => e.id === prev.id);
            if (match) return match;
          }
          return data.events[0];
        });

        // Compute real total registered & checked-in across all events
        const totalReg = data.events.reduce(
          (sum: number, e: EventItem) => sum + (e.registeredCount || 0),
          0
        );
        const totalChk = data.events.reduce(
          (sum: number, e: EventItem) => sum + (e.checkedInCount || 0),
          0
        );
        setTotalRegistered(totalReg);
        setCheckedInCount(totalChk);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch student's real registrations from MongoDB
  const refreshMyRegistrations = useCallback(async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);
    if (!activeToken || !currentUser || currentUser.role !== 'student') {
      setMyRegistrations([]);
      return;
    }

    try {
      const res = await fetch('/api/registrations/my', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.registrations)) {
        setMyRegistrations(data.registrations);
      } else {
        setMyRegistrations([]);
      }
    } catch {
      setMyRegistrations([]);
    }
  }, [token, currentUser]);

  // Fetch live check-in feed (MANAGEMENT ONLY)
  const refreshCheckIns = useCallback(async () => {
    if (!selectedEvent?.id) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);
    if (!activeToken || !currentUser || currentUser.role !== 'management') {
      setCheckIns([]);
      return;
    }

    try {
      const res = await fetch(`/api/checkin/feed?eventId=${selectedEvent.id}`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.checkIns)) {
        setCheckIns(data.checkIns);
      }
    } catch {
      // ignore
    }
  }, [selectedEvent?.id, token, currentUser]);

  // Fetch security telemetry (MANAGEMENT ONLY)
  const refreshSecurityTelemetry = useCallback(async () => {
    if (!selectedEvent?.id) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);
    if (!activeToken || !currentUser || currentUser.role !== 'management') {
      setSecurityActivity(INITIAL_SECURITY_ACTIVITY);
      return;
    }

    try {
      const res = await fetch(`/api/security/alerts?eventId=${selectedEvent.id}`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
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
  }, [selectedEvent?.id, token, currentUser]);

  // Sync data on load and when dependencies change
  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  useEffect(() => {
    if (currentUser?.role === 'student') {
      refreshMyRegistrations();
    } else if (currentUser?.role === 'management') {
      refreshCheckIns();
      refreshSecurityTelemetry();
    }
  }, [currentUser, refreshMyRegistrations, refreshCheckIns, refreshSecurityTelemetry]);

  // Dynamic Pass Token (STUDENT ONLY for registered event)
  const fetchPassToken = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'student' || !selectedEvent?.id) {
      setQrValue('');
      return;
    }

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
      } else {
        setQrValue('');
      }
    } catch {
      setQrValue('');
    }
    setQrRefreshKey((k) => k + 1);
  }, [currentUser, selectedEvent?.id, token, userCoords]);

  // Pass rotation 1s interval timer
  useEffect(() => {
    if (currentUser?.role === 'student' && selectedEvent?.id) {
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
    }
  }, [currentUser?.role, selectedEvent?.id, fetchPassToken]);

  // Register for event (Student Action)
  const registerForEvent = async (eventId: string): Promise<boolean> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      addToast('info', 'Sign In Required', 'Please sign in or register to book an event pass.');
      return false;
    }

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
      await refreshMyRegistrations();
      await fetchPassToken();
      return true;
    } catch (err: any) {
      addToast('error', 'Registration Failed', err.message);
      return false;
    }
  };

  // Cancel registration (Student Action)
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
      await refreshMyRegistrations();
      setQrValue('');
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

    if (userData.role === 'management') {
      setViewModeState('management');
    } else {
      setViewModeState('student');
      if (!userData.hasFaceEnrolled) {
        setFaceEnrollUpdateMode(false);
        setIsFaceEnrollModalOpen(true);
      }
    }
  };

  // Logout handler
  const logoutUser = () => {
    setCurrentUser(null);
    setToken(null);
    setMyRegistrations([]);
    setCheckIns([]);
    setQrValue('');
    setViewModeState('student');
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

  // Express manual check-in (MANAGEMENT ONLY)
  const simulateCheckIn = async () => {
    if (!currentUser || currentUser.role !== 'management') {
      addToast('error', 'Access Denied', 'Operator check-in requires management privileges.');
      return;
    }
    if (!selectedEvent?.id) return;

    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);
      const res = await fetch('/api/checkin/rapid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
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
      await refreshEvents();
    } catch (err: any) {
      addToast('error', 'Check-in Failed', err.message);
    }
  };

  // Failed check-in / flag exception (MANAGEMENT ONLY)
  const simulateFailedCheckIn = async () => {
    if (!currentUser || currentUser.role !== 'management') {
      addToast('error', 'Access Denied', 'Security flags require management privileges.');
      return;
    }
    if (!selectedEvent?.id) return;

    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);
      await fetch('/api/checkin/flag-exception', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          reason: 'Perimeter anomaly flagged by terminal operator',
        }),
      });
      addToast('error', 'Security Exception Logged', 'Anomaly logged to database stream');
      await refreshCheckIns();
      await refreshSecurityTelemetry();
    } catch (err: any) {
      addToast('error', 'Security Exception Error', err.message);
    }
  };

  // Reset baseline (MANAGEMENT ONLY)
  const resetDemoStats = async () => {
    if (!currentUser || currentUser.role !== 'management') {
      addToast('error', 'Access Denied', 'Calibrating database requires management privileges.');
      return;
    }

    try {
      await fetch('/api/seed', { method: 'POST' });
      await refreshEvents();
      await refreshCheckIns();
      await refreshSecurityTelemetry();
      addToast('info', 'Database Calibrated', 'Operational baseline restored to clean seed state.');
    } catch {
      addToast('error', 'Calibration Error', 'Failed to recalibrate database.');
    }
  };

  // Export CSV (MANAGEMENT ONLY)
  const exportAttendeesCsv = () => {
    if (!currentUser || currentUser.role !== 'management') {
      addToast('error', 'Access Denied', 'Exporting attendee roster requires management privileges.');
      return;
    }
    if (!selectedEvent?.id) return;

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : '');
    window.open(
      `/api/reports/export-csv?eventId=${selectedEvent.id}&token=${encodeURIComponent(authToken || '')}`,
      '_blank'
    );
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
        myRegistrations,
        refreshMyRegistrations,
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
