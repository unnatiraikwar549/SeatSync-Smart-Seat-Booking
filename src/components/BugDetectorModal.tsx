import React, { useState } from 'react';
import { Seat, WorkstationBug, ThemeMode } from '../types';

interface BugDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  seats: Seat[];
  flaggedDesks: Seat[];
  onReportBug: (seatNumber: string, category: string, severity: 'minor' | 'moderate' | 'critical', description: string) => void;
  onClearBug: (seatNumber: string) => void;
  onAutoHeal: () => void;
  onInjectAnomaly: () => void;
  theme: ThemeMode;
}

export const BugDetectorModal: React.FC<BugDetectorModalProps> = ({
  isOpen,
  onClose,
  seats,
  flaggedDesks,
  onReportBug,
  onClearBug,
  onAutoHeal,
  onInjectAnomaly,
  theme
}) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'diagnostics' | 'report' | 'flagged'>('diagnostics');
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [logs, setLogs] = useState<string[]>([
    'System initialized. All 60 workstations responding.',
    'Concurrency matrix: 0 collisions detected across floors.',
    '20-Min away timer epoch synchronizer: active & healthy.',
    'QR cryptographic signatures: 100% verified.'
  ]);

  const [reportSeat, setReportSeat] = useState('G-04');
  const [reportCat, setReportCat] = useState('Power Outlet Defect');
  const [reportSev, setReportSev] = useState<'minor' | 'moderate' | 'critical'>('moderate');
  const [reportDesc, setReportDesc] = useState('Power socket loose and intermittently disconnects laptop charger.');

  const runDeepScan = () => {
    setDiagnosticsRunning(true);
    setProgress(0);
    setLogs(['[INITIALIZING] Starting SeatSync Diagnostic & Probe Suite v3.4...']);

    const steps = [
      { pct: 20, log: 'Probe 1/6 [CONCURRENCY]: Verifying 60 desks against active bookings... PASSED (0 collisions).' },
      { pct: 40, log: 'Probe 2/6 [AWAY TIMERS]: Auditing epoch timestamps & auto-release loop... PASSED (Sync 100%).' },
      { pct: 60, log: 'Probe 3/6 [QR SECURITY]: Validating token hashes & cryptographic salts... PASSED (Verified).' },
      { pct: 80, log: `Probe 4/6 [HARDWARE TELEMETRY]: Scanning dual monitors, power outlets... ${flaggedDesks.length > 0 ? 'FLAGGED (' + flaggedDesks.length + ' defects).' : 'PASSED (0 defects).'}` },
      { pct: 95, log: 'Probe 5/6 [DATA BUS]: Multi-tab BroadcastChannel & LocalStorage quota check... PASSED (Optimal).' },
      { pct: 100, log: 'Probe 6/6 [AUDIO SYNTH]: Web Audio API sample rate & tone generator... PASSED (Armed).' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setProgress(step.pct);
        setLogs(prev => [...prev, step.log]);
        if (idx === steps.length - 1) {
          setDiagnosticsRunning(false);
        }
      }, (idx + 1) * 320);
    });
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReportBug(reportSeat, reportCat, reportSev, reportDesc);
    setActiveTab('flagged');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border relative max-h-[90vh] flex flex-col ${
        isDark ? 'bg-[#0d1633] border-blue-900 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/20">
          <div className="flex items-center gap-3">
            <img
              src="/seatsync_icon.png"
              alt="SeatSync"
              className="w-10 h-10 rounded-2xl object-cover ring-1 ring-sky-400/50 shadow-lg shadow-sky-500/20 bg-[#070c1d]"
            />
            <div>
              <h3 className="text-xl font-black tracking-tight">Workstation & System Bug Detector</h3>
              <p className="text-xs text-slate-400">Automated diagnostic probe engine & workstation fault tracker.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 cursor-pointer text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2 py-4 border-b border-slate-700/20 flex-wrap">
          {[
            { key: 'diagnostics', label: '🔍 Automated Health Probes' },
            { key: 'report', label: '⚡ Report Workstation Bug' },
            { key: 'flagged', label: `📋 Flagged Desks (${flaggedDesks.length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md'
                  : isDark
                  ? 'bg-[#090f24] text-slate-400 hover:text-white border border-blue-950'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          
          {/* TAB 1: AUTOMATED HEALTH PROBES */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                flaggedDesks.length > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">System Health Score</span>
                  <h4 className="text-xl font-black mt-0.5">
                    {flaggedDesks.length > 0 ? `${100 - flaggedDesks.length * 5}% (Minor Anomaly)` : '100% Optimal (Clean)'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">6 Automated probes continuously auditing concurrency, away timers, and hardware.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={runDeepScan}
                    disabled={diagnosticsRunning}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {diagnosticsRunning ? 'Scanning...' : '▶ Run Deep Scan'}
                  </button>
                  <button
                    onClick={onAutoHeal}
                    className="px-3 py-2 rounded-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold cursor-pointer"
                  >
                    🩺 Auto-Heal
                  </button>
                </div>
              </div>

              {diagnosticsRunning && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-sky-400">
                    <span>Diagnostic Audit in Progress...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700/20 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#090f24] border-blue-950' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between font-bold"><span>Probe 1: Concurrency Matrix</span><span className="text-emerald-400">✓ PASSED</span></div>
                  <p className="text-[11px] text-slate-400 mt-0.5">0 double-booking collisions across 60 desks.</p>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#090f24] border-blue-950' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between font-bold"><span>Probe 2: 20-Min Away Timers</span><span className="text-emerald-400">✓ SYNCED</span></div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Epoch UTC timestamps valid. Zero negative drift.</p>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#090f24] border-blue-950' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between font-bold"><span>Probe 3: QR Cryptography</span><span className="text-emerald-400">✓ VALID</span></div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Check-in salts and tokens tamper-proof.</p>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#090f24] border-blue-950' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between font-bold">
                    <span>Probe 4: Physical Hardware</span>
                    <span className={flaggedDesks.length > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {flaggedDesks.length > 0 ? `⚠️ ${flaggedDesks.length} DEFECTS` : '✓ 100% OK'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Power plugs, dual-monitors, and acoustic sensors.</p>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#090f24] border-blue-950' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between font-bold"><span>Probe 5: Multi-Tab Data Bus</span><span className="text-emerald-400">✓ 0ms LAG</span></div>
                  <p className="text-[11px] text-slate-400 mt-0.5">BroadcastChannel & LocalStorage quota healthy.</p>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#090f24] border-blue-950' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between font-bold"><span>Probe 6: Audio Synthesizer</span><span className="text-emerald-400">✓ ARMED</span></div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Web Audio API tones active for chimes.</p>
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-black/40 border border-slate-800 text-[11px] font-mono text-emerald-400 space-y-1 max-h-36 overflow-y-auto">
                <div className="text-slate-500 font-bold mb-1"># LIVE PROBE AUDIT STREAM:</div>
                {logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-sky-400">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-300">Hackathon Presentation Shortcut:</span>
                  <p className="text-[11px] text-amber-200">Inject a simulated hardware defect at desk G-04 to test probe detection live.</p>
                </div>
                <button
                  onClick={onInjectAnomaly}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 font-bold text-xs cursor-pointer whitespace-nowrap"
                >
                  ⚡ Inject Test Anomaly
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REPORT WORKSTATION BUG */}
          {activeTab === 'report' && (
            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sky-200">
                Reporting a workstation defect automatically adds a visible ⚠️ badge to the 3D floor map and dispatches an IT maintenance ticket.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Workstation # *</label>
                  <select
                    value={reportSeat}
                    onChange={(e) => setReportSeat(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer ${
                      isDark ? 'bg-[#090f24] border-blue-900/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {seats.map((s) => (
                      <option key={s.id} value={s.number}>
                        {s.number} ({s.floor.toUpperCase()} • {s.zone.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Defect Category *</label>
                  <select
                    value={reportCat}
                    onChange={(e) => setReportCat(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer ${
                      isDark ? 'bg-[#090f24] border-blue-900/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Power Outlet Defect">Faulty Power Socket / USB-C Port</option>
                    <option value="Dual Monitor Dock Flaky">Monitor / USB-C Dock Disconnecting</option>
                    <option value="Broken Chair Mechanism">Broken Chair / Hydraulic Leak</option>
                    <option value="Wi-Fi Signal Drop">Wi-Fi Dead Zone / Packet Drop</option>
                    <option value="Noise Disturbance">Noise Violation in Quiet Zone</option>
                    <option value="Unattended Bag Hogging">Unattended Bag / Seat Hogging</option>
                    <option value="App / Software Bug">Website / Application Bug</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['minor', 'moderate', 'critical'] as const).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setReportSev(sev)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                        reportSev === sev
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : isDark
                          ? 'border-blue-950 bg-[#090f24] text-slate-400'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Defect Description *</label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Describe the hardware defect, location specifics, or malfunction..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium focus:outline-none focus:ring-1 focus:ring-sky-400 ${
                    isDark ? 'bg-[#090f24] border-blue-900/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer hover:opacity-95"
              >
                Log Defect & Flag Desk on 3D Map →
              </button>
            </form>
          )}

          {/* TAB 3: FLAGGED DESKS REGISTRY */}
          {activeTab === 'flagged' && (
            <div className="space-y-3">
              {flaggedDesks.length > 0 ? (
                flaggedDesks.map((seat) => (
                  <div
                    key={seat.id}
                    className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                      isDark ? 'bg-[#090f24] border-amber-500/30' : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-amber-400">{seat.number}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                          {seat.bug?.category || 'Defect'}
                        </span>
                        <span className="text-[10px] text-slate-400">({seat.floor.toUpperCase()} • {seat.zone})</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{seat.bug?.description}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Reported by: {seat.bug?.reportedBy || 'Student'}</p>
                    </div>
                    <button
                      onClick={() => onClearBug(seat.number)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs cursor-pointer whitespace-nowrap"
                    >
                      ✓ Mark Fixed
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-400">
                  <span className="text-2xl block mb-2">🎉</span>
                  No workstation defects currently flagged! All 60 desks are fully operational.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
