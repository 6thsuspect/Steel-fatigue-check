import { useState } from 'react';
import { CheckCircle, XCircle, Zap } from 'lucide-react';
import AppBar from '../components/AppBar';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { detailCategories, calculateΔσD, calculateΔσL, calculateNR, calculateSizeEffect, partialSafetyFactors } from '../data/fatigueData';

interface Props {
  onBack: () => void;
}

export default function QuickCheckScreen({ onBack }: Props) {
  const [detailCategoryId, setDetailCategoryId] = useState('');
  const [stressRange, setStressRange] = useState('');
  const [thickness, setThickness] = useState('25');
  const [consequenceLevel, setConsequenceLevel] = useState('safe_life_low_consequence');
  const [result, setResult] = useState<{
    pass: boolean;
    ΔσC: number;
    ΔσD: number;
    ΔσL: number;
    allowable: number;
    NR: number;
    sizeEffect: number;
    region: string;
  } | null>(null);

  const catOptions = detailCategories.map(d => ({
    value: d.id.toString(),
    label: `Cat ${d.category} - ${d.description.substring(0, 45)}...`,
  }));

  const consequenceOptions = [
    { value: 'safe_life_high_consequence', label: 'Safe Life - High (γMf=1.35)' },
    { value: 'safe_life_low_consequence', label: 'Safe Life - Low (γMf=1.15)' },
    { value: 'damage_tolerant_high_consequence', label: 'Damage Tolerant - High (γMf=1.15)' },
    { value: 'damage_tolerant_low_consequence', label: 'Damage Tolerant - Low (γMf=1.00)' },
  ];

  const handleCheck = () => {
    const det = detailCategories.find(d => d.id === Number(detailCategoryId));
    if (!det || !stressRange) return;

    const Δσ = Number(stressRange);
    const t = Number(thickness);
    const sizeEffect = calculateSizeEffect(t);
    const effectiveΔσC = det.deltaσC * sizeEffect;
    const ΔσD = calculateΔσD(effectiveΔσC);
    const ΔσL = calculateΔσL(effectiveΔσC);
    const γMf = partialSafetyFactors.γMf[consequenceLevel as keyof typeof partialSafetyFactors.γMf];
    const allowable = effectiveΔσC / γMf;
    const NR = calculateNR(Δσ, effectiveΔσC);

    let region = '';
    if (Δσ <= ΔσL) region = 'Below cut-off limit (infinite life)';
    else if (Δσ <= ΔσD) region = 'Between CAFL and cut-off (m=5)';
    else region = 'Above CAFL (m=3)';

    setResult({
      pass: Δσ <= allowable,
      ΔσC: effectiveΔσC,
      ΔσD,
      ΔσL,
      allowable,
      NR,
      sizeEffect,
      region,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <AppBar title="Quick Stress Check" subtitle="Verify stress range vs allowable" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Quick check banner */}
        <div className="bg-cyan-50 rounded-xl p-3 mb-3 border border-cyan-100 flex items-center gap-2">
          <Zap size={20} className="text-cyan-600" />
          <div>
            <p className="text-[11px] font-medium text-cyan-700">Quick Verification Tool</p>
            <p className="text-[10px] text-cyan-600">Check if stress range is within allowable limits for a given detail category</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
          <SelectField
            label="Detail Category"
            value={detailCategoryId}
            onChange={(v) => { setDetailCategoryId(v); setResult(null); }}
            options={catOptions}
            required
          />
          <InputField
            label="Applied Stress Range (Δσ)"
            value={stressRange}
            onChange={(v) => { setStressRange(v); setResult(null); }}
            unit="MPa"
            helpText="The actual stress range at the detail"
            required
          />
          <InputField
            label="Plate Thickness"
            value={thickness}
            onChange={(v) => { setThickness(v); setResult(null); }}
            unit="mm"
            helpText="For size effect (applies for t > 25mm)"
          />
          <SelectField
            label="Assessment Method"
            value={consequenceLevel}
            onChange={(v) => { setConsequenceLevel(v); setResult(null); }}
            options={consequenceOptions}
          />
        </div>

        {/* Check Button */}
        <button
          onClick={handleCheck}
          disabled={!detailCategoryId || !stressRange}
          className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg mb-3 transition-all
            ${detailCategoryId && stressRange 
              ? 'bg-[#00838F] text-white active:bg-[#006064]' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          ⚡ QUICK CHECK
        </button>

        {/* Result */}
        {result && (
          <div className="animate-slide-up space-y-3">
            <div className={`rounded-xl p-4 shadow-md ${result.pass ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-3">
                {result.pass ? (
                  <CheckCircle size={36} className="text-green-600" />
                ) : (
                  <XCircle size={36} className="text-red-600" />
                )}
                <div>
                  <h3 className={`text-base font-bold ${result.pass ? 'text-green-700' : 'text-red-700'}`}>
                    {result.pass ? 'WITHIN LIMITS ✓' : 'EXCEEDS LIMITS ✗'}
                  </h3>
                  <p className={`text-[11px] ${result.pass ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(stressRange).toFixed(1)} MPa {result.pass ? '≤' : '>'} {result.allowable.toFixed(1)} MPa
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-600 uppercase mb-2">Details</h4>
              <div className="space-y-1.5">
                <Row label="Effective ΔσC" value={`${result.ΔσC.toFixed(2)} MPa`} />
                <Row label="CAFL (ΔσD)" value={`${result.ΔσD.toFixed(2)} MPa`} />
                <Row label="Cut-off (ΔσL)" value={`${result.ΔσL.toFixed(2)} MPa`} />
                <Row label="Size Effect Factor" value={result.sizeEffect.toFixed(4)} />
                <Row label="Allowable Strength" value={`${result.allowable.toFixed(2)} MPa`} />
                <Row label="Cycles to Failure (NR)" value={result.NR === Infinity ? '∞' : result.NR.toExponential(3)} />
                <Row label="S-N Region" value={result.region} />
              </div>
            </div>

            {/* Gauge */}
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-600 uppercase mb-2">Utilization</h4>
              <div className="relative pt-1">
                <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      Number(stressRange) / result.allowable > 1 
                        ? 'bg-red-500' 
                        : Number(stressRange) / result.allowable > 0.7 
                          ? 'bg-amber-500' 
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((Number(stressRange) / result.allowable) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-gray-400">0%</span>
                  <span className="text-[10px] font-bold text-gray-600">
                    {((Number(stressRange) / result.allowable) * 100).toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-gray-400">100%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 px-2 rounded bg-gray-50">
      <span className="text-[10px] text-gray-600">{label}</span>
      <span className="text-[11px] font-semibold text-gray-800">{value}</span>
    </div>
  );
}
