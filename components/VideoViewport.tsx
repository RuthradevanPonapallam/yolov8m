
import React, { useState } from 'react';

interface VideoViewportProps {
  isActive: boolean;
  onToggle: () => void;
  streamUrl: string | null;
}

const VideoViewport: React.FC<VideoViewportProps> = ({
  isActive,
  onToggle,
  streamUrl
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/upload_image`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadedImage(`data:image/jpeg;base64,${data.image}`);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="flex-1 glass rounded-[2.5rem] overflow-hidden relative border border-white/10 group shadow-2xl">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />

      {/* HUD Metadata Overlay */}
      <div className="absolute top-4 lg:top-8 left-4 lg:left-8 right-4 lg:right-8 z-30 flex justify-between items-start pointer-events-none">
        <div className="space-y-2 lg:space-y-4">
          <div className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-[8px] lg:text-[10px] font-black tracking-wider lg:tracking-widest flex items-center gap-1.5 lg:gap-2 transition-all duration-500 border ${isActive || uploadedImage ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-white/20 border-white/5'}`}>
            <span className={`w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-white/20'}`}></span>
            <span className="hidden sm:inline">{uploadedImage ? 'STATIC_IMAGE_ANALYSIS' : isActive ? 'OPTICAL_SENSORS_ACTIVE' : 'SYSTEM_STANDBY'}</span>
            <span className="sm:hidden">{uploadedImage ? 'STATIC' : isActive ? 'ACTIVE' : 'STANDBY'}</span>
          </div>
          <div className="flex gap-1.5 lg:gap-2">
            <div className="glass px-2 lg:px-3 py-0.5 lg:py-1 rounded-lg text-[8px] lg:text-[10px] font-mono text-white/40 border-white/5 uppercase backdrop-blur-md">
              <span className="lg:hidden">{uploadedImage ? 'EXTERNAL' : 'MY_KL_001'}</span>
              <span className="hidden lg:inline">{uploadedImage ? 'SOURCE: EXTERNAL_FILE' : 'NODE: MY_KL_001'}</span>
            </div>
            {isActive && !uploadedImage && (
              <div className="glass px-2 lg:px-3 py-0.5 lg:py-1 rounded-lg text-[8px] lg:text-[10px] font-mono text-emerald-400 border-emerald-500/20 animate-pulse backdrop-blur-md">
                LIVE_FEED_ON
              </div>
            )}
          </div>
        </div>

        <div className="glass p-2 lg:p-4 rounded-xl lg:rounded-2xl border-white/5 backdrop-blur-xl">
          <CompassIcon className={`w-4 h-4 lg:w-6 lg:h-6 ${isActive ? 'text-cyan-400 animate-[spin_15s_linear_infinite]' : 'text-white/10'}`} />
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="absolute bottom-3 lg:bottom-8 left-3 lg:left-8 right-3 lg:right-8 z-30 flex flex-col lg:flex-row justify-between items-center lg:items-end gap-3 lg:gap-6">
        {/* Buttons Row */}
        <div className="flex items-center justify-center gap-2 lg:gap-4 w-full lg:w-auto">
          <button
            onClick={onToggle}
            className={`flex-1 lg:flex-none px-8 lg:px-10 py-3 lg:py-5 rounded-[1.5rem] font-black text-[11px] lg:text-xs tracking-[0.15em] lg:tracking-[0.25em] uppercase transition-all duration-500 shadow-2xl active:scale-95 ${isActive
              ? 'bg-red-500/10 text-red-500 border border-red-500/40 hover:bg-red-500/20'
              : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/40 hover:scale-105'
              }`}
          >
            {isActive ? 'DISABLE_LIVE' : 'ENGAGE_LIVE'}
          </button>

          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="p-3 lg:p-5 glass rounded-[1.5rem] text-white/80 hover:bg-white/10 transition-all border-white/10 shadow-xl"
            title="Upload Image"
          >
            <UploadIcon size={18} className="lg:w-6 lg:h-6" />
          </button>

          {uploadedImage && (
            <button
              onClick={() => setUploadedImage(null)}
              className="p-3 lg:p-5 glass rounded-[1.5rem] text-red-400 hover:bg-red-500/10 transition-all border-red-500/20 shadow-xl"
              title="Clear Upload"
            >
              <ClearIcon size={18} className="lg:w-6 lg:h-6" />
            </button>
          )}
        </div>

        {/* Metrics Row - Hidden on very small screens */}
        <div className="hidden sm:flex gap-3 lg:gap-4 justify-center w-full lg:w-auto">
          <MetricBox label="Speed" value={isActive ? "42" : "--"} unit="KM/H" />
          <MetricBox label="Stability" value={isActive ? "0.98" : "--"} unit="G" />
        </div>
      </div>

      {/* Rendering Layer */}
      <div className="absolute inset-0 z-0 bg-[#050506]">
        {uploadedImage ? (
          <img
            src={uploadedImage}
            alt="Uploaded Analysis"
            className="w-full h-full object-contain"
          />
        ) : streamUrl ? (
          <img
            src={streamUrl}
            alt="Live Feed"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 lg:gap-8 bg-black/40 backdrop-blur-sm">
            <div className="relative">
              <div className="w-16 lg:w-24 h-16 lg:h-24 border-b-2 border-cyan-500/30 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 lg:w-14 h-10 lg:h-14 border-t-2 border-cyan-400 rounded-full animate-[spin_2s_linear_infinite]"></div>
              </div>
            </div>
            <div className="text-center space-y-1 lg:space-y-2 px-4">
              <h3 className="text-[8px] lg:text-[10px] font-black tracking-[0.3em] lg:tracking-[0.5em] text-white/40 uppercase">Awaiting_Sensor_Sync</h3>
              <p className="text-[7px] lg:text-[9px] font-mono text-cyan-500 animate-pulse uppercase">Engage live camera or upload image...</p>
            </div>
          </div>
        )}

        {(isActive || uploadedImage) && <div className="scan-line"></div>}
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="glass px-6 py-4 rounded-2xl flex flex-col items-center min-w-[120px] border-white/10 backdrop-blur-xl">
    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
    <span className="font-mono text-2xl font-black text-white">{value}<span className="text-[10px] text-cyan-500/60 ml-1">{unit}</span></span>
  </div>
);

const CompassIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const UploadIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);

const ClearIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

export default VideoViewport;
