
import React from 'react';
import { HazardEvent } from '../types';

interface HazardLogProps {
  hazards: HazardEvent[];
}

const HazardLog: React.FC<HazardLogProps> = ({ hazards }) => {
  return (
    <div className="flex-1 lg:flex-none glass rounded-[2rem] flex flex-col border border-white/10 overflow-hidden max-h-[400px] lg:max-h-none lg:min-h-[300px]">
      <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/50">Tactical Event Log</h2>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/10"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {hazards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/10 text-[10px] font-mono uppercase tracking-widest gap-4">
            <div className="w-px h-12 bg-white/5"></div>
            Monitoring_Active...
          </div>
        ) : (
          hazards.map((hazard, idx) => (
            <div
              key={hazard.id}
              className={`p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 transition-all duration-300 hover:border-red-500/30 ${idx === 0 ? 'animate-in fade-in slide-in-from-right duration-500' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${hazard.confidence > 0.8 ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-white/30'}`}>
                <AlertIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[11px] font-black text-white/90 uppercase tracking-tight truncate">{hazard.type}</span>
                  <span className="text-[9px] font-mono text-white/30 shrink-0">{hazard.time}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${hazard.confidence > 0.8 ? 'bg-red-500' : 'bg-cyan-500'}`}
                      style={{ width: `${hazard.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] font-mono text-white/30">{Math.round(hazard.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AlertIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);

export default HazardLog;
