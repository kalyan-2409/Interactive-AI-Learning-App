import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, RotateCcw, AlertTriangle, Zap, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types';

interface TutorChatProps {
  currentSubject: string;
  currentContext: any;
  onTrackBadge: (badge: string) => void;
  simplicity: 'kids' | 'student' | 'expert';
  onChangeSimplicity: (lvl: 'kids' | 'student' | 'expert') => void;
}

export default function TutorChat({ currentSubject, currentContext, onTrackBadge, simplicity, onChangeSimplicity }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'tutor',
      text: `Hi science adventurer! 🚀 I'm **AI Sparky**, your live STEM tutor! I see you're working in the **${currentSubject.toUpperCase()}** lab right now. Ask me anything about this simulation or try a quick prompt below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSimplicityChange = (lvl: 'kids' | 'student' | 'expert') => {
    onChangeSimplicity(lvl);
    const names = { kids: 'Kid Friendly 👶', student: 'Easy Student 🎒', expert: 'Expert Scientist 🔬' };
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString() + '-info',
        sender: 'tutor',
        text: `🔧 **Explanatory level adjusted!** I will now explain concepts to you at the **${names[lvl]}** level. Ask me anything or click a preset!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-8), // send last 8 messages for context
          currentSubject,
          currentContext: { ...currentContext, simplicityLevel: simplicity },
          simplicityLevel: simplicity
        })
      });

      if (!response.ok) throw new Error('Failed to retrieve response');
      const data = await response.json();

      const tutorMsg: ChatMessage = {
        id: Date.now().toString() + '-tutor',
        sender: 'tutor',
        text: data.text || 'I encountered an issue getting information from my neurons.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, tutorMsg]);
      
      // Encourage engagement by awarding a badge!
      if (messages.length >= 4) {
        onTrackBadge('Scholar Chatter');
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-error',
          sender: 'tutor',
          text: "I had a quick synaptic delay! Let's try that again. Ensure your Gemini key is valid.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerPresetPrompt = (type: 'experiment' | 'explain5' | 'practical') => {
    let prompt = '';
    const name = currentContext?.selectedName || currentContext?.element?.name || 'this state';

    switch (type) {
      case 'experiment':
        prompt = `Suggest an awesome real-world scientific experiment or practical project I could try regarding ${name} in ${currentSubject}!`;
        break;
      case 'explain5':
        prompt = `Can you explain ${name} like I am 5 years old? Use a super simple, memorable analogy.`;
        break;
      case 'practical':
        prompt = `What are the futuristic or major real-world industrial and modern applications of ${name}?`;
        break;
    }
    handleSendMessage(prompt);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'init-reset',
        sender: 'tutor',
        text: `Chat reset! Let's resume our discovery session in **${currentSubject.toUpperCase()}**. What shall we explore? 🧪`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div id="tutor-chat-panel" className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Target header */}
      <div className="bg-gradient-to-r from-violet-900/60 to-indigo-900/60 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/40">
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white">AI Sparky Coach</h3>
            <p className="text-xs text-violet-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-ping"></span>
              On Standby • {currentSubject}
            </p>
          </div>
        </div>
        <button 
          onClick={handleReset}
          className="p-1 px-2 rounded-md hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition-all"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Simplicity Level Segmented Selector for Easy Understanding */}
      <div className="bg-slate-950 p-2.5 border-b border-slate-850">
        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block mb-1.5 text-center">EXPLANATION STYLE (TAP TO TRANSLATE)</span>
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-805">
          <button
            onClick={() => handleSimplicityChange('kids')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 leading-none ${
              simplicity === 'kids' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
            }`}
          >
            <span>👶</span>
            <span className="hidden sm:inline">Kid Mode</span>
            <span className="sm:hidden">Kids</span>
          </button>
          <button
            onClick={() => handleSimplicityChange('student')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 leading-none ${
              simplicity === 'student' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
            }`}
          >
            <span>🎒</span>
            <span>Student</span>
          </button>
          <button
            onClick={() => handleSimplicityChange('expert')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 leading-none ${
              simplicity === 'expert' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-450 hover:text-slate-200 hover:bg-slate-850/40'
            }`}
          >
            <span>🔬</span>
            <span>Expert</span>
          </button>
        </div>
      </div>

      {/* Context banner */}
      <div className="bg-slate-950/80 p-2.5 px-4 border-b border-slate-800/60 text-[11px] font-mono flex items-center gap-2 text-slate-400 truncate">
        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">TARGETING</span>
        <span className="truncate text-slate-300 font-semibold">{JSON.stringify(currentContext)}</span>
      </div>

      {/* Message space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-violet-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-705/30 rounded-bl-none'
            }`}>
              {/* Parse rudimentary bolding for cleaner look */}
              {msg.text.split('\n').map((para, pIdx) => (
                <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>
                  {para.split('**').map((chunk, cIdx) => 
                    cIdx % 2 === 1 ? <strong key={cIdx} className="text-amber-300 font-bold">{chunk}</strong> : chunk
                  )}
                </p>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
        {isLoading && (
          <div className="flex max-w-[80%] mr-auto items-start">
            <div className="bg-slate-800/80 p-3 rounded-2xl rounded-bl-none border border-slate-750 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Synthesizing...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested actions (Quick Queries) */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-850 space-y-2">
        <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" /> Quick Coach Actions:
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button 
            onClick={() => triggerPresetPrompt('explain5')}
            className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg py-1 px-2.5 transition active:scale-95"
          >
            👶 Explain like I'm 5
          </button>
          <button 
            onClick={() => triggerPresetPrompt('experiment')}
            className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg py-1 px-2.5 transition active:scale-95"
          >
            🧪 Experiment Ideas
          </button>
          <button 
            onClick={() => triggerPresetPrompt('practical')}
            className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg py-1 px-2.5 transition active:scale-95"
          >
            🏭 Future Real-world tech
          </button>
        </div>
      </div>

      {/* Form Area */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 items-center"
      >
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask about active ${currentSubject} settings...`}
          disabled={isLoading}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition disabled:opacity-65"
        />
        <button 
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 bg-violet-600 hover:bg-violet-500 text-white disabled:bg-slate-800 disabled:text-slate-500 rounded-xl transition-all font-semibold shadow-md active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
