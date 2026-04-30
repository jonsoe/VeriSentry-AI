import { ScamAnalysisResult } from '../services/geminiService';
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface AnalysisResultProps {
  result: ScamAnalysisResult;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const getRiskDetails = () => {
    switch (result.riskLevel) {
      case 'CRITICAL':
        return {
          textColor: 'text-red-400',
          borderColor: 'border-red-500/30',
          bgColor: 'bg-red-500/20',
          label: 'CRITICAL',
          progressColor: 'text-red-500',
          indicatorColor: 'bg-red-500'
        };
      case 'HIGH':
        return {
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          bgColor: 'bg-amber-500/20',
          label: 'HIGH RISK',
          progressColor: 'text-amber-500',
          indicatorColor: 'bg-amber-500'
        };
      case 'MEDIUM':
        return {
          textColor: 'text-orange-400',
          borderColor: 'border-orange-500/30',
          bgColor: 'bg-orange-500/20',
          label: 'SUSPICIOUS',
          progressColor: 'text-orange-500',
          indicatorColor: 'bg-orange-500'
        };
      default:
        return {
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          bgColor: 'bg-emerald-500/20',
          label: 'SECURE',
          progressColor: 'text-emerald-500',
          indicatorColor: 'bg-emerald-500'
        };
    }
  };

  const details = getRiskDetails();
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (result.score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-dark rounded-2xl p-8 text-white shadow-2xl flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Risk Assessment</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Diagnostic Report v4.0.1</p>
        </div>
        <span className={cn(
          "px-3 py-1 border rounded text-[10px] font-black tracking-[0.2em] uppercase transition-colors",
          details.borderColor, details.textColor, details.bgColor
        )}>
          {details.label}
        </span>
      </div>

      {/* Sentry Score Dial */}
      <div className="flex flex-col items-center justify-center py-8 mb-8 border-y border-slate-800">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="88" cy="88" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
            <motion.circle
              cx="88" cy="88" r={radius}
              stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              className={details.progressColor}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
            <span className="text-5xl font-black text-white">{result.score}%</span>
            <span className="text-[10px] uppercase text-slate-400 font-black tracking-widest mt-1">Deception</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 flex-1">
        {/* Indicators */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center md:text-left">Threat Indicators</h3>
          <div className="space-y-2">
            {result.reasons.map((reason, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 group hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", details.indicatorColor)} />
                  <span className="text-xs text-slate-300 font-medium">{reason}</span>
                </div>
                <span className={cn("text-[10px] font-mono shrink-0", details.textColor)}>MATCH</span>
              </div>
            ))}
          </div>
        </div>

        {/* Protocol */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center md:text-left">Safety Protocol</h3>
          <div className="grid gap-2">
            {result.tips.map((tip, i) => (
              <div key={i} className="flex gap-3 text-xs text-slate-400 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                <ShieldCheck className="w-4 h-4 text-brand-success shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 italic text-slate-400 text-xs leading-relaxed text-center">
          "{result.summary}"
        </div>
        <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-black tracking-widest transition-all uppercase">
          Download Analysis Log
        </button>
      </div>
    </motion.div>
  );
}

