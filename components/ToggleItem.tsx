
import React from 'react';

interface ToggleItemProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ icon, label, sub, checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group"
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-white/90">{label}</div>
        <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{sub}</div>
      </div>
    </div>
    <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${checked ? 'bg-cyan-500/30 border border-cyan-500/40' : 'bg-white/5 border border-white/10'}`}>
      <div className={`absolute top-1 w-2.5 h-2.5 rounded-full transition-all duration-300 ${checked ? 'left-6 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'left-1 bg-white/20'}`}></div>
    </div>
  </div>
);

export default ToggleItem;
