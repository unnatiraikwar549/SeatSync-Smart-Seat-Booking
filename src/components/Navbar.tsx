import React, { useState } from 'react';
import { Seat, UserPersona, ThemeMode } from '../types';
import { storageService } from '../services/storageService';
import { PERSONAS } from '../data/initialSeats';

interface NavbarProps {
  activeTab: 'landing' | 'map' | 'dashboard' | 'admin' | 'scanner';
  setActiveTab: (tab: 'landing' | 'map' | 'dashboard' | 'admin' | 'scanner') => void;
  seats: Seat[];
  activeUser: UserPersona;
  setActiveUser: (user: UserPersona) => void;
  onOpenDemoControls: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  seats,
  activeUser,
  setActiveUser,
  onOpenDemoControls,
  theme,
  toggleTheme
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  // Calculate live availability stats
  const availableCount = seats.filter((s) => s.status === 'available').length;
  const totalCount = seats.length;

  // Check if active user has an away timer running
  const userSeat = seats.find((s) => s.occupiedBy?.studentId === (activeUser.studentId || activeUser.id));
  const isUserAway = userSeat?.status === 'away';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-xl transition-colors duration-300 ${
      isDark 
        ? 'bg-[#070c1d]/95 border-blue-950/80 shadow-black/40' 
        : 'bg-white/95 border-slate-200 shadow-slate-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Official SeatSync Logo */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="relative flex-shrink-0 group-hover:scale-105 transition-all">
              <img
                src="/seatsync_icon.png"
                alt="SeatSync Crest"
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-sky-400/50 shadow-lg shadow-sky-500/25 bg-[#070c1d]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 ring-2 ring-slate-900"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xl font-black tracking-tight transition-colors ${
                  isDark ? 'text-white group-hover:text-sky-300' : 'text-slate-900 group-hover:text-blue-600'
                }`}>
                  Seat<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">Sync</span>
                </span>
                <span className="text-xs">🎓</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  3D
                </span>
              </div>
              <p className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${isDark ? 'text-sky-300/80' : 'text-slate-500'}`}>
                Smart Library Seat Finder
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'landing'
                  ? isDark ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-sky-50 text-sky-700 border border-sky-300 shadow-sm'
                  : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? isDark ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-sky-50 text-sky-700 border border-sky-300 shadow-sm'
                  : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🏢 3D Map</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? isDark ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-sky-50 text-sky-700 border border-sky-300 shadow-sm'
                  : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              My Seat & Pass
              {isUserAway && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'scanner'
                  ? isDark ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-sky-50 text-sky-700 border border-sky-300 shadow-sm'
                  : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              QR Scanner
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/25'
                  : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Admin Panel
            </button>
          </nav>

          {/* Right Controls: Theme Toggle + Vacancy Badge + Persona Dropdown + Demo Controls */}
          <div className="flex items-center gap-2.5">
            {/* THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-sm ${
                isDark 
                  ? 'bg-[#0d1633] border-blue-900 text-amber-300 hover:bg-[#121f47] hover:border-amber-400' 
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-blue-400'
              }`}
            >
              {isDark ? <span className="text-xs font-bold">☀️ Light</span> : <span className="text-xs font-bold">🌙 Dark</span>}
            </button>

            {/* Real-time vacancy pill */}
            <div 
              onClick={() => setActiveTab('map')}
              className={`hidden lg:flex items-center gap-2 border px-3 py-1.5 rounded-full cursor-pointer transition-all ${
                isDark 
                  ? 'bg-[#0c1634] hover:bg-[#101d45] border-sky-500/30 text-sky-200 shadow-sky-500/10' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400"></span>
              </span>
              <span className="text-xs font-bold">
                {availableCount} / {totalCount} Seats Free
              </span>
            </div>

            {/* Persona switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 p-1.5 rounded-xl transition-colors border ${
                  isDark ? 'bg-[#0d1633] border-blue-900/50 hover:bg-[#111c3d]' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-sky-500/40"
                />
                <span className={`text-xs font-bold hidden sm:inline-block max-w-[90px] truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {activeUser.name.split(' ')[0]}
                </span>
                <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border py-2 z-50 ${
                  isDark ? 'bg-[#0d1633] border-blue-900/80' : 'bg-white border-slate-200'
                }`}>
                  <div className={`px-3 py-2 border-b ${isDark ? 'border-blue-950' : 'border-slate-100'}`}>
                    <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                      Current Persona
                    </p>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeUser.name}</p>
                    <p className="text-xs text-slate-400">{activeUser.email}</p>
                  </div>
                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                      Switch User
                    </p>
                    {PERSONAS.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => {
                          setActiveUser(persona);
                          storageService.setActiveUser(persona);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                          activeUser.id === persona.id 
                            ? 'bg-sky-500/20 text-sky-400 font-bold border-l-2 border-sky-400' 
                            : isDark ? 'text-slate-300 hover:bg-blue-950/60' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <img src={persona.avatar} alt={persona.name} className="w-6 h-6 rounded-md object-cover ring-1 ring-sky-500/30" />
                        <div>
                          <div className="font-semibold">{persona.name}</div>
                          <div className="text-[10px] text-slate-400">{persona.role.toUpperCase()} • {persona.major || 'Staff'}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Controls Pill */}
            <button
              onClick={onOpenDemoControls}
              title="Demo & Hackathon Presentation Settings"
              className={`p-2 rounded-xl transition-colors border ${
                isDark 
                  ? 'text-sky-300 hover:text-white hover:border-sky-400 bg-[#0d1633] border-blue-900/50' 
                  : 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 shadow-sm'
              }`}
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
