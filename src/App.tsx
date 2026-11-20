import React, { useState, useEffect, useCallback } from 'react';
import { Seat, Booking, ActivityLog, UserPersona, FloorId, ThemeMode } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { FloorMap } from './components/FloorMap';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingModal } from './components/BookingModal';
import { QRCheckInModal } from './components/QRCheckInModal';
import { DemoControlsModal } from './components/DemoControlsModal';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('SEATSYNC_THEME') as ThemeMode) || 'dark');
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('SEATSYNC_THEME', next);
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
      document.documentElement.classList.remove('dark');
    } else {
      document.body.style.backgroundColor = '#070c1d';
      document.body.style.color = '#f8fafc';
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'landing' | 'map' | 'dashboard' | 'admin' | 'scanner'>('landing');
  const [selectedFloor, setSelectedFloor] = useState<FloorId>('ground');

  // Core Data
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeUser, setActiveUser] = useState<UserPersona>(storageService.getActiveUser());

  // Modals
  const [bookingSeat, setBookingSeat] = useState<Seat | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isDemoControlsOpen, setIsDemoControlsOpen] = useState<boolean>(false);

  // Toast alert
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Sync data from storageService
  const refreshData = useCallback(() => {
    setSeats(storageService.getSeats());
    setBookings(storageService.getBookings());
    setLogs(storageService.getLogs());
    setActiveUser(storageService.getActiveUser());
  }, []);

  useEffect(() => {
    refreshData();
    const unsubscribe = storageService.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [refreshData]);

  // Current user's active booking
  const userBooking = bookings.find(
    (b) => b.studentId === (activeUser.studentId || activeUser.id) && ['reserved', 'checked_in', 'away'].includes(b.status)
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#070c1d] text-slate-100 selection:bg-sky-500' : 'bg-[#f8fafc] text-slate-900 selection:bg-blue-500'
    }`}>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-sky-500/90 text-white border-sky-400 shadow-sky-500/20'
              : toast.type === 'warning'
              ? 'bg-amber-500/90 text-slate-950 border-amber-400 shadow-amber-500/20'
              : 'bg-rose-600/90 text-white border-rose-500 shadow-rose-600/20'
          }`}>
            <span>
              {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠️' : '✕'}
            </span>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        seats={seats}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        onOpenDemoControls={() => setIsDemoControlsOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            seats={seats}
            onNavigateToMap={(floorId) => {
              if (floorId) setSelectedFloor(floorId as FloorId);
              setActiveTab('map');
            }}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'map' && (
          <FloorMap
            seats={seats}
            activeUser={activeUser}
            selectedFloor={selectedFloor}
            setSelectedFloor={setSelectedFloor}
            onSelectSeat={() => {}}
            onBookSeat={(seat) => setBookingSeat(seat)}
          />
        )}

        {activeTab === 'dashboard' && (
          <StudentDashboard
            activeUser={activeUser}
            seats={seats}
            bookings={bookings}
            onOpenScanner={() => setIsScannerOpen(true)}
            onNavigateToMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            seats={seats}
            bookings={bookings}
            logs={logs}
          />
        )}

        {activeTab === 'scanner' && (
          <div className="py-12 max-w-lg mx-auto px-4">
            <div className={`rounded-3xl p-6 sm:p-8 border shadow-2xl text-center ${
              isDark ? 'bg-[#0d1633] border-blue-900/80' : 'bg-white border-slate-200'
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h2 className="text-xl font-black">QR Check-in Station</h2>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Scan your desk QR code to confirm physical attendance.
              </p>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white rounded-xl font-extrabold text-sm shadow-xl shadow-sky-500/25 transition-all cursor-pointer"
              >
                Launch QR Scanner Modal
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Booking Confirmation Modal */}
      {bookingSeat && (
        <BookingModal
          seat={bookingSeat}
          activeUser={activeUser}
          onClose={() => setBookingSeat(null)}
          onBookingSuccess={(booking) => {
            setBookingSeat(null);
            showToast(`Seat ${booking.seatNumber} reserved successfully! Please check in within 15 min.`, 'success');
            setActiveTab('dashboard');
          }}
        />
      )}

      {/* QR Check-in Scanner Modal */}
      {isScannerOpen && (
        <QRCheckInModal
          userBooking={userBooking}
          onClose={() => setIsScannerOpen(false)}
          onCheckInSuccess={(b) => {
            showToast(`Checked in to Seat ${b.seatNumber}! Study pass active.`, 'success');
            setIsScannerOpen(false);
            setActiveTab('dashboard');
          }}
        />
      )}

      {/* Demo Controls Modal */}
      {isDemoControlsOpen && (
        <DemoControlsModal
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          onClose={() => setIsDemoControlsOpen(false)}
          onDataReset={() => {
            refreshData();
            showToast('All demo data has been reset to defaults.', 'success');
          }}
        />
      )}
    </div>
  );
};
