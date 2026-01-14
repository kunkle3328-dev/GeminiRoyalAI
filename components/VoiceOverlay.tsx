
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, VolumeX, MessageCircle, Sparkles, Activity } from 'lucide-react';
import { PersonalityType, VoiceStatus } from '../types';

interface VoiceOverlayProps {
  onClose: () => void;
  status: VoiceStatus;
  userText: string;
  aiText: string;
  transcript?: { role: 'user' | 'assistant', text: string }[];
  onToggleMute?: (muted: boolean) => void;
  onToggleOutputMute?: (muted: boolean) => void;
  personality?: PersonalityType;
}

const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ 
  onClose, status, userText, aiText, transcript = [], onToggleMute, onToggleOutputMute, personality = 'Professional'
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isOutputMuted, setIsOutputMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [transcript, userText, aiText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width, h = canvas.height;
      const drawLayer = (color: string, amp: number, freq: number, off: number, width: number) => {
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * freq + off) * amp * Math.exp(-Math.pow(x - w / 2, 2) / (w * w / 16));
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };
      const intensity = status === 'speaking' ? 60 : (status === 'listening' ? 25 : 5);
      drawLayer('rgba(59, 130, 246, 0.1)', intensity * 0.4, 0.01, frame * 0.02, 2);
      drawLayer('rgba(59, 130, 246, 0.3)', intensity * 0.8, 0.015, -frame * 0.03, 3);
      drawLayer('#3b82f6', intensity, 0.02, frame * 0.05, 5);
      frame++;
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [status]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] flex flex-col bg-[#070a13]/98 backdrop-blur-3xl overflow-hidden"
    >
      <motion.div 
        animate={{ scale: status === 'speaking' ? [1, 1.1, 1] : 1, opacity: [0.15, 0.25, 0.15] }} 
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/30 blur-[160px] pointer-events-none" 
      />
      
      <header className="p-8 flex justify-between items-center z-10 safe-top">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 glass-royal rounded-2xl flex items-center justify-center border border-blue-500/20"><Sparkles size={24} className="text-blue-400" /></div>
          <div>
             <h2 className="text-lg font-bold text-white tracking-tight">Gemini Royal Live</h2>
             <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'listening' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-blue-500 animate-pulse shadow-[0_0_8px_blue]'}`} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{status} • {personality}</span>
             </div>
          </div>
        </div>
        <button onClick={onClose} className="p-4 glass-interactive rounded-full text-gray-400 hover:text-white transition-all active:scale-90"><X size={28} /></button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 gap-12 z-10 overflow-hidden">
        <div className="w-full flex items-center justify-center max-w-3xl relative">
          <canvas ref={canvasRef} width={1000} height={400} className="w-full h-48 sm:h-64 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-24 h-24 rounded-full glass border border-blue-500/10 flex items-center justify-center"><Activity size={32} className="text-blue-500 opacity-20" /></div>
          </div>
        </div>

        <div ref={scrollRef} className="w-full max-w-2xl h-[30vh] overflow-y-auto scrollbar-hide flex flex-col gap-4 py-8 mask-fade">
          {transcript.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%] ${m.role === 'user' ? 'bg-blue-600/10 text-blue-300 border border-blue-500/10' : 'glass border border-white/5 text-gray-200'}`}>{m.text}</div>
            </motion.div>
          ))}
          {userText && <div className="flex justify-end"><div className="px-5 py-3 rounded-2xl bg-blue-600/20 text-blue-200 text-sm font-medium italic animate-pulse">{userText}</div></div>}
          {aiText && <div className="flex justify-start"><div className="px-6 py-4 rounded-[2rem] glass border border-blue-500/30 text-white text-[16px] font-bold shadow-2xl tracking-tight leading-tight">{aiText}</div></div>}
        </div>
      </div>

      <footer className="p-12 flex flex-col items-center gap-8 z-10 safe-bottom">
        <div className="flex items-center gap-12 sm:gap-16">
          <button onClick={() => { setIsMuted(!isMuted); onToggleMute?.(!isMuted); }} className={`p-6 rounded-full glass-interactive border ${isMuted ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-white/5 text-gray-400'} transition-all hover:scale-110`}>{isMuted ? <MicOff size={28} /> : <Mic size={28} />}</button>
          
          <div className="relative group">
            <div className={`absolute inset-0 bg-blue-500/20 rounded-full blur-3xl scale-[2] transition-opacity duration-1000 ${status === 'speaking' ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`w-24 h-24 rounded-full glass-royal border border-blue-500/40 flex items-center justify-center transition-all duration-500 ${status === 'speaking' ? 'scale-110 shadow-[0_0_50px_rgba(59,130,246,0.5)]' : 'scale-100 shadow-2xl'}`}><Volume2 size={40} className={`text-blue-400 ${status === 'speaking' ? 'animate-pulse' : ''}`} /></div>
          </div>

          <button onClick={() => { setIsOutputMuted(!isOutputMuted); onToggleOutputMute?.(!isOutputMuted); }} className={`p-6 rounded-full glass-interactive border ${isOutputMuted ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-white/5 text-gray-400'} transition-all hover:scale-110`}>{isOutputMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}</button>
        </div>
        <div className="flex items-center gap-2 opacity-30"><MessageCircle size={14} /><span className="text-[10px] font-bold uppercase tracking-[0.3em]">Quantum Link Established</span></div>
      </footer>
    </motion.div>
  );
};

export default VoiceOverlay;
