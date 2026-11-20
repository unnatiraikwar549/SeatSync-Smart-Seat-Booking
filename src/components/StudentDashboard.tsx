import React, { useState, useEffect } from 'react';
import { Booking, Seat, UserPersona } from '../types';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';

interface StudentDashboardProps {
  activeUser: UserPersona;
  seats: Seat[];
  bookings: Booking[];
  onOpenScanner: () => void;
  onNavigateToMap: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  activeUser,
  seats,
  bookings,
  onOpenScanner,
  onNavigateToMap
}) => {
  // Find current user's active booking
  const activeBooking = bookings.find(
    (b) => b.studentId === (activeUser.studentId || activeUser.id) && ['reserved', 'checked_in', 'away'].includes(b.status)
  );

  // Find corresponding seat
  const activeSeat = activeBooking ? seats.find((s) => s.id === activeBooking.seatId) : null;

  // Away timer states
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isNearExpiration, setIsNearExpiration] = useState<boolean>(false);
  const [hasWarnedAudio, setHasWarnedAudio] = useState<boolean>(false);

  // Update timer every second
  useEffect(() => {
    const updateTimer = () => {
      if (activeSeat?.status === 'away' && activeSeat.awayExpiresAt) {
        const diff = Math.max(0, Math.floor((activeSeat.awayExpiresAt - Date.now()) / 1000));
        setRemainingSeconds(diff);

        // Near expiration warning (< 3 minutes or < 10s for fast demo)
        if (diff > 0 && diff <= 180) {
          setIsNearExpiration(true);
          if (!hasWarnedAudio && diff <= 60) {
            soundService.playWarning();
            setHasWarnedAudio(true);
          }
        } else {
          setIsNearExpiration(false);
        }
      } else {
        setRemainingSeconds(0);
        setIsNearExpiration(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSeat, hasWarnedAudio]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start 20-min Away Timer
  const handleStartAway = () => {
    if (!activeBooking || !activeSeat) return;
    const config = storageService.getConfig();
    const durationMinutes = config.demoFastTimer ? 0.5 : 20; // 30 sec for demo mode, or 20 mins
    storageService.startAwayTimer(activeSeat.id, durationMinutes);
    soundService.playWarning();
  };

  // Return From Away Break
  const handleReturnFromAway = () => {
    if (!activeBooking || !activeSeat) return;
    storageService.returnFromAway(activeSeat.id);
    soundService.playCheckInSuccess();
  };

  // Cancel / Release Booking
  const handleReleaseSeat = () => {
    if (!activeBooking) return;
    if (confirm('Are you sure you want to release your desk reservation? It will immediately become available to other students.')) {
      storageService.cancelBooking(activeBooking.id);
      soundService.playAutoRelease();
    }
  };

  // Fast-Forward Demo Timer (Presentation helper)
  const handleFastForwardDemo = () => {
    if (!activeSeat || activeSeat.status !== 'away') return;
    const now = Date.now();
    const seats = storageService.getSeats();
    const updated = seats.map((s) => {
      if (s.id === activeSeat.id) {
        return {
          ...s,
          awayExpiresAt: now + 15000 // Jump to 15 seconds remaining
        };
      }
      return s;
    });
    storageService.saveSeats(updated);
  };

  // Filter history bookings for this student
  const userHistory = bookings.filter(
    (b) => b.studentId === (activeUser.studentId || activeUser.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Student Workspace & Pass
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">
              ID: {activeUser.studentId || 'FACULTY'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Welcome back, {activeUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your live seat session, digital QR check-in, and fair-use away grace periods.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScanner}
            className="px-4 py-2.5 rounded-xl bg-[#0d1633] hover:bg-[#13224f] text-sky-300 font-bold text-xs border border-sky-500/30 shadow-md shadow-sky-500/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Desk QR Scanner
          </button>
        </div>
      </div>

      {/* Main Grid: Active Booking + Digital Pass */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Active Booking Card (2 cols) */}
        <div className="lg:col-span-2">
          {activeBooking && activeSeat ? (
            <div className="bg-[#0d1633] rounded-3xl p-6 sm:p-8 border border-blue-900/80 shadow-2xl relative overflow-hidden">
              
              {/* Status Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-blue-950">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-sky-500/25">
                    {activeBooking.seatNumber}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Active Desk Pass
                    </h3>
                    <p className="text-xs text-slate-400">
                      Booking Ref: <span className="font-mono font-bold text-sky-400">{activeBooking.id}</span>
                    </p>
                  </div>
                </div>

                {/* State Pill */}
                <div className="flex items-center gap-2">
                  {activeBooking.status === 'reserved' && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                      Reserved (Check-in Required)
                    </span>
                  )}
                  {activeBooking.status === 'checked_in' && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Verified & Checked In
                    </span>
                  )}
                  {activeBooking.status === 'away' && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      Temporarily Away (Grace Active)
                    </span>
                  )}
                </div>
              </div>

              {/* Location & Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-blue-950 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">Floor Level</span>
                  <p className="font-bold text-white uppercase text-sm mt-0.5">{activeBooking.floor}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Zone</span>
                  <p className="font-bold text-white text-sm mt-0.5">{activeBooking.zone}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Noise Environment</span>
                  <p className="font-bold text-sky-300 text-sm mt-0.5">{activeSeat.noiseLevel}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Session Closes</span>
                  <p className="font-bold text-emerald-400 text-sm mt-0.5">
                    {new Date(activeBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* QR Verification CTA if status is reserved */}
              {activeBooking.status === 'reserved' && (
                <div className="my-6 p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/25">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Physical Check-in Required</h4>
                      <p className="text-xs text-sky-300">Scan physical desk QR code to confirm your presence.</p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenScanner}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/25 cursor-pointer shrink-0"
                  >
                    Open QR Check-in
                  </button>
                </div>
              )}

              {/* Core 20-Minute Away Timer Controller */}
              <div className="mt-6 pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">
                      20-Minute Study Break Controller
                    </h4>
                    <p className="text-xs text-slate-400">
                      Need a coffee or bathroom break? Activate grace timer to safeguard your seat.
                    </p>
                  </div>
                  {activeSeat.status === 'away' && (
                    <button
                      onClick={handleFastForwardDemo}
                      title="Judge presentation feature: Jumps timer to last 15 seconds"
                      className="text-[11px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 rounded-lg border border-amber-500/40 transition-colors cursor-pointer"
                    >
                      ⏩ Fast-Forward Demo (15s left)
                    </button>
                  )}
                </div>

                {activeSeat.status === 'away' ? (
                  <div className={`p-6 rounded-2xl border transition-all ${
                    isNearExpiration
                      ? 'bg-rose-950/60 border-rose-500/80 shadow-xl shadow-rose-950/40 animate-pulse'
                      : 'bg-amber-950/40 border-amber-500/60'
                  }`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl font-mono shadow-md ${
                          isNearExpiration ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {formatTime(remainingSeconds)}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                            Break Timer Counting Down
                          </span>
                          <h5 className={`text-base font-black ${isNearExpiration ? 'text-rose-400' : 'text-white'}`}>
                            {isNearExpiration ? '⚠️ Warning: Desk Will Auto-Release Soon!' : 'Seat Protected by Anti-Hogging System'}
                          </h5>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Return to desk and click "I'm Back" before 00:00 to keep your seat.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleReturnFromAway}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        ✓ I'm Back / Resume Study
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleStartAway}
                      className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Take a 20-Min Break (Step Away)
                    </button>
                    <button
                      onClick={handleReleaseSeat}
                      className="w-full sm:w-auto px-5 py-3 bg-blue-950 hover:bg-rose-950 hover:border-rose-700 hover:text-rose-300 text-slate-300 font-bold text-xs rounded-xl border border-blue-900 transition-colors cursor-pointer"
                    >
                      End Session & Release Seat
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0d1633] rounded-3xl p-10 border border-blue-900/70 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-3xl bg-blue-950 border border-blue-800 text-sky-400 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-white">
                No Active Seat Reservation
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                You do not currently hold any desk in the library. Jump into our interactive floor map to find and book your preferred study zone.
              </p>
              <button
                onClick={onNavigateToMap}
                className="mt-6 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
              >
                Find & Book a Seat →
              </button>
            </div>
          )}
        </div>

        {/* Digital Boarding Pass Card (1 col) */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-[#0a1128] via-[#0d1633] to-[#070c1d] text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-blue-900/80 relative">
            <div className="flex items-center justify-between pb-4 border-b border-blue-950">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                University Smart Pass
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                SeatSync ID
              </span>
            </div>

            {/* Pass Body */}
            <div className="py-6 text-center">
              {/* Dynamic QR Code Render */}
              <div className="w-44 h-44 bg-white rounded-2xl p-3 mx-auto shadow-inner flex flex-col items-center justify-center border-4 border-sky-500/30">
                {activeBooking ? (
                  <svg className="w-full h-full text-[#070c1d]" viewBox="0 0 100 100" fill="currentColor">
                    {/* Simulated High Density Matrix Pattern */}
                    <rect x="0" y="0" width="28" height="28" fill="#070c1d" />
                    <rect x="4" y="4" width="20" height="20" fill="#ffffff" />
                    <rect x="8" y="8" width="12" height="12" fill="#070c1d" />

                    <rect x="72" y="0" width="28" height="28" fill="#070c1d" />
                    <rect x="76" y="4" width="20" height="20" fill="#ffffff" />
                    <rect x="80" y="8" width="12" height="12" fill="#070c1d" />

                    <rect x="0" y="72" width="28" height="28" fill="#070c1d" />
                    <rect x="4" y="76" width="20" height="20" fill="#ffffff" />
                    <rect x="8" y="80" width="12" height="12" fill="#070c1d" />

                    {/* Data dots */}
                    <rect x="36" y="4" width="6" height="6" />
                    <rect x="48" y="8" width="8" height="6" />
                    <rect x="32" y="18" width="12" height="6" />
                    <rect x="52" y="24" width="10" height="8" />
                    <rect x="34" y="34" width="32" height="8" fill="#0284c7" />
                    <rect x="8" y="38" width="16" height="8" />
                    <rect x="76" y="38" width="16" height="8" />
                    <rect x="36" y="50" width="8" height="14" />
                    <rect x="52" y="50" width="12" height="6" />
                    <rect x="48" y="62" width="8" height="12" />
                    <rect x="36" y="76" width="10" height="6" />
                    <rect x="52" y="76" width="12" height="14" />
                    <rect x="74" y="72" width="16" height="6" />
                    <rect x="78" y="84" width="12" height="10" />
                  </svg>
                ) : (
                  <div className="text-slate-400 text-xs font-semibold px-4">
                    QR Generated Upon Seat Booking
                  </div>
                )}
              </div>

              <div className="mt-4">
                <span className="text-[10px] text-sky-400 font-mono font-semibold">
                  {activeBooking ? activeBooking.qrCodeToken.substring(0, 24) + '...' : 'INACTIVE PASS'}
                </span>
                <h4 className="text-lg font-bold text-white mt-1">
                  {activeUser.name}
                </h4>
                <p className="text-xs text-sky-300 font-semibold">
                  {activeBooking ? `Seat ${activeBooking.seatNumber} • Level ${activeBooking.floor.toUpperCase()}` : 'No Reserved Seat'}
                </p>
              </div>
            </div>

            {/* Barcode Footer Graphic */}
            <div className="pt-4 border-t border-blue-950 flex flex-col items-center">
              <div className="flex gap-1 h-6 w-full items-center justify-center opacity-60">
                {[4, 2, 6, 1, 3, 5, 2, 8, 3, 2, 5, 1, 4, 2, 6, 3, 2, 5].map((w, idx) => (
                  <span key={idx} className="bg-sky-300 h-full inline-block" style={{ width: `${w}px` }}></span>
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1">
                ALX-LIB-AUTH-2026-ENCRYPTED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking History Table */}
      <div className="bg-[#0d1633] rounded-3xl p-6 sm:p-8 border border-blue-900/80 shadow-2xl">
        <h3 className="text-lg font-black text-white mb-1">
          Recent Study Session History
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Log of past bookings, durations, and departure records.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090f24] text-slate-400 uppercase font-semibold border-b border-blue-950">
              <tr>
                <th className="py-3 px-4">Seat</th>
                <th className="py-3 px-4">Floor / Zone</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950 text-slate-300">
              {userHistory.length > 0 ? (
                userHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-950/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-white">
                      {item.seatNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.floor.toUpperCase()} • {item.zone}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {new Date(item.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.durationHours} Hours
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'checked_in'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : item.status === 'reserved'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : item.status === 'away'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : item.status === 'auto_released'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No session history recorded yet. Book a seat to start your study log.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
