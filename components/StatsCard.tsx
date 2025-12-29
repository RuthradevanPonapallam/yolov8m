
import React from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
  return (
    <div className="glass p-3 lg:p-4 rounded-2xl flex items-center gap-4 group transition-all hover:scale-[1.02] active:scale-[0.98]">
      <div className={`p-2.5 lg:p-3 rounded-xl ${color} bg-opacity-15 text-white/90 shadow-inner`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] lg:text-xs font-bold text-white/30 uppercase tracking-[0.15em] truncate">{label}</div>
        <div className="text-xl lg:text-2xl font-bold font-mono leading-none mt-1.5 flex items-baseline gap-1">
          {value}
          <span className="text-[10px] text-white/10 font-normal">UNITS</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
