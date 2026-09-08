import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import AppBar from '../components/AppBar';

interface Props {
  onBack: () => void;
}

interface Section {
  title: string;
  clause: string;
  content: string;
  formula?: string;
}

const sections: Section[] = [
  {
    title: 'Fluctuations of Stress (Fatigue)',
    clause: 'Cl. 3.6.1',
    content: 'Fluctuations of stresses may cause fatigue failure of members or connections at lower stresses than those at which they would fail under static load. Such failures would be primarily due to stress concentrations introduced by the constructional details.',
  },
  {
    title: 'Design Avoidance of Stress Concentrations',
    clause: 'Cl. 3.6.2',
    content: 'All details shall be designed to avoid as far as possible stress concentrations likely to result in excessive reductions of the fatigue strength of members or connections. Care shall be taken to avoid a sudden reduction of the section of a member or a part of a member, especially where bending occurs.',
  },
  {
    title: 'Loads for Fatigue',
    clause: 'Cl. 3.6.3',
    content: 'Stresses due to dead load, live load and impact, stresses resulting from curvature and eccentricity of track and secondary stresses as defined in clause 3.3.2 (a) only shall be considered for effects due to fatigue. All other items mentioned in clause 3.1 and secondary stresses as defined in clause 3.3.2(b) shall be ignored.',
  },
  {
    title: 'Fatigue Design Reference',
    clause: 'Cl. 3.6.4',
    content: 'For any structural member or connection, the fatigue design shall be done as per Appendix G² (Re-revised) for a specified "Design Life" and "Fatigue Load Model". The use of High Strength Steel shall not be made in designs governed by fatigue.',
  },
  {
    title: 'Design Cycles',
    clause: 'Cl. 3.6.5',
    content: 'All members of standard bridge girders should be designed for 10 million cycles of stresses produced under minimum and maximum of the design load. No allowance for fatigue need be made in the design of foot over bridges. Design Life = 100 years (standard).',
  },
  {
    title: 'CDA for Fatigue',
    clause: 'Cl. 6.2.1',
    content: 'For fatigue assessment, 50% of the impact loads (CDA) specified in Bridge Rules shall be considered. Φ = 0.5 × CDA.',
    formula: 'Δσ_fatigue = Δσ × (1 + 0.5 × CDA)',
  },
  {
    title: 'Stress Range Definition',
    clause: 'Cl. 14.2',
    content: 'The stress range Δσp is the algebraic difference between the maximum and minimum stresses at a point under consideration.',
    formula: 'Δσp = |σ_max - σ_min|',
  },
  {
    title: 'Fatigue Verification',
    clause: 'Cl. 8.1.3',
    content: 'The fatigue verification shall satisfy: γFf × ΔσE,2 ≤ ΔσC / (γMf). Where ΔσE,2 = equivalent constant amplitude stress range at 2 million cycles.',
    formula: 'γFf × ΔσE,2 ≤ ΔσC / γMf',
  },
  {
    title: 'Equivalent Stress Range',
    clause: 'Appendix G',
    content: 'The equivalent constant amplitude stress range at 2 million cycles is determined using damage equivalent factors: ΔσE,2 = Δσp × λ₁ × λ₂ × λ₃ × λ₄',
    formula: 'ΔσE,2 = Δσp × λ₁ × λ₂ × λ₃ × λ₄',
  },
  {
    title: 'Traffic Volume Factor λ₂',
    clause: 'Cl. 14.6.4',
    content: 'The traffic volume factor λ₂ accounts for the annual volume of traffic. Ta = Annual volume of traffic in GMT.',
    formula: 'λ₂ = 0.5193 × Ta^0.2036',
  },
  {
    title: 'Design Life Factor λ₃',
    clause: 'Cl. 14.6.5',
    content: 'The design life factor λ₃ adjusts for the specified design life of the bridge. LD = Design life in years.',
    formula: 'λ₃ = (LD / 100)^(1/3)',
  },
  {
    title: 'Multi-Lane Factor λ₄',
    clause: 'Cl. 14.6.6',
    content: 'For multi-lane bridges, the factor λ₄ accounts for the effect of traffic on adjacent lanes. a = σ₁/(σ₁ + σ₂).',
    formula: 'λ₄ = 0.7926×a² - 0.728×a + 0.9371',
  },
  {
    title: 'S-N Curve Parameters',
    clause: 'Appendix G',
    content: 'The S-N curve is defined by the detail category ΔσC at 2×10⁶ cycles. Slope m=3 for N ≤ 5×10⁶, slope m=5 for 5×10⁶ < N ≤ 10⁸. Cut-off limit at 10⁸ cycles.',
    formula: 'N_R = (ΔσC^m × 2×10⁶) / Δσ^m  [for m=3]\nΔσD = (2/5)^(1/3) × ΔσC\nΔσL = (5/100)^(1/5) × ΔσD',
  },
  {
    title: 'Size Effect Factor',
    clause: 'IRS SBC',
    content: 'For plate thicknesses exceeding 25mm, a size effect factor shall be applied to reduce the fatigue strength.',
    formula: 'Size Effect = (25/t)^0.2  [for t > 25mm]',
  },
  {
    title: 'Palmgren-Miner Rule',
    clause: 'Annex A',
    content: 'For variable amplitude loading, cumulative damage is assessed using the Palmgren-Miner linear damage rule. The total damage D shall not exceed 1.0.',
    formula: 'D = Σ(nᵢ/Nᵢ) ≤ 1.0',
  },
  {
    title: 'Stress Limitation',
    clause: 'Cl. 8.1',
    content: 'The maximum stress range shall not exceed 1.5 times the yield stress of the material. For shear, the limit is 1.5×fy/√3.',
    formula: 'Δσ ≤ 1.5 × fy\nΔτ ≤ 1.5 × fy / √3',
  },
  {
    title: 'Partial Safety Factor γMf',
    clause: 'Table G',
    content: 'γMf depends on consequence level and assessment method:\n• Safe Life, High Consequence: γMf = 1.35\n• Safe Life, Low Consequence: γMf = 1.15\n• Damage Tolerant, High Consequence: γMf = 1.15\n• Damage Tolerant, Low Consequence: γMf = 1.00',
  },
  {
    title: 'Riveted/Bolted Connections',
    clause: 'Cl. 3.6.6',
    content: 'The number of rivets and bolts shall be calculated without any allowance for fatigue but rivets or bolts subjected to reversal of stress during passage of live load shall be designed for the arithmetical sum of the maximum load plus 50% of the reversed load.',
  },
];

export default function ReferenceScreen({ onBack }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full">
      <AppBar title="Reference & Clauses" subtitle="IRS Steel Bridge Code Key Provisions" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Header */}
        <div className="bg-gray-700 rounded-xl p-3 mb-3 flex items-center gap-3">
          <BookOpen size={24} className="text-gray-300" />
          <div>
            <h3 className="text-sm font-bold text-white">IRS Steel Bridge Code</h3>
            <p className="text-[10px] text-gray-300">
              Appendix G (Re-revised) 2017 • ACS 22/24<br/>
              RDSO, Lucknow – 226011
            </p>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm mb-2 overflow-hidden">
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left active:bg-gray-50"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-gray-500">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-medium text-gray-800 truncate">{section.title}</h4>
                <p className="text-[9px] text-blue-600 font-medium">{section.clause}</p>
              </div>
              {expandedIdx === idx ? (
                <ChevronUp size={14} className="text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              )}
            </button>
            {expandedIdx === idx && (
              <div className="px-3 pb-3 animate-slide-up">
                <div className="border-t border-gray-100 pt-2">
                  <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                  {section.formula && (
                    <div className="mt-2 bg-blue-50 rounded-lg p-2 border border-blue-100">
                      <p className="text-[10px] font-medium text-blue-700 mb-0.5">Formula:</p>
                      <pre className="text-[11px] text-blue-800 font-mono whitespace-pre-wrap">
                        {section.formula}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="mt-3 mb-4 text-center">
          <p className="text-[9px] text-gray-400">
            Reference material compiled from IRS Steel Bridge Code<br/>
            For official design, always refer to the latest published code
          </p>
        </div>
      </div>
    </div>
  );
}
