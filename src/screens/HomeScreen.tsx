import { 
  Activity, Calculator, BookOpen, Layers, 
  ChevronRight, Wrench, BarChart3, Shield
} from 'lucide-react';
import AppBar from '../components/AppBar';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const menuItems = [
    {
      icon: Calculator,
      title: 'Fatigue Analysis',
      subtitle: 'Complete fatigue check as per IRS SBC',
      color: '#1565C0',
      screen: 'fatigue-analysis',
    },
    {
      icon: BarChart3,
      title: 'S-N Curve Viewer',
      subtitle: 'View S-N curves for detail categories',
      color: '#2E7D32',
      screen: 'sn-curve',
    },
    {
      icon: Layers,
      title: 'Detail Categories',
      subtitle: 'Browse all detail categories (Table G-II)',
      color: '#E65100',
      screen: 'detail-categories',
    },
    {
      icon: Activity,
      title: 'Damage Accumulation',
      subtitle: 'Palmgren-Miner rule calculation',
      color: '#7B1FA2',
      screen: 'damage-accumulation',
    },
    {
      icon: Wrench,
      title: 'Quick Stress Check',
      subtitle: 'Verify stress range vs allowable',
      color: '#00838F',
      screen: 'quick-check',
    },
    {
      icon: BookOpen,
      title: 'Reference & Clauses',
      subtitle: 'IRS SBC key clauses & formulas',
      color: '#455A64',
      screen: 'reference',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <AppBar 
        title="IRS Steel Bridge Code" 
        subtitle="Fatigue Analysis Calculator" 
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1565C0] to-[#0D47A1] text-white px-4 py-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Shield size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">Fatigue Design Tool</h2>
            <p className="text-[11px] text-blue-200 leading-snug mt-0.5">
              As per IRS Steel Bridge Code<br />
              Appendix G (Re-revised) 2017
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
            <p className="text-[10px] text-blue-200">Detail Categories</p>
            <p className="text-lg font-bold">25</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
            <p className="text-[10px] text-blue-200">Steel Grades</p>
            <p className="text-lg font-bold">10</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
            <p className="text-[10px] text-blue-200">Design Life</p>
            <p className="text-lg font-bold">100yr</p>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 px-3 py-3 overflow-y-auto">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
          Analysis Modules
        </p>
        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(item.screen)}
              className="w-full flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm 
                hover:shadow-md active:scale-[0.98] transition-all duration-150 text-left"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-800">{item.title}</h3>
                <p className="text-[10px] text-gray-500 leading-tight truncate">{item.subtitle}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 mb-2 text-center">
          <p className="text-[9px] text-gray-400">
            IRS Steel Bridge Code - RDSO, Lucknow
          </p>
          <p className="text-[9px] text-gray-400">
            Appendix G (Re-revised) • ACS 22/24
          </p>
        </div>
      </div>
    </div>
  );
}
