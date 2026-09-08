import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import AppBar from '../components/AppBar';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import {
  detailCategories,
  steelGrades,
  calculateΔσD,
  calculateΔσL,
  calculateNR,
  calculateλ2,
  calculateλ3,
  calculateλ4,
  calculateSizeEffect,
  partialSafetyFactors,
} from '../data/fatigueData';

interface Props {
  onBack: () => void;
}

interface AnalysisResult {
  ΔσE2: number;
  ΔσC: number;
  ΔσD: number;
  ΔσL: number;
  γFf_ΔσE2: number;
  allowableFatigueStrength: number;
  NR: number;
  λ1: number;
  λ2: number;
  λ3: number;
  λ4: number;
  sizeEffect: number;
  utilizationRatio: number;
  isPassing: boolean;
  designStressRange: number;
  maxStressRange: number;
  stressLimitCheck: boolean;
}

export default function FatigueAnalysisScreen({ onBack }: Props) {
  // Step tracking
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  
  // Input states
  const [steelGradeIdx, setSteelGradeIdx] = useState('');
  const [detailCategoryId, setDetailCategoryId] = useState('');
  const [designLife, setDesignLife] = useState('100');
  const [thickness, setThickness] = useState('25');
  const [consequenceLevel, setConsequenceLevel] = useState('safe_life_low_consequence');
  
  // Loading inputs
  const [σMax, setσMax] = useState('');
  const [σMin, setσMin] = useState('');
  const [cdaFactor, setCdaFactor] = useState('50');
  const [spanLength, setSpanLength] = useState('');
  
  // Traffic inputs
  const [annualTraffic, setAnnualTraffic] = useState('60');
  const [numberOfLanes, setNumberOfLanes] = useState('1');
  const [stressRatioLane, setStressRatioLane] = useState('1.0');
  
  // Lambda1 input  
  const [lambda1, setLambda1] = useState('');
  
  // Result
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const steps = [
    'Material & Detail',
    'Loading Parameters',
    'Traffic & Life',
    'Damage Factors',
  ];

  const toggleStep = (idx: number) => {
    const newSet = new Set(expandedSteps);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setExpandedSteps(newSet);
  };

  const calculateResults = () => {
    const detCat = detailCategories.find(d => d.id === Number(detailCategoryId));
    if (!detCat) return;
    
    const selectedGrade = steelGrades[Number(steelGradeIdx)];
    if (!selectedGrade) return;

    const ΔσC = detCat.deltaσC;
    const ΔσD = calculateΔσD(ΔσC);
    const ΔσL = calculateΔσL(ΔσC);

    // Calculate stress range with CDA
    const cdaMultiplier = Number(cdaFactor) / 100;
    const maxStress = Number(σMax);
    const minStress = Number(σMin);
    const Δσp = Math.abs(maxStress - minStress);
    
    // Design stress range with 50% CDA as per Cl 6.2.1
    const designStressRange = Δσp * (1 + cdaMultiplier * 0.5);

    // Lambda factors
    const λ1Val = Number(lambda1) || 1.0;
    const Ta = Number(annualTraffic);
    const λ2Val = calculateλ2(Ta);
    const ld = Number(designLife);
    const λ3Val = calculateλ3(ld);
    const a = Number(stressRatioLane);
    const λ4Val = Number(numberOfLanes) === 1 ? 1.0 : calculateλ4(a);

    // Size effect
    const t = Number(thickness);
    const sizeEffect = calculateSizeEffect(t);

    // Equivalent constant amplitude stress range at 2 million cycles
    const ΔσE2 = designStressRange * λ1Val * λ2Val * λ3Val * λ4Val;

    // Partial safety factors
    const γFf = partialSafetyFactors.γFf;
    const γMf = partialSafetyFactors.γMf[consequenceLevel as keyof typeof partialSafetyFactors.γMf];

    const γFf_ΔσE2 = γFf * ΔσE2;

    // Allowable fatigue strength
    const allowableFatigueStrength = (ΔσC * sizeEffect) / γMf;

    // Number of cycles to failure
    const NR = calculateNR(γFf_ΔσE2, ΔσC * sizeEffect);

    // Utilization ratio
    const utilizationRatio = γFf_ΔσE2 / allowableFatigueStrength;

    // Stress limit check: Δσ ≤ 1.5 fy
    const stressLimitCheck = Δσp <= 1.5 * selectedGrade.fy;

    const isPassing = utilizationRatio <= 1.0 && stressLimitCheck;

    setResult({
      ΔσE2,
      ΔσC,
      ΔσD,
      ΔσL,
      γFf_ΔσE2,
      allowableFatigueStrength,
      NR,
      λ1: λ1Val,
      λ2: λ2Val,
      λ3: λ3Val,
      λ4: λ4Val,
      sizeEffect,
      utilizationRatio,
      isPassing,
      designStressRange,
      maxStressRange: Δσp,
      stressLimitCheck,
    });
    setShowResult(true);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: return steelGradeIdx !== '' && detailCategoryId !== '' && Number(thickness) > 0;
      case 1: return σMax !== '' && σMin !== '' && spanLength !== '';
      case 2: return annualTraffic !== '' && designLife !== '';
      case 3: return lambda1 !== '';
      default: return true;
    }
  };

  const allValid = steps.every((_, i) => isStepValid(i));

  const detailCatOptions = detailCategories.map(d => ({
    value: d.id.toString(),
    label: `Cat ${d.category} - ${d.description.substring(0, 50)}...`,
  }));

  const steelGradeOptions = steelGrades.map((g, i) => ({
    value: i.toString(),
    label: `${g.name} (fy=${g.fy} MPa)`,
  }));

  const consequenceOptions = [
    { value: 'safe_life_high_consequence', label: 'Safe Life - High Consequence (γMf=1.35)' },
    { value: 'safe_life_low_consequence', label: 'Safe Life - Low Consequence (γMf=1.15)' },
    { value: 'damage_tolerant_high_consequence', label: 'Damage Tolerant - High (γMf=1.15)' },
    { value: 'damage_tolerant_low_consequence', label: 'Damage Tolerant - Low (γMf=1.00)' },
  ];

  if (showResult && result) {
    return (
      <div className="flex flex-col h-full">
        <AppBar 
          title="Fatigue Analysis Results" 
          subtitle="As per IRS SBC Appendix G" 
          onBack={() => setShowResult(false)} 
        />
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* Status Card */}
          <div className={`rounded-xl p-4 mb-3 shadow-md ${result.isPassing ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-3">
              {result.isPassing ? (
                <CheckCircle size={36} className="text-green-600" />
              ) : (
                <XCircle size={36} className="text-red-600" />
              )}
              <div>
                <h3 className={`text-base font-bold ${result.isPassing ? 'text-green-700' : 'text-red-700'}`}>
                  {result.isPassing ? 'FATIGUE CHECK PASSED ✓' : 'FATIGUE CHECK FAILED ✗'}
                </h3>
                <p className={`text-[11px] ${result.isPassing ? 'text-green-600' : 'text-red-600'}`}>
                  Utilization Ratio: {(result.utilizationRatio * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Key Results */}
          <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
            <h4 className="text-[11px] font-bold text-gray-600 uppercase mb-2">Key Results</h4>
            <div className="space-y-1.5">
              <ResultRow label="Design Stress Range (Δσp)" value={`${result.designStressRange.toFixed(2)} MPa`} />
              <ResultRow label="Equiv. Stress Range (ΔσE,2)" value={`${result.ΔσE2.toFixed(2)} MPa`} />
              <ResultRow label="γFf × ΔσE,2" value={`${result.γFf_ΔσE2.toFixed(2)} MPa`} highlight />
              <ResultRow label="Allowable Fatigue Strength" value={`${result.allowableFatigueStrength.toFixed(2)} MPa`} highlight />
              <ResultRow label="Cycles to Failure (NR)" value={result.NR === Infinity ? '∞ (Infinite Life)' : formatNumber(result.NR)} />
            </div>
          </div>

          {/* S-N Curve Limits */}
          <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
            <h4 className="text-[11px] font-bold text-gray-600 uppercase mb-2">S-N Curve Parameters</h4>
            <div className="space-y-1.5">
              <ResultRow label="Detail Category (ΔσC)" value={`${result.ΔσC.toFixed(1)} MPa at 2×10⁶ cycles`} />
              <ResultRow label="CAFL (ΔσD)" value={`${result.ΔσD.toFixed(2)} MPa at 5×10⁶ cycles`} />
              <ResultRow label="Cut-off Limit (ΔσL)" value={`${result.ΔσL.toFixed(2)} MPa at 10⁸ cycles`} />
            </div>
          </div>

          {/* Lambda Factors */}
          <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
            <h4 className="text-[11px] font-bold text-gray-600 uppercase mb-2">Modification Factors</h4>
            <div className="space-y-1.5">
              <ResultRow label="λ₁ (Damage equiv. factor)" value={result.λ1.toFixed(4)} />
              <ResultRow label="λ₂ (Traffic volume factor)" value={result.λ2.toFixed(4)} />
              <ResultRow label="λ₃ (Design life factor)" value={result.λ3.toFixed(4)} />
              <ResultRow label="λ₄ (Multi-lane factor)" value={result.λ4.toFixed(4)} />
              <ResultRow label="Size effect factor" value={result.sizeEffect.toFixed(4)} />
            </div>
          </div>

          {/* Verification */}
          <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
            <h4 className="text-[11px] font-bold text-gray-600 uppercase mb-2">Verification Checks</h4>
            <div className="space-y-2">
              <CheckRow 
                label="γFf × ΔσE,2 ≤ ΔσC / (γMf × size effect)" 
                detail={`${result.γFf_ΔσE2.toFixed(2)} ≤ ${result.allowableFatigueStrength.toFixed(2)}`}
                pass={result.utilizationRatio <= 1.0} 
              />
              <CheckRow 
                label="Δσ ≤ 1.5 × fy (Stress Limit)" 
                detail={`${result.maxStressRange.toFixed(2)} MPa`}
                pass={result.stressLimitCheck} 
              />
            </div>
          </div>

          {/* Reference */}
          <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-100">
            <h4 className="text-[11px] font-bold text-blue-700 mb-1">📋 Reference Clauses</h4>
            <p className="text-[10px] text-blue-600 leading-relaxed">
              • Cl. 3.6.4 - Fatigue design as per Appendix G<br/>
              • Cl. 3.6.5 - Design for 10 million cycles<br/>
              • Cl. 8.1.3 - γFf × ΔσE,2 &lt; ΔσC / γMf<br/>
              • Cl. 14.2 - Stress Range = |σmax - σmin|<br/>
              • Cl. 6.2.1 - 50% CDA for fatigue assessment<br/>
              • Cl. 14.6.4 - λ₂ = 0.5193 × Ta^0.2036<br/>
              • Table G-II - Detail category classification
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppBar 
        title="Fatigue Analysis" 
        subtitle="Complete fatigue check as per IRS SBC" 
        onBack={onBack} 
      />
      
      {/* Progress */}
      <div className="bg-white px-3 py-2 border-b border-gray-200">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: isStepValid(i) ? '100%' : '0%',
                  backgroundColor: isStepValid(i) ? '#1565C0' : '#ccc',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* Step 1: Material & Detail */}
        <StepCard 
          step={0} 
          title="Material & Detail Category" 
          expanded={expandedSteps.has(0)}
          valid={isStepValid(0)}
          onToggle={() => toggleStep(0)}
        >
          <SelectField
            label="Steel Grade"
            value={steelGradeIdx}
            onChange={setSteelGradeIdx}
            options={steelGradeOptions}
            helpText="As per IS 2062 / IS 226 / IS 961"
            required
          />
          <SelectField
            label="Detail Category (Table G-II)"
            value={detailCategoryId}
            onChange={setDetailCategoryId}
            options={detailCatOptions}
            helpText="As per Appendix G-II of IRS SBC"
            required
          />
          {detailCategoryId && (
            <div className="bg-blue-50 rounded-lg p-2 mb-3 border border-blue-100">
              <p className="text-[10px] text-blue-700 font-medium">
                Selected: Category {detailCategories.find(d => d.id === Number(detailCategoryId))?.category} — 
                ΔσC = {detailCategories.find(d => d.id === Number(detailCategoryId))?.deltaσC} MPa
              </p>
              <p className="text-[10px] text-blue-600">
                {detailCategories.find(d => d.id === Number(detailCategoryId))?.description}
              </p>
            </div>
          )}
          <InputField
            label="Plate / Element Thickness"
            value={thickness}
            onChange={setThickness}
            unit="mm"
            min={1}
            helpText="Size effect applies for thickness > 25mm (Cl. IRS SBC)"
            required
          />
          <SelectField
            label="Consequence & Assessment Method"
            value={consequenceLevel}
            onChange={setConsequenceLevel}
            options={consequenceOptions}
            helpText="Determines partial safety factor γMf"
          />
        </StepCard>

        {/* Step 2: Loading Parameters */}
        <StepCard 
          step={1} 
          title="Loading Parameters" 
          expanded={expandedSteps.has(1)}
          valid={isStepValid(1)}
          onToggle={() => toggleStep(1)}
        >
          <InputField
            label="Maximum Stress (σmax)"
            value={σMax}
            onChange={setσMax}
            unit="MPa"
            helpText="Max stress due to DL + LL + Impact at the detail"
            required
          />
          <InputField
            label="Minimum Stress (σmin)"
            value={σMin}
            onChange={setσMin}
            unit="MPa"
            helpText="Min stress at the detail (tensile +ve, compressive -ve)"
            required
          />
          {σMax && σMin && (
            <div className="bg-amber-50 rounded-lg p-2 mb-3 border border-amber-100">
              <p className="text-[10px] text-amber-700 font-medium">
                Stress Range Δσp = |σmax - σmin| = {Math.abs(Number(σMax) - Number(σMin)).toFixed(2)} MPa
              </p>
              <p className="text-[10px] text-amber-600">
                fmin/fmax = {(Number(σMin) / Number(σMax)).toFixed(4)}
              </p>
            </div>
          )}
          <InputField
            label="CDA Factor (%)"
            value={cdaFactor}
            onChange={setCdaFactor}
            unit="%"
            helpText="50% of CDA for fatigue as per Cl. 6.2.1 of IRS SBC"
          />
          <InputField
            label="Span Length"
            value={spanLength}
            onChange={setSpanLength}
            unit="m"
            helpText="Effective span of the bridge"
            required
          />
        </StepCard>

        {/* Step 3: Traffic & Design Life */}
        <StepCard 
          step={2} 
          title="Traffic Volume & Design Life" 
          expanded={expandedSteps.has(2)}
          valid={isStepValid(2)}
          onToggle={() => toggleStep(2)}
        >
          <InputField
            label="Annual Traffic Volume (Ta)"
            value={annualTraffic}
            onChange={setAnnualTraffic}
            unit="GMT"
            helpText="Appendix G-I Table 1(a): Suburban=30, Sub-Urban=60, Main Line=90, Heavy=120 GMT"
            required
          />
          <InputField
            label="Design Life (LD)"
            value={designLife}
            onChange={setDesignLife}
            unit="years"
            helpText="As per Cl. 3.6.5: Standard = 100 years"
            required
          />
          <SelectField
            label="Number of Lanes"
            value={numberOfLanes}
            onChange={setNumberOfLanes}
            options={[
              { value: '1', label: 'Single Lane' },
              { value: '2', label: 'Double Lane' },
              { value: '3', label: 'Multi Lane (3+)' },
            ]}
            helpText="For λ₄ calculation (Cl. 14.6.6)"
          />
          {Number(numberOfLanes) > 1 && (
            <InputField
              label="Stress Ratio (σ₁ / σ₁₊₂)"
              value={stressRatioLane}
              onChange={setStressRatioLane}
              helpText="Ratio of stress from 1 lane to all lanes loading. Use 1.0 for single lane."
              step={0.01}
              min={0}
              max={1}
            />
          )}
        </StepCard>

        {/* Step 4: Damage Equivalent Factors */}
        <StepCard 
          step={3} 
          title="Damage Equivalent Factors" 
          expanded={expandedSteps.has(3)}
          valid={isStepValid(3)}
          onToggle={() => toggleStep(3)}
        >
          <InputField
            label="λ₁ (Damage Equivalent Factor)"
            value={lambda1}
            onChange={setLambda1}
            helpText="From Table G-III based on span & influence line. Typical: 0.6 to 2.0"
            step={0.01}
            required
          />
          <div className="bg-gray-50 rounded-lg p-2 mb-3 border border-gray-200">
            <p className="text-[10px] text-gray-600 font-medium mb-1">Auto-calculated factors:</p>
            <p className="text-[10px] text-gray-500">
              λ₂ = 0.5193 × Ta^0.2036 = {annualTraffic ? calculateλ2(Number(annualTraffic)).toFixed(4) : '—'}<br/>
              λ₃ = (LD/100)^(1/3) = {designLife ? calculateλ3(Number(designLife)).toFixed(4) : '—'}<br/>
              λ₄ = {Number(numberOfLanes) === 1 ? '1.0 (single lane)' : calculateλ4(Number(stressRatioLane)).toFixed(4)}
            </p>
          </div>
        </StepCard>

        {/* Calculate Button */}
        <button
          onClick={calculateResults}
          disabled={!allValid}
          className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg mb-4 transition-all duration-200
            ${allValid 
              ? 'bg-[#1565C0] text-white active:bg-[#0D47A1] hover:shadow-xl pulse-glow' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {allValid ? '🔍 CALCULATE FATIGUE CHECK' : 'Complete all fields to calculate'}
        </button>
      </div>
    </div>
  );
}

// Sub-components
function StepCard({ 
  step, title, expanded, valid, onToggle, children 
}: { 
  step: number; title: string; expanded: boolean; valid: boolean; 
  onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm mb-2 overflow-hidden border border-gray-100">
      <button 
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left active:bg-gray-50"
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
          ${valid ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {valid ? '✓' : step + 1}
        </div>
        <span className="text-xs font-medium text-gray-700 flex-1">{title}</span>
        {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 animate-slide-up">
          <div className="border-t border-gray-100 pt-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1 px-2 rounded ${highlight ? 'bg-blue-50' : ''}`}>
      <span className="text-[10px] text-gray-600">{label}</span>
      <span className={`text-[11px] font-semibold ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}

function CheckRow({ label, detail, pass }: { label: string; detail: string; pass: boolean }) {
  return (
    <div className={`flex items-start gap-2 p-2 rounded-lg ${pass ? 'bg-green-50' : 'bg-red-50'}`}>
      {pass ? (
        <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertTriangle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
      )}
      <div>
        <p className={`text-[10px] font-medium ${pass ? 'text-green-700' : 'text-red-700'}`}>{label}</p>
        <p className={`text-[10px] ${pass ? 'text-green-600' : 'text-red-600'}`}>{detail}</p>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' × 10⁹';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + ' × 10⁶';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' × 10³';
  return n.toFixed(0);
}
