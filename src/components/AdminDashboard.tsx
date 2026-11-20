import React, { useState } from 'react';
import { Seat, Booking, ActivityLog, SeatStatus, FloorId } from '../types';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';

interface AdminDashboardProps {
  seats: Seat[];
  bookings: Booking[];
  logs: ActivityLog[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  seats,
  bookings,
  logs
}) => {
  // Metrics calculation
  const totalSeats = seats.length;
  const availableSeats = seats.filter((s) => s.status === 'available').length;
  const occupiedSeats = seats.filter((s) => s.status === 'occupied').length;
  const reservedSeats = seats.filter((s) => s.status === 'reserved').length;
  const awaySeats = seats.filter((s) => s.status === 'away').length;
  const occupancyPercent = totalSeats > 0 ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100) : 0;

  // Floor stats
  const groundSeats = seats.filter((s) => s.floor === 'ground');
  const firstSeats = seats.filter((s) => s.floor === 'first');
  const secondSeats = seats.filter((s) => s.floor === 'second');

  const groundOcc = groundSeats.length > 0 ? Math.round(((groundSeats.length - groundSeats.filter((s) => s.status === 'available').length) / groundSeats.length) * 100) : 0;
  const firstOcc = firstSeats.length > 0 ? Math.round(((firstSeats.length - firstSeats.filter((s) => s.status === 'available').length) / firstSeats.length) * 100) : 0;
  const secondOcc = secondSeats.length > 0 ? Math.round(((secondSeats.length - secondSeats.filter((s) => s.status === 'available').length) / secondSeats.length) * 100) : 0;

  // Table filter states
  const [filterFloor, setFilterFloor] = useState<FloorId | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<SeatStatus | 'all'>('all');
  const [tableSearch, setTableSearch] = useState<string>('');

  // Add Seat Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newSeatNumber, setNewSeatNumber] = useState<string>('');
  const [newSeatFloor, setNewSeatFloor] = useState<FloorId>('ground');
  const [newSeatZone, setNewSeatZone] = useState<string>('Collaborative Study Pod');
  const [newHasPower, setNewHasPower] = useState<boolean>(true);
  const [newIsWindow, setNewIsWindow] = useState<boolean>(false);

  // Filtered Seats for admin table
  const filteredTableSeats = seats.filter((seat) => {
    if (filterFloor !== 'all' && seat.floor !== filterFloor) return false;
    if (filterStatus !== 'all' && seat.status !== filterStatus) return false;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      if (!seat.number.toLowerCase().includes(q) && !seat.zone.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Admin Actions
  const handleForceRelease = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat) return;
    if (confirm(`Force release ${seat.number}? This will revoke the student's booking immediately.`)) {
      storageService.forceReleaseSeat(seatId);
      soundService.playAutoRelease();
    }
  };

  const handleSetStatus = (seatId: string, status: SeatStatus) => {
    storageService.adminUpdateSeatStatus(seatId, status);
  };

  const handleDeleteSeat = (seatId: string, seatNum: string) => {
    if (confirm(`Decommission desk ${seatNum}? This desk will be removed from the library inventory.`)) {
      storageService.adminDeleteSeat(seatId);
    }
  };

  const handleAddNewSeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeatNumber.trim()) return;

    storageService.adminAddSeat({
      number: newSeatNumber.toUpperCase(),
      floor: newSeatFloor,
      zone: newSeatZone,
      row: 5,
      col: 5,
      hasPower: newHasPower,
      isWindow: newIsWindow,
      isQuiet: newSeatFloor !== 'ground',
      hasMonitor: false,
      isErgonomic: true,
      noiseLevel: newSeatFloor === 'ground' ? 'Active (<50dB)' : 'Silent (<30dB)'
    });

    setIsAddModalOpen(false);
    setNewSeatNumber('');
    soundService.playCheckInSuccess();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Telemetry Pill in Deep Navy & Electric Blue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2.5 py-1 rounded-md">
              Operations Center
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Telemetry Stream
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            Admin Occupancy Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage seat allocations, observe rush hours, and enforce anti-hogging protocols.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            + Add New Desk
          </button>
        </div>
      </div>

      {/* KPI Stats Cards in Deep Navy */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-[#0d1633] p-5 rounded-2xl border border-blue-900/70 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Desks</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">{totalSeats}</div>
          <p className="text-[10px] text-slate-400 mt-1">3 monitored floors</p>
        </div>

        <div className="bg-[#0d1633] p-5 rounded-2xl border border-blue-900/70 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Available</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">{availableSeats}</div>
          <p className="text-[10px] text-sky-300 mt-1">Ready for check-in</p>
        </div>

        <div className="bg-[#0d1633] p-5 rounded-2xl border border-blue-900/70 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Occupied</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">{occupiedSeats}</div>
          <p className="text-[10px] text-rose-300 mt-1">Verified presence</p>
        </div>

        <div className="bg-[#0d1633] p-5 rounded-2xl border border-blue-900/70 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Reserved</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">{reservedSeats}</div>
          <p className="text-[10px] text-blue-300 mt-1">Check-in pending</p>
        </div>

        <div className="bg-[#0d1633] p-5 rounded-2xl border border-blue-900/70 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Away (Grace)</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{awaySeats}</div>
          <p className="text-[10px] text-amber-300 mt-1">Grace countdown</p>
        </div>

        <div className="bg-[#0d1633] p-5 rounded-2xl border border-blue-900/70 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Occupancy</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">{occupancyPercent}%</div>
          <div className="w-full bg-blue-950 h-1.5 rounded-full mt-2 overflow-hidden border border-blue-900/50">
            <div
              className={`h-full ${occupancyPercent > 80 ? 'bg-rose-500' : 'bg-sky-400'}`}
              style={{ width: `${occupancyPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Floor-wise Comparison Bar Chart */}
        <div className="bg-[#0d1633] p-6 rounded-3xl border border-blue-900/70 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">
                Floor-Wise Capacity Utilization
              </h3>
              <p className="text-xs text-slate-400">
                Comparison of capacity saturation across library levels
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-sky-500/15 text-sky-300 border border-sky-500/30 rounded-lg">
              Live Real-Time
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                <span>Ground Floor (Commons & Cafe Hub)</span>
                <span className="text-sky-300">{groundOcc}% Occupied</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden border border-blue-900/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-500"
                  style={{ width: `${groundOcc}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                <span>First Floor (Silent Study & Window Vista)</span>
                <span className="text-cyan-300">{firstOcc}% Occupied</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden border border-blue-900/50">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${firstOcc}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                <span>Second Floor (Deep Focus & Research Pods)</span>
                <span className="text-indigo-300">{secondOcc}% Occupied</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden border border-blue-900/50">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${secondOcc}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-blue-950 text-center text-xs">
            <div>
              <span className="text-slate-400">Ground Desks</span>
              <p className="font-bold text-white text-sm">{groundSeats.length}</p>
            </div>
            <div>
              <span className="text-slate-400">First Desks</span>
              <p className="font-bold text-white text-sm">{firstSeats.length}</p>
            </div>
            <div>
              <span className="text-slate-400">Second Desks</span>
              <p className="font-bold text-white text-sm">{secondSeats.length}</p>
            </div>
          </div>
        </div>

        {/* 24-Hour Peak Hours Traffic Curve */}
        <div className="bg-[#0d1633] p-6 rounded-3xl border border-blue-900/70 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Peak Exam Hours Traffic Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Hourly student density • High rush between 2:00 PM – 6:00 PM
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md">
              Exam Rush Active
            </span>
          </div>

          {/* Traffic Distribution Histogram */}
          <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 px-1 border-b border-blue-950">
            {[
              { hour: '8am', val: 20 },
              { hour: '10am', val: 45 },
              { hour: '12pm', val: 70 },
              { hour: '2pm', val: 94, peak: true },
              { hour: '4pm', val: 98, peak: true },
              { hour: '6pm', val: 86, peak: true },
              { hour: '8pm', val: 62 },
              { hour: '10pm', val: 35 }
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.val}%
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    item.peak
                      ? 'bg-gradient-to-t from-blue-600 via-sky-500 to-cyan-300 shadow-md shadow-sky-500/20'
                      : 'bg-blue-950 hover:bg-blue-900 border border-blue-900/50'
                  }`}
                  style={{ height: `${item.val}%` }}
                ></div>
                <span className={`text-[10px] font-bold ${item.peak ? 'text-sky-300' : 'text-slate-500'}`}>
                  {item.hour}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-blue-600 to-sky-400"></span>
              Peak Exam Demand Hours (2 PM - 6 PM)
            </span>
            <span className="text-sky-400 font-semibold">Historical Avg: 84% Occupancy</span>
          </div>
        </div>
      </div>

      {/* Seat Management Table */}
      <div className="bg-[#0d1633] rounded-3xl p-6 sm:p-8 border border-blue-900/70 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-white">
              Live Seat Management Directory
            </h3>
            <p className="text-xs text-slate-400">
              Force release abandoned desks, modify status, or decommission seats.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search seat # or zone..."
              className="px-3 py-1.5 bg-[#090f24] border border-blue-900 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value as FloorId | 'all')}
              className="px-3 py-1.5 bg-[#090f24] border border-blue-900 rounded-xl text-xs text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="all">All Floors</option>
              <option value="ground">Ground Floor</option>
              <option value="first">First Floor</option>
              <option value="second">Second Floor</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SeatStatus | 'all')}
              className="px-3 py-1.5 bg-[#090f24] border border-blue-900 rounded-xl text-xs text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="away">Away</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090f24] text-slate-400 uppercase font-semibold border-b border-blue-950">
              <tr>
                <th className="py-3 px-4">Seat #</th>
                <th className="py-3 px-4">Floor</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Features</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Occupant</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950 text-slate-300">
              {filteredTableSeats.map((seat) => (
                <tr key={seat.id} className="hover:bg-blue-950/40 transition-colors">
                  <td className="py-3 px-4 font-black text-white">
                    {seat.number}
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-sky-300">
                    {seat.floor}
                  </td>
                  <td className="py-3 px-4">
                    {seat.zone}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 text-[11px]">
                      {seat.hasPower && <span title="Power">⚡</span>}
                      {seat.isWindow && <span title="Window">🪟</span>}
                      {seat.hasMonitor && <span title="Monitor">🖥️</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      seat.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : seat.status === 'occupied'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : seat.status === 'away'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    }`}>
                      {seat.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {seat.occupiedBy ? (
                      <div>
                        <span className="font-bold text-white">{seat.occupiedBy.studentName}</span>
                        <p className="text-[10px] text-sky-400 font-mono">{seat.occupiedBy.bookingId}</p>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    {seat.status !== 'available' && (
                      <button
                        onClick={() => handleForceRelease(seat.id)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Force Release
                      </button>
                    )}
                    <button
                      onClick={() => handleSetStatus(seat.id, seat.status === 'available' ? 'occupied' : 'available')}
                      className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-slate-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDeleteSeat(seat.id, seat.number)}
                      className="px-2 py-1 text-slate-500 hover:text-rose-400 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      title="Decommission desk"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Activity Audit Feed */}
      <div className="bg-[#0d1633] rounded-3xl p-6 sm:p-8 border border-blue-900/70 shadow-2xl">
        <h3 className="text-lg font-black text-white mb-1">
          Real-Time Campus Activity Audit Log
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Automated stream of reservations, check-ins, away timer expirations, and admin overrides.
        </p>

        <div className="space-y-3">
          {logs.slice(0, 8).map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#090f24] border border-blue-950 text-xs"
            >
              <div className="flex items-start gap-3">
                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                  log.type === 'checkin'
                    ? 'bg-emerald-400'
                    : log.type === 'away'
                    ? 'bg-amber-400'
                    : log.type === 'autorelease'
                    ? 'bg-rose-400'
                    : log.type === 'booking'
                    ? 'bg-sky-400'
                    : 'bg-slate-400'
                }`}></span>
                <div>
                  <p className="font-bold text-white">{log.description}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Seat {log.seatNumber} • {log.studentName}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] text-slate-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Seat Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d1633] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-900">
            <h3 className="text-lg font-black text-white mb-4">
              Add New Library Study Desk
            </h3>
            <form onSubmit={handleAddNewSeat} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Seat Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. G-21, F-21, S-21"
                  value={newSeatNumber}
                  onChange={(e) => setNewSeatNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090f24] border border-blue-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Floor Level</label>
                <select
                  value={newSeatFloor}
                  onChange={(e) => setNewSeatFloor(e.target.value as FloorId)}
                  className="w-full px-3 py-2 bg-[#090f24] border border-blue-900 rounded-xl text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="ground">Ground Floor</option>
                  <option value="first">First Floor</option>
                  <option value="second">Second Floor</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={newSeatZone}
                  onChange={(e) => setNewSeatZone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090f24] border border-blue-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newHasPower}
                    onChange={(e) => setNewHasPower(e.target.checked)}
                    className="rounded text-sky-500"
                  />
                  <span>Has Power Socket (⚡)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newIsWindow}
                    onChange={(e) => setNewIsWindow(e.target.checked)}
                    className="rounded text-sky-500"
                  />
                  <span>Window Vista (🪟)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white rounded-xl font-extrabold shadow-md shadow-sky-500/25 cursor-pointer"
                >
                  Create Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
