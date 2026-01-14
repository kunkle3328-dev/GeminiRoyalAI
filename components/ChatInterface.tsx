
import React, { useEffect, useRef, useState } from 'react';
import { Message, PresetPrompt } from '../types';
import { User, Bot, Copy, RotateCcw, Check, Sparkles, Command, ArrowRight } from 'lucide-react';

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
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in fade-in duration-1000 overflow-y-auto scrollbar-hide">
        <div className="relative mb-6 sm:mb-8 shrink-0">
            <div className="absolute inset-0 bg-blue-600 rounded-[2rem] blur-[60px] opacity-15 animate-pulse" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 glass-royal rounded-[2rem] flex items-center justify-center relative border border-blue-400/30 shadow-2xl transition-all hover:scale-105 duration-700 group cursor-default">
              <Bot size={40} className="sm:size-12 text-blue-400 group-hover:rotate-6 transition-transform duration-500" />
              <Sparkles size={20} className="absolute -top-3 -right-3 text-blue-300 animate-bounce" />
            </div>
        </div>
        
        <div className="max-w-md mx-auto mb-8 sm:mb-10 shrink-0 px-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Gemini Royal</h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed opacity-60">
            Sophisticated, efficient, and precise intelligence.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 max-w-2xl w-full px-2">
          {presets.map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => onPresetClick?.(item.prompt)}
              className="glass p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[2rem] border border-white/5 hover:border-blue-500/40 hover:bg-blue-600/10 transition-all text-left group shadow-lg active:scale-95 flex flex-col justify-between h-[115px] sm:h-[140px]"
            >
              <div className="flex flex-col gap-1.5 overflow-hidden">
                <div className="flex items-center gap-2">
                  <Command size={14} className="opacity-40 group-hover:text-blue-400 transition-colors shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-blue-400/80 transition-colors truncate">
                    {item.title}
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-gray-400 opacity-70 group-hover:opacity-100 transition-opacity leading-snug line-clamp-3">
                  {item.prompt}
                </span>
              </div>
              <div className="flex justify-end w-full">
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-400 shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide">
      <div className="max-w-3xl mx-auto space-y-10 sm:space-y-16">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 sm:gap-6 animate-message ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl glass-royal border border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-2xl mt-1">
                <Bot size={20} className="text-blue-400" />
              </div>
            )}
            
            <div className={`group relative max-w-[88%] sm:max-w-[85%] rounded-[1.5rem] sm:rounded-[2.25rem] p-4 sm:p-7 text-[14.5px] sm:text-[15.5px] leading-relaxed transition-all duration-300 ${
              message.role === 'user' 
                ? 'bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-tr-none shadow-2xl shadow-blue-900/40 border border-blue-500/30' 
                : 'glass text-gray-200 rounded-tl-none border border-white/10 shadow-xl'
            }`}>
              <div className={`prose prose-invert prose-sm max-w-none prose-p:my-1 whitespace-pre-wrap ${
                isTyping && message === messages[messages.length-1] && message.role === 'assistant' 
                  ? 'streaming-cursor' : ''
              }`}>
                {message.content}
              </div>
              
              <div className={`absolute -bottom-9 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                message.role === 'user' ? 'right-2' : 'left-2'
              }`}>
                <button 
                  onClick={() => copyToClipboard(message.id, message.content)}
                  className="flex items-center gap-1.5 px-2 py-1 glass-interactive rounded-lg text-[9px] font-bold text-gray-500 hover:text-blue-400 transition-all uppercase tracking-widest"
                >
                  {copiedId === message.id ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                  <span>{copiedId === message.id ? 'Copied' : 'Copy'}</span>
                </button>
                {message.role === 'assistant' && onRegenerate && (
                  <button 
                    onClick={onRegenerate} 
                    className="flex items-center gap-1.5 px-2 py-1 glass-interactive rounded-lg text-[9px] font-bold text-gray-500 hover:text-blue-400 transition-all uppercase tracking-widest"
                  >
                    <RotateCcw size={10} />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl glass border border-white/10 flex items-center justify-center flex-shrink-0 shadow-2xl mt-1">
                <User size={20} className="text-blue-400" />
              </div>
            )}
          </div>
        ))}
        {isTyping && messages[messages.length-1]?.role === 'user' && (
          <div className="flex gap-3 sm:gap-6 animate-message">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl glass-royal border border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-2xl">
              <Bot size={20} className="text-blue-400" />
            </div>
            <div className="glass border border-white/10 rounded-[1.5rem] sm:rounded-[2.25rem] rounded-tl-none px-5 py-4 flex items-center gap-2 shadow-xl">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce shadow-[0_0_12px_rgba(59,130,246,0.8)]" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce shadow-[0_0_12px_rgba(59,130,246,0.8)]" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce shadow-[0_0_12px_rgba(59,130,246,0.8)]" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
