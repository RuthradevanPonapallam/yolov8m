
import React, { useState, useEffect } from 'react';

const StatusBar: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-10 border-b border-white/10 flex items-center justify-between px-3 sm:px-6 bg-black/40 backdrop-blur-sm z-50">
      <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-medium uppercase tracking-widest text-white/50">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="hidden sm:inline">System: Online</span>
          <span className="sm:hidden">Online</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <span>GPS: Active (3.1390° N, 101.6869° E)</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <div className="hidden sm:block text-xs font-mono text-white/60">
          KUALA LUMPUR, MALAYSIA
        </div>
        <div className="text-xs sm:text-sm font-mono font-medium text-white/90">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
