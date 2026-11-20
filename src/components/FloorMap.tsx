import React, { useState, useMemo } from 'react';
import { Seat, FloorId, UserPersona, CameraPreset } from '../types';
import { FLOORS } from '../data/initialSeats';

interface FloorMapProps {
  seats: Seat[];
  activeUser: UserPersona;
  selectedFloor: FloorId;
  setSelectedFloor: (floor: FloorId) => void;
  onSelectSeat: (seat: Seat) => void;
  onBookSeat: (seat: Seat) => void;
}

export const FloorMap: React.FC<FloorMapProps> = ({
  seats,
  activeUser,
  selectedFloor,
  setSelectedFloor,
  onSelectSeat,
  onBookSeat
}) => {
  // 3D Spatial Engine State
  const [is3DView, setIs3DView] = useState(true);
  const [cameraTilt, setCameraTilt] = useState(54);
  const [cameraRotate, setCameraRotate] = useState(-18);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('iso');

  const setPresetCamera = (preset: CameraPreset) => {
    setCameraPreset(preset);
    if (preset === 'iso') {
      setCameraTilt(54);
      setCameraRotate(-18);
      setCameraZoom(1);
    } else if (preset === 'aerial') {
      setCameraTilt(18);
      setCameraRotate(0);
      setCameraZoom(0.95);
    } else if (preset === 'walk') {
      setCameraTilt(68);
      setCameraRotate(-28);
      setCameraZoom(1.15);
    }
  };

  // Filter States
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyWindow, setOnlyWindow] = useState(false);
  const [onlyPower, setOnlyPower] = useState(false);
  const [onlyQuiet, setOnlyQuiet] = useState(false);
  const [onlyMonitor, setOnlyMonitor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Seat for side inspector modal
  const [inspectedSeat, setInspectedSeat] = useState<Seat | null>(null);

  // Active Floor Details
  const currentFloorInfo = FLOORS.find((f) => f.id === selectedFloor) || FLOORS[0];

  // Filtered Seats
  const filteredSeats = useMemo(() => {
    return seats.filter((seat) => {
      if (seat.floor !== selectedFloor) return false;
      if (onlyAvailable && seat.status !== 'available') return false;
      if (onlyWindow && !seat.isWindow) return false;
      if (onlyPower && !seat.hasPower) return false;
      if (onlyQuiet && !seat.isQuiet) return false;
      if (onlyMonitor && !seat.hasMonitor) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNumber = seat.number.toLowerCase().includes(query);
        const matchesZone = seat.zone.toLowerCase().includes(query);
        if (!matchesNumber && !matchesZone) return false;
      }

      return true;
    });
  }, [seats, selectedFloor, onlyAvailable, onlyWindow, onlyPower, onlyQuiet, onlyMonitor, searchQuery]);

  // Live floor counts
  const floorSeats = seats.filter((s) => s.floor === selectedFloor);
  const availableCount = floorSeats.filter((s) => s.status === 'available').length;
  const occupiedCount = floorSeats.filter((s) => s.status === 'occupied').length;
  const awayCount = floorSeats.filter((s) => s.status === 'away').length;
  const reservedCount = floorSeats.filter((s) => s.status === 'reserved').length;

  // Format away time remaining
  const getAwayRemainingMinutes = (seat: Seat) => {
    if (seat.status !== 'away' || !seat.awayExpiresAt) return null;
    const diff = Math.max(0, seat.awayExpiresAt - Date.now());
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Floor Selection & 3D Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>Interactive Library Floor Map</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/40">
              {is3DView ? '3D Spatial View' : '2D Plan View'}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time occupancy synchronization • Orbit camera in 3D and click any desk to inspect or book.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 3D vs 2D Toggle */}
          <div className="flex items-center p-1 rounded-2xl border bg-[#0d1633] border-blue-900/60 shadow-lg">
            <button
              onClick={() => setIs3DView(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                is3DView
                  ? 'bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏢 3D Spatial</span>
            </button>
            <button
              onClick={() => setIs3DView(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                !is3DView
                  ? 'bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>▦ 2D Plan</span>
            </button>
          </div>

          {/* Floor Nav Pills */}
          <div className="flex items-center bg-[#0d1633] p-1.5 rounded-xl border border-blue-900/70">
            {FLOORS.map((floor) => {
              const isSelected = selectedFloor === floor.id;
              const floorAvail = seats.filter((s) => s.floor === floor.id && s.status === 'available').length;
              return (
                <button
                  key={floor.id}
                  onClick={() => {
                    setSelectedFloor(floor.id);
                    setInspectedSeat(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-sky-500/25 border border-sky-400/50'
                      : 'text-slate-400 hover:text-white hover:bg-blue-950/50'
                  }`}
                >
                  <span>{floor.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-black/30 text-sky-200' : 'bg-blue-950 text-slate-400'
                  }`}>
                    {floorAvail} Free
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3D Camera Controls Bar */}
      {is3DView && (
        <div className="p-3 rounded-2xl border mb-6 flex flex-wrap items-center justify-between gap-4 text-xs font-bold bg-[#0d1633] border-blue-900/60 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider mr-1">3D Camera:</span>
            <button
              onClick={() => setPresetCamera('iso')}
              className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                cameraPreset === 'iso' ? 'bg-sky-500 text-white border-sky-400 shadow-sm' : 'bg-[#070c1d] border-blue-900/80 text-slate-300'
              }`}
            >
              📐 Isometric (54°)
            </button>
            <button
              onClick={() => setPresetCamera('aerial')}
              className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                cameraPreset === 'aerial' ? 'bg-sky-500 text-white border-sky-400 shadow-sm' : 'bg-[#070c1d] border-blue-900/80 text-slate-300'
              }`}
            >
              🦅 Top-Down (18°)
            </button>
            <button
              onClick={() => setPresetCamera('walk')}
              className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                cameraPreset === 'walk' ? 'bg-sky-500 text-white border-sky-400 shadow-sm' : 'bg-[#070c1d] border-blue-900/80 text-slate-300'
              }`}
            >
              🚶 Eye-Level (68°)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10px]">Tilt:</span>
              <input
                type="range"
                min="15"
                max="75"
                value={cameraTilt}
                onChange={(e) => {
                  setCameraTilt(Number(e.target.value));
                  setCameraPreset('custom');
                }}
                className="w-20 accent-sky-400 cursor-pointer"
              />
              <span className="text-[10px] text-sky-400 font-mono w-7">{cameraTilt}°</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10px]">Rotate:</span>
              <input
                type="range"
                min="-60"
                max="60"
                value={cameraRotate}
                onChange={(e) => {
                  setCameraRotate(Number(e.target.value));
                  setCameraPreset('custom');
                }}
                className="w-20 accent-sky-400 cursor-pointer"
              />
              <span className="text-[10px] text-sky-400 font-mono w-7">{cameraRotate}°</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCameraZoom((z) => Math.max(0.7, z - 0.1))}
                className="w-7 h-7 rounded-lg border border-blue-900 bg-[#070c1d] flex items-center justify-center font-bold cursor-pointer"
              >
                -
              </button>
              <span className="text-[10px] font-mono text-sky-400 w-10 text-center">{Math.round(cameraZoom * 100)}%</span>
              <button
                onClick={() => setCameraZoom((z) => Math.min(1.4, z + 0.1))}
                className="w-7 h-7 rounded-lg border border-blue-900 bg-[#070c1d] flex items-center justify-center font-bold cursor-pointer"
              >
                +
              </button>
            </div>

            <button onClick={() => setPresetCamera('iso')} className="text-[10px] text-sky-400 hover:underline cursor-pointer">
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Floor Overview Card with Stats */}
      <div className="bg-[#0d1633] rounded-2xl p-5 border border-blue-900/70 shadow-xl shadow-black/20 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300 bg-sky-500/15 px-2.5 py-1 rounded-md border border-sky-500/30">
              Level {currentFloorInfo.level}
            </span>
            <h2 className="text-lg font-bold text-white">{currentFloorInfo.name}</h2>
            <span className="text-xs text-slate-400">— {currentFloorInfo.subtitle}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">{currentFloorInfo.description}</p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">Available: <strong className="text-emerald-400">{availableCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500 inline-block"></span>
            <span className="text-slate-300">Occupied: <strong className="text-rose-400">{occupiedCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-400 inline-block"></span>
            <span className="text-slate-300">Away: <strong className="text-amber-400">{awayCount}</strong></span>
          </div>
          {reservedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-sky-500 inline-block"></span>
              <span className="text-slate-300">Reserved: <strong className="text-sky-300">{reservedCount}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Main Floor Blueprint Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Floor Canvas (3 cols) */}
        <div className="lg:col-span-3">
          {is3DView ? (
            /* 3D SPATIAL STUDIO */
            <div 
              className="relative w-full overflow-hidden rounded-3xl p-6 sm:p-10 border border-blue-900/60 shadow-2xl transition-all"
              style={{
                perspective: '1300px',
                minHeight: '660px',
                background: 'radial-gradient(circle at 50% 30%, #0d1a45 0%, #070c1d 85%)'
              }}
            >
              <div 
                className="floor-3d-scene w-full max-w-4xl mx-auto my-6"
                style={{
                  transform: `rotateX(${cameraTilt}deg) rotateZ(${cameraRotate}deg) scale(${cameraZoom})`,
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                <div 
                  className="relative p-8 rounded-3xl border border-blue-900/80 shadow-2xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    backgroundColor: '#091026',
                    boxShadow: '0 35px 60px -15px rgba(0, 0, 0, 0.85), inset 0 0 40px rgba(56, 189, 248, 0.08)',
                    backgroundImage: 'linear-gradient(to right, rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.06) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }}
                >
                  {/* Desks Grid in 3D */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6 sm:gap-7" style={{ transformStyle: 'preserve-3d' }}>
                    {filteredSeats.map((seat) => {
                      const isUserSeat = seat.occupiedBy?.studentId === (activeUser.studentId || activeUser.id);
                      const isAway = seat.status === 'away';
                      const isAvailable = seat.status === 'available';
                      const isSelected = inspectedSeat?.id === seat.id;

                      return (
                        <div
                          key={seat.id}
                          onClick={() => {
                            setInspectedSeat(seat);
                            onSelectSeat(seat);
                          }}
                          className="desk-3d-box group relative rounded-2xl p-3 cursor-pointer select-none"
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: isSelected ? 'translateZ(34px) scale(1.08)' : undefined,
                            backgroundColor: '#0d1633',
                            borderWidth: '1.5px',
                            borderColor: isSelected 
                              ? '#38bdf8' 
                              : isUserSeat 
                              ? '#38bdf8'
                              : isAvailable 
                              ? '#059669' 
                              : isAway 
                              ? '#f59e0b' 
                              : '#e11d48',
                            boxShadow: '0 12px 25px -4px rgba(0,0,0,0.7)'
                          }}
                        >
                          <div 
                            className="rounded-xl p-2.5 flex flex-col justify-between min-h-[95px] relative"
                            style={{
                              transform: 'translateZ(18px)',
                              transformStyle: 'preserve-3d',
                              backgroundColor: isAvailable ? '#064e3b' : isAway ? '#78350f' : isUserSeat ? '#1e3a8a' : '#881337',
                              boxShadow: '0 6px 12px rgba(0,0,0,0.3)'
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-sm font-black tracking-tight text-white">{seat.number}</span>
                              <div className="flex gap-0.5 text-[9px] opacity-90">
                                {seat.hasPower && <span>⚡</span>}
                                {seat.isWindow && <span>🪟</span>}
                              </div>
                            </div>
                            <p className="text-[9px] font-semibold truncate text-slate-200">{seat.zone.split(' ')[0]}</p>
                            <div className="flex items-center justify-between pt-1 border-t border-black/10">
                              <span className="text-[8px] font-black uppercase text-white">
                                {isUserSeat ? 'YOU' : isAway ? 'AWAY' : isAvailable ? 'FREE' : 'TAKEN'}
                              </span>
                              <span 
                                className={`w-3 h-3 rounded-full shadow-lg ${isAway ? 'beacon-pulse' : ''}`}
                                style={{
                                  backgroundColor: isAvailable ? '#10b981' : isAway ? '#f59e0b' : isUserSeat ? '#38bdf8' : '#f43f5e',
                                  boxShadow: '0 0 12px ' + (isAvailable ? '#10b981' : isAway ? '#f59e0b' : isUserSeat ? '#38bdf8' : '#f43f5e')
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 2D PLAN VIEW */
            <div className="bg-[#0a1128] rounded-3xl p-6 sm:p-8 border border-blue-950/90 shadow-2xl relative overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
                {filteredSeats.map((seat) => {
                  const isUserSeat = seat.occupiedBy?.studentId === (activeUser.studentId || activeUser.id);
                  const isAway = seat.status === 'away';
                  const isAvailable = seat.status === 'available';
                  const isSelected = inspectedSeat?.id === seat.id;
                  const awayMins = getAwayRemainingMinutes(seat);

                  return (
                    <div
                      key={seat.id}
                      onClick={() => {
                        setInspectedSeat(seat);
                        onSelectSeat(seat);
                      }}
                      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[115px] border ${
                        isSelected ? 'ring-4 ring-sky-400 scale-105 z-10' : 'hover:scale-[1.03]'
                      } ${
                        isUserSeat 
                          ? 'bg-blue-600 text-white border-sky-400' 
                          : isAvailable 
                          ? 'bg-emerald-600/90 text-white border-emerald-500' 
                          : isAway 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500' 
                          : 'bg-rose-950/80 text-rose-200 border-rose-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-base font-black tracking-tight">{seat.number}</span>
                        <div className="flex gap-1 text-[11px] opacity-90">
                          {seat.hasPower && <span>⚡</span>}
                          {seat.isWindow && <span>🪟</span>}
                        </div>
                      </div>
                      <div className="my-1">
                        <p className="text-[11px] font-semibold truncate opacity-90">{seat.zone}</p>
                        {isAway && awayMins && (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-950/60 text-amber-300 text-[10px] font-bold">
                            {awayMins} left
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-black uppercase tracking-wider">{seat.status}</span>
                        {isAvailable && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-extrabold">Book</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Side Seat Inspector Drawer (1 col) */}
        <div className="lg:col-span-1">
          {inspectedSeat ? (
            <div className="bg-[#0d1633] rounded-3xl p-6 border border-blue-900/80 shadow-2xl sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  3D Desk Inspector
                </span>
                <button
                  onClick={() => setInspectedSeat(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">
                    {inspectedSeat.number}
                  </h3>
                  <p className="text-xs font-bold text-sky-400">{inspectedSeat.zone}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  inspectedSeat.status === 'available'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : inspectedSeat.status === 'away'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {inspectedSeat.status.toUpperCase()}
                </span>
              </div>

              {/* Desk Amenities List */}
              <div className="space-y-3 py-4 border-y border-blue-950 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Floor Level</span>
                  <span className="font-bold text-white uppercase">{inspectedSeat.floor}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Acoustic Rating</span>
                  <span className="font-semibold text-sky-300">{inspectedSeat.noiseLevel}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>AC Power Outlets</span>
                  <span className="font-semibold text-emerald-400">
                    {inspectedSeat.hasPower ? 'Dual 230V + USB-C' : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Natural Window Light</span>
                  <span className="font-semibold text-white">
                    {inspectedSeat.isWindow ? 'Panoramic Garden Facing' : 'Standard Lighting'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                {inspectedSeat.status === 'available' ? (
                  <button
                    onClick={() => onBookSeat(inspectedSeat)}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white rounded-xl font-extrabold text-sm shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Book Seat {inspectedSeat.number} Now
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3.5 bg-slate-800 text-slate-500 rounded-xl font-bold text-xs cursor-not-allowed border border-slate-700"
                  >
                    Seat Currently Unavailable
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0d1633] rounded-3xl p-8 border border-blue-900/70 text-center sticky top-24 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800 text-sky-400 flex items-center justify-center mx-auto mb-3">
                🏢
              </div>
              <h4 className="text-sm font-bold text-white">No Seat Selected</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Click any volumetric desk on the 3D map to inspect power plugs, noise decibels, and availability.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
