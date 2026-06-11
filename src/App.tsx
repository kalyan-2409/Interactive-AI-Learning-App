import React, { useState, useEffect } from 'react';
import { Microscope, Scale, Atom, Award, BookOpen, Layers, Sparkles, Menu, X, GraduationCap } from 'lucide-react';
import { UserProgress, SubjectId } from './types';
import Dashboard from './components/Dashboard';
import CellExplorer from './components/CellExplorer';
import OrbitSimulator from './components/OrbitSimulator';
import AtomBuilder from './components/AtomBuilder';
import QuizHub from './components/QuizHub';
import HelperPanel from './components/HelperPanel';
import TutorChat from './components/TutorChat';
import OnboardingGuide from './components/OnboardingGuide';

// Real-time Firebase database and authentication integration
import { auth, db, saveUserProfile } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import AuthScreen from './components/AuthScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | SubjectId | 'quiz' | 'ai-lab'>('dashboard');
  const [simplicityLevel, setSimplicityLevel] = useState<'kids' | 'student' | 'expert'>('student');
  
  // Sidebar state for mobile layout
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared active Context state used by the contextual AI tutor chat
  const [currentContext, setCurrentContext] = useState<any>({
    activeSelected: 'Eukaryotic Cell',
    type: 'microscopic_cytology',
    biologyLabState: { transportMode: 'passive', atpPoints: 10 }
  });

  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // User progressive academic scoring
  const [progress, setProgress] = useState<UserProgress>({
    score: 150, // starting XP
    modulesCompleted: {},
    badges: ['Workspace Starter 🎓'],
    quizHistory: []
  });

  // Centralized progress updater with local storage backup and firestore auto-failover
  const syncUserProgress = async (updated: UserProgress) => {
    setProgress(updated);
    if (!currentUser) return;

    if (currentUser.isGuest) {
      // Guest mode writes directly and solely to localStorage
      try {
        localStorage.setItem('ai-spark-guest-progress', JSON.stringify(updated));
      } catch (e) {
        console.error("Guest localStorage write error:", e);
      }
      return;
    }

    // Standard user gets both local cache and Firestore attempt
    try {
      localStorage.setItem(`ai-spark-user-progress_${currentUser.uid}`, JSON.stringify(updated));
      
      await saveUserProfile(currentUser.uid, {
        email: currentUser.email || '',
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Member Student',
        score: updated.score,
        modulesCompleted: updated.modulesCompleted,
        badges: updated.badges,
        quizHistory: updated.quizHistory
      });
      setIsOfflineMode(false);
    } catch (err) {
      console.warn("Firestore database sync failed; falling back to local memory storage safely.", err);
      setIsOfflineMode(true);
    }
  };

  const handleGuestAccess = () => {
    const guestUser = {
      uid: 'guest_user',
      displayName: 'Guest Scholar',
      email: 'guest@sparklabs.offline',
      isGuest: true
    };
    try {
      localStorage.setItem('ai-spark-current-guest', JSON.stringify(guestUser));
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(guestUser);
    setIsOfflineMode(true);
    
    // Load guest progress
    try {
      const saved = localStorage.getItem('ai-spark-guest-progress');
      if (saved) {
        setProgress(JSON.parse(saved));
      } else {
        const initial = {
          score: 150,
          modulesCompleted: {},
          badges: ['Workspace Starter 🎓'],
          quizHistory: []
        };
        setProgress(initial);
        localStorage.setItem('ai-spark-guest-progress', JSON.stringify(initial));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Listen to Authentication state changes and sync real-time user database entries
  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsOfflineMode(false);

        // Preload local backup cache in case connection is slow or blocked
        try {
          const cached = localStorage.getItem(`ai-spark-user-progress_${user.uid}`);
          if (cached) {
            setProgress(JSON.parse(cached));
          }
        } catch (e) {
          console.warn("Failed to load local backup cache:", e);
        }

        // Subscribing to real-time changes inside Firestore
        const userDocRef = doc(db, 'users', user.uid);
        unsubSnapshot = onSnapshot(userDocRef, async (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const loaded = {
              score: data.score ?? 150,
              modulesCompleted: data.modulesCompleted ?? {},
              badges: data.badges ?? ['Workspace Starter 🎓'],
              quizHistory: data.quizHistory ?? []
            };
            setProgress(loaded);
            try {
              localStorage.setItem(`ai-spark-user-progress_${user.uid}`, JSON.stringify(loaded));
            } catch (e) {}
          } else {
            // New register or Google student profile
            const initialData = {
              email: user.email || '',
              name: user.displayName || user.email?.split('@')[0] || 'Lab Journeyman',
              score: 150,
              modulesCompleted: {},
              badges: ['Workspace Starter 🎓'],
              quizHistory: []
            };
            try {
              await saveUserProfile(user.uid, initialData);
            } catch (err) {
              console.warn("Firestore collection create block; default to offline storage.", err);
              setIsOfflineMode(true);
            }
          }
          setAuthLoading(false);
        }, (error) => {
          console.warn("Firestore subscription failed; continuing inside offline sandbox mode.", error);
          setIsOfflineMode(true);
          setAuthLoading(false);
        });
      } else {
        // Fallback or persist Guest state
        const storedGuest = localStorage.getItem('ai-spark-current-guest');
        if (storedGuest) {
          try {
            const guestUser = JSON.parse(storedGuest);
            setCurrentUser(guestUser);
            setIsOfflineMode(true);
            const saved = localStorage.getItem('ai-spark-guest-progress');
            if (saved) {
              setProgress(JSON.parse(saved));
            }
          } catch (e) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
          setProgress({
            score: 150,
            modulesCompleted: {},
            badges: ['Workspace Starter 🎓'],
            quizHistory: []
          });
        }
        setAuthLoading(false);
        if (unsubSnapshot) {
          unsubSnapshot();
          unsubSnapshot = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  const handleSelectModuleDirect = (subj: SubjectId) => {
    setActiveTab(subj);
    setSidebarOpen(false);
  };

  // Callback to log completed test scores synchronously
  const handleAddNewScore = async (topic: string, score: number, total: number) => {
    const xpGained = score * 40;
    const newQuiz = {
      topic,
      score,
      total,
      date: new Date().toLocaleDateString()
    };
    const updatedHistory = [newQuiz, ...progress.quizHistory];
    const updatedScore = progress.score + xpGained;
    const nextProgress = {
      ...progress,
      score: updatedScore,
      quizHistory: updatedHistory
    };

    if (currentUser) {
      await syncUserProgress(nextProgress);
    } else {
      setProgress(nextProgress);
    }
  };

  // Callback to award specific structural achievements synchronously
  const handleAwardBadge = async (badgeName: string) => {
    if (progress.badges.includes(badgeName)) return; // prevent duplicates
    const updatedScore = progress.score + 100;
    const updatedBadges = [...progress.badges, badgeName];
    const nextProgress = {
      ...progress,
      score: updatedScore,
      badges: updatedBadges
    };

    if (currentUser) {
      await syncUserProgress(nextProgress);
    } else {
      setProgress(nextProgress);
    }
  };

  // Sync contextual settings and track module completions inside the real-time database
  useEffect(() => {
    if (activeTab === 'dashboard') {
      setCurrentContext({ activeSelected: 'Student Dashboard', mode: 'profile_view' });
    } else if (activeTab === 'biology') {
      setCurrentContext({ activeSelected: 'Eukaryotic Cell Map', mode: 'cytology_inspection' });
      const nextModules = { ...progress.modulesCompleted, biology: true };
      const nextProg = { ...progress, modulesCompleted: nextModules };
      if (currentUser && !progress.modulesCompleted.biology) {
        syncUserProgress(nextProg).catch(err => console.error(err));
      } else if (!progress.modulesCompleted.biology) {
        setProgress(nextProg);
      }
    } else if (activeTab === 'physics') {
      setCurrentContext({ activeSelected: 'Stable Earth-like Orbit', starMass: 500, planetVelocity: 12, mode: 'orbital_gravity' });
      const nextModules = { ...progress.modulesCompleted, physics: true };
      const nextProg = { ...progress, modulesCompleted: nextModules };
      if (currentUser && !progress.modulesCompleted.physics) {
        syncUserProgress(nextProg).catch(err => console.error(err));
      } else if (!progress.modulesCompleted.physics) {
        setProgress(nextProg);
      }
    } else if (activeTab === 'chemistry') {
      setCurrentContext({ activeSelected: 'Hydrogen Bohr Atom', mode: 'subatomic_inspection' });
      const nextModules = { ...progress.modulesCompleted, chemistry: true };
      const nextProg = { ...progress, modulesCompleted: nextModules };
      if (currentUser && !progress.modulesCompleted.chemistry) {
        syncUserProgress(nextProg).catch(err => console.error(err));
      } else if (!progress.modulesCompleted.chemistry) {
        setProgress(nextProg);
      }
    } else if (activeTab === 'quiz') {
      setCurrentContext({ activeSelected: 'Interactive Academic Quiz', mode: 'active_testing' });
    } else if (activeTab === 'ai-lab') {
      setCurrentContext({ activeSelected: 'AI Prompts Sandbox', mode: 'playground_sandbox' });
    }
  }, [activeTab, currentUser]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/25" />
          <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold animate-pulse">
          Booting STEM Workspace...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onGuestAccess={handleGuestAccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden relative">
      
      {/* Background radial highlight */}
      <div className="absolute top-0 left-64 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* MOBILE HEADER BAR */}
      <header className="lg:hidden w-full h-[60px] bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 absolute top-0 left-0 z-40">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <span className="font-display font-extrabold text-sm tracking-tight text-white uppercase">AI Spark Learning</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white transition"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION: Desktop & Mobile Drawer */}
      <aside className={`w-[260px] bg-slate-900 border-r border-slate-805/80 flex flex-col justify-between shrink-0 h-full fixed lg:static z-50 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col gap-4">
          {/* Logo Brand */}
          <div className="p-5 border-b border-slate-850 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-display font-extrabold text-sm leading-none text-white tracking-wide uppercase">AI Spark Labs</h1>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-[9px] font-mono font-bold text-indigo-400">MULTIPHYSICS</span>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-md font-extrabold tracking-wider ${
                  isOfflineMode || currentUser?.isGuest
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse'
                    : 'bg-indigo-500/10 text-indigo-450 border border-indigo-500/10'
                }`}>
                  {isOfflineMode || currentUser?.isGuest ? '💾 LOCAL SAVE (FREE)' : '☁️ CLOUD ONLINE'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="px-3 space-y-1 text-left">
            <span className="px-3.5 mb-1.5 font-mono text-[9px] text-slate-500 font-bold uppercase tracking-widest block">LEARNER WORKSPACE</span>
            
            <button
              id="nav-dashboard"
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Dashboard 🚀</span>
            </button>

            <span className="px-3.5 pt-4 mb-1.5 font-mono text-[9px] text-slate-500 font-bold uppercase tracking-widest block">INTERACTIVE LABORATORIES</span>
            
            <button
              id="nav-biology"
              onClick={() => handleSelectModuleDirect('biology')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'biology' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
              }`}
            >
              <Microscope className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Cell Explorer 🧬</span>
            </button>

            <button
              id="nav-physics"
              onClick={() => handleSelectModuleDirect('physics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'physics' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
              }`}
            >
              <Scale className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Orbit Simulator 🪐</span>
            </button>

            <button
              id="nav-chemistry"
              onClick={() => handleSelectModuleDirect('chemistry')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chemistry' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
              }`}
            >
              <Atom className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Atom Builder 🧪</span>
            </button>

            <span className="px-3.5 pt-4 mb-1.5 font-mono text-[9px] text-slate-500 font-bold uppercase tracking-widest block">EVALUATIONS</span>

            <button
              id="nav-quiz"
              onClick={() => { setActiveTab('quiz'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'quiz' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
              }`}
            >
              <Award className="w-4 h-4 text-violet-400 shrink-0" />
              <span>Quiz Hub 🏆</span>
            </button>

            <button
              id="nav-ai-lab"
              onClick={() => { setActiveTab('ai-lab'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ai-lab' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
              }`}
            >
              <Layers className="w-4 h-4 text-pink-400 shrink-0" />
              <span>AI Sandbox ⚙️</span>
            </button>
          </nav>
        </div>

        {/* Dynamic score summary on left bottom */}
        <div className="p-4 border-t border-slate-850/80 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-xl border border-slate-850">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 font-mono font-bold text-xs text-indigo-400 shrink-0">
              {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-[10px] font-bold text-white truncate leading-tight">
                {currentUser?.displayName || 'Active Student'}
              </p>
              <p className="text-[8px] font-mono text-slate-500 truncate leading-none mt-0.5">
                {currentUser?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-1.5 px-2.5 bg-slate-950 rounded-xl border border-slate-850">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <div className="text-left leading-tight">
                <span className="text-[7px] font-mono text-slate-500 font-bold uppercase block leading-none">SCORE</span>
                <span className="text-[10px] font-display font-black text-white leading-none">{progress.score} XP</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (currentUser?.isGuest) {
                  localStorage.removeItem('ai-spark-current-guest');
                  setCurrentUser(null);
                } else {
                  signOut(auth);
                }
              }}
              className="py-1.5 px-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-red-900/40 text-slate-400 hover:text-red-400 rounded-xl text-[9px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* BACKGROUND SHADOW FOR MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* CORE WORKSPACE CONTENT AREA */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden pt-[60px] lg:pt-0">
        
        {/* Dynamic simulator workspace viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="max-w-[1200px] mx-auto space-y-6">
            <OnboardingGuide activeTab={activeTab} />

            {activeTab === 'dashboard' && (
              <Dashboard progress={progress} onSelectModule={handleSelectModuleDirect} />
            )}
            {activeTab === 'biology' && (
              <CellExplorer onSelectContext={setCurrentContext} onTrackBadge={handleAwardBadge} simplicityLevel={simplicityLevel} />
            )}
            {activeTab === 'physics' && (
              <OrbitSimulator onSelectContext={setCurrentContext} onTrackBadge={handleAwardBadge} simplicityLevel={simplicityLevel} />
            )}
            {activeTab === 'chemistry' && (
              <AtomBuilder onSelectContext={setCurrentContext} onTrackBadge={handleAwardBadge} simplicityLevel={simplicityLevel} />
            )}
            {activeTab === 'quiz' && (
              <QuizHub onAddScore={handleAddNewScore} onTrackBadge={handleAwardBadge} badges={progress.badges} />
            )}
            {activeTab === 'ai-lab' && (
              <HelperPanel />
            )}
          </div>
        </div>

        {/* SIDE BAR: Contextual AI Tutor Chat (Right panel) */}
        {activeTab !== 'ai-lab' && (
          <div className="w-full lg:w-[350px] bg-slate-950 p-4 border-t lg:border-t-0 lg:border-l border-slate-900 shrink-0 flex flex-col justify-stretch h-[450px] lg:h-full">
            <TutorChat 
              currentSubject={activeTab === 'dashboard' ? 'Science Dashboard' : activeTab}
              currentContext={currentContext}
              onTrackBadge={handleAwardBadge}
              simplicity={simplicityLevel}
              onChangeSimplicity={setSimplicityLevel}
            />
          </div>
        )}

      </main>

    </div>
  );
}
