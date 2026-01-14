
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse, LiveServerMessage, Modality } from '@google/genai';
import { Menu, Send, Mic, Paperclip, ChevronDown, Sparkles, StopCircle, RefreshCw, X, Shield, Volume2, Fingerprint, Settings, Zap, History, Database, User } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import VoiceOverlay from './components/VoiceOverlay';
import { Message, Conversation, MODELS, VOICE_NAMES, VoiceName, PRESET_PROMPTS, PresetPrompt } from './types';
import { encode, decode, decodeAudioData, createBlob } from './services/audioUtils';

const API_KEY = process.env.API_KEY || '';
const VOICE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

const SettingsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  onPurge: () => void;
  historySize: string;
  isNeuralPrivacy: boolean;
  onTogglePrivacy: (val: boolean) => void;
}> = ({ isOpen, onClose, selectedVoice, onVoiceChange, onPurge, historySize, isNeuralPrivacy, onTogglePrivacy }) => {
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300" onClick={onClose} />
      <div className="glass relative w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-visible animate-in zoom-in-95 duration-500">
        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 glass-royal rounded-2xl flex items-center justify-center border border-blue-400/30">
                <Settings size={24} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">System Configuration</h2>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest opacity-60">Elite Access</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 glass hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all active:scale-90">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-5 glass-interactive rounded-3xl border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 glass rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Neural Privacy</h3>
                  <p className="text-[11px] text-gray-500">Auto-wipe chat memory weekly</p>
                </div>
              </div>
              <button 
                onClick={() => onTogglePrivacy(!isNeuralPrivacy)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isNeuralPrivacy ? 'bg-blue-600' : 'bg-white/10'} border border-white/10`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${isNeuralPrivacy ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="relative">
              <div 
                onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                className="p-5 glass-interactive rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 glass rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Vocal Tone</h3>
                    <p className="text-[11px] text-gray-500">Current: {selectedVoice} (Prosody)</p>
                  </div>
                </div>
                <ChevronDown size={18} className={`text-gray-500 transition-transform ${isVoiceDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isVoiceDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#121826] rounded-2xl overflow-hidden z-[210] animate-in fade-in slide-in-from-top-2 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                  {VOICE_NAMES.map((v) => (
                    <button 
                      key={v}
                      onClick={() => { onVoiceChange(v); setIsVoiceDropdownOpen(false); }}
                      className={`w-full text-left p-4 text-sm transition-all hover:bg-blue-600/40 border-b border-white/5 last:border-none ${selectedVoice === v ? 'bg-blue-600/30 text-white font-bold' : 'text-gray-400'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 glass-interactive rounded-3xl border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 glass rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Session History</h3>
                  <p className="text-[11px] text-gray-500">{historySize} cached local data</p>
                </div>
              </div>
              <button 
                onClick={onPurge}
                className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors bg-red-500/10 px-3 py-1.5 rounded-lg active:scale-95"
              >
                Purge
              </button>
            </div>

            <div className="p-6 glass-royal rounded-3xl border border-blue-500/20 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Quantum Health</h3>
                <Zap size={14} className="text-blue-400 animate-pulse" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium">Core Connection</span>
                <span className="text-green-400 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                  STABLE
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-10 py-5 glass-royal text-white text-sm font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl tracking-widest uppercase"
          >
            Synchronize Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Zephyr');
  const [isNeuralPrivacy, setIsNeuralPrivacy] = useState(false);
  const [currentPresets, setCurrentPresets] = useState<PresetPrompt[]>([]);
  
  const [isVoiceOverlayVisible, setIsVoiceOverlayVisible] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'connecting' | 'listening' | 'speaking' | 'idle'>('idle');
  const [userSpeechText, setUserSpeechText] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesSetRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  const isMutedRef = useRef(false);
  const isOutputMutedRef = useRef(false);

  // Initialize presets randomly on launch
  useEffect(() => {
    const shuffled = [...PRESET_PROMPTS].sort(() => 0.5 - Math.random());
    setCurrentPresets(shuffled.slice(0, 4));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('gemini_royal_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) setCurrentId(parsed[0].id);
      } catch (e) { console.error(e); }
    }
    const savedVoice = localStorage.getItem('gemini_royal_voice');
    if (savedVoice) setSelectedVoice(savedVoice as VoiceName);
    
    const savedPrivacy = localStorage.getItem('gemini_royal_privacy');
    if (savedPrivacy) setIsNeuralPrivacy(savedPrivacy === 'true');
  }, []);

  useEffect(() => {
    if (!isNeuralPrivacy) {
      localStorage.setItem('gemini_royal_v4', JSON.stringify(conversations));
    }
  }, [conversations, isNeuralPrivacy]);

  const handleVoiceChange = (v: VoiceName) => {
    setSelectedVoice(v);
    localStorage.setItem('gemini_royal_voice', v);
  };

  const handleTogglePrivacy = (val: boolean) => {
    setIsNeuralPrivacy(val);
    localStorage.setItem('gemini_royal_privacy', val.toString());
    if (val) {
      // If privacy enabled, we might want to inform the user that history won't be saved henceforth.
      console.log("Neural Privacy Enabled: Conversations will not be persisted to local storage.");
    }
  };

  const handlePurgeHistory = () => {
    if (confirm("Are you sure you want to purge all session history? This cannot be undone.")) {
      setConversations([]);
      setCurrentId(null);
      localStorage.removeItem('gemini_royal_v4');
      setIsSettingsOpen(false);
    }
  };

  const getHistorySize = () => {
    const size = JSON.stringify(conversations).length;
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  const currentChat = conversations.find(c => c.id === currentId);

  const handleNewChat = useCallback(() => {
    const id = Date.now().toString();
    const newChat: Conversation = {
      id,
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    };
    setConversations(prev => [newChat, ...prev]);
    setCurrentId(id);
    return id;
  }, []);

  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, retryMessage?: string) => {
    if (e) e.preventDefault();
    const textToSend = retryMessage || inputValue;
    if (!textToSend.trim() || isTyping) return;

    let targetId = currentId;
    if (!targetId) {
      targetId = handleNewChat();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now()
    };

    setConversations(prev => prev.map(c => 
      c.id === targetId 
        ? { 
            ...c, 
            messages: [...c.messages, userMessage], 
            updatedAt: Date.now(),
            title: c.messages.length === 0 ? textToSend.substring(0, 30) : c.title 
          }
        : c
    ));

    if (!retryMessage) setInputValue('');
    setIsTyping(true);
    abortControllerRef.current = new AbortController();

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const currentMessages = conversations.find(c => c.id === targetId)?.messages || [];
      const history = currentMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const stream = await ai.models.generateContentStream({
        model: selectedModelId,
        contents: [...history, { role: 'user', parts: [{ text: userMessage.content }] }],
        config: { temperature: 0.7 }
      });

      let fullResponse = '';
      const assistantId = (Date.now() + 1).toString();

      setConversations(prev => prev.map(c => 
        c.id === targetId 
          ? { ...c, messages: [...c.messages, { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() }] }
          : c
      ));

      for await (const chunk of stream) {
        if (abortControllerRef.current?.signal.aborted) break;
        fullResponse += chunk.text;
        setConversations(prev => prev.map(c => 
          c.id === targetId 
            ? { ...c, messages: c.messages.map(m => m.id === assistantId ? { ...m, content: fullResponse } : m) }
            : c
        ));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat error:', err);
        const errorMsg: Message = { id: Date.now().toString(), role: 'assistant', content: "Neural handshake failed. Verify connection or key.", timestamp: Date.now() };
        setConversations(prev => prev.map(c => c.id === targetId ? { ...c, messages: [...c.messages, errorMsg] } : c));
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleRefresh = () => {
    if (!currentId) return;
    setConversations(prev => prev.map(c => c.id === currentId ? { ...c, messages: [] } : c));
    setIsTyping(false);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    // Cycle presets on refresh too for extra variety
    const shuffled = [...PRESET_PROMPTS].sort(() => 0.5 - Math.random());
    setCurrentPresets(shuffled.slice(0, 4));
  };

  const handleRegenerate = () => {
    if (!currentChat || currentChat.messages.length === 0) return;
    const lastUserMsg = [...currentChat.messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      setConversations(prev => prev.map(c => c.id === currentId ? { ...c, messages: c.messages.slice(0, -1) } : c));
      handleSendMessage(undefined, lastUserMsg.content);
    }
  };

  const handleDeleteChat = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentId === id) setCurrentId(null);
  };

  const stopVoiceMode = useCallback(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close?.();
      liveSessionRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close().catch(console.error);
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close().catch(console.error);
      outputAudioContextRef.current = null;
    }
    sourcesSetRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    sourcesSetRef.current.clear();
    setIsVoiceOverlayVisible(false);
    setVoiceStatus('idle');
    setVoiceTranscript([]);
  }, []);

  const handleToggleMute = (muted: boolean) => {
    isMutedRef.current = muted;
  };

  const handleToggleOutputMute = (muted: boolean) => {
    isOutputMutedRef.current = muted;
    if (outputGainNodeRef.current) {
      outputGainNodeRef.current.gain.value = muted ? 0 : 1;
    }
  };

  const startVoiceMode = async () => {
    if (isVoiceOverlayVisible) { stopVoiceMode(); return; }
    setIsVoiceOverlayVisible(true);
    setVoiceStatus('connecting');
    setUserSpeechText('');
    setAiSpeechText('');
    setVoiceTranscript([]);

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const outputGain = outputCtx.createGain();
      outputGain.connect(outputCtx.destination);
      outputGain.gain.value = isOutputMutedRef.current ? 0 : 1;
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      outputGainNodeRef.current = outputGain;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: VOICE_MODEL,
        callbacks: {
          onopen: () => {
            setVoiceStatus('listening');
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMutedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (m: LiveServerMessage) => {
            if (m.serverContent?.inputTranscription) {
              const text = m.serverContent.inputTranscription.text;
              setUserSpeechText(text);
              setVoiceStatus('listening');
            }
            if (m.serverContent?.outputTranscription) {
              const text = m.serverContent.outputTranscription.text;
              setAiSpeechText(prev => prev + text);
              setVoiceStatus('speaking');
            }
            const audioData = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputGain);
              source.addEventListener('ended', () => sourcesSetRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesSetRef.current.add(source);
            }
            if (m.serverContent?.interrupted) {
              sourcesSetRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesSetRef.current.clear();
              nextStartTimeRef.current = 0;
              setAiSpeechText('');
            }
            if (m.serverContent?.turnComplete) {
              setVoiceStatus('idle');
              if (userSpeechText || aiSpeechText) {
                setVoiceTranscript(prev => [
                  ...prev, 
                  { role: 'user', text: userSpeechText },
                  { role: 'assistant', text: aiSpeechText }
                ].filter(t => t.text.trim().length > 0));
              }
              setUserSpeechText('');
              setAiSpeechText('');
            }
          },
          onerror: (e) => { console.error(e); stopVoiceMode(); },
          onclose: () => stopVoiceMode()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are Gemini Royal. Flagship system. Professional, efficient, and precise. Speak in a sophisticated, clear, and direct royal tone.'
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) { stopVoiceMode(); }
  };

  return (
    <div className="flex h-screen text-gray-100 overflow-hidden font-sans select-none bg-bg-dark">
      <Sidebar 
        conversations={conversations}
        currentId={currentId}
        isOpen={isSidebarOpen}
        onNewChat={handleNewChat}
        onSelectChat={setCurrentId}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onClose={() => setIsSidebarOpen(false)}
        selectedModelId={selectedModelId}
        onModelChange={setSelectedModelId}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative h-full">
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-white/5 z-20 glass sticky top-0 safe-top">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 glass-interactive rounded-xl md:hidden text-gray-300 transition-all active:scale-90"
            >
              <Menu size={22} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Gemini Royal <Sparkles size={16} className="text-blue-400 animate-pulse" />
              </h1>
              <span className="hidden sm:inline text-[10px] text-blue-500 font-extrabold uppercase tracking-[0.25em] opacity-80 leading-none mt-0.5">
                Quantum System
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
             <button 
              onClick={handleRefresh}
              title="Refresh Neural Interface"
              className="p-2 glass-interactive rounded-xl text-gray-400 hover:text-blue-400 active:rotate-180 duration-700 shadow-lg"
             >
                <RefreshCw size={18} />
             </button>
             <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 glass-interactive rounded-xl text-gray-400 hover:text-blue-400 shadow-lg"
             >
                <Fingerprint size={18} />
             </button>
          </div>
        </header>

        <ChatInterface 
          messages={currentChat?.messages || []}
          isTyping={isTyping}
          presets={currentPresets}
          onRegenerate={handleRegenerate}
          onPresetClick={(text) => handleSendMessage(undefined, text)}
        />

        <div className="px-4 pb-4 sm:pb-10 z-20 relative safe-bottom">
          <div className="max-w-3xl mx-auto">
             {isTyping && (
               <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex justify-center w-full">
                  <button 
                    onClick={handleStopGeneration}
                    className="flex items-center gap-2 px-5 py-2 glass rounded-full text-[10px] font-bold text-gray-300 hover:text-red-400 border border-white/10 transition-all hover:scale-105 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-2"
                  >
                    <StopCircle size={14} /> ABORT SEQUENCE
                  </button>
               </div>
             )}

            <form 
              onSubmit={handleSendMessage}
              className="relative glass rounded-[1.75rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl transition-all duration-700 focus-within:ring-2 focus-within:ring-blue-500/30 p-1.5 sm:p-2.5 flex items-end gap-1.5 sm:gap-3 group/input"
            >
              <button 
                type="button" 
                className="p-2.5 sm:p-4 text-gray-500 hover:text-blue-400 hover:bg-white/5 rounded-full transition-all active:scale-90"
              >
                <Paperclip size={20} />
              </button>
              
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask anything..."
                className="flex-1 max-h-32 sm:max-h-48 min-h-[44px] sm:min-h-[48px] py-3 sm:py-4 bg-transparent border-none focus:ring-0 resize-none scrollbar-hide text-[15px] sm:text-[17px] leading-relaxed text-white placeholder-gray-600"
                rows={1}
              />

              <div className="flex gap-1 sm:gap-2 pr-1 sm:pr-1.5 pb-0.5">
                <button 
                  type="button"
                  onClick={startVoiceMode}
                  className="p-2.5 sm:p-4 text-gray-500 hover:text-blue-400 hover:bg-white/5 rounded-full transition-all active:scale-90"
                >
                  <Mic size={22} />
                </button>
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className={`p-2.5 sm:p-4 rounded-full transition-all duration-700 shadow-2xl ${
                    inputValue.trim() && !isTyping 
                      ? 'glass-royal text-white hover:scale-105 active:scale-90 border-blue-400/40' 
                      : 'bg-white/5 text-gray-700'
                  }`}
                >
                  <Send size={22} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {isVoiceOverlayVisible && (
          <VoiceOverlay 
            onClose={stopVoiceMode}
            status={voiceStatus}
            userText={userSpeechText}
            aiText={aiSpeechText}
            transcript={voiceTranscript}
            onToggleMute={handleToggleMute}
            onToggleOutputMute={handleToggleOutputMute}
          />
        )}
        
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          selectedVoice={selectedVoice}
          onVoiceChange={handleVoiceChange}
          onPurge={handlePurgeHistory}
          historySize={getHistorySize()}
          isNeuralPrivacy={isNeuralPrivacy}
          onTogglePrivacy={handleTogglePrivacy}
        />
      </main>
    </div>
  );
};

export default App;
