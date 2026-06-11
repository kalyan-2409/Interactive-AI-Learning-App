import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Pause, RefreshCw, Zap, Shield, Microscope, MessageSquare, Info } from 'lucide-react';
import { Organelle, CellParticle } from '../types';

interface CellExplorerProps {
  onSelectContext: (context: any) => void;
  onTrackBadge: (badge: string) => void;
  simplicityLevel?: string;
}

const ORGANELLES: Organelle[] = [
  {
    name: 'Nucleus',
    symbol: 'DNA',
    shortDesc: 'The cell command center housing chromosomes and directing protein synthesis.',
    color: '#3b82f6',
    cx: '160', cy: '160', rx: '42', ry: '42'
  },
  {
    name: 'Mitochondria',
    symbol: 'ATP',
    shortDesc: 'The powerhouses producing energy through metabolic cellular respiration.',
    color: '#ef4444',
    cx: '250', cy: '210', rx: '24', ry: '14'
  },
  {
    name: 'Golgi Apparatus',
    symbol: 'PKG',
    shortDesc: 'The post office packing, processing, and shipping macromolecules out of the cell.',
    color: '#f59e0b',
    cx: '80', cy: '190', rx: '28', ry: '18'
  },
  {
    name: 'Endoplasmic Reticulum',
    symbol: 'RER',
    shortDesc: 'The manufacturing plants synthesis folding membrane sheets.',
    color: '#a855f7',
    cx: '160', cy: '100', rx: '55', ry: '14'
  },
  {
    name: 'Lysosome',
    symbol: 'WST',
    shortDesc: 'The recycling bins filled with cellular enzymes to devour proteins or broken organelles.',
    color: '#e2e8f0',
    cx: '235', cy: '110', rx: '12', ry: '12'
  },
];

export default function CellExplorer({ onSelectContext, onTrackBadge, simplicityLevel }: CellExplorerProps) {
  const [selectedOrganelle, setSelectedOrganelle] = useState<Organelle | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState<any | null>(null);

  // Reload explanation on simplicity level toggle
  useEffect(() => {
    if (selectedOrganelle) {
      handleSelectOrganelle(selectedOrganelle);
    }
  }, [simplicityLevel]);

  // Membrane Lab parameters
  const [transportMode, setTransportMode] = useState<'passive' | 'active'>('passive');
  const [isSimulating, setIsSimulating] = useState(true);
  const [atpPoints, setAtpPoints] = useState(10);
  const [pumpSpeed, setPumpSpeed] = useState(1);
  const [innerCount, setInnerCount] = useState(0);
  const [outerCount, setOuterCount] = useState(0);

  const [particles, setParticles] = useState<CellParticle[]>([]);
  const simInterval = useRef<any>(null);
  const requestRef = useRef<number | null>(null);

  // Initialize random particle distribution
  useEffect(() => {
    const list: CellParticle[] = [];
    // Upper part represents outer environment (y < 120)
    // Lower part represents inner cytoplams (y > 180)
    // Membrane is at y: 120 to 180
    for (let i = 0; i < 28; i++) {
      list.push({
        id: i,
        x: Math.random() * 320,
        y: Math.random() * 95, // outer
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        type: Math.random() > 0.45 ? 'nutrient' : 'sodium'
      });
    }
    for (let i = 28; i < 40; i++) {
      list.push({
        id: i,
        x: Math.random() * 320,
        y: 195 + Math.random() * 95, // inner
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        type: 'sodium'
      });
    }
    setParticles(list);

    // Default select first organelle
    handleSelectOrganelle(ORGANELLES[0]);
  }, []);

  // Frame anim loop for rendering molecular kinetics
  useEffect(() => {
    if (!isSimulating) return;

    let localParticles = [...particles];

    const updatePhysics = () => {
      let pin = 0;
      let pout = 0;

      localParticles = localParticles.map(p => {
        let nx = p.x + p.vx;
        let ny = p.y + p.vy;

        // Bounce walls
        if (nx < 5 || nx > 315) { p.vx *= -1; nx = p.x; }
        if (ny < 5 || ny > 295) { p.vy *= -1; ny = p.y; }

        // Cellular Membrane boundaries at y: 130 to 170
        const topMembraneY = 135;
        const bottomMembraneY = 165;

        // If passive mode, particles leak slowly across membranes
        if (transportMode === 'passive') {
          // Slow resistive leakage
          if (ny >= topMembraneY && ny <= bottomMembraneY) {
            // Leak channels
            if (Math.random() < 0.12) {
              // cross
              p.vy *= 1.2;
            } else {
              p.vy *= -1; // bounce
              ny = p.y;
            }
          }
        } else {
          // ACTIVE PUMP TRANSPORT
          // Sodium ions are pumped out of the cell (from bottom inner to top outer)
          // Against gradient! Require ATP!
          if (p.type === 'sodium' && p.y > bottomMembraneY && ny <= bottomMembraneY) {
            // Cannot cross passively inside active mode unless we use ATP energy
          }
          if (ny >= topMembraneY && ny <= bottomMembraneY) {
            if (p.type === 'sodium' && p.vy < 0) {
              // bounce back in unless pumped
              p.vy *= -1;
              ny = p.y;
            } else if (p.type === 'nutrient') {
              // Passive glucose carriers leak in
              p.vy *= 1.1;
            } else {
              p.vy *= -1;
              ny = p.y;
            }
          }
        }

        if (ny > 170) pin++;
        else if (ny < 130) pout++;

        return { ...p, x: nx, y: ny };
      });

      setInnerCount(pin);
      setOuterCount(pout);
      setParticles(localParticles);
      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isSimulating, transportMode]);

  const handleSelectOrganelle = async (org: Organelle) => {
    setSelectedOrganelle(org);
    setLoadingExplanation(true);
    setExplanationData(null);

    // Notify parent for state context sync
    onSelectContext({
      organelleSelected: org.name,
      symbol: org.symbol,
      biologyLabState: {
        transportMode,
        atpPoints,
      }
    });

    try {
      const response = await fetch('/api/explain-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Biology',
          topic: org.name,
          parameters: {
            organelleSymbol: org.symbol,
            role: org.shortDesc
          },
          simplicityLevel
        })
      });

      if (!response.ok) throw new Error('Explain endpoint error');
      const data = await response.json();
      setExplanationData(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setExplanationData({
        coreExplanation: org.shortDesc,
        mechanics: [
          'Catalyzes critical biological macromolecules.',
          'Interacts with neighboring organelles via vesicle networks.',
          'Maintains inner cell pH and thermodynamic parameters.'
        ],
        analogy: `Think of it like a smart logistic depot inside a sprawling, fully cooperative metropolis.`,
        experimentTip: 'Try requesting our AI Tutor chat below to suggest a cellular mutation experiment!'
      });
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleApplyATP = () => {
    if (atpPoints <= 0) return;
    setAtpPoints(prev => prev - 1);

    // Trigger pump action: project 3 Sodium ions from inside (y > 170) to outside (y < 125)
    setParticles(prev => {
      let pumped = 0;
      return prev.map(p => {
        if (p.type === 'sodium' && p.y > 170 && pumped < 3) {
          pumped++;
          return {
            ...p,
            y: 80, // Teleport up represent active pump outward
            vy: -1.2,
            vx: (Math.random() - 0.5) * 1.5
          };
        }
        return p;
      });
    });

    // Notify parent that ATP was used
    onSelectContext({
      organelleSelected: selectedOrganelle ? selectedOrganelle.name : 'None',
      biologyLabState: {
        transportMode: 'active',
        atpPoints: atpPoints - 1,
        activePulseTrigger: true
      }
    });

    onTrackBadge('Energy Alchemist');
  };

  const refillAtp = () => {
    setAtpPoints(15);
  };

  return (
    <div id="cell-explorer" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT: 2.5D SVG interactive Cell Viewer */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Microscope className="w-5 h-5 text-blue-400" />
              <h2 className="font-display font-bold text-lg text-white">Eukaryotic Cell Map</h2>
            </div>
            <span className="text-xs bg-blue-500/10 text-blue-400 font-mono px-2 py-0.5 rounded-full border border-blue-500/20">
              Interactive 2.5D Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Click on any cellular structure inside the microscopic model below to extract real-time AI tutor details.
          </p>

          {/* SVG Diagram */}
          <div className="relative w-full aspect-square max-w-[380px] mx-auto bg-slate-950/60 rounded-full border border-slate-800/80 p-4 flex items-center justify-center">
            
            {/* Background Cytoplasm Grid */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-slate-900/65 animate-[spin_120s_linear_infinite]" />

            <svg viewBox="0 0 320 320" className="w-full h-full select-none cursor-pointer">
              {/* Outer Membrane border */}
              <circle cx="160" cy="160" r="148" fill="#1e1b4b" fillOpacity="0.25" stroke="#4f46e5" strokeWidth="4" strokeDasharray="3,3" className="animate-[spin_40s_linear_infinite]" />
              <circle cx="160" cy="160" r="144" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.3" />

              {/* Organelle elements */}
              {/* Rough Endoplasmic Reticulum (RER) - layers */}
              <g onClick={() => handleSelectOrganelle(ORGANELLES[3])} className="hover:opacity-90">
                <path d="M 90,130 Q 160,80 230,130 Q 160,110 90,130 Z" fill="#6b21a8" fillOpacity="0.4" stroke="#a855f7" strokeWidth="1.5" />
                <path d="M 105,110 Q 160,70 215,110 Q 160,95 105,110 Z" fill="#6b21a8" fillOpacity="0.3" stroke="#a855f7" strokeWidth="1.2" />
                <circle cx="115" cy="105" r="2" fill="#fff" />
                <circle cx="140" cy="98" r="2" fill="#fff" />
                <circle cx="170" cy="95" r="2" fill="#fff" />
                <circle cx="195" cy="102" r="2" fill="#fff" />
              </g>

              {/* Nucleus & Nucleolus */}
              <g onClick={() => handleSelectOrganelle(ORGANELLES[0])} className="hover:scale-105 transform origin-[160px_160px] transition duration-300">
                <circle cx="160" cy="160" r="42" fill="#1e3a8a" fillOpacity="0.75" stroke="#3b82f6" strokeWidth="2.5" />
                {/* Chromatin/DNA lines */}
                <path d="M 140,150 Q 150,140 160,155 T 180,150" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <path d="M 135,165 Q 160,175 175,160 Z" fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity="0.6" />
                {/* Nucleolus */}
                <circle cx="160" cy="165" r="15" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1.5" />
              </g>

              {/* Mitochondria 1 */}
              <g onClick={() => handleSelectOrganelle(ORGANELLES[1])} className="hover:opacity-90">
                <ellipse cx="250" cy="210" rx="24" ry="14" fill="#7f1d1d" fillOpacity="0.8" stroke="#ef4444" strokeWidth="2.2" transform="rotate(-15 250 210)" />
                {/* inner membranes cristae */}
                <path d="M 233,212 Q 240,202 245,214 Q 252,204 257,215 Q 262,206 266,212" fill="none" stroke="#fca5a5" strokeWidth="1.5" transform="rotate(-15 250 210)" />
              </g>

              {/* Golgi complex layer loops */}
              <g onClick={() => handleSelectOrganelle(ORGANELLES[2])} className="hover:opacity-90">
                <path d="M 60,180 C 80,165 95,185 85,210" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M 52,185 C 72,175 84,192 76,215" fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.8" />
                <circle cx="50" cy="172" r="3.5" fill="#f59e0b" />
                <circle cx="95" cy="215" r="3.5" fill="#f59e0b" />
              </g>

              {/* Lysosome */}
              <g onClick={() => handleSelectOrganelle(ORGANELLES[4])} className="hover:opacity-90">
                <circle cx="235" cy="110" r="10" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="232" cy="107" r="2" fill="#cbd5e1" />
                <circle cx="238" cy="113" r="1.5" fill="#94a3b8" />
              </g>

              {/* Helper Pins */}
              {ORGANELLES.map((org, idx) => (
                <g key={idx} onClick={() => handleSelectOrganelle(org)} className="group select-none">
                  <circle cx={org.cx} cy={org.cy} r="6" fill="#10b981" fillOpacity="0.85" className="animate-[pulse_1.8s_infinite] group-hover:fill-emerald-400 transition" />
                  <circle cx={org.cx} cy={org.cy} r="2" fill="#fff" />
                  {/* Label */}
                  <text x={Number(org.cx) + 10} y={Number(org.cy) + 4} fill="#e2e8f0" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none drop-shadow-md">
                    {org.name}
                  </text>
                </g>
              ))}
          </svg>
        </div>

          {/* Active indicator */}
          <div className="mt-4 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-300">
            <span>SELECTED STRUCTURE:</span>
            <span className="text-blue-400 font-bold uppercase">{selectedOrganelle ? selectedOrganelle.name : 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Dynamic Lab and explanations */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        
        {/* Lab Simulator */}
        <div id="transport-lab-card" className="glass-panel p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-extrabold text-sm text-white">Membrane Transport Lab</h3>
            </div>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
              <button 
                onClick={() => setTransportMode('passive')}
                className={`text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-md font-bold transition-all ${transportMode === 'passive' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Passive
              </button>
              <button 
                onClick={() => setTransportMode('active')}
                className={`text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-md font-bold transition-all ${transportMode === 'active' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Active
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            {transportMode === 'passive' 
              ? 'Passive mode: Molecules shift freely across lipid channels based on spatial concentrations (Gradients). No biochemical fuel required.'
              : 'Active mode: Pumping sodium ions against electrostatic gradients (into high concentrations) requires chemical energy input (ATP).'
            }
          </p>

          {/* Kinetic Canvas frame */}
          <div className="relative w-full h-[180px] bg-slate-950/90 rounded-xl border border-slate-850/80 overflow-hidden">
            {/* Upper half boundary: Outer Environment label */}
            <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-500 font-bold">OUTER ENVIRONMENT (ECF)</div>
            {/* Lower half boundary: Inner cytoplasm */}
            <div className="absolute bottom-2 left-3 text-[9px] font-mono text-slate-500 font-bold">INNER CYTOPLASM (ATP-rich)</div>

            {/* Phospholipid Bilayer Graphic boundary */}
            <div className="absolute top-[80px] left-0 right-0 h-[24px] bg-indigo-950/40 border-y border-indigo-500/30 flex items-center justify-around px-2 pointer-events-none">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-0.5 justify-center items-center opacity-60">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <div className="w-0.5 h-2.5 bg-slate-500" />
                </div>
              ))}
              {/* Specialized Transport Pump Channel */}
              <div className="absolute left-[50%] -translate-x-[50%] -top-2 w-[42px] h-[40px] bg-gradient-to-b from-indigo-800 to-indigo-950 border-2 border-indigo-500/80 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-[8px] font-extrabold text-indigo-200">PUMP</span>
                {transportMode === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute -top-0.5"></span>}
              </div>
            </div>

            {/* Render Particles */}
            {particles.map(p => (
              <div 
                key={p.id}
                className="absolute w-2 h-2 rounded-full transform transition-all duration-75 pointer-events-none"
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  backgroundColor: p.type === 'sodium' ? '#a855f7' : '#22c55e',
                  boxShadow: p.type === 'sodium' ? '0 0 4px #c084fc' : '0 0 4px #4ade80'
                }}
              />
            ))}
          </div>

          {/* Counts */}
          <div className="grid grid-cols-2 gap-3 mt-3 text-center">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Sodium Ions (Violet)</span>
              <span className="text-sm font-mono font-bold text-violet-400">{particles.filter(p => p.type === 'sodium').length} Molecules</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Glucose Nutrients (Green)</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{particles.filter(p => p.type === 'nutrient').length} Molecules</span>
            </div>
          </div>

          {/* Active Transport Energy Console */}
          {transportMode === 'active' && (
            <div className="mt-4 p-3 bg-violet-950/40 rounded-xl border border-violet-800/40 flex items-center justify-between text-slate-200 animate-[pulse_2s_infinite]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white">Active Pump Energy Balance</p>
                  <p className="text-xs text-violet-300 font-mono">ATP: {atpPoints} Units</p>
                </div>
              </div>
              
              {atpPoints > 0 ? (
                <button 
                  onClick={handleApplyATP}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-3 py-1.5 rounded-lg font-bold shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Apply ATP
                </button>
              ) : (
                <button 
                  onClick={refillAtp}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Synthesize ATP
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI Explanation Console */}
        <div className="glass-panel p-5 min-h-[220px]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="font-display font-extrabold text-sm text-white">Gemini Interactive Tutor Response</h3>
          </div>

          {loadingExplanation ? (
            <div className="flex flex-col gap-3 py-6 justify-center items-center">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
              <p className="text-xs font-mono text-slate-400">Consulting STEM Knowledge Graph...</p>
            </div>
          ) : explanationData ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-bold">EXPLANATION</span>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">{explanationData.coreExplanation}</p>
              </div>

              {/* Mechanics list */}
              <div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono font-bold">STRUCTURAL CYTOLOGY</span>
                <ul className="text-xs text-slate-300 mt-2 list-decimal list-inside space-y-1.5">
                  {(explanationData.mechanics || []).map((mech: string, i: number) => (
                    <li key={i} className="text-slate-300"><span className="text-slate-400 font-sans">{mech}</span></li>
                  ))}
                </ul>
              </div>

              {/* Analogy bubble */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">🏫 Visual Analogy:</span>
                <p className="text-xs text-slate-400 mt-1 italic">"{explanationData.analogy}"</p>
              </div>

              {/* Action Tip */}
              <div className="text-[11px] text-slate-400 flex items-start gap-2 bg-blue-950/15 p-2 rounded-lg border border-blue-900/20">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p><strong>Educator Tip:</strong> {explanationData.experimentTip}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Select an organelle or configure parameters to launch explanations.</p>
          )}
        </div>

      </div>
    </div>
  );
}
