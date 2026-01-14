
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, PresetPrompt, FileAttachment, GroundingChunk } from '../types';
import { User, Bot, Copy, RotateCcw, Check, Sparkles, Command, ArrowRight, FileText, File, ExternalLink, Globe, UserCheck } from 'lucide-react';
import { MOTION } from '../App';

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  presets: PresetPrompt[];
  onRegenerate?: () => void;
  onPresetClick?: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isTyping, presets, onRegenerate, onPresetClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center overflow-y-auto scrollbar-hide">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: MOTION.ease }} className="relative mb-6 sm:mb-8 shrink-0">
          <div className="absolute inset-0 bg-blue-600 rounded-[2rem] sm:rounded-[2.5rem] blur-[60px] sm:blur-[80px] opacity-20 animate-pulse" />
          <div className="w-20 h-20 sm:w-28 sm:h-28 glass-royal rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center border border-blue-400/40 group shadow-2xl">
            <Bot size={40} className="text-blue-400 sm:size-12 group-hover:scale-110 transition-transform duration-700" />
            <Sparkles size={20} className="absolute -top-3 -right-3 text-blue-300 animate-bounce sm:size-6" />
          </div>
        </motion.div>
        
        <div className="max-w-2xl w-full grid grid-cols-2 gap-2 sm:gap-4 px-1">
          {presets.map((item, idx) => (
            <motion.button 
              key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.05 }}
              onClick={() => onPresetClick?.(item.prompt)}
              className="glass p-3 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] border border-white/5 hover:border-blue-500/40 hover:bg-blue-600/10 transition-all text-left group shadow-lg flex flex-col justify-between h-[100px] sm:h-[140px] relative overflow-hidden"
            >
              <div className="flex flex-col gap-1.5 sm:gap-2 relative z-10">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg glass-royal flex items-center justify-center text-blue-400"><Command size={10} className="sm:size-3" /></div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-blue-400/80 truncate">{item.title}</span>
                </div>
                <p className="text-[10px] sm:text-[13px] text-gray-400 line-clamp-3 group-hover:text-gray-200 leading-snug">{item.prompt}</p>
              </div>
              <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={14} className="text-blue-400 sm:size-4" /></div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-10 scrollbar-hide">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 pb-12">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 sm:gap-6 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl glass-royal border border-blue-500/20 flex items-center justify-center shrink-0 mt-1 shadow-lg"><Bot size={18} className="text-blue-400 sm:size-6" /></div>}
              
              <div className={`group relative max-w-[92%] sm:max-w-[80%] rounded-[1.25rem] sm:rounded-[1.75rem] p-4 sm:p-7 text-[14px] sm:text-[17px] leading-relaxed shadow-xl border ${message.role === 'user' ? 'bg-[#1e40af] text-white rounded-tr-none border-blue-400/30' : 'glass text-gray-200 rounded-tl-none border-white/10'}`}>
                <div className="prose prose-invert prose-blue max-w-none whitespace-pre-wrap tracking-tight font-medium">
                  {message.content}
                </div>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                    {message.attachments.map((att, i) => (
                      <div key={i} className="glass p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 border border-white/10 max-w-[200px] sm:max-w-[240px]">
                        {att.previewUrl ? <img src={att.previewUrl} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover" /> : <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/5 flex items-center justify-center"><File size={16} className="text-blue-400 sm:size-5" /></div>}
                        <div className="flex flex-col min-w-0 pr-1">
                           <span className="text-[10px] sm:text-[11px] font-bold text-white truncate">{att.name}</span>
                           <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest font-bold">{(att.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {message.groundingChunks && message.groundingChunks.length > 0 && (
                   <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-white/5 flex flex-wrap gap-2">
                      <div className="w-full flex items-center gap-1.5 sm:gap-2 mb-1 text-[9px] sm:text-[10px] font-bold text-blue-400 uppercase tracking-widest"><Globe size={10} className="sm:size-3" /> Verified Sources</div>
                      {message.groundingChunks.map((c, i) => c.web && (
                        <a key={i} href={c.web.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 glass rounded-lg border border-white/5 hover:border-blue-500/30 transition-all text-[10px] sm:text-[11px] text-gray-400 hover:text-white group/link">
                          <span className="truncate max-w-[120px] sm:max-w-[140px] font-semibold">{c.web.title}</span>
                          <ExternalLink size={8} className="sm:size-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </a>
                      ))}
                   </div>
                )}

                <div className={`absolute -bottom-8 sm:-bottom-10 flex gap-3 sm:gap-4 opacity-0 group-hover:opacity-100 transition-opacity ${message.role === 'user' ? 'right-1' : 'left-1'}`}>
                  <button onClick={() => copyToClipboard(message.id, message.content)} className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 glass-interactive rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold text-gray-400 hover:text-blue-400 uppercase tracking-[0.1em]">{copiedId === message.id ? <Check size={10} className="sm:size-3 text-green-400" /> : <Copy size={10} className="sm:size-3" />} {copiedId === message.id ? 'Copied' : 'Copy'}</button>
                  {message.role === 'assistant' && <button onClick={onRegenerate} className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 glass-interactive rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold text-gray-400 hover:text-blue-400 uppercase tracking-[0.1em]"><RotateCcw size={10} className="sm:size-3" /> Retry</button>}
                </div>
              </div>

              {message.role === 'user' && <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl glass border border-white/10 flex items-center justify-center shrink-0 mt-1 shadow-lg"><User size={18} className="text-blue-400 sm:size-6" /></div>}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 sm:gap-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl glass-royal border border-blue-500/20 flex items-center justify-center shrink-0 shadow-lg"><Bot size={18} className="text-blue-400 sm:size-6 animate-pulse" /></div>
              <div className="glass px-4 py-3 sm:px-6 sm:py-4 rounded-[1.25rem] sm:rounded-[1.5rem] rounded-tl-none border border-white/10 flex items-center gap-1.5 sm:gap-2">
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full" />
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full" />
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatInterface;
