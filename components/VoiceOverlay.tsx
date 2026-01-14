
import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, MessageCircle } from 'lucide-react';

interface VoiceOverlayProps {
  onClose: () => void;
  status: 'connecting' | 'listening' | 'speaking' | 'idle';
  userText: string;
  aiText: string;
  transcript?: { role: 'user' | 'assistant', text: string }[];
  onToggleMute?: (muted: boolean) => void;
  onToggleOutputMute?: (muted: boolean) => void;
}

const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ 
  onClose, 
  status, 
  userText, 
  aiText, 
  transcript = [],
  onToggleMute,
  onToggleOutputMute
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isOutputMuted, setIsOutputMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, userText, aiText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      
      const drawWave = (color: string, amp: number, freq: number, off: number, lineWidth: number) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * freq + off) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      const baseAmp = status === 'idle' ? 4 : (status === 'speaking' ? 45 : 20);
      
      drawWave('rgba(30, 64, 175, 0.15)', baseAmp * 0.4, 0.012, offset * 0.4, 2);
      drawWave('rgba(59, 130, 246, 0.25)', baseAmp * 0.7, 0.022, -offset * 0.6, 1.5);
      drawWave('#3b82f6', baseAmp, 0.028, offset, 4);

      offset += status === 'idle' ? 0.015 : 0.07;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [status]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    onToggleMute?.(next);
  };

  const toggleOutputMute = () => {
    const next = !isOutputMuted;
    setIsOutputMuted(next);
    onToggleOutputMute?.(next);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center animate-in fade-in duration-500 overflow-hidden safe-top safe-bottom">
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[#0b0f1a]/98 backdrop-blur-3xl" />
      
      {/* Glow Effects */}
      <div className={`absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] transition-all duration-1000 ${
        status === 'listening' ? 'bg-blue-600/15' : 
        status === 'speaking' ? 'bg-indigo-600/25' : 
        'bg-white/5'
      }`} />

      {/* Header Area */}
      <header className="relative w-full flex justify-between items-center z-10 p-6 sm:p-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2.5 border border-white/5">
             <div className={`w-2.5 h-2.5 rounded-full ${
              status === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              status === 'listening' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]' :
              status === 'speaking' ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.7)]' : 'bg-gray-600'
            }`} />
            <span className="text-[11px] font-bold text-gray-200 uppercase tracking-[0.2em]">
              {status}
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 glass-interactive hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
        >
          <X size={22} />
        </button>
      </header>

      {/* Main Content: Waveform & Transcript */}
      <div className="relative flex-1 flex flex-col items-center justify-start w-full max-w-2xl px-6 z-10 overflow-hidden">
        {/* Waveform Area */}
        <div className="w-full shrink-0 flex items-center justify-center py-8">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={200} 
            className="w-full h-32 sm:h-48 opacity-90 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          />
        </div>

        {/* Transcript Area (Chatbox style) */}
        <div className="w-full flex-1 overflow-y-auto scrollbar-hide flex flex-col space-y-4 pb-8 mask-fade">
          {transcript.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20 rounded-tr-none' 
                : 'glass text-gray-300 border border-white/5 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* Active Utterances */}
          {userText && (
            <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
               <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tr-none bg-blue-600/40 text-blue-100 border border-blue-400/30 text-[14px] italic">
                {userText}
              </div>
            </div>
          )}
          {aiText && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
               <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-none glass border border-blue-500/40 text-gray-100 text-[16px] font-medium shadow-2xl">
                {aiText}
              </div>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Controls Footer */}
      <footer className="relative flex flex-col items-center gap-6 p-8 z-10 shrink-0 w-full max-w-lg">
        <div className="flex items-center justify-between w-full">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all glass-interactive hover:scale-110 active:scale-95 ${
              isMuted ? 'text-red-400 border-red-500/40 bg-red-500/5' : 'text-gray-400 border-white/10'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <div className="relative group cursor-pointer" onClick={() => { /* Tap to interrupt handled in App */ }}>
            <div className={`absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${status === 'speaking' ? 'animate-pulse' : ''}`} />
            <div className={`w-20 h-20 sm:w-24 sm:h-24 glass-royal rounded-full flex items-center justify-center text-blue-400 shadow-2xl transition-all border border-blue-500/40 ${
              status === 'speaking' ? 'scale-110' : 'scale-100'
            }`}>
              <Volume2 size={36} className={status === 'speaking' ? 'animate-pulse' : ''} />
            </div>
          </div>

          <button 
            onClick={toggleOutputMute}
            className={`p-4 rounded-full transition-all glass-interactive hover:scale-110 active:scale-95 ${
              isOutputMuted ? 'text-red-400 border-red-500/40 bg-red-500/5' : 'text-gray-400 border-white/10'
            }`}
          >
            {isOutputMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
        
        <div className="flex items-center gap-2 opacity-40">
           <MessageCircle size={12} className="text-blue-400" />
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
             Transcript Active
           </p>
        </div>
      </footer>
      
      <style>{`
        .mask-fade {
          mask-image: linear-gradient(to bottom, transparent 0%, black 10%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%);
        }
      `}</style>
    </div>
  );
};

export default VoiceOverlay;
