import React, { useState } from 'react';
import { storageService, AppConfig } from '../services/storageService';
import { UserPersona } from '../types';
import { PERSONAS } from '../data/initialSeats';

interface DemoControlsModalProps {
  onClose: () => void;
  activeUser: UserPersona;
  setActiveUser: (user: UserPersona) => void;
  onDataReset: () => void;
}

export const DemoControlsModal: React.FC<DemoControlsModalProps> = ({
  onClose,
  activeUser,
  setActiveUser,
  onDataReset
}) => {
  const [config, setConfig] = useState<AppConfig>(storageService.getConfig());
  const [supabaseUrl, setSupabaseUrl] = useState<string>(config.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState<string>(config.supabaseKey || '');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleToggleFastTimer = () => {
    const updated = !config.demoFastTimer;
    storageService.saveConfig({ demoFastTimer: updated });
    setConfig({ ...config, demoFastTimer: updated });
  };

  const handleToggleSound = () => {
    const updated = !config.soundEnabled;
    storageService.saveConfig({ soundEnabled: updated });
    setConfig({ ...config, soundEnabled: updated });
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveConfig({
      supabaseUrl,
      supabaseKey,
      supabaseConnected: Boolean(supabaseUrl.trim() && supabaseKey.trim())
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all seats, active bookings, away timers, and logs back to initial factory demo state?')) {
      storageService.resetToDefaults();
      onDataReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0d1633] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-blue-900/80 relative overflow-hidden text-xs text-slate-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-blue-950 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center shadow-xs">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              Demo & Presentation Settings
            </h3>
            <p className="text-slate-400">
              Tailor speed and database persistence for live evaluation
            </p>
          </div>
        </div>

        {/* Demo Fast Timer Toggle */}
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-amber-300 text-sm">
              Hackathon Fast-Timer Mode (30 Seconds)
            </h4>
            <p className="text-amber-200 text-[11px] mt-0.5 leading-relaxed">
              When ON, the 20-minute away timer counts down in <strong>30 seconds</strong> for rapid judge demonstration of auto-release.
            </p>
          </div>
          <button
            onClick={handleToggleFastTimer}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ml-3 ${
              config.demoFastTimer ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
          </button>
        </div>

        {/* Audio Synthesis Toggle */}
        <div className="p-4 rounded-2xl bg-[#090f24] border border-blue-950 mb-6 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-sm">
              Web Audio Synthesizer Chimes
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Generates audio tones for QR check-in, booking confirmation, and auto-release.
            </p>
          </div>
          <button
            onClick={handleToggleSound}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ml-3 ${
              config.soundEnabled ? 'bg-sky-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
          </button>
        </div>

        {/* Persona Switcher Section */}
        <div className="mb-6">
          <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
            Switch Demo Persona
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActiveUser(p);
                  storageService.setActiveUser(p);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  activeUser.id === p.id
                    ? 'border-sky-400 bg-sky-500/20 text-white font-bold'
                    : 'border-blue-950 bg-[#090f24] hover:border-sky-500/40 text-slate-300'
                }`}
              >
                <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover mx-auto mb-1.5 ring-1 ring-sky-500/40" />
                <div className="truncate font-bold">{p.name.split(' ')[0]}</div>
                <div className="text-[10px] text-sky-400 capitalize">{p.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Live Supabase Credentials */}
        <div className="border-t border-blue-950 pt-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Optional Supabase Connection
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              config.supabaseConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-blue-950 text-slate-400'
            }`}>
              {config.supabaseConnected ? '● Live Connected' : '● Demo Local Engine'}
            </span>
          </div>

          <form onSubmit={handleSaveSupabase} className="space-y-2">
            <input
              type="text"
              placeholder="VITE_SUPABASE_URL (e.g. https://xxx.supabase.co)"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[#090f24] border border-blue-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="password"
              placeholder="VITE_SUPABASE_ANON_KEY"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3 py-2 bg-[#090f24] border border-blue-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-sky-400">
                {saveSuccess ? '✓ Credentials Saved!' : 'Leave blank for LocalStorage Demo Mode'}
              </span>
              <button
                type="submit"
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white rounded-lg font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Factory Reset Button */}
        <div className="pt-4 border-t border-blue-950 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
          >
            Reset All Sample Data
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-slate-300 font-bold rounded-xl cursor-pointer border border-blue-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
