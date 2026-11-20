import React, { useState, useRef, useEffect } from 'react';
import { Booking } from '../types';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';

interface QRCheckInModalProps {
  onClose: () => void;
  onCheckInSuccess: (booking: Booking) => void;
  userBooking?: Booking | null;
}

export const QRCheckInModal: React.FC<QRCheckInModalProps> = ({
  onClose,
  onCheckInSuccess,
  userBooking
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'simulator'>('simulator');
  const [manualToken, setManualToken] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);

  // Camera stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize camera when activeMode === 'camera'
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (activeMode === 'camera') {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
            setCameraActive(true);
            setCameraError(null);
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unavailable:', err);
          setCameraError('Camera access not available or permission denied. Please use the simulated scanner.');
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeMode]);

  const handleVerify = (tokenOrId: string) => {
    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      const res = storageService.checkIn(tokenOrId.trim());

      if (res.success && res.booking) {
        soundService.playCheckInSuccess();
        setSuccessBooking(res.booking);
        onCheckInSuccess(res.booking);
      } else {
        setErrorMsg(res.error || 'Verification failed. Token does not match an active reservation.');
      }
      setIsVerifying(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0d1633] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-blue-900/80 relative overflow-hidden">
        
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              Library Desk QR Check-in
            </h3>
            <p className="text-xs text-slate-400">
              Scan physical desk QR code to confirm presence
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#090f24] p-1 rounded-xl mb-6 border border-blue-950">
          <button
            type="button"
            onClick={() => setActiveMode('simulator')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'simulator'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Demo / Simulated Scanner
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📷 Mobile / Web Camera
          </button>
        </div>

        {/* Success Alert */}
        {successBooking && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-black">
              ✓
            </div>
            <h4 className="text-base font-bold text-white">
              Check-in Verified Successfully!
            </h4>
            <p className="text-xs text-emerald-300 mt-1">
              Seat <strong>{successBooking.seatNumber}</strong> is now officially occupied by {successBooking.studentName}.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Go to My Dashboard
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/80 text-rose-300 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {!successBooking && (
          <>
            {/* Camera View Mode */}
            {activeMode === 'camera' && (
              <div className="mb-6">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-blue-900">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  {/* Scanner overlay viewfinder */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-sky-400 rounded-2xl relative shadow-2xl">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-sky-400 -mt-1 -ml-1 rounded-tl"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-sky-400 -mt-1 -mr-1 rounded-tr"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-sky-400 -mb-1 -ml-1 rounded-bl"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-sky-400 -mb-1 -mr-1 rounded-br"></div>
                      <div className="w-full h-0.5 bg-sky-400 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-sm"></div>
                    </div>
                  </div>
                </div>
                {cameraError ? (
                  <p className="text-xs text-rose-400 mt-2 text-center">{cameraError}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Point camera at the QR sticker affixed to your reserved library desk.
                  </p>
                )}
              </div>
            )}

            {/* Simulated Desktop Mode */}
            {activeMode === 'simulator' && (
              <div className="space-y-4 mb-6">
                {userBooking && userBooking.status === 'reserved' ? (
                  <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-left">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                      Your Pending Reservation
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <h4 className="text-base font-bold text-white">
                          Seat {userBooking.seatNumber} ({userBooking.floor.toUpperCase()} Floor)
                        </h4>
                        <p className="text-xs text-sky-300 font-mono">Ref: {userBooking.id}</p>
                      </div>
                      <button
                        onClick={() => handleVerify(userBooking.id)}
                        disabled={isVerifying}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/25 cursor-pointer disabled:opacity-50"
                      >
                        {isVerifying ? 'Scanning...' : 'Simulate QR Scan'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#090f24] border border-blue-950 text-xs text-slate-400">
                    No active pending reservation found for current persona. You can book a seat from the map or test with a sample reference below.
                  </div>
                )}

                {/* Manual Token / Reference Entry */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Or Enter Booking Reference ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="e.g. BK-8931-G04 or QR Token..."
                      className="flex-1 px-3.5 py-2.5 bg-[#090f24] border border-blue-900 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      disabled={isVerifying || !manualToken.trim()}
                      onClick={() => handleVerify(manualToken)}
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40"
                    >
                      {isVerifying ? 'Checking...' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-blue-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
