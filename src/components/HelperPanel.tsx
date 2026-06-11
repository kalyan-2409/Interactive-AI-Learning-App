import React, { useState } from 'react';
import { Code2, Sparkles, Send, Cpu, Check, FileJson, Layers } from 'lucide-react';

export default function HelperPanel() {
  const [testPrompt, setTestPrompt] = useState('Explain why Helium is inert and never forms covalent bonds.');
  const [responseOutput, setResponseOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestQuery = async () => {
    setIsLoading(true);
    setResponseOutput('');

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testPrompt,
          currentSubject: 'AI Sandbox Playground',
          currentContext: { mode: 'sandbox_inspection' }
        })
      });

      if (!response.ok) throw new Error('Sandbox query failed');
      const data = await response.json();
      setResponseOutput(data.text || 'No response captured.');
    } catch (err: any) {
      setResponseOutput(`[Synaptic Timeout Error] Make sure you have a valid GEMINI_API_KEY set under Settings > Secrets. Error Details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-sandbox-laboratory" className="space-y-6 text-left">
      
      {/* Banner */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-violet-400 animate-pulse" />
          <h2 className="font-display font-bold text-lg text-white">AI Studio & Model Engineering</h2>
        </div>
        <p className="text-xs text-slate-400">
          This system uses state-of-the-art server-side generative architectures to coordinate deep academic explanations on-demand.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Model Specs & JSON schemas */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" /> Model Configuration
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900/60 flex justify-between">
                <span className="text-slate-500">API SDK Target:</span>
                <span className="text-violet-400">@google/genai (v2.4.0)</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900/60 flex justify-between">
                <span className="text-slate-500">Core Gemini Model:</span>
                <span className="text-amber-400 font-bold">gemini-3.5-flash</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900/60 flex justify-between">
                <span className="text-slate-500">Response Mimeline:</span>
                <span className="text-emerald-400">application/json</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 space-y-3">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <FileJson className="w-4 h-4 text-emerald-400" /> Prompt & Schema Engineering
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              To achieve durable UI integrations without syntax errors, we specify strict JSON models to control the outputs of Gemini:
            </p>

            <pre className="bg-slate-950 text-[10px] font-mono text-slate-450 p-3.5 rounded-xl border border-slate-900 overflow-x-auto text-emerald-400/90 leading-tight">
{`responseSchema: {
  type: Type.OBJECT,
  properties: {
    coreExplanation: { type: Type.STRING },
    mechanics: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    analogy: { type: Type.STRING },
    experimentTip: { type: Type.STRING }
  },
  required: ["coreExplanation", "mechanics", "analogy"]
}`}
            </pre>
          </div>

        </div>

        {/* RIGHT: Active Playground Sandbox */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="glass-panel p-5 flex flex-col justify-between flex-1">
            <div className="space-y-3">
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold tracking-widest px-2.5 py-0.5 rounded border border-indigo-500/20">
                PROMPT LEVEL PLAYGROUND
              </span>
              <h3 className="font-display font-bold text-sm text-white">Tutor Core Sandbox</h3>
              <p className="text-xs text-slate-400">
                Type any custom scientific concept or query to watch the academic tutor construct personalized responses.
              </p>

              <textarea
                rows={3}
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Type a custom query..."
                className="w-full bg-slate-950 border border-slate-805 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
              />

              <button
                onClick={handleTestQuery}
                disabled={isLoading || !testPrompt.trim()}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold p-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Sandbox Query</span>
              </button>
            </div>

            {/* Sandbox responses output */}
            <div className="mt-5 pt-4 border-t border-slate-850/60 text-left">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-black block mb-2">OUTPUT LOG:</span>
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-900 min-h-[120px] max-h-[180px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex gap-2 items-center justify-center h-20 text-slate-500 text-xs font-mono">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-transparent animate-spin"></div>
                    <span>Streaming subatomic data...</span>
                  </div>
                ) : responseOutput ? (
                  <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium whitespace-pre-line">{responseOutput}</p>
                ) : (
                  <p className="text-xs text-slate-600 italic">No query output captured yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
