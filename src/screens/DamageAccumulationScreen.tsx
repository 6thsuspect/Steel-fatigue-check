import { useState } from 'react';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import AppBar from '../components/AppBar';
import SelectField from '../components/SelectField';
import InputField from '../components/InputField';
import { detailCategories, calculateNR, calculateSizeEffect } from '../data/fatigueData';

interface Props {
  onBack: () => void;
}

interface StressBlock {
  id: number;
  stressRange: string;
  cycles: string;
}

export default function DamageAccumulationScreen({ onBack }: Props) {
  const [detailCategoryId, setDetailCategoryId] = useState('');
  const [thickness, setThickness] = useState('25');
  const [blocks, setBlocks] = useState<StressBlock[]>([
    { id: 1, stressRange: '', cycles: '' },
    { id: 2, stressRange: '', cycles: '' },
  ]);
  const [showResults, setShowResults] = useState(false);

  let nextId = blocks.length > 0 ? Math.max(...blocks.map(b => b.id)) + 1 : 1;

  const addBlock = () => {
    setBlocks([...blocks, { id: nextId++, stressRange: '', cycles: '' }]);
  };

  const removeBlock = (id: number) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id));
    }
  };

  const updateBlock = (id: number, field: 'stressRange' | 'cycles', value: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const detCat = detailCategories.find(d => d.id === Number(detailCategoryId));
  const sizeEffect = calculateSizeEffect(Number(thickness));
  const effectiveΔσC = detCat ? detCat.deltaσC * sizeEffect : 0;

  const catOptions = detailCategories.map(d => ({
    value: d.id.toString(),
    label: `Cat ${d.category} - ${d.description.substring(0, 45)}...`,
  }));

  const calculate = () => {
    setShowResults(true);
  };

  // Calculate damage for each block
  const blockResults = blocks.map(block => {
    const Δσ = Number(block.stressRange);
    const nE = Number(block.cycles);
    const NR = effectiveΔσC > 0 && Δσ > 0 ? calculateNR(Δσ, effectiveΔσC) : Infinity;
    const damage = NR === Infinity ? 0 : nE / NR;
    return { ...block, NR, damage };
  });

  const totalDamage = blockResults.reduce((sum, b) => sum + b.damage, 0);
  const isPassing = totalDamage <= 1.0;

  const validBlocks = blocks.every(b => b.stressRange !== '' && b.cycles !== '');
  const canCalculate = detailCategoryId !== '' && validBlocks;

  return (
    <div className="flex flex-col h-full">
      <AppBar 
        title="Damage Accumulation" 
        subtitle="Palmgren-Miner Rule (Annex A)" 
        onBack={onBack} 
      />

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Info Banner */}
        <div className="bg-purple-50 rounded-xl p-3 mb-3 border border-purple-100">
          <p className="text-[10px] text-purple-700 font-medium">📐 Palmgren-Miner Rule</p>
          <p className="text-[10px] text-purple-600 mt-0.5">
            D = Σ (nᵢ / Nᵢ) ≤ 1.0 — where nᵢ = applied cycles, Nᵢ = cycles to failure at stress range Δσᵢ
          </p>
        </div>

        {/* Detail Category Selection */}
        <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
          <SelectField
            label="Detail Category"
            value={detailCategoryId}
            onChange={(v) => { setDetailCategoryId(v); setShowResults(false); }}
            options={catOptions}
            helpText="As per Table G-II of IRS SBC"
            required
          />
          <InputField
            label="Plate Thickness"
            value={thickness}
            onChange={(v) => { setThickness(v); setShowResults(false); }}
            unit="mm"
            helpText="For size effect calculation"
          />
          {detCat && (
            <div className="bg-gray-50 rounded-lg p-2 mt-1">
              <p className="text-[10px] text-gray-600">
                ΔσC = {detCat.deltaσC} MPa | Size Effect = {sizeEffect.toFixed(4)} | Effective ΔσC = {effectiveΔσC.toFixed(2)} MPa
              </p>
            </div>
          )}
        </div>

        {/* Stress Range Blocks */}
        <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-bold text-gray-600 uppercase">Stress Range Blocks</h4>
            <button 
              onClick={addBlock}
              className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-medium active:bg-blue-100"
            >
              <Plus size={12} /> Add Block
            </button>
          </div>
          
          {blocks.map((block, idx) => (
            <div key={block.id} className="flex gap-2 items-start mb-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-[10px] text-gray-500 font-bold mt-2 w-4">#{idx + 1}</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={block.stressRange}
                  onChange={(e) => { updateBlock(block.id, 'stressRange', e.target.value); setShowResults(false); }}
                  placeholder="Δσ (MPa)"
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] mb-1 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  value={block.cycles}
                  onChange={(e) => { updateBlock(block.id, 'cycles', e.target.value); setShowResults(false); }}
                  placeholder="No. of cycles (nᵢ)"
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>
              <button 
                onClick={() => removeBlock(block.id)}
                className="p-1 text-red-400 hover:text-red-600 mt-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculate}
          disabled={!canCalculate}
          className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg mb-3 transition-all
            ${canCalculate 
              ? 'bg-[#7B1FA2] text-white active:bg-[#6A1B9A]' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          🔍 CALCULATE DAMAGE
        </button>

        {/* Results */}
        {showResults && (
          <div className="animate-slide-up">
            {/* Status */}
            <div className={`rounded-xl p-4 mb-3 shadow-md ${isPassing ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-3">
                {isPassing ? (
                  <CheckCircle size={32} className="text-green-600" />
                ) : (
                  <XCircle size={32} className="text-red-600" />
                )}
                <div>
                  <h3 className={`text-sm font-bold ${isPassing ? 'text-green-700' : 'text-red-700'}`}>
                    {isPassing ? 'DAMAGE CHECK PASSED ✓' : 'DAMAGE CHECK FAILED ✗'}
                  </h3>
                  <p className={`text-xl font-bold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                    D = {totalDamage.toFixed(6)}
                  </p>
                  <p className={`text-[10px] ${isPassing ? 'text-green-500' : 'text-red-500'}`}>
                    {isPassing ? `D ≤ 1.0 — ${((1 - totalDamage) * 100).toFixed(1)}% remaining life` : `D > 1.0 — Exceeded by ${((totalDamage - 1) * 100).toFixed(1)}%`}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Results Table */}
            <div className="bg-white rounded-xl p-3 shadow-sm mb-3 overflow-x-auto">
              <h4 className="text-[11px] font-bold text-gray-600 uppercase mb-2">Detailed Breakdown</h4>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-1 px-1 text-left text-gray-500">#</th>
                    <th className="py-1 px-1 text-right text-gray-500">Δσᵢ (MPa)</th>
                    <th className="py-1 px-1 text-right text-gray-500">nᵢ</th>
                    <th className="py-1 px-1 text-right text-gray-500">Nᵢ</th>
                    <th className="py-1 px-1 text-right text-gray-500">Dᵢ</th>
                  </tr>
                </thead>
                <tbody>
                  {blockResults.map((br, idx) => (
                    <tr key={br.id} className="border-t border-gray-100">
                      <td className="py-1.5 px-1 font-medium text-gray-600">{idx + 1}</td>
                      <td className="py-1.5 px-1 text-right font-mono">{Number(br.stressRange).toFixed(1)}</td>
                      <td className="py-1.5 px-1 text-right font-mono">{Number(br.cycles).toExponential(2)}</td>
                      <td className="py-1.5 px-1 text-right font-mono">
                        {br.NR === Infinity ? '∞' : br.NR.toExponential(2)}
                      </td>
                      <td className={`py-1.5 px-1 text-right font-mono font-bold ${br.damage > 0.5 ? 'text-red-600' : 'text-gray-700'}`}>
                        {br.damage.toExponential(3)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td colSpan={4} className="py-1.5 px-1 font-bold text-gray-700 text-right">Total D =</td>
                    <td className={`py-1.5 px-1 text-right font-mono font-bold text-xs ${isPassing ? 'text-green-700' : 'text-red-700'}`}>
                      {totalDamage.toFixed(6)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Damage Bar */}
            <div className="bg-white rounded-xl p-3 shadow-sm mb-4">
              <h4 className="text-[11px] font-bold text-gray-600 uppercase mb-2">Damage Visualization</h4>
              <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${totalDamage > 1 ? 'bg-red-500' : totalDamage > 0.7 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(totalDamage * 100, 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                  {(totalDamage * 100).toFixed(1)}%
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-gray-400">0%</span>
                <span className="text-[9px] text-gray-400">D = 1.0 (100%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
