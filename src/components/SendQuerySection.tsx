import React, { useState } from 'react';
import { SupportQuery, UserPersona, ThemeMode } from '../types';

interface SendQuerySectionProps {
  activeUser: UserPersona;
  queries: SupportQuery[];
  onSendQuery: (query: Omit<SupportQuery, 'id' | 'ticketNumber' | 'createdAt' | 'status' | 'adminReply'>) => void;
  theme: ThemeMode;
}

export const SendQuerySection: React.FC<SendQuerySectionProps> = ({
  activeUser,
  queries,
  onSendQuery,
  theme
}) => {
  const isDark = theme === 'dark';

  const [category, setCategory] = useState('General Student Inquiry');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [floor, setFloor] = useState('general');
  const [seatNumber, setSeatNumber] = useState('General / Campus');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    onSendQuery({
      studentName: activeUser.name,
      studentEmail: activeUser.email,
      studentId: activeUser.studentId || 'STU-001',
      category,
      priority,
      floor,
      seatNumber: seatNumber || 'N/A',
      subject,
      message
    });

    const ticketNumber = 'QRY-' + Math.floor(1000 + Math.random() * 9000);
    setSuccessTicket(ticketNumber);
    setSubject('');
    setMessage('');
    setSeatNumber('');
  };

  return (
    <section id="send-queries-section" className={`border-t py-16 transition-colors duration-300 ${
      isDark ? 'bg-[#050814] border-blue-950/80 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/15 border border-sky-500/30 text-sky-400 mb-3 shadow-sm">
            <img src="/seatsync_icon.png" alt="" className="w-4 h-4 rounded object-cover ring-1 ring-sky-400/40 bg-[#070c1d]" />
            <span>University Helpdesk & Operations Dispatch</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Have Questions or Desk Issues? Send Your Query
          </h2>
          <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Direct line to Alexandria University Library IT, Operations, and Student Facilities. Average staff response time is under 15 minutes during exam periods.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Send Query Form */}
          <div className="lg:col-span-7">
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative ${
              isDark ? 'bg-[#0d1633] border-blue-900/70 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
            }`}>
              
              {successTicket ? (
                <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl">
                    ✓
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full">
                    Query Ticket Dispatched
                  </span>
                  <h3 className="text-2xl font-black mt-2">Ticket #{successTicket}</h3>
                  <p className={`text-xs max-w-md mx-auto mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Your query has been logged into the Alexandria Library operations dispatch queue.
                  </p>
                  
                  <div className={`mt-6 p-4 rounded-2xl border max-w-md mx-auto text-left text-xs ${
                    isDark ? 'bg-[#090f24] border-blue-950 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex justify-between py-1"><span>Priority:</span><span className="font-bold uppercase text-amber-400">{priority}</span></div>
                    <div className="flex justify-between py-1"><span>Est. Resolution:</span><span className="font-bold text-emerald-400">&lt; 15 Minutes</span></div>
                    <div className="flex justify-between py-1"><span>Category:</span><span className="font-bold">{category}</span></div>
                  </div>

                  <button
                    onClick={() => setSuccessTicket(null)}
                    className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-95 cursor-pointer"
                  >
                    Send Another Query →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-sky-500/10 border-sky-500/25 text-sky-200' : 'bg-sky-50 border-sky-200 text-sky-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">👤</span>
                      <span>Sending as: <strong>{activeUser.name}</strong> ({activeUser.email})</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold text-sky-400">
                      {activeUser.studentId || 'STUDENT'}
                    </span>
                  </div>

                  {/* Mode Switcher: General Query vs Desk Specific */}
                  <div className="flex gap-2 p-1.5 rounded-2xl bg-black/20 border border-slate-700/30">
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('General Student Inquiry');
                        setFloor('general');
                        setSeatNumber('General / Campus');
                        setSubject('General library hours, access & study policy inquiry');
                        setMessage('Could you please clarify the library operating schedule, facilities access, or exam policy?');
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        category === 'General Student Inquiry'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>💬 General Query Mode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('Broken Hardware / Bug');
                        setFloor('ground');
                        setSeatNumber('G-04');
                        setSubject('');
                        setMessage('');
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        category !== 'General Student Inquiry'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>⚡ Specific Desk Issue</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Query Category *</label>
                      <select
                        value={category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setCategory(newCat);
                          if (newCat === 'General Student Inquiry') {
                            setFloor('general');
                            setSeatNumber('General / Campus');
                          }
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer ${
                          isDark ? 'bg-[#090f24] border-blue-900/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="General Student Inquiry">💬 General Query & Library Policies</option>
                        <option value="Seat Availability & Booking Rules">🪑 Seat Availability & Booking Rules</option>
                        <option value="20-Minute Away Timer & Policy">⏱️ 20-Minute Away Timer & Policy</option>
                        <option value="Broken Hardware / Bug">⚡ Broken Hardware / Workstation Bug</option>
                        <option value="Power Outlets & Dual Monitor Docks">🔌 Power Outlets & Dual Monitor Docks</option>
                        <option value="Quiet Zone Noise Disturbance">🔇 Quiet Zone Noise Disturbance</option>
                        <option value="Lost & Found Belongings">💼 Lost & Found Belongings</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Urgency Level *</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { key: 'normal', label: '🟢 Normal' },
                          { key: 'high', label: '🟡 High' },
                          { key: 'urgent', label: '🔴 Urgent' }
                        ].map((lvl) => (
                          <button
                            type="button"
                            key={lvl.key}
                            onClick={() => setPriority(lvl.key as any)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              priority === lvl.key
                                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                                : isDark
                                ? 'border-blue-950 bg-[#090f24] text-slate-400 hover:text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {lvl.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Library Floor</label>
                      <select
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer ${
                          isDark ? 'bg-[#090f24] border-blue-900/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="general">🏢 General / Campus-Wide (Not Desk Specific)</option>
                        <option value="ground">Ground Floor (Commons & Cafe)</option>
                        <option value="first">First Floor (Silent Study & Windows)</option>
                        <option value="second">Second Floor (Deep Focus & Pods)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Workstation # (Optional)</label>
                      <input
                        type="text"
                        placeholder={floor === 'general' ? 'General / Campus-wide' : 'e.g. G-04, F-12, S-08'}
                        value={seatNumber}
                        onChange={(e) => setSeatNumber(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium focus:outline-none focus:ring-1 focus:ring-sky-400 ${
                          isDark ? 'bg-[#090f24] border-blue-900/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Subject Line *</label>
                    <input
                      type="text"
                      placeholder="Brief summary of your query or problem..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium focus:outline-none focus:ring-1 focus:ring-sky-400 ${
                        isDark ? 'bg-[#090f24] border-blue-900/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Query Message / Incident Details *</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your inquiry, requested extension, equipment issue, or feedback in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium focus:outline-none focus:ring-1 focus:ring-sky-400 ${
                        isDark ? 'bg-[#090f24] border-blue-900/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                      required
                    />
                  </div>

                  {/* Quick Suggestions Chips */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Quick Suggestions (Click to Autofill):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '💬 General Query: Hours & Study Access', cat: 'General Student Inquiry', flr: 'general', seat: 'General / Campus', subj: 'Library 24/7 exam hours and quiet room access', msg: 'What are the official 24/7 library operating hours during final exam week, and how do we access private group discussion rooms on Ground Floor?' },
                        { label: '📚 Book Borrowing & Renewals', cat: 'General Student Inquiry', flr: 'general', seat: 'General / Campus', subj: 'Question on digital book checkouts and return grace period', msg: 'How do students renew physical research books through SeatSync, and where is the automated return drop on Ground Floor?' },
                        { label: '⏱️ Away timer rules', cat: '20-Minute Away Timer & Policy', flr: 'ground', seat: 'G-05', subj: '20-Minute away timer policy question', msg: 'Can the 20-minute break timer be extended if attending quick library consultation?' },
                        { label: '⚡ Socket issue at G-04', cat: 'Broken Hardware / Bug', flr: 'ground', seat: 'G-04', subj: 'Power socket defect at Desk G-04', msg: 'The dual AC wall plug on desk G-04 has no power output.' },
                        { label: '🔇 Silent zone noise', cat: 'Quiet Zone Noise Disturbance', flr: 'first', seat: 'F-12', subj: 'Noise disturbance on Floor 1', msg: 'Excessive group conversation in the garden vista quiet zone.' },
                        { label: '💼 Lost AirPods', cat: 'Lost & Found Belongings', flr: 'second', seat: 'S-08', subj: 'Lost item report: AirPods Pro', msg: 'Left white AirPods case near Second Floor thesis carrels yesterday afternoon.' }
                      ].map((chip, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => {
                            setCategory(chip.cat);
                            setFloor(chip.flr);
                            setSeatNumber(chip.seat);
                            setSubject(chip.subj);
                            setMessage(chip.msg);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            category === chip.cat && subject === chip.subj
                              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                              : isDark ? 'bg-[#090f24] border-blue-950 text-sky-300 hover:border-sky-400' : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-black text-sm rounded-2xl shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🚀 Send Query to Helpdesk</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Live Inquiries Tracker */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`p-6 rounded-3xl border shadow-xl ${
              isDark ? 'bg-[#0d1633] border-blue-900/70 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black">Live Support Ticket Tracker</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track real-time status of submitted queries.</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {queries.slice(0, 4).map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3.5 rounded-2xl border text-xs transition-all ${
                      isDark ? 'bg-[#090f24] border-blue-950/70' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-sky-400">{ticket.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : ticket.status === 'in_progress'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold truncate text-white">{ticket.subject}</h4>
                    <p className={`text-[11px] mt-0.5 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{ticket.message}</p>
                    
                    {ticket.adminReply && (
                      <div className="mt-2 pt-2 border-t border-slate-700/20 text-[10px] text-sky-300">
                        <span className="font-bold text-sky-400">Staff: </span>{ticket.adminReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0d1633] border-blue-900/70 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
            }`}>
              <h3 className="text-sm font-black mb-3">Direct Alexandria Library Contacts</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">📍</span>
                  <div>
                    <p className="font-bold">Main Helpdesk Counter</p>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Level 0 Commons • Next to Cafe Entrance</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">📞</span>
                  <div>
                    <p className="font-bold">Hotline & Urgent Escalation</p>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>+1 (555) 019-SEAT (ext 402)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">✉️</span>
                  <div>
                    <p className="font-bold">Official University Mail</p>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>library-helpdesk@alexandria.edu</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
