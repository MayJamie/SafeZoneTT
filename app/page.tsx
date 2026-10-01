"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Shield, Heart, MapPin, Bell, UserCheck, AlertTriangle, HeartHandshake } from "lucide-react";
import ReportModal from "@/components/ReportModal";
import { Incident } from "@/components/Map";
import { initialIncidents } from "@/data/mockIncidents";

const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[490px] w-full rounded-2xl bg-slate-900/90 border border-pink-900/40 flex flex-col items-center justify-center gap-3 text-pink-400">
      <Shield className="w-12 h-12 text-pink-500 animate-spin" />
      <span className="text-base font-bold tracking-wider text-slate-200">SafeZone TT</span>
    </div>
  ),
});

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [userVotedIncidentIds, setUserVotedIncidentIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setIsModalOpen(true);
  };

  const handleAddIncident = (newIncidentData: Omit<Incident, "id">) => {
    const newIncident: Incident = {
      ...newIncidentData,
      id: Date.now().toString(),
      meTooCount: 0,
    };
    setIncidents((prev) => [newIncident, ...prev]);
  };

  // Toggle "Happened to me too" logic (1 vote per incident per user)
  const handleMeToo = (id: string) => {
    const hasVoted = userVotedIncidentIds.includes(id);

    if (hasVoted) {
      // Remove vote
      setUserVotedIncidentIds((prev) => prev.filter((votedId) => votedId !== id));
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === id ? { ...inc, meTooCount: Math.max(0, (inc.meTooCount || 0) - 1) } : inc
        )
      );
    } else {
      // Add vote
      setUserVotedIncidentIds((prev) => [...prev, id]);
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, meTooCount: (inc.meTooCount || 0) + 1 } : inc))
      );
    }
  };

  return (
    <main className="min-h-screen bg-black text-slate-100 p-4 sm:p-6 md:p-8 font-sans selection:bg-pink-500 selection:text-white flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* HERO HEADER - Centered & Enlarged */}
        <header className="flex flex-col items-center text-center gap-5 mb-10 pb-8 border-b border-pink-900/30 max-w-3xl mx-auto">
          <div>
            <div className="flex items-center justify-center gap-3 font-black text-4xl sm:text-5xl tracking-wider bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent mb-3">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-pink-500" />
              <span>SafeZone TT</span>
            </div>
            <p className="text-slate-300 text-sm sm:text-base flex items-center justify-center gap-2 font-medium">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> 
              Women's Safety & Civic Incident Monitoring Platform
            </p>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            SafeZone TT helps monitor and pinpoint safety concerns across Trinidad and Tobago. Explore reported incidents in real-time or contribute directly. We created this platform so citizens can report crime incidents to warn others about unsafe areas and help keep our community safe.
          </p>

          {/* Emergency Caution Banner - SMALLER TEXT & ICON */}
          <div className="mt-2 p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-start text-left gap-2.5 text-amber-300 text-[11px] sm:text-xs leading-relaxed shadow-sm w-full max-w-2xl">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <span>
              <strong className="text-amber-200">Caution:</strong> This app does not replace official emergency services. We strongly encourage reporting to local crime authorities first. This tool is a secondary effort to keep your friends and fellow citizens safe.
            </span>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Map Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-sm tracking-wide text-slate-300 flex items-center gap-2 uppercase">
                <MapPin className="w-4 h-4 text-pink-500" /> Interactive Alert Map
              </h2>
              <span className="text-xs bg-pink-950/60 text-pink-300 border border-pink-900/50 px-3 py-1 rounded-full">
                Click map to pinpoint report
              </span>
            </div>

            <MapComponent
              incidents={incidents}
              onMapClick={handleMapClick}
              onMeToo={handleMeToo}
              userVotedIncidentIds={userVotedIncidentIds}
              isModalOpen={isModalOpen}
              onCloseModal={() => setIsModalOpen(false)}
            />
          </div>

          {/* Live Feed Sidebar */}
          <div className="space-y-3 flex flex-col h-full">
            <h2 className="font-semibold text-sm tracking-wide text-slate-300 flex items-center gap-2 uppercase">
              <Bell className="w-4 h-4 text-pink-500" /> Live Safety Feed ({incidents.length})
            </h2>

            <div className="bg-slate-950/80 border border-pink-900/30 rounded-2xl p-3 h-[645px] flex flex-col shadow-xl">
              <div className="space-y-3 overflow-y-auto pr-1.5 h-full scrollbar-thin scrollbar-thumb-slate-800">
                {incidents.map((incident) => {
                  const hasVoted = userVotedIncidentIds.includes(incident.id);

                  return (
                    <div
                      key={incident.id}
                      className="bg-slate-900/80 border border-slate-800 hover:border-pink-900/60 p-3.5 rounded-xl transition-all shadow-md"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-pink-400 bg-pink-950/80 border border-pink-900/50 px-2 py-0.5 rounded-md">
                          {incident.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{incident.time}</span>
                      </div>

                      <p className="text-xs text-slate-200 mt-2 font-medium leading-relaxed">{incident.description}</p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                        <span>📅 {incident.date}</span>

                        {/* Toggleable "Happened to me too" Button */}
                        <button
                          onClick={() => handleMeToo(incident.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                            hasVoted
                              ? "bg-pink-600 text-white border-pink-400 font-semibold"
                              : "bg-slate-800 hover:bg-pink-950/80 text-pink-300 border-pink-900/40"
                          }`}
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Happened to me too</span>
                          {incident.meTooCount ? (
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded-full text-[9px] ${
                                hasVoted ? "bg-white text-pink-600" : "bg-pink-600 text-white"
                              }`}
                            >
                              {incident.meTooCount}
                            </span>
                          ) : null}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* OUR MISSION SECTION */}
        <div className="mt-16 sm:mt-20 bg-gradient-to-br from-pink-950/20 to-slate-900/50 border border-pink-900/30 rounded-3xl p-8 sm:p-10 max-w-4xl mx-auto text-center relative overflow-hidden shadow-2xl">
          {/* Decorative glowing background effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-pink-500/5 blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-pink-950/50 p-3 rounded-full mb-4 border border-pink-900/50">
              <HeartHandshake className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4 tracking-wide">Our Mission</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              We built SafeZone TT because everyone deserves to feel secure in their community. Our goal is to bridge the gap between official crime reporting and real-time community awareness. By sharing our experiences, we can look out for one another, protect the vulnerable, and build a culture of vigilance and care across Trinidad and Tobago.
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-slate-600 text-xs mt-12 pt-5 border-t border-slate-900">
        SafeZone TT &copy; {new Date().getFullYear()} — Empowering safer communities across Trinidad & Tobago.
      </footer>

      {/* Report Modal */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedCoords={selectedCoords}
        onSubmit={handleAddIncident}
      />
    </main>
  );
}