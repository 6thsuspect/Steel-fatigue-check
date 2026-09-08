import { ArrowLeft, Info } from 'lucide-react';

interface AppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onInfo?: () => void;
}

export default function AppBar({ title, subtitle, onBack, onInfo }: AppBarProps) {
  return (
    <div className="bg-[#1565C0] text-white px-3 py-2.5 shadow-md sticky top-0 z-30">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-[10px] text-blue-200 leading-tight truncate">{subtitle}</p>}
        </div>
        {onInfo && (
          <button onClick={onInfo} className="p-1 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors">
            <Info size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
