import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, BookOpen, Info, CheckCircle2 } from 'lucide-react';

interface OnboardingGuideProps {
  activeTab: string;
}

export default function OnboardingGuide({ activeTab }: OnboardingGuideProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Auto-open when tab changes to show corresponding guide
  useEffect(() => {
    setIsOpen(true);
  }, [activeTab]);

  const getGuideContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: "Dashboard Help • Quick Start",
          icon: <BookOpen className="w-5 h-5 text-indigo-400" />,
          steps: [
            "Select one of the 3 Virtual Labs (Cell, Orbit, or Atom Builder) below to begin.",
            "Ask AI Sparky (on the right panel) any question anytime—he follows your current tab context!",
            "Earn badges and increase your XP by interacting with sims, building compounds, and passing quizzes!"
          ]
        };
      case 'biology':
        return {
          title: "Cell Explorer Guide • How to Play",
          icon: <span className="text-lg">🧬</span>,
          steps: [
            "Tap any glowing cell component in the circular map on the left to read what it does.",
            "Toggle between 'Passive' and 'Active' lipid transport modes to watch molecules drift or get locked.",
            "In 'Active Mode', tap 'Apply ATP' to spend chemical energy and pump sodium out of the cell!"
          ]
        };
      case 'physics':
        return {
          title: "Space Orbit Guide • How to Play",
          icon: <span className="text-lg">🪐</span>,
          steps: [
            "Pick a preset pattern (like 'Stable Earth-like' or 'Escaping Spacecraft') to auto-configure simulation.",
            "Drag gravity mass and velocity sliders to customize the balance of star gravitational attraction.",
            "Watch to see if your planet maintains equilibrium, runs away, or spirals directly into the stellar star!"
          ]
        };
      case 'chemistry':
        return {
          title: "Atom Builder Guide • How to Play",
          icon: <span className="text-lg">🧪</span>,
          steps: [
            "Tap any element in the grid (like H, He, Li, Na) to view protons and orbital energy levels.",
            "Select compound compound recipes (like Water H2O) inside the chemical synthesis controller on the right.",
            "Tap 'React & Synthesize Compound' to simulate molecule bonding with full AI-generated reviews!"
          ]
        };
      case 'quiz':
        return {
          title: "Quiz Hub Guide • How to Play",
          icon: <span className="text-lg">🏆</span>,
          steps: [
            "Pick a learning topic (Biology, Physics, or Chemistry) and an academic level tier.",
            "Tap 'Assemble Quiz' to generate 5 multiple-choice questions curated on-demand by Gemini.",
            "Examine correct answers, study prompt explanations, and get 5/5 correct to win unique STEM badges!"
          ]
        };
      default:
        return null;
    }
  };

  const currentGuide = getGuideContent();
  if (!currentGuide) return null;

  return (
    <div id="interactive-onboarding-banner" className="bg-slate-900/90 border border-indigo-500/20 rounded-2xl overflow-hidden transition-all duration-300">
      
      {/* Banner Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3.5 px-5 flex items-center justify-between cursor-pointer hover:bg-slate-850/35 transition-all select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            {currentGuide.icon}
          </div>
          <div>
            <span className="text-[10px] bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
              QUICK ADVENTURER GUIDE 💡
            </span>
            <h4 className="font-display font-extrabold text-sm text-slate-100 flex items-center gap-1.5 mt-0.5">
              {currentGuide.title}
            </h4>
          </div>
        </div>

        <button className="p-1.5 text-slate-400 hover:text-white transition">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Steps List */}
      {isOpen && (
        <div className="p-5 pt-0 border-t border-slate-850 bg-slate-950/40 text-left animate-[fadeIn_0.2s_ease-out]">
          <p className="text-xs text-slate-400 mb-4 mt-3 leading-relaxed">
            Welcome! Science is for everyone. Here are <strong>3 simple things</strong> you can click and interact with in this view:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentGuide.steps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-805/40 flex gap-3 items-start hover:border-indigo-500/20 transition-all"
              >
                <div className="w-5.5 h-5.5 rounded-full bg-violet-600/10 text-violet-400 border border-violet-500/20 text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900/50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>✨ TIP: You can close or open this guide anytime by clicking the header.</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-violet-400 hover:text-violet-300 font-bold transition"
            >
              Okay, I got it!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
