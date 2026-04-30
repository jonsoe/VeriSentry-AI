import { useState, useEffect } from 'react';
import { MessageSquare, Mic, Search, Trash2, Shield, Scan, History, AlertTriangle, Lock } from 'lucide-react';
import { analyzeScam, ScamAnalysisResult } from '../services/geminiService';
import { AudioRecorder } from './AudioRecorder';
import { AnalysisResult } from './AnalysisResult';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { saveReport, getReports, SavedReport } from '../services/dbService';

interface ScamAnalyzerProps {
  user: User | null;
}

export function ScamAnalyzer({ user }: ScamAnalyzerProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'audio'>('text');
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  const [history, setHistory] = useState<SavedReport[]>([]);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [user]);

  const loadHistory = async () => {
    const reports = await getReports(5);
    setHistory(reports);
  };

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const analysis = await analyzeScam(textInput);
      setResult(analysis);
      if (user) {
        await saveReport(textInput, 'text', analysis);
        loadHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAudioRecording = async (blob: Blob) => {
    setIsAnalyzing(true);
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      try {
        const analysis = await analyzeScam({
          data: base64Data,
          mimeType: blob.type
        });
        setResult(analysis);
        if (user) {
          await saveReport('Audio Content', 'audio', analysis);
          loadHistory();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    };
  };

  const clearResults = () => {
    setResult(null);
    setTextInput('');
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Scan for Deception</h1>
        <p className="text-slate-500 max-w-2xl text-lg text-balance">
          Analyze suspect messages, voice notes, or job listings to detect deepfake signatures and fraudulent intent.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="space-y-6">
          {/* Main Interaction Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setActiveTab('text')}
                className={cn(
                  "px-8 py-4 text-sm font-bold tracking-wider transition-all border-b-2",
                  activeTab === 'text' 
                    ? "border-brand-accent text-brand-accent bg-white" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                MESSAGE ANALYSIS
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={cn(
                  "px-8 py-4 text-sm font-bold tracking-wider transition-all border-b-2",
                  activeTab === 'audio' 
                    ? "border-brand-accent text-brand-accent bg-white" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                VOICE SNIPPET
              </button>
            </div>

            <div className="p-8 space-y-6">
              {activeTab === 'text' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paste suspicious content</label>
                    {textInput && (
                      <button 
                        onClick={clearResults}
                        className="text-slate-400 hover:text-brand-danger transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
                      >
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter message text here..."
                      className="w-full h-56 bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-700 resize-none focus:outline-none focus:ring-4 focus:ring-brand-accent/5 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    onClick={handleTextAnalysis}
                    disabled={isAnalyzing || !textInput.trim()}
                    className={cn(
                      "w-full py-5 rounded-xl font-black text-sm tracking-[0.1em] transition-all flex items-center justify-center gap-3",
                      isAnalyzing || !textInput.trim() 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                        : "bg-brand-accent text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98]"
                    )}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        RUNNING AI DIAGNOSTIC...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        RUN AI DIAGNOSTIC SCAN
                      </>
                    )}
                  </button>
                  {!user && (
                    <div className="flex items-center gap-2 justify-center py-2 px-4 bg-amber-50 rounded-lg border border-amber-100">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Sign in to save analysis to history</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <AudioRecorder 
                    onRecordingComplete={handleAudioRecording} 
                    isAnalyzing={isAnalyzing} 
                  />
                   {!user && (
                    <div className="flex items-center gap-2 justify-center py-2 px-4 bg-amber-50 rounded-lg border border-amber-100">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Sign in to save analysis to history</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Display */}
          <AnimatePresence mode="wait">
            {result && (
              <AnalysisResult key="result" result={result} />
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 mb-6 font-black uppercase text-[10px] tracking-[0.2em]">
              <History className="w-4 h-4" />
              <h3>Audit History</h3>
            </div>
            
            {!user ? (
              <div className="text-center py-12 px-4 space-y-4 rounded-xl border-2 border-dashed border-slate-100">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">History Encrypted</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Sign in with your secure node to view and manage your scan history.</p>
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 space-y-3 opacity-30">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 mx-auto" />
                <p className="text-[10px] font-bold">NO RECENT SCANS</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl group cursor-pointer hover:border-brand-accent/30 transition-all flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      item.score > 50 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {item.score > 50 ? <AlertTriangle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Scan ID #{item.id.slice(0, 4)}</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{item.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-2 text-brand-accent">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Guard</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Our neural models are tuned to detect emergency impersonation and fraudulent job offer signatures.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
