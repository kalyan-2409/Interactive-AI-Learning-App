import React, { useState, useEffect } from 'react';
import { Sparkles, Atom, Shield, Info, Sliders, Zap, Check, FlaskConical } from 'lucide-react';
import { PERIODIC_ELEMENTS, ChemicalElement, BOND_PRESETS, AtomicBondPreset } from '../types';

interface AtomBuilderProps {
  onSelectContext: (context: any) => void;
  onTrackBadge: (badge: string) => void;
  simplicityLevel?: string;
}

export default function AtomBuilder({ onSelectContext, onTrackBadge, simplicityLevel }: AtomBuilderProps) {
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(PERIODIC_ELEMENTS[0]);
  
  // Bonding Simulator state
  const [selectedBond, setSelectedBond] = useState<AtomicBondPreset>(BOND_PRESETS[0]);
  const [isBonded, setIsBonded] = useState(false);
  const [playingReaction, setPlayingReaction] = useState(false);

  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState<any | null>(null);

  // Reload explanation on simplicity level toggle
  useEffect(() => {
    if (isBonded) {
      // Re-trigger synthesis explanation
      triggerSynthesisExplanation();
    } else {
      triggerSubatomicExplanation(selectedElement);
    }
  }, [simplicityLevel]);

  // Trigger content update
  const handleSelectElement = (el: ChemicalElement) => {
    setSelectedElement(el);
    setIsBonded(false); // break chemical bonds

    // Notify state context for AI Chat tutor
    onSelectContext({
      activeElement: el.name,
      symbol: el.symbol,
      atomicConfig: { protons: el.protons, neutrons: el.neutrons, electrons: el.electrons, shells: el.shells },
      chemistryLabState: { mode: 'atomic_inspection', currentElement: el.symbol }
    });
    
    // Fetch AI report for the atom structure
    triggerSubatomicExplanation(el);
  };

  const triggerSubatomicExplanation = async (el: ChemicalElement) => {
    setLoadingExplanation(true);
    setExplanationData(null);

    try {
      const response = await fetch('/api/explain-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Chemistry',
          topic: `Subatomic Structure of ${el.name} Atom`,
          parameters: {
            atomicNumber: el.number,
            protons: el.protons,
            electrons: el.electrons,
            shells: el.shells,
            valency: el.valency
          },
          simplicityLevel
        })
      });

      if (!response.ok) throw new Error('AI analysis error');
      const data = await response.json();
      setExplanationData(data);
    } catch (err) {
      console.error(err);
      setExplanationData({
        coreExplanation: el.fact,
        mechanics: [
          `Contains exactly ${el.protons} protons and ${el.neutrons} neutrons inside the nuclear core.`,
          `Configures its ${el.electrons} electrons across orbital energy levels: ${el.shells.join(', ')}.`,
          `Maintains a chemical valency configuration of ${el.valency} outer valence electron shell slots.`
        ],
        analogy: `Think of it like a micro planet star with ${el.protons} dense suns in the center and ${el.electrons} high-speed satellites circularizing in strict speed zones.`,
        experimentTip: 'Synthesize table salt (NaCl) or water under the Molecular Bond terminal above to witness quantum reactions!'
      });
    } finally {
      setLoadingExplanation(false);
    }
  };

  const triggerSynthesisExplanation = async () => {
    setLoadingExplanation(true);
    setExplanationData(null);

    try {
      const response = await fetch('/api/explain-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Chemistry',
          topic: `Chemical synthesis of ${selectedBond.name} (${selectedBond.formula})`,
          parameters: {
            reactants: selectedBond.reactants,
            bondType: selectedBond.productType,
            chemicalFormula: selectedBond.formula
          },
          simplicityLevel
        })
      });

      if (!response.ok) throw new Error('Bond explanations failed');
      const data = await response.json();
      setExplanationData(data);
    } catch (err) {
      console.error(err);
      setExplanationData({
        coreExplanation: selectedBond.description,
        mechanics: [
          'Sharing or transfer of outer valence shells establishes complete electronic octets.',
          'Covalent bonds lock shared electrons in localized molecular orbitals.',
          'Ionic transfer yields electrostatic attraction salts.'
        ],
        analogy: selectedBond.productType === 'Ionic' 
          ? 'It operates like a strict monetary transaction—one atom donates a coin (electron) completely, creating stable magnets.'
          : 'It operates like roommates co-parenting a puppy; both families share ownership of the electron, pulling them tight!',
        experimentTip: 'Feel free to inspect single Alkali metals (like Sodium) and Halogens (like Chlorine) below to analyze their reactivity.'
      });
    } finally {
      setLoadingExplanation(false);
    }
  };

  // Run bonding synthesis reaction
  const handleTriggerBond = async () => {
    setPlayingReaction(true);
    setIsBonded(false);

    // Notify badge
    onTrackBadge('Molecular Wizard');

    // Simulate 1.5s electron configuration sharing delay
    setTimeout(async () => {
      setPlayingReaction(false);
      setIsBonded(true);

      onSelectContext({
        activeBond: selectedBond.name,
        formula: selectedBond.formula,
        chemistryLabState: { mode: 'molecular_bonding', compound: selectedBond.formula }
      });

      triggerSynthesisExplanation();
    }, 1800);
  };

  // Load first explanation on mount
  useEffect(() => {
    triggerSubatomicExplanation(selectedElement);
  }, []);

  return (
    <div id="chemistry-constructor-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT: Subatomic Constructor and Bond reaction */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        
        {/* Atomic constructor shell visual */}
        <div className="glass-panel p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Atom className="w-5 h-5 text-emerald-400" />
              <h2 className="font-display font-bold text-lg text-white">Quantum Shell Builder</h2>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
              Bohr Orbital Visualizer
            </span>
          </div>

          {/* Periodic Selectors micro grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-5">
            {PERIODIC_ELEMENTS.map((el) => (
              <button
                key={el.number}
                onClick={() => handleSelectElement(el)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden ${
                  selectedElement.number === el.number && !isBonded
                    ? 'bg-emerald-600/30 text-white border-emerald-400 font-extrabold shadow-sm'
                    : 'bg-slate-900/60 text-slate-300 border-slate-805 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] font-mono absolute top-1 left-1.5 opacity-50">{el.number}</span>
                <span className="text-lg font-display font-extrabold mt-1.5">{el.symbol}</span>
                <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">{el.name}</span>
              </button>
            ))}
          </div>

          {/* Sliced Bohr Shell View */}
          <div className="relative w-full aspect-square max-w-[340px] mx-auto bg-slate-950/80 rounded-2xl border border-slate-900 p-4 flex items-center justify-center">
            
            {/* Standard Animation trails if bonded */}
            {isBonded && (
              <div className="absolute inset-0 bg-indigo-500/5 animate-pulse rounded-2xl border-2 border-indigo-500/20 pointer-events-none" />
            )}

            {playingReaction ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <FlaskConical className="w-12 h-12 text-violet-400 animate-[spin_3s_linear_infinite]" />
                <p className="text-xs font-mono font-bold text-violet-300 animate-pulse">Exchanging Shell Octets...</p>
                <div className="w-[180px] bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-violet-500 h-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                </div>
              </div>
            ) : isBonded ? (
              // Bonded Compound graphic
              <div className="flex flex-col items-center text-center p-4">
                <FlaskConical className="w-14 h-14 text-indigo-400" />
                <h4 className="font-display font-extrabold text-2xl text-white mt-3">{selectedBond.formula}</h4>
                <p className="text-xs text-indigo-300 font-semibold">{selectedBond.name}</p>
                <p className="text-[10px] text-slate-400 mt-2 italic px-4">"{selectedBond.description}"</p>
                <span className="mt-3 text-[10px] bg-indigo-500/20 text-indigo-300 font-mono py-0.5 px-2.5 rounded border border-indigo-500/30">
                  {selectedBond.productType} synthesis locked
                </span>
              </div>
            ) : (
              // Simple Bohr Atom Shell mapping
              <svg viewBox="0 0 240 240" className="w-full h-full select-none">
                {/* Orbital Shell 3 */}
                {selectedElement.shells.length >= 3 && (
                  <circle cx="120" cy="120" r="100" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
                )}
                {/* Orbital Shell 2 */}
                {selectedElement.shells.length >= 2 && (
                  <circle cx="120" cy="120" r="70" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />
                )}
                {/* Orbital Shell 1 */}
                <circle cx="120" cy="120" r="40" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />

                {/* Central Nucleus */}
                <circle cx="120" cy="120" r="18" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
                <text x="120" y="124" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="extrabold" className="font-mono">
                  {selectedElement.symbol}
                </text>

                {/* Draw Protons and Neutrons particles as dots clustered inside Nucleus (conceptual surrounding dots) */}
                <circle cx="112" cy="112" r="2.5" fill="#ef4444" opacity="0.8" />
                <circle cx="128" cy="114" r="2.5" fill="#3b82f6" opacity="0.8" />
                <circle cx="116" cy="128" r="2.5" fill="#ef4444" opacity="0.8" />

                {/* Draw Electrons circularizing around Shell coordinates */}
                {/* Shell 1 Electrons */}
                {Array.from({ length: Math.min(selectedElement.shells[0] || 0, 2) }).map((_, idx) => {
                  const angle = (idx * 360) / Math.min(selectedElement.shells[0] || 0, 2);
                  const rads = (angle * Math.PI) / 180;
                  const ex = 120 + Math.cos(rads) * 40;
                  const ey = 120 + Math.sin(rads) * 40;
                  return (
                    <g key={`s1-${idx}`}>
                      <circle cx={ex} cy={ey} r="3.5" fill="#10b981" className="animate-[pulse_1s_infinite]" />
                      <circle cx={ex} cy={ey} r="7" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.4" />
                    </g>
                  );
                })}

                {/* Shell 2 Electrons */}
                {selectedElement.shells[1] && Array.from({ length: selectedElement.shells[1] }).map((_, idx) => {
                  const angle = (idx * 360) / selectedElement.shells[1];
                  const rads = (angle * Math.PI) / 180;
                  const ex = 120 + Math.cos(rads) * 70;
                  const ey = 120 + Math.sin(rads) * 70;
                  return (
                    <g key={`s2-${idx}`}>
                      <circle cx={ex} cy={ey} r="3.5" fill="#10b981" />
                      <circle cx={ex} cy={ey} r="7" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.4" />
                    </g>
                  );
                })}

                {/* Shell 3 Electrons */}
                {selectedElement.shells[2] && Array.from({ length: selectedElement.shells[2] }).map((_, idx) => {
                  const angle = (idx * 360) / selectedElement.shells[2];
                  const rads = (angle * Math.PI) / 180;
                  const ex = 120 + Math.cos(rads) * 100;
                  const ey = 120 + Math.sin(rads) * 100;
                  return (
                    <g key={`s3-${idx}`}>
                      <circle cx={ex} cy={ey} r="3.5" fill="#10b981" />
                      <circle cx={ex} cy={ey} r="7" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.4" />
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Subatomic summary details label */}
            {!isBonded && (
              <div className="absolute top-3 right-3 text-[10px] font-mono bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-400 space-y-0.5">
                <div>Protons: <span className="text-emerald-400 font-bold">{selectedElement.protons}</span></div>
                <div>Neutrons: <span className="text-[#38bdf8] font-bold">{selectedElement.neutrons}</span></div>
                <div>Electrons: <span className="text-amber-400 font-bold">{selectedElement.electrons}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Compound synthetic reaction lab and AI details */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        
        {/* Molecular Bond terminal */}
        <div id="molecular-bond-terminal" className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-5 h-5 text-violet-400" />
            <h3 className="font-display font-extrabold text-sm text-white">Compound Synthetic Lab</h3>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Synthesize molecular compounds by initiating electrostatic transfer reactions between reactants.
          </p>

          <div className="space-y-3">
            {BOND_PRESETS.map((bp, i) => (
              <div
                key={i}
                onClick={() => { setSelectedBond(bp); setIsBonded(false); }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedBond.name === bp.name 
                    ? 'bg-violet-900/30 border-violet-500' 
                    : 'bg-slate-950/60 border-slate-850 hover:border-slate-750'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-white">{bp.name}</span>
                  <span className="font-mono text-xs font-extrabold text-violet-400">{bp.formula}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500 font-mono">Reactants: {bp.reactants.join(' + ')}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${bp.productType === 'Covalent' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-pink-500/20 text-pink-300'}`}>
                    {bp.productType}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleTriggerBond}
            disabled={playingReaction}
            className="w-full mt-4 bg-violet-600 hover:bg-violet-500 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-55"
          >
            <FlaskConical className="w-4 h-4 fill-current text-white" />
            <span>React & Synthesize Compound</span>
          </button>
        </div>

        {/* Dynamic chemistry AI explanations details */}
        <div className="glass-panel p-5 min-h-[220px]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="font-display font-extrabold text-sm text-white">Gemini Quantum Interpretation</h3>
          </div>

          {loadingExplanation ? (
            <div className="flex flex-col gap-3 py-6 justify-center items-center">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
              <p className="text-xs font-mono text-slate-400 font-bold">Solving Hartree-Fock Wavefunctions...</p>
            </div>
          ) : explanationData ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">STATE OVERVIEW</span>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">{explanationData.coreExplanation}</p>
              </div>

              <div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-bold">MOLECULAR MECHANICS</span>
                <ul className="text-xs text-slate-300 mt-2 list-decimal list-inside space-y-1.5">
                  {(explanationData.mechanics || []).map((mech: string, i: number) => (
                    <li key={i} className="text-slate-300"><span className="text-slate-400 font-sans">{mech}</span></li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">🏫 Physical Analogy:</span>
                <p className="text-xs text-slate-400 mt-1 italic">"{explanationData.analogy}"</p>
              </div>

              <div className="text-[11px] text-slate-400 flex items-start gap-2 bg-blue-950/15 p-2 rounded-lg border border-blue-900/20">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p><strong>Experiment tip:</strong> {explanationData.experimentTip}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Select elements or trigger bonding to refresh molecular orbitals.</p>
          )}
        </div>

      </div>
    </div>
  );
}
