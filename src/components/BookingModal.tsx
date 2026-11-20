import React, { useState } from 'react';
import { Seat, UserPersona, Booking } from '../types';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';

interface BookingModalProps {
  seat: Seat;
  activeUser: UserPersona;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  seat,
  activeUser,
  onClose,
  onBookingSuccess
}) => {
  const [durationHours, setDurationHours] = useState<number>(2);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirmBooking = () => {
    if (!agreedTerms) {
      setErrorMessage('Please accept the library occupancy terms.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = storageService.bookSeat(seat.id, activeUser, durationHours);

      if (res.success && res.booking) {
        soundService.playBookingSuccess();
        onBookingSuccess(res.booking);
      } else {
        setErrorMessage(res.error || 'Failed to reserve seat. It might have just been taken.');
        setIsSubmitting(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0d1633] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-blue-900/80 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-blue-950/60 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-sky-500/25">
            {seat.number}
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              Confirm Seat Reservation
            </h3>
            <p className="text-xs text-slate-400">
              {seat.zone} • {seat.floor.toUpperCase()} FLOOR
            </p>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/80 text-rose-300 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Seat Specs Overview */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#090f24] border border-blue-950 mb-6 text-xs">
          <div>
            <span className="text-slate-400 font-semibold">Student</span>
            <p className="font-bold text-white">{activeUser.name}</p>
            <p className="text-[11px] text-sky-400">{activeUser.studentId || 'ID Verified'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Noise Rating</span>
            <p className="font-bold text-sky-300">{seat.noiseLevel}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Power Outlet</span>
            <p className="font-bold text-emerald-400">{seat.hasPower ? 'Available ⚡' : 'None'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Natural Light</span>
            <p className="font-bold text-white">{seat.isWindow ? 'Window Desk 🪟' : 'Interior'}</p>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Select Study Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 4, 8].map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => setDurationHours(hours)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  durationHours === hours
                    ? 'bg-sky-500/25 text-sky-300 border-sky-400 shadow-md shadow-sky-500/10'
                    : 'bg-[#090f24] text-slate-400 border-blue-950 hover:border-sky-500/40 hover:text-white'
                }`}
              >
                {hours} {hours === 1 ? 'Hour' : 'Hours'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Session will expire automatically at {new Date(Date.now() + durationHours * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
          </p>
        </div>

        {/* 20-minute away policy notice */}
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 mb-6 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
            !
          </div>
          <div className="text-xs text-amber-200 leading-relaxed">
            <strong className="text-white">20-Minute Away Grace Guarantee:</strong> You can take study breaks up to 20 minutes. If unattended past 20 minutes, your seat will be automatically released to other students.
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setAgreedTerms(!agreedTerms)}>
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="w-4 h-4 text-sky-500 rounded border-blue-900 bg-[#090f24] focus:ring-sky-500"
          />
          <span className="text-xs text-slate-300 font-medium select-none">
            I agree to check in via QR code within 15 minutes of reservation.
          </span>
        </div>

        {/* Confirmation Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3.5 bg-blue-950 hover:bg-blue-900 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-blue-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmBooking}
            className="w-2/3 py-3.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Reserving Seat...
              </span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Confirm & Get QR Pass
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
