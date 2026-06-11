import React, { useState } from 'react';
import { Sparkles, Award, Play, CheckCircle, XCircle, ChevronRight, BookOpen, Clock, BarChart3, AlertCircle } from 'lucide-react';
import { QuizQuestion, SubjectId } from '../types';

interface QuizHubProps {
  onAddScore: (topic: string, score: number, total: number) => void;
  onTrackBadge: (badge: string) => void;
  badges: string[];
}

export default function QuizHub({ onAddScore, onTrackBadge, badges }: QuizHubProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('biology');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Beginner' | 'Advanced'>('Beginner');
  
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Trigger Gemini dynamic quiz creation
  const handleStartQuiz = async () => {
    setIsLoading(true);
    setHasStarted(true);
    setIsComplete(false);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          difficulty: selectedDifficulty
        })
      });

      if (!response.ok) throw new Error('Failed to retrieve quiz');
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        throw new Error('Malformed quiz schema');
      }
    } catch (err) {
      console.error(err);
      // Fail-safe mock questions
      const fallbacks: Record<SubjectId, QuizQuestion[]> = {
        biology: [
          { id: 1, question: "Identify the semi-autonomous organelle containing its own circular DNA and ribosomes.", options: ["Lysosome", "Mitochondria", "Golgi complex", "Central Vacuole"], correctIndex: 1, explanation: "Mitochondria are thought to have originated from endosymbiotic alpha-proteobacteria, thus retaining unique circular genomes." },
          { id: 2, question: "What is the key difference between passive transport and active membrane transport?", options: ["Active transport travels down gradients", "Active transport consumes metabolic ATP energy", "Passive transport uses specialized sodium pumps", "Passive transport is strictly restricted to plant cells only"], correctIndex: 1, explanation: "Active transport requires metabolic energy (ATP) because it pushes ions counter to natural electrostatic gradients." }
        ],
        physics: [
          { id: 1, question: "If the velocity of an orbiting planet drops below its circular requirement, what happens physically?", options: ["It rockets deeper into outer space", "It falls in a decaying spiral towards the star core", "It maintains its perfect radius", "Its mass inflates"], correctIndex: 1, explanation: "If speed drops, kinetic energy can't withstand gravitations, forcing a gravity sink collapse." }
        ],
        chemistry: [
          { id: 1, question: "Which bond type is characterized by the unequal sharing of valence electrons, creating partial electric poles?", options: ["Nonpolar covalent", "Polar covalent", "Pure metallic", "Ionic transfer"], correctIndex: 1, explanation: "Polar covalent bonding involves unequal division due to electronegativity discrepancies (like in H2O)." }
        ]
      };
      setQuestions(fallbacks[selectedSubject] || fallbacks['biology']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return; // already locked
    setSelectedOption(idx);
    setShowExplanation(true);

    const isCorrect = idx === questions[currentIdx].correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Completed!
      setIsComplete(true);
      onAddScore(selectedSubject.toUpperCase(), score, questions.length);

      // Evaluate badges
      if (score === questions.length) {
        if (selectedSubject === 'biology') onTrackBadge('Cellular Scout 🏆');
        if (selectedSubject === 'physics') onTrackBadge('Cosmic Voyager 🚀');
        if (selectedSubject === 'chemistry') onTrackBadge('Valency Scholar 🧪');
      }
      onTrackBadge('Master Academic');
    }
  };

  return (
    <div id="quiz-hub-panel" className="max-w-2xl mx-auto flex flex-col gap-6">
      
      {/* Quiz setup view */}
      {!hasStarted || isComplete ? (
        <div className="glass-panel p-6 text-center space-y-5">
          <div className="w-14 h-14 bg-violet-500/10 text-violet-400 rounded-full flex items-center justify-center mx-auto border border-violet-500/20">
            <Award className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-xl text-white">
              {isComplete ? 'Academic Evaluation Finished!' : 'STEM Quiz Hub'}
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {isComplete 
                ? `Wonderful! You completed the quiz. You scored ${score} out of ${questions.length} correct answers.`
                : 'Select a custom subject and difficulty tier. Gemini will generate a target set of 5 multiple choice questions.'
              }
            </p>
          </div>

          {/* Results dashboard if completed */}
          {isComplete && (
            <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl max-w-sm mx-auto">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">SCORE REPORT</span>
              <p className="text-4xl font-display font-black text-amber-400">
                {Math.round((score / questions.length) * 100)}%
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">{score} / {questions.length} Correct</p>
            </div>
          )}

          {/* Configuration Form */}
          <div className="space-y-4 pt-2">
            {/* Subject selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block text-left mb-1.5">Learning Subject</label>
              <div className="grid grid-cols-3 gap-2">
                {(['biology', 'physics', 'chemistry'] as SubjectId[]).map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`p-3 rounded-xl border font-bold text-xs capitalize transition ${
                      selectedSubject === subj 
                        ? 'bg-violet-600/20 text-white border-violet-500' 
                        : 'bg-slate-900 text-slate-400 border-slate-805 hover:border-slate-800'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block text-left mb-1.5">Academic Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Beginner', 'Advanced'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedDifficulty === level 
                        ? 'bg-violet-600/20 text-white border-violet-500' 
                        : 'bg-slate-900 text-slate-400 border-slate-805 hover:border-slate-800'
                    }`}
                  >
                    {level} Level
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-extrabold py-3 rounded-xl text-xs transition duration-200 shadow-md active:scale-95"
          >
            {isComplete ? 'Attempt New Quiz' : 'Assemble Quiz (via Gemini)'}
          </button>
        </div>
      ) : isLoading ? (
        // Loading state
        <div className="glass-panel p-10 text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs font-mono font-bold text-slate-300">Formulating custom test questions...</p>
          <p className="text-[11px] text-slate-500 italic max-w-xs mx-auto">
            "Gemini is applying structured JSON response constraints to ensure high educational quality."
          </p>
        </div>
      ) : (
        // Active Quiz Layout
        <div className="glass-panel p-6 space-y-6">
          {/* Header metrics */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="uppercase font-bold">{selectedSubject}</span>
              <span>•</span>
              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">{selectedDifficulty}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400">
                Question <span className="text-white font-bold">{currentIdx + 1}</span> of {questions.length}
              </span>
              <div className="w-[100px] h-1.5 bg-slate-850 rounded-full overflow-hidden">
                <div 
                  className="bg-violet-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-extrabold">QUESTION</span>
            <p className="font-display font-medium text-lg text-slate-100 leading-snug">
              {questions[currentIdx].question}
            </p>
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {questions[currentIdx].options.map((opt, oIdx) => {
              const isLocked = selectedOption !== null;
              const isChosen = selectedOption === oIdx;
              const isCorrectAnswer = oIdx === questions[currentIdx].correctIndex;

              let buttonStyle = 'bg-slate-950/60 border-slate-850 hover:bg-slate-900 hover:border-slate-700 text-slate-200';
              if (isLocked) {
                if (isCorrectAnswer) {
                  buttonStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-300 font-semibold';
                } else if (isChosen) {
                  buttonStyle = 'bg-rose-950/30 border-rose-500 text-rose-300 font-semibold';
                } else {
                  buttonStyle = 'bg-slate-950/20 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={isLocked}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between ${buttonStyle}`}
                >
                  <span className="pr-4">{opt}</span>
                  {isLocked && isCorrectAnswer && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isChosen && !isCorrectAnswer && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Live explanation console */}
          {showExplanation && (
            <div className="bg-slate-80 bg-violet-950/25 border border-violet-800/25 p-4 rounded-xl space-y-2 animate-[fadeIn_0.3s_ease]">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>EXPLANATION ANALYSIS</span>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">{questions[currentIdx].explanation}</p>
              
              <button
                onClick={handleNextQuestion}
                className="mt-3 w-full bg-violet-600 hover:bg-violet-500 text-white font-bold p-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <span>{currentIdx + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
