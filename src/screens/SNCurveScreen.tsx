import { useState, useMemo } from 'react';
import AppBar from '../components/AppBar';
import SelectField from '../components/SelectField';
import { detailCategories, generateSNCurveData, calculateΔσD, calculateΔσL } from '../data/fatigueData';

interface Props {
  onBack: () => void;
}

export default function SNCurveScreen({ onBack }: Props) {
  const [selectedCats, setSelectedCats] = useState<string[]>(['1']);

  const catOptions = detailCategories.map(d => ({
    value: d.id.toString(),
    label: `Cat ${d.category} - ${d.group}`,
  }));

  const colors = ['#1565C0', '#C62828', '#2E7D32', '#F57F17', '#7B1FA2', '#00838F'];

  const selectedDetails = selectedCats
    .map(id => detailCategories.find(d => d.id === Number(id)))
    .filter(Boolean);

  // Generate SVG chart
  const chartData = useMemo(() => {
    return selectedDetails.map((det, idx) => {
      if (!det) return null;
      const data = generateSNCurveData(det.deltaσC);
      return {
        detail: det,
        data,
        color: colors[idx % colors.length],
      };
    }).filter(Boolean);
  }, [selectedCats]);

  // SVG dimensions
  const svgW = 360;
  const svgH = 260;
  const margin = { top: 20, right: 20, bottom: 40, left: 45 };
  const plotW = svgW - margin.left - margin.right;
  const plotH = svgH - margin.top - margin.bottom;

  // Log scales
  const logNMin = 4;
  const logNMax = 9;
  const logSMin = 1;
  const logSMax = 3;

  const scaleX = (logN: number) => margin.left + ((logN - logNMin) / (logNMax - logNMin)) * plotW;
  const scaleY = (logS: number) => margin.top + plotH - ((logS - logSMin) / (logSMax - logSMin)) * plotH;

  const gridLinesX = [4, 5, 6, 7, 8, 9];
  const gridLinesY = [1, 1.3, 1.5, 1.7, 2, 2.2, 2.5, 3];

  const addCategory = (val: string) => {
    if (val && !selectedCats.includes(val) && selectedCats.length < 6) {
      setSelectedCats([...selectedCats, val]);
    }
  };

  const removeCategory = (id: string) => {
    setSelectedCats(selectedCats.filter(c => c !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <AppBar title="S-N Curve Viewer" subtitle="Stress Range vs Number of Cycles" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Selector */}
        <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
          <SelectField
            label="Add Detail Category"
            value=""
            onChange={addCategory}
            options={catOptions}
            helpText="Select up to 6 categories to compare"
          />
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedDetails.map((det, idx) => det && (
              <span
                key={det.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white cursor-pointer"
                style={{ backgroundColor: colors[idx % colors.length] }}
                onClick={() => removeCategory(det.id.toString())}
              >
                Cat {det.category} ✕
              </span>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-2 shadow-sm mb-3">
          <h4 className="text-[11px] font-bold text-gray-600 uppercase mb-1 px-1">S-N Curve (Log-Log Scale)</h4>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
            {/* Grid */}
            {gridLinesX.map(x => (
              <g key={`gx-${x}`}>
                <line x1={scaleX(x)} y1={margin.top} x2={scaleX(x)} y2={margin.top + plotH} stroke="#eee" strokeWidth="0.5" />
                <text x={scaleX(x)} y={svgH - 5} textAnchor="middle" fontSize="8" fill="#999">10^{x}</text>
              </g>
            ))}
            {gridLinesY.map(y => (
              <g key={`gy-${y}`}>
                <line x1={margin.left} y1={scaleY(y)} x2={margin.left + plotW} y2={scaleY(y)} stroke="#eee" strokeWidth="0.5" />
                <text x={margin.left - 5} y={scaleY(y) + 3} textAnchor="end" fontSize="7" fill="#999">{Math.pow(10, y).toFixed(0)}</text>
              </g>
            ))}

            {/* Axes */}
            <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH} stroke="#333" strokeWidth="1" />
            <line x1={margin.left} y1={margin.top + plotH} x2={margin.left + plotW} y2={margin.top + plotH} stroke="#333" strokeWidth="1" />

            {/* Labels */}
            <text x={svgW / 2} y={svgH - 18} textAnchor="middle" fontSize="9" fill="#666">Number of Cycles (N)</text>
            <text x={12} y={svgH / 2} textAnchor="middle" fontSize="9" fill="#666" transform={`rotate(-90, 12, ${svgH / 2})`}>Δσ (MPa)</text>

            {/* Reference lines */}
            <line x1={scaleX(Math.log10(2e6))} y1={margin.top} x2={scaleX(Math.log10(2e6))} y2={margin.top + plotH} 
              stroke="#1565C0" strokeWidth="0.5" strokeDasharray="4,2" />
            <text x={scaleX(Math.log10(2e6))} y={margin.top - 4} textAnchor="middle" fontSize="7" fill="#1565C0">NC=2×10⁶</text>

            <line x1={scaleX(Math.log10(5e6))} y1={margin.top} x2={scaleX(Math.log10(5e6))} y2={margin.top + plotH} 
              stroke="#F57F17" strokeWidth="0.5" strokeDasharray="4,2" />
            <text x={scaleX(Math.log10(5e6))} y={margin.top - 4} textAnchor="middle" fontSize="7" fill="#F57F17">ND=5×10⁶</text>

            <line x1={scaleX(8)} y1={margin.top} x2={scaleX(8)} y2={margin.top + plotH} 
              stroke="#C62828" strokeWidth="0.5" strokeDasharray="4,2" />
            <text x={scaleX(8)} y={margin.top - 4} textAnchor="middle" fontSize="7" fill="#C62828">NL=10⁸</text>

            {/* Curves */}
            {chartData.map((cd) => {
              if (!cd) return null;
              const pathData = cd.data
                .filter(p => p.sigma > 0)
                .map((p, i) => {
                  const x = scaleX(Math.log10(p.N));
                  const y = scaleY(Math.log10(p.sigma));
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ');
              return (
                <g key={cd.detail.id}>
                  <path d={pathData} fill="none" stroke={cd.color} strokeWidth="2" />
                  <text 
                    x={scaleX(4.5)} 
                    y={scaleY(Math.log10(cd.detail.deltaσC * Math.pow(2e6 / Math.pow(10, 4.5), 1/3))) - 5}
                    fontSize="8" 
                    fill={cd.color}
                    fontWeight="bold"
                  >
                    Cat {cd.detail.category}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[8px] text-gray-400">m=3 (N≤5×10⁶)</span>
            <span className="text-[8px] text-gray-400">|</span>
            <span className="text-[8px] text-gray-400">m=5 (5×10⁶&lt;N≤10⁸)</span>
            <span className="text-[8px] text-gray-400">|</span>
            <span className="text-[8px] text-gray-400">Cut-off at 10⁸</span>
          </div>
        </div>

        {/* Details */}
        {selectedDetails.map((det, idx) => det && (
          <div key={det.id} className="bg-white rounded-xl p-3 shadow-sm mb-2" style={{ borderLeft: `3px solid ${colors[idx % colors.length]}` }}>
            <h4 className="text-[11px] font-bold text-gray-700">Category {det.category} — {det.group}</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">{det.description}</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center bg-gray-50 rounded p-1">
                <p className="text-[9px] text-gray-500">ΔσC</p>
                <p className="text-xs font-bold text-gray-700">{det.deltaσC} MPa</p>
              </div>
              <div className="text-center bg-gray-50 rounded p-1">
                <p className="text-[9px] text-gray-500">ΔσD</p>
                <p className="text-xs font-bold text-gray-700">{calculateΔσD(det.deltaσC).toFixed(1)} MPa</p>
              </div>
              <div className="text-center bg-gray-50 rounded p-1">
                <p className="text-[9px] text-gray-500">ΔσL</p>
                <p className="text-xs font-bold text-gray-700">{calculateΔσL(det.deltaσC).toFixed(1)} MPa</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
