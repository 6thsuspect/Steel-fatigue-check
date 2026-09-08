import type { ReactNode } from 'react';

interface AndroidFrameProps {
  children: ReactNode;
}

export default function AndroidFrame({ children }: AndroidFrameProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 p-0 sm:p-4">
      {/* Phone Frame */}
      <div className="relative w-full sm:max-w-[420px] bg-black sm:rounded-[2.5rem] shadow-2xl overflow-hidden sm:border-4 sm:border-gray-700"
        style={{ height: '100vh', maxHeight: '900px' }}>
        {/* Notch - visible only on desktop */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-black rounded-b-2xl z-50 items-center justify-center">
          <div className="w-16 h-1 bg-gray-700 rounded-full" />
        </div>
        {/* Status Bar */}
        <div className="bg-[#0D47A1] h-7 flex items-center justify-between px-6 text-white text-[10px] font-medium z-40 relative pt-1">
          <span>IRS Bridge</span>
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>
        {/* App Content */}
        <div className="bg-[#F5F5F5] overflow-y-auto" style={{ height: 'calc(100% - 27px - 20px)' }}>
          {children}
        </div>
        {/* Bottom Navigation Bar */}
        <div className="h-5 bg-black flex items-center justify-center">
          <div className="w-24 h-1 bg-gray-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
