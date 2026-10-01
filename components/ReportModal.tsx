"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, HeartHandshake, Calendar, Clock, ShieldCheck, XCircle } from "lucide-react";

const CRIME_CATEGORIES = [
  "Harassment / Stalking",
  "Mugging / Armed Robbery",
  "Verbal Assault / Threat",
  "Vehicle Break-In / Theft",
  "Unsafe Transport / Taxi Incident",
  "Other Suspicious Activity",
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCoords: { lat: number; lng: number } | null;
  onSubmit: (data: any) => void;
}

export default function ReportModal({ isOpen, onClose, selectedCoords, onSubmit }: ReportModalProps) {
  const [category, setCategory] = useState(CRIME_CATEGORIES[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to safely get local date string YYYY-MM-DD
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper to format Date object to local HH:MM string
  const getLocalTimeString = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Calculate Date Boundaries (Max = Today, Min = Exactly 1 Year Ago)
  const now = new Date();
  const todayStr = getLocalDateString(now);
  const currentTimeStr = getLocalTimeString(now);
  
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  const oneYearAgoStr = getLocalDateString(oneYearAgo);

  useEffect(() => {
    if (isOpen) {
      const currentDate = new Date();
      setDate(getLocalDateString(currentDate));
      setTime(getLocalTimeString(currentDate));
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time date handler with instant snapping
  const handleDateChange = (inputDateStr: string) => {
    if (!inputDateStr) {
      setDate(todayStr);
      return;
    }

    // Snap future dates back to today
    if (inputDateStr > todayStr) {
      setDate(todayStr);
      if (time > currentTimeStr) {
        setTime(currentTimeStr);
      }
      return;
    }

    // Snap older dates back to exactly one year ago
    if (inputDateStr < oneYearAgoStr) {
      setDate(oneYearAgoStr);
      return;
    }

    setDate(inputDateStr);

    // If date is updated to today, double check time snap
    if (inputDateStr === todayStr && time > currentTimeStr) {
      setTime(currentTimeStr);
    }
  };

  // Real-time time handler with instant snapping
  const handleTimeChange = (inputTimeStr: string) => {
    if (!inputTimeStr) {
      setTime("");
      return;
    }

    // If selected date is today, snap future time back to current time
    if (date === todayStr && inputTimeStr > currentTimeStr) {
      setTime(currentTimeStr);
      return;
    }

    setTime(inputTimeStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!date || !time) {
      setErrorMsg("Please select a valid date and time.");
      return;
    }

    onSubmit({
      category,
      date,
      time,
      description,
      lat: selectedCoords?.lat || 10.6549,
      lng: selectedCoords?.lng || -61.5019,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
    >
      {/* CSS fix applied strictly to the DATE input only */}
      <style jsx>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border border-pink-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
      >
        <div className="flex items-center gap-2 text-pink-400 font-bold text-lg mb-1">
          <ShieldAlert className="w-5 h-5" />
          <span>Anonymous Incident Report</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Your identity is completely protected. Help keep women and communities safe in Trinidad.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-600/50 rounded-xl text-rose-300 text-xs font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Classification / Incident Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 text-slate-100 rounded-xl p-2.5 text-sm outline-none cursor-pointer"
            >
              {CRIME_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  min={oneYearAgoStr}
                  max={todayStr}
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                  onKeyDown={(e) => e.preventDefault()} // Blocks weird manual typing only on Date
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5 pr-9 text-xs outline-none focus:border-pink-500 cursor-pointer relative z-10 bg-transparent"
                />
                <Calendar className="w-4 h-4 text-pink-400 absolute right-3 pointer-events-none z-0" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
              <div className="relative flex items-center">
                {/* Time input completely reverted to original working version */}
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5 pr-9 text-xs outline-none focus:border-pink-500 cursor-pointer"
                />
                <Clock className="w-4 h-4 text-pink-400 absolute right-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Brief Description / Location Detail</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Near the taxi stand after dark..."
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5 text-xs outline-none resize-none focus:border-pink-500"
            />
          </div>

          {/* Map Pinpoint Callout */}
          <div className="p-3 bg-pink-950/20 border border-pink-900/30 rounded-xl flex items-center gap-2.5 text-pink-300 text-[11px] leading-relaxed">
            <HeartHandshake className="w-5 h-5 shrink-0 text-pink-400" />
            <span>Clicking submit pinpoints location coordinates directly to the alert map.</span>
          </div>

          {/* Civic Trust & Honesty Pledge */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-2.5 text-slate-300 text-[11px] leading-relaxed">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <span>
              <strong className="text-slate-100">Accuracy matters:</strong> Please ensure your report is accurate and truthful. Honest community data builds trust and directly protects lives.
            </span>
          </div>

          {/* Clear Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-pink-950/50"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}