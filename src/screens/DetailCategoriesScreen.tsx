import { useState } from 'react';
import { Search } from 'lucide-react';
import AppBar from '../components/AppBar';
import { detailCategories, calculateΔσD, calculateΔσL } from '../data/fatigueData';

interface Props {
  onBack: () => void;
}

export default function DetailCategoriesScreen({ onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');

  const groups = ['All', ...new Set(detailCategories.map(d => d.group))];

  const filteredCategories = detailCategories.filter(d => {
    const matchesGroup = selectedGroup === 'All' || d.group === selectedGroup;
    const matchesSearch = searchQuery === '' || 
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toString().includes(searchQuery);
    return matchesGroup && matchesSearch;
  });

  const groupColors: Record<string, string> = {
    'Plain Material': '#1565C0',
    'Bolted Connections': '#2E7D32',
    'Butt Welds': '#C62828',
    'Longitudinal Welds': '#F57F17',
    'Welded Attachments': '#7B1FA2',
  };

  return (
    <div className="flex flex-col h-full">
      <AppBar title="Detail Categories" subtitle="Table G-II of IRS SBC" onBack={onBack} />

      {/* Search */}
      <div className="bg-white px-3 py-2 border-b border-gray-200">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-8 pr-3 py-2 bg-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1565C0]"
          />
        </div>
        {/* Group filters */}
        <div className="flex gap-1 mt-2 overflow-x-auto pb-1 -mx-1 px-1">
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors
                ${selectedGroup === g 
                  ? 'bg-[#1565C0] text-white' 
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-[10px] text-gray-400 mb-2">{filteredCategories.length} categories found</p>
        {filteredCategories.map((det) => (
          <div 
            key={det.id} 
            className="bg-white rounded-xl p-3 shadow-sm mb-2 border-l-3"
            style={{ borderLeftColor: groupColors[det.group] || '#666', borderLeftWidth: '3px' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: groupColors[det.group] || '#666' }}>
                    Cat {det.category}
                  </span>
                  <span className="text-[10px] text-gray-500">{det.group}</span>
                </div>
                <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">{det.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              <div className="bg-blue-50 rounded p-1.5 text-center">
                <p className="text-[8px] text-blue-500 font-medium">ΔσC (2×10⁶)</p>
                <p className="text-[11px] font-bold text-blue-700">{det.deltaσC} MPa</p>
              </div>
              <div className="bg-amber-50 rounded p-1.5 text-center">
                <p className="text-[8px] text-amber-500 font-medium">ΔσD (5×10⁶)</p>
                <p className="text-[11px] font-bold text-amber-700">{calculateΔσD(det.deltaσC).toFixed(1)} MPa</p>
              </div>
              <div className="bg-red-50 rounded p-1.5 text-center">
                <p className="text-[8px] text-red-500 font-medium">ΔσL (10⁸)</p>
                <p className="text-[11px] font-bold text-red-700">{calculateΔσL(det.deltaσC).toFixed(1)} MPa</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
