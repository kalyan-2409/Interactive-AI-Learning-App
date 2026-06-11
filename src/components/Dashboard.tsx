import React from 'react';
import { Award, Zap, Code2, Microscope, Scale, Atom, Compass, TrendingUp, Sparkles } from 'lucide-react';
import { UserProgress, ModuleInfo, MODULES, SubjectId } from '../types';

interface DashboardProps {
  progress: UserProgress;
  onSelectModule: (id: SubjectId) => void;
}

export default function Dashboard({ progress, onSelectModule }: DashboardProps) {
  
  const getBadgeIcon = (badge: string) => {
    if (badge.includes('Scout')) return '🧬';
    if (badge.includes('Voyager')) return '🪐';
    if (badge.includes('Wizard') || badge.includes('Valency')) return '🧪';
    if (badge.includes('Energy')) return '⚡';
    if (badge.includes('Scholars') || badge.includes('Academic') || badge.includes('Speaker')) return '🎓';
    return '🌟';
  };

  const getSubjectIcon = (id: SubjectId) => {
    switch (id) {
      case 'biology': return <Microscope className="w-5 h-5 text-blue-400" />;
      case 'physics': return <Scale className="w-5 h-5 text-amber-400" />;
      case 'chemistry': return <Atom className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div id="dashboard-tab" className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative glass-panel overflow-hidden p-6 bg-gradient-to-r from-slate-900 via-[#1e1b4b]/60 to-slate-900 border-indigo-500/20">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl animate-pulse" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] bg-violet-500/20 text-violet-300 font-mono font-bold tracking-widest px-2.5 py-0.5 rounded border border-violet-500/20 uppercase">
              STUDENT WORKSPACE
            </span>
            <h1 className="font-display font-extrabold text-2xl text-white">Welcome back, Scientist!</h1>
            <p className="text-xs text-slate-400">
              Welcome to AI Spark. Explore biology, gravity kinematics, and molecular shells accompanied by your virtual AI Coach.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-slate-950 p-3 pr-6 rounded-xl border border-slate-900 flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <span className="text-[9px] text-slate-500 font-mono font-bold block uppercase">SPARK POINTS</span>
                <span className="text-lg font-display font-black text-white">{progress.score} XP</span>
              </div>
            </div>
            <div className="bg-slate-950 p-3 pr-6 rounded-xl border border-slate-900 flex items-center gap-2.5">
              <Award className="w-5 h-5 text-violet-400" />
              <div className="text-left">
                <span className="text-[9px] text-slate-500 font-mono font-bold block uppercase">BADGES WON</span>
                <span className="text-lg font-display font-black text-white">{progress.badges.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Lab Modules */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">STEM Interactive Labs</h2>
            <span className="text-xs text-slate-500 font-mono">3 Virtual Labs Ready</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODULES.map((m) => {
              const completed = progress.modulesCompleted[m.id];
              return (
                <div 
                  key={m.id}
                  className="bg-slate-900/40 backdrop-blur-sm border border-slate-805 hover:border-slate-700/60 transition-all rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-850">
                        {getSubjectIcon(m.id)}
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        m.difficulty === 'Beginner' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        m.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {m.difficulty}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-white mt-2">{m.title}</h3>
                    <p className="text-[11px] text-slate-450 font-medium">{m.subtitle}</p>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">{m.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <span>Est: {m.duration}</span>
                      {completed && (
                        <span className="text-emerald-400 font-bold ml-2">✓ Visited</span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectModule(m.id)}
                      className="bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-350 text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
                    >
                      Enter Lab
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Achievements & History */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Unlocked Badges */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white">Merit Badges</h3>
              <span className="text-[10px] font-mono text-slate-500">{progress.badges.length} Won</span>
            </div>

            {progress.badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {progress.badges.map((b, i) => (
                  <div key={i} className="bg-slate-950 p-2 border border-slate-900 rounded-xl flex items-center gap-2">
                    <span className="text-xl select-none">{getBadgeIcon(b)}</span>
                    <span className="text-[10px] font-semibold text-slate-300 truncate" title={b}>{b}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">No badges unlocked yet! Synthesize molecules or score 100% in tests to win badges.</p>
            )}
          </div>

          {/* Test scores history */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-display font-bold text-sm text-white">Evaluation Log</h3>
            
            {progress.quizHistory.length > 0 ? (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {progress.quizHistory.map((hist, i) => (
                  <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-900/60 flex items-center justify-between text-xs font-mono">
                    <div className="text-left">
                      <p className="font-semibold text-slate-300 uppercase">{hist.topic}</p>
                      <p className="text-[9px] text-slate-500">{hist.date}</p>
                    </div>
                    <span className="text-amber-400 font-bold">{hist.score} / {hist.total}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">No quizzes attempted yet. Try out the Quiz Hub tab in the navigation bar.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
