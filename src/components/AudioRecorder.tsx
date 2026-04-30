import { useState, useRef } from 'react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isAnalyzing: boolean;
}

export function AudioRecorder({ onRecordingComplete, isAnalyzing }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-10 border border-slate-200 rounded-2xl bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-2 opacity-40">
          <Volume2 className="w-4 h-4 text-slate-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Audio Input</span>
        </div>
      </div>

      <div className="flex items-center justify-center w-24 h-24 rounded-full border-4 border-white shadow-inner relative bg-white">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 0.1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 bg-brand-danger rounded-full"
            />
          )}
        </AnimatePresence>
        
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-brand-danger flex items-center justify-center text-white hover:bg-red-600 transition-all z-10 shadow-lg"
          >
            <Square className="w-6 h-6 fill-current" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={isAnalyzing}
            className={cn(
              "w-16 h-16 rounded-full bg-brand-accent flex items-center justify-center text-white hover:bg-indigo-700 transition-all z-10 shadow-lg shadow-indigo-200",
              isAnalyzing && "opacity-50 cursor-not-allowed bg-slate-400 shadow-none"
            )}
          >
            {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6" />}
          </button>
        )}
      </div>

      <div className="text-center space-y-1">
        <p className="text-base font-bold text-slate-800 tracking-tight">
          {isRecording ? 'Capturing Audio Stream...' : isAnalyzing ? 'Verifying Signal Integrity...' : 'Record Voice Snippet'}
        </p>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
          {isRecording ? formatTime(recordingTime) : 'Extract specific segment for detection'}
        </p>
      </div>

      <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              className="h-full bg-brand-danger"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 60, ease: "linear" }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

