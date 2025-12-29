
import React, { useState, useEffect } from 'react';
import StatusBar from './components/StatusBar';
import StatsCard from './components/StatsCard';
import VideoViewport from './components/VideoViewport';
import HazardLog from './components/HazardLog';
import ToggleItem from './components/ToggleItem';
import { HazardEvent, DetectionCategory } from './types';

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasHazard, setHasHazard] = useState(false);

  // Backend Stats State
  const [stats, setStats] = useState({
    vehicles: 0,
    hazards: 0,
    pedestrians: 0,
    speed: 0.0,
    logs: [] as HazardEvent[]
  });

  // Settings State
  const [cloudRelay, setCloudRelay] = useState(true);
  const [audioCues, setAudioCues] = useState(false);

  // Poll Stats from Backend
  useEffect(() => {
    let interval: any;

    if (isActive) {
      interval = setInterval(async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const res = await fetch(`${apiUrl}/api/stats`);
          if (res.ok) {
            const data = await res.json();
            // data.stats contains { vehicles, hazards, pedestrians, speed, logs }
            setStats(data.stats);
            setHasHazard(data.stats.hazards > 0);
          }
        } catch (err) {
          console.error("Failed to fetch backend stats:", err);
        }
      }, 500); // 500ms polling
    }

    return () => clearInterval(interval);
  }, [isActive]);

  const toggleCamera = () => {
    setIsActive(!isActive);
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-all duration-1000 bg-[#050506] ${hasHazard ? 'hazard-vignette' : ''}`}>
      <StatusBar />

      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-4 lg:gap-6 overflow-y-auto overflow-x-hidden relative">
        <div className="absolute inset-0 hud-grid pointer-events-none opacity-20 z-0"></div>

        {/* Viewport & Bottom Stats */}
        <div className="flex-none lg:flex-1 flex flex-col gap-4 lg:gap-6 min-h-[500px] lg:min-h-0 z-10">
          <VideoViewport
            isActive={isActive}
            onToggle={toggleCamera}
            streamUrl={isActive ? `${import.meta.env.VITE_API_URL || ''}/video_feed` : null}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <StatsCard
              label="Traffic Density"
              value={stats.vehicles}
              icon={<CarIcon />}
              color="bg-cyan-500"
            />
            <StatsCard
              label="Active Hazards"
              value={stats.hazards}
              icon={<AlertIcon />}
              color="bg-red-500"
            />
            <StatsCard
              label="Lifeforms Detected"
              value={stats.pedestrians}
              icon={<PersonIcon />}
              color="bg-lime-500"
            />
          </div>
        </div>

        {/* Tactical Panel */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 lg:gap-6 z-20 lg:overflow-hidden">
          <HazardLog hazards={stats.logs || []} />

          <div className="glass rounded-[2rem] p-6 sm:p-8 border border-white/10 space-y-4 sm:space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Neural_Control_Config</h2>
            <div className="space-y-4">
              <ToggleItem
                icon={<TelegramIcon className="text-cyan-400" />}
                label="Cloud Uplink"
                sub="Remote Hazard Sync"
                checked={cloudRelay}
                onChange={setCloudRelay}
              />
              <ToggleItem
                icon={<SoundIcon size={16} className="text-white/40" />}
                label="Sonic Feedback"
                sub="Spatial Audio Alerts"
                checked={audioCues}
                onChange={setAudioCues}
              />
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Active Core</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">YOLO_V8_M</span>
              </div>
              <div className="text-[10px] font-mono text-white/40 bg-black/40 p-3.5 rounded-2xl border border-white/5 truncate">
                REG: MY_KUL_WEST_GATEWAY
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-10 sm:h-12 flex items-center justify-between px-4 sm:px-10 text-[8px] sm:text-[9px] font-mono text-white/30 uppercase tracking-[0.3em] sm:tracking-[0.5em] bg-black/80 border-t border-white/5 backdrop-blur-md">
        <div className="hidden sm:block">Proprietary OS v25.4.1</div>
        <div className="sm:hidden">v25.4.1</div>
        <div className="flex gap-3 sm:gap-8">
          <span className="text-emerald-500/40 hidden sm:inline font-bold">ENCRYPTION: AES_256</span>
          <span className="text-emerald-500/40 sm:hidden font-bold">AES_256</span>
          <span className="hidden sm:inline text-white/30">UPTIME: 142:52:11</span>
        </div>
      </footer>
    </div>
  );
};

// Icons Helper
const CarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11 2 11.1 2 11.3V16c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>;
const PersonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /><path d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M18 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>;
const AlertIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const TelegramIcon = ({ className = "" }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.195-2.81 5.12-4.628c.223-.198-.048-.307-.346-.11l-6.33 3.986-2.72-.85c-.593-.186-.605-.593.123-.878l10.64-4.102c.49-.18.919.113.752.959z" /></svg>;
const SoundIcon = ({ size = 18, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>;

export default App;
