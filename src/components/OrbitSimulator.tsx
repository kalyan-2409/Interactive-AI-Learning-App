import React, { useState, useEffect, useRef } from 'react';
import { Space, Sparkles, Star, Scale, Play, Pause, RefreshCw, Send, AlertCircle, Info, Landmark } from 'lucide-react';

interface OrbitSimulatorProps {
  onSelectContext: (context: any) => void;
  onTrackBadge: (badge: string) => void;
  simplicityLevel?: string;
}

interface OrbitPreset {
  name: string;
  starMass: number;
  velocity: number;
  distance: number;
  description: string;
}

const PRESETS: OrbitPreset[] = [
  { name: 'Stable Earth-like', starMass: 500, velocity: 12, distance: 100, description: 'A state of orbital equilibrium. The centripetal force perfect matches gravity\'s pull, forming a perfect circular trajectory.' },
  { name: 'Sizzling Hot Jupiter', starMass: 900, velocity: 19, distance: 55, description: 'A supermassive gaseous giant locked in an extremely tight, high-speed, high-radiation stellar warp.' },
  { name: 'Escaping Spacecraft', starMass: 300, velocity: 22, distance: 120, description: 'The craft\'s forward velocity exceeds the escape velocity limit, creating a hyper-parabolic trajectory.' },
];

export default function OrbitSimulator({ onSelectContext, onTrackBadge, simplicityLevel }: OrbitSimulatorProps) {
  // Simulator parameters
  const [starMass, setStarMass] = useState(500);
  const [velocity, setVelocity] = useState(12);
  const [distance, setDistance] = useState(100);
  const [selectedPreset, setSelectedPreset] = useState<string>('Stable Earth-like');

  const [isSimulating, setIsSimulating] = useState(true);
  const [trail, setTrail] = useState<{ x: number, y: number }[]>([]);

  // Real-time animation physics variables
  const [planetPos, setPlanetPos] = useState({ x: 160 + 100, y: 160 });
  const [vx, setVx] = useState(0);
  const [vy, setVy] = useState(12 * 0.15); // scaled initial velocity

  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState<any | null>(null);

  const requestRef = useRef<number | null>(null);

  // Reload explanation on simplicity level toggle
  useEffect(() => {
    triggerAiExplain();
  }, [simplicityLevel]);

  // Restart physics when variables alter
  const handleResetState = (mass: number, speed: number, dist: number, presetName: string) => {
    setStarMass(mass);
    setVelocity(speed);
    setDistance(dist);
    setSelectedPreset(presetName);

    const cx = 160;
    const cy = 160;
    const px = cx + dist;
    const py = cy;

    // Reset trajectory position
    setPlanetPos({ x: px, y: py });
    setVx(0);
    setVy(speed * 0.14); // apply scaled vertical vector
    setTrail([]);

    // Trigger AI report context sync
    onSelectContext({
      orbitalPreset: presetName,
      massVal: `${mass} Ms`,
      velocityVal: `${speed} km/s`,
      radiusVal: `${dist} AU`,
      orbitalLabState: { starMass: mass, planetVelocity: speed, initialRadius: dist }
    });
  };

  // Run dynamic physics update
  useEffect(() => {
    if (!isSimulating) return;

    let px = planetPos.x;
    let py = planetPos.y;
    let localVx = vx;
    let localVy = vy;
    let localTrail = [...trail];

    const cx = 160;
    const cy = 160;

    const gameLoop = () => {
      // Newton universal gravity math
      const dx = px - cx;
      const dy = py - cy;
      const r = Math.sqrt(dx * dx + dy * dy);

      if (r < 15) {
        // Star collision
        setIsSimulating(false);
        return;
      }

      // Gravity force scaling constant
      // F = (G * M1 * M2) / r^2
      const G = 0.85; 
      const gravAccel = (G * starMass) / (r * r);

      // Unit vector vectors
      const ax = -gravAccel * (dx / r);
      const ay = -gravAccel * (dy / r);

      // Update velocities
      localVx += ax;
      localVy += ay;

      // Update positions
      px += localVx;
      py += localVy;

      // Append trail
      if (Math.random() < 0.3) {
        localTrail.push({ x: px, y: py });
        if (localTrail.length > 35) localTrail.shift();
      }

      setPlanetPos({ x: px, y: py });
      setVx(localVx);
      setVy(localVy);
      setTrail(localTrail);

      // Bounds limit (to prevent infinite looping far away)
      if (px < -150 || px > 480 || py < -150 || py > 480) {
        // Reset back inside
        px = cx + distance;
        py = cy;
        localVx = 0;
        localVy = velocity * 0.14;
        localTrail = [];
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isSimulating, starMass, velocity, distance]);

  // Handle preset loading
  const loadPreset = (p: OrbitPreset) => {
    handleResetState(p.starMass, p.velocity, p.distance, p.name);
  };

  // Trigger Gemini API explanation for this thermodynamic specific context
  const triggerAiExplain = async () => {
    setLoadingExplanation(true);
    setExplanationData(null);

    // Track active user badge
    onTrackBadge('Gravity Sculptor');

    try {
      const response = await fetch('/api/explain-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Physics',
          topic: 'Newtonian Orbital Trajectory',
          parameters: {
            starMassG_Units: starMass,
            planetaryVelocity_Scaled: velocity,
            radiusDistance_Pixels: distance,
            presetActive: selectedPreset,
          },
          simplicityLevel
        })
      });

      if (!response.ok) throw new Error('AI analysis failed');
      const data = await response.json();
      setExplanationData(data);
    } catch (err) {
      console.error(err);
      setExplanationData({
        coreExplanation: `Your planetary system establishes a dynamic gravitational orbit curve. Under these exact settings, the planet travels at ${velocity} AU/s with stellar warp gravitational acceleration.`,
        mechanics: [
          `Gravitational Force pulls the planetary mass inward toward star center of barycenter.`,
          'Centripetal acceleration pushes the planet orthogonal to the stellar line of gravity pull.',
          'If the escape speed of (sqrt(2*G*M/r)) is met, the path changes from elliptical to parabolic.'
        ],
        analogy: 'Operating like a quick tetherball slinging wildly around a structural metal pole; the speed dictates if the rope stays tight or snaps!',
        experimentTip: 'Double the stellar mass to see if the planet spirals in, or trigger the "Escaping Spacecraft" preset to look at gravity sling effects.'
      });
    } finally {
      setLoadingExplanation(false);
    }
  };

  // Run AI query once on mount to establish standard learning explanation
  useEffect(() => {
    triggerAiExplain();
  }, [selectedPreset]);

  return (
    <div id="physics-simulator" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT: Physics control console & Visual Simulator */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass-panel p-5 relative flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 animate-pulse" />
              <h2 className="font-display font-bold text-lg text-white">Gravity Simulator</h2>
            </div>
            <span className="text-[11px] bg-amber-500/10 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/20">
              Live Particle Canvas
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Test celestial mechanics. Alter star mass or planetary speed, or choose predefined scenarios below.
          </p>

          {/* Quick Preset Selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => loadPreset(p)}
                className={`text-[11px] shrink-0 font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  selectedPreset === p.name
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/10'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Canvas View */}
          <div className="relative w-full aspect-square max-w-[380px] mx-auto bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden">
            
            {/* Stars background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

            <svg viewBox="0 0 320 320" className="w-full h-full">
              {/* Reference Orbit Guideline */}
              <circle cx="160" cy="160" r={distance} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" className="opacity-60" />

              {/* Trajectory Trail */}
              {trail.length > 1 && (
                <polyline
                  points={trail.map(t => `${t.x},${t.y}`).join(' ')}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                  opacity="0.65"
                />
              )}

              {/* Central Star */}
              <circle cx="160" cy="160" r={16 + starMass / 110} fill="url(#starGradient)" className="radial-pulse" />
              {/* Star core glow */}
              <circle cx="160" cy="160" r="6" fill="#fff" opacity="0.9" />

              {/* Orbiting Planet */}
              <g transform={`translate(${planetPos.x}, ${planetPos.y})`}>
                <circle cx="0" cy="0" r="7" fill="#60a5fa" stroke="#2563eb" strokeWidth="2.5" />
                {/* Planet core */}
                <circle cx="-1.5" cy="-1.5" r="2.5" fill="#93c5fd" />
              </g>

              {/* Star gradients */}
              <defs>
                <radialGradient id="starGradient">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="30%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.1" />
                </radialGradient>
              </defs>
            </svg>

            {/* Simulation controls */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className="bg-slate-900/90 hover:bg-slate-850 p-2 rounded-lg border border-slate-800 text-amber-400 transition"
                title={isSimulating ? 'Pause physics' : 'Resume simulation'}
              >
                {isSimulating ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button 
                onClick={() => handleResetState(starMass, velocity, distance, selectedPreset)}
                className="bg-slate-900/90 hover:bg-slate-850 p-2 rounded-lg border border-slate-800 text-slate-300 transition"
                title="Reset scenario"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick physics metrics banner */}
          <div className="mt-4 p-2 px-3 bg-slate-950/60 rounded-xl border border-slate-900 text-[10px] font-mono grid grid-cols-2 gap-2 text-slate-400">
            <div>CENTRIPETAL FORCE: <span className="text-amber-400 font-bold">{(スター力(starMass, velocity, distance)).toFixed(2)} N</span></div>
            <div>ESCAPE VELOCITY Limit: <span className="text-amber-400 font-bold">{(Math.sqrt((2 * 0.85 * starMass) / distance) * 20).toFixed(1)} km/s</span></div>
          </div>
        </div>
      </div>

      {/* RIGHT: Adjust sliders and AI explanations */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        
        {/* Sliders Console */}
        <div id="physics-controls-sliders" className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-extrabold text-sm text-white">Dynamic Force Tuner</h3>
          </div>

          <div className="space-y-4">
            {/* Slider 1: Star Mass */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold text-slate-300 mb-1.5">
                <span>Stellar Mass (M)</span>
                <span className="text-amber-400">{starMass} Ms</span>
              </div>
              <input
                type="range"
                min="150"
                max="950"
                step="25"
                value={starMass}
                onChange={(e) => handleResetState(Number(e.target.value), velocity, distance, 'Custom System')}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">Modulates the central star curvature. Higher mass pulls tighter.</span>
            </div>

            {/* Slider 2: Orbital speed */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold text-slate-300 mb-1.5">
                <span>Starting Speed (v)</span>
                <span className="text-amber-400">{velocity} km/s</span>
              </div>
              <input
                type="range"
                min="4"
                max="26"
                step="1"
                value={velocity}
                onChange={(e) => handleResetState(starMass, Number(e.target.value), distance, 'Custom System')}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">Initial planetary vector. Exceeding velocity snaps gravity limits.</span>
            </div>

            {/* Slider 3: Orbit Distance */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold text-slate-300 mb-1.5">
                <span>Apoapsis Distance (R)</span>
                <span className="text-amber-400">{distance} AU</span>
              </div>
              <input
                type="range"
                min="50"
                max="170"
                step="5"
                value={distance}
                onChange={(e) => handleResetState(starMass, velocity, Number(e.target.value), 'Custom System')}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">The initial launch distance of planetary orbit mass.</span>
            </div>
          </div>
        </div>

        {/* AI Explainer */}
        <div className="glass-panel p-5 min-h-[220px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="font-display font-extrabold text-sm text-white">Gemini Orbital Interpretation</h3>
            </div>
            <button
              onClick={triggerAiExplain}
              className="text-[10px] bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white px-2.5 py-1 rounded-lg border border-violet-500/20 transition-all font-bold flex items-center gap-1"
            >
              Analyze Settings
            </button>
          </div>

          {loadingExplanation ? (
            <div className="flex flex-col gap-3 py-6 justify-center items-center">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
              <p className="text-xs font-mono text-slate-400 font-bold">Simulating Trajectory Curves...</p>
            </div>
          ) : explanationData ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">SPLICED TRAJECTORY</span>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">{explanationData.coreExplanation}</p>
              </div>

              <div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-bold">GRAVITATIONAL KINEMATICS</span>
                <ul className="text-xs text-slate-300 mt-2 list-decimal list-inside space-y-1.5">
                  {(explanationData.mechanics || []).map((mech: string, i: number) => (
                    <li key={i} className="text-slate-300"><span className="text-slate-400 font-sans">{mech}</span></li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/85 border border-slate-800 p-3 rounded-xl-sm rounded-xl">
                <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider block">🏫 Physical Analogy:</span>
                <p className="text-xs text-slate-400 mt-1 italic">"{explanationData.analogy}"</p>
              </div>

              <div className="text-[11px] text-slate-400 flex items-start gap-2 bg-blue-950/15 p-2 rounded-lg border border-blue-900/20">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p><strong>Experiment tip:</strong> {explanationData.experimentTip}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Adjust settings or click 'Analyze Settings' to refresh AI tutor calculations.</p>
          )}
        </div>

      </div>
    </div>
  );
}

// Helper calculation to output force estimate
function スター力(mass: number, speed: number, r: number): number {
  return (mass * speed) / (r * 0.85);
}
