import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile 
} from 'firebase/auth';
import { auth, saveUserProfile } from '../firebase';
import { GraduationCap, Mail, Lock, User, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onGuestAccess: () => void;
}

export default function AuthScreen({ onGuestAccess }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick helper to translate Firebase auth errors to student-friendly language
  const getCleanErrorMessage = (errCode: string) => {
    switch (errCode) {
      case 'auth/invalid-email':
        return 'Please enter a valid student email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password combination. Please try again!';
      case 'auth/email-already-in-use':
        return 'This email is already registered! Did you mean to sign in?';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long for security.';
      case 'auth/popup-closed-by-user':
        return 'Google login popup window was closed. Please try again.';
      default:
        return 'An unexpected authentication error occurred. Please try again.';
    }
  };

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password fields.');
      setLoading(false);
      return;
    }

    if (isRegistering && !name.trim()) {
      setError('Please tell us your name to register your student profile.');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        // 1. Create firebase auth user
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        // 2. Set display name
        await updateProfile(user, { displayName: name });

        // 3. Save initial student record in real-time Firestore database
        await saveUserProfile(user.uid, {
          email: user.email || email,
          name: name,
          score: 150, // default XP points
          modulesCompleted: {},
          badges: ['Workspace Starter 🎓'],
          quizHistory: []
        });

        setSuccessMsg('Academic profile registered successfully! Opening workspace...');
      } else {
        // Standard Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(getCleanErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSocialSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is signing in for the first time or save initial profile safely
      // (The App-level state will handle initializing in Firestore if profile is missing onSnapshot)
      setSuccessMsg('Google configuration loaded. Welcome to AI Spark!');
    } catch (err: any) {
      console.error(err);
      setError(getCleanErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Sci-fi backdrop graphics */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-805 rounded-3xl shadow-2xl p-6 md:p-8 relative backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
        
        {/* Decorative micro indicator */}
        <div className="absolute top-4 right-6 flex items-center gap-1.5 text-[9px] font-mono font-bold text-indigo-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          SECURE PROTOCOL ACTIVE
        </div>

        {/* Brand/logo block */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3.5">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-black text-2xl tracking-tight text-white uppercase leading-none">
            AI Spark Labs
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-mono uppercase tracking-widest font-semibold">
            STEM Multiphysics Virtual Space
          </p>
        </div>

        {/* Level indicator / welcome text */}
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/15 rounded-xl text-center mb-6 text-xs text-indigo-200">
          ✨ Join over <strong>1,800+</strong> students custom-tuning subatomic cells and orbiting gravity planets!
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-805/70 mb-6">
          <button
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              !isRegistering ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Login
          </button>
          <button
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              isRegistering ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Profile
          </button>
        </div>

        {/* Error / Success feedback */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailPasswordAuth} className="space-y-4 text-left">
          {isRegistering && (
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                FIGHTING ALIAS NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Marie Curie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full bg-slate-950 border border-slate-805 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-colors"
                />
                <User className="absolute left-3.5 top-3.2 w-4 h-4 text-slate-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
              STUDENT EMAIL ADDRESS
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full bg-slate-950 border border-slate-805 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-colors"
              />
              <Mail className="absolute left-3.5 top-3.2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
              SECURITY PASSWORD
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full bg-slate-950 border border-slate-805 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-colors"
              />
              <Lock className="absolute left-3.5 top-3.2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none mt-2 shadow-lg"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-white-force font-bold">{isRegistering ? 'Register & Start Labs' : 'Unlock Academic Labs'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-x-0 h-px bg-slate-800" />
          <span className="relative px-3 text-[9px] font-mono text-slate-500 bg-slate-900 font-bold uppercase tracking-wider">
            OR CHOOSE AUTH METHOD
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Google SSO Button */}
          <button
            onClick={handleGoogleSocialSignIn}
            disabled={loading}
            type="button"
            className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 rounded-2xl text-[11px] border border-slate-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0 text-red-500 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.74-.08-1.3-.176-1.85h-10.617z" />
            </svg>
            <span className="text-slate-800 font-bold">Continue with Google</span>
          </button>

          {/* Guest Mode Button */}
          <button
            onClick={onGuestAccess}
            disabled={loading}
            type="button"
            className="w-full bg-gradient-to-r from-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-slate-800 text-indigo-300 hover:text-indigo-200 font-bold py-2.5 rounded-2xl text-[11px] border border-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Enter as Guest (Free Offline Lab)</span>
          </button>
        </div>

        {/* Info footer */}
        <p className="text-[10px] font-mono text-slate-500 text-center mt-5 leading-relaxed">
          💾 Guest mode operates fully offline using client-side localStorage. No account or database configuration is required!
        </p>

      </div>
    </div>
  );
}
