import React from 'react';
import { Seat } from '../types';
import { FLOORS } from '../data/initialSeats';

interface LandingPageProps {
  seats: Seat[];
  onNavigateToMap: (floorId?: string) => void;
  onNavigateToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  seats,
  onNavigateToMap,
}) => {
  const totalSeats = seats.length;
  const availableSeats = seats.filter((s) => s.status === 'available').length;
  const awaySeats = seats.filter((s) => s.status === 'away').length;

  const occupancyRate = totalSeats > 0 ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100) : 0;

  // Floor stats calculation
  const getFloorStats = (floorId: string) => {
    const floorSeats = seats.filter((s) => s.floor === floorId);
    const available = floorSeats.filter((s) => s.status === 'available').length;
    const total = floorSeats.length;
    const percent = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
    return { available, total, percent };
  };

  return (
    <div className="min-h-screen bg-[#070c1d] text-slate-100 flex flex-col">
      {/* Top Banner Alert for Exam Rush in Deep Navy & Electric Blue */}
      <div className="bg-gradient-to-r from-blue-900/90 via-sky-900/70 to-blue-950/90 border-b border-sky-500/30 text-sky-200 text-xs sm:text-sm font-medium py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
        </span>
        <span>
          <strong className="text-white">Exam Season Real-Time Protocol Active:</strong> 20-Minute Anti-Bag-Hogging Away Timer is enforced on all floors.
        </span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold mb-6 shadow-sm shadow-sky-500/10">
              <img src="/seatsync_icon.png" alt="" className="w-4 h-4 rounded object-cover" />
              <span>Smart Campus Library Automation • Alexandria University</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.15]">
              Find Your Seat.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">
                Focus on Your Future.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
              No more wandering library stairs during midterms. Instantly view live floor vacancies, reserve your desk with charging sockets, check in via QR code, and enjoy fair-study enforcement.
            </p>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigateToMap()}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-extrabold text-base shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find a Seat Now →
              </button>
              <button
                onClick={() => onNavigateToMap()}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0d1633] hover:bg-[#13224f] text-slate-200 font-bold text-base border border-blue-900/80 shadow-md transition-all hover:border-sky-500/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View Library Map
              </button>
            </div>

            {/* Live Stats Bar Cards in Deep Navy & Electric Blue */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="bg-[#0d1633] rounded-2xl p-5 border border-blue-900/60 shadow-xl shadow-black/20 hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Available Now</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-3xl font-black text-white">{availableSeats}</div>
                <p className="text-xs text-slate-400 mt-1">Ready for instant booking</p>
              </div>

              <div className="bg-[#0d1633] rounded-2xl p-5 border border-blue-900/60 shadow-xl shadow-black/20 hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Desks</span>
                  <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                  </svg>
                </div>
                <div className="text-3xl font-black text-white">{totalSeats}</div>
                <p className="text-xs text-slate-400 mt-1">Spread across 3 floors</p>
              </div>

              <div className="bg-[#0d1633] rounded-2xl p-5 border border-blue-900/60 shadow-xl shadow-black/20 hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Occupancy</span>
                  <span className="text-xs font-bold text-sky-300">{occupancyRate}%</span>
                </div>
                <div className="text-3xl font-black text-white">{occupancyRate}%</div>
                <div className="w-full bg-blue-950 h-2 rounded-full mt-2 overflow-hidden border border-blue-900/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      occupancyRate > 80 ? 'bg-rose-500' : occupancyRate > 50 ? 'bg-amber-400' : 'bg-sky-400'
                    }`}
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#0d1633] rounded-2xl p-5 border border-blue-900/60 shadow-xl shadow-black/20 hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Away Grace</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                </div>
                <div className="text-3xl font-black text-amber-400">{awaySeats}</div>
                <p className="text-xs text-slate-400 mt-1">20-min grace active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Floors Interactive Preview Section */}
      <section className="py-16 bg-[#0a1128] border-y border-blue-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-sky-400 tracking-wider uppercase">
                Library Real-Time Topology
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Explore Available Floors
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Click any floor level to jump straight to its interactive seat map.
              </p>
            </div>
            <button
              onClick={() => onNavigateToMap()}
              className="mt-4 md:mt-0 text-sm font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 group cursor-pointer"
            >
              Open Complete Interactive Map
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FLOORS.map((floor) => {
              const { available, total, percent } = getFloorStats(floor.id);
              return (
                <div
                  key={floor.id}
                  onClick={() => onNavigateToMap(floor.id)}
                  className="group bg-[#0d1633] hover:bg-[#111e47] rounded-2xl p-6 border border-blue-900/70 hover:border-sky-500/60 hover:shadow-2xl hover:shadow-sky-500/10 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-950 text-sky-300 border border-blue-800">
                      Level {floor.level}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      {available} of {total} Free
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                    {floor.name}
                  </h3>
                  <p className="text-xs font-medium text-sky-400/90 mb-3">{floor.subtitle}</p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    {floor.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                      <span>Floor Occupancy</span>
                      <span className="text-sky-300">{percent}%</span>
                    </div>
                    <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden border border-blue-900/50">
                      <div
                        className={`h-full rounded-full ${
                          percent > 80 ? 'bg-rose-500' : percent > 50 ? 'bg-amber-400' : 'bg-sky-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Amenities Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-blue-950">
                    {floor.features.map((feat, i) => (
                      <span key={i} className="text-[11px] bg-blue-950/70 text-slate-300 px-2 py-0.5 rounded border border-blue-900/60">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Innovation & Anti-Ghost Features */}
      <section className="py-20 bg-[#070c1d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-black text-white">
              Engineered to Solve Library Exam Chaos
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base">
              SeatSync replaces seat-hogging and backpack reservations with algorithmic fairness and instant QR validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#0d1633] p-7 rounded-2xl border border-blue-900/70 shadow-xl shadow-black/20 hover:border-sky-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                20-Minute Away Grace Timer
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Step away for coffee or restroom breaks without losing your desk. If a student does not return within 20 minutes, the seat is auto-released to the queue.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0d1633] p-7 rounded-2xl border border-blue-900/70 shadow-xl shadow-black/20 hover:border-sky-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center justify-center mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Secure QR Physical Check-in
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Every reservation generates a unique cryptographic QR token. Verify your arrival via mobile camera or desk scanner to officially activate occupancy.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0d1633] p-7 rounded-2xl border border-blue-900/70 shadow-xl shadow-black/20 hover:border-sky-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-sky-400 border border-blue-500/30 flex items-center justify-center mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Micro-Climate Study Filters
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Filter seats by natural window light, dual monitor connectivity, whisper quiet zones, or high-speed charging outlets tailored to your exam workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#050814] text-slate-400 py-10 border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold">
              S
            </div>
            <span className="text-white font-bold tracking-tight">SeatSync University Systems</span>
          </div>
          <p className="text-xs text-center md:text-left">
            Built for Alexandria University Library • Supabase Real-Time Engine • Demo Mode Enabled
          </p>
          <div className="flex gap-4 text-xs">
            <span className="text-sky-400 font-semibold">● 60 Monitored Desks</span>
            <span className="text-slate-600">|</span>
            <span>Version 2.4.0 (Hackathon Edition)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
