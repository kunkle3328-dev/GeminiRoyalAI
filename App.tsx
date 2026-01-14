
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, GenerateContentResponse, LiveServerMessage, Modality } from '@google/genai';
import { Menu, Send, Mic, Paperclip, ChevronDown, Sparkles, StopCircle, RefreshCw, X, Shield, Volume2, Fingerprint, Settings, Zap, History, Database, User, FileText, File, Image as ImageIcon, Plus, Search, Code, Globe, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import VoiceOverlay from './components/VoiceOverlay';
import { Message, Conversation, MODELS, VOICE_NAMES, VoiceName, PRESET_PROMPTS, PresetPrompt, PERSONALITIES, PersonalityType, FileAttachment, AppMode, VoiceStatus } from './types';
import { encode, decode, decodeAudioData, createBlob } from './services/audioUtils';

// Constants for configuration
const VOICE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

export const MOTION = {
  fast: 0.15,
  base: 0.22,
  slow: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

const SettingsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  personality: PersonalityType;
  onPersonalityChange: (p: PersonalityType) => void;
  onPurge: () => void;
  historySize: string;
  isNeuralPrivacy: boolean;
  onTogglePrivacy: (val: boolean) => void;
}> = ({ isOpen, onClose, selectedVoice, onVoiceChange, personality, onPersonalityChange, onPurge, historySize, isNeuralPrivacy, onTogglePrivacy }) => {
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [isPersonalityDropdownOpen, setIsPersonalityDropdownOpen] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: MOTION.base, ease: MOTION.ease }}
        className="glass relative w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-visible overflow-y-auto max-h-[90vh]"
      >
        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 glass-royal rounded-2xl flex items-center justify-center border border-blue-400/30">
                <Settings size={24} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Configuration</h2>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest opacity-60">System Core</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 glass-interactive rounded-full text-gray-400 hover:text-white transition-all">
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
                  <p className="text-[11px] text-gray-500">Volatile memory management</p>
                </div>
              </div>
              <button 
                onClick={() => onTogglePrivacy(!isNeuralPrivacy)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isNeuralPrivacy ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-white/10'} border border-white/10`}
              >
                <motion.div 
                  animate={{ x: isNeuralPrivacy ? 22 : 2 }}
                  className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg" 
                />
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => { setIsVoiceDropdownOpen(!isVoiceDropdownOpen); setIsPersonalityDropdownOpen(false); }}
                className="w-full p-5 glass-interactive rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 glass rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                    <Volume2 size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white">Vocal Signature</h3>
                    <p className="text-[11px] text-gray-500">{selectedVoice}</p>
                  </div>
                </div>
                <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${isVoiceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isVoiceDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-[#0e1628] rounded-2xl overflow-hidden z-[410] border border-white/10 shadow-2xl"
                  >
                    {VOICE_NAMES.map((v) => (
                      <button 
                        key={v}
                        onClick={() => { onVoiceChange(v); setIsVoiceDropdownOpen(false); }}
                        className={`w-full text-left p-4 text-sm transition-all hover:bg-blue-600/40 border-b border-white/5 last:border-none ${selectedVoice === v ? 'bg-blue-600/30 text-white font-bold' : 'text-gray-400'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => { setIsPersonalityDropdownOpen(!isPersonalityDropdownOpen); setIsVoiceDropdownOpen(false); }}
                className="w-full p-5 glass-interactive rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 glass rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                    <Fingerprint size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white">Personality Core</h3>
                    <p className="text-[11px] text-gray-500">{personality}</p>
                  </div>
                </div>
                <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${isPersonalityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isPersonalityDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-[#0e1628] rounded-2xl overflow-hidden z-[410] border border-white/10 shadow-2xl"
                  >
                    {PERSONALITIES.map((p) => (
                      <button 
                        key={p}
                        onClick={() => { onPersonalityChange(p); setIsPersonalityDropdownOpen(false); }}
                        className={`w-full text-left p-4 text-sm transition-all hover:bg-blue-600/40 border-b border-white/5 last:border-none ${personality === p ? 'bg-blue-600/30 text-white font-bold' : 'text-gray-400'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-5 glass-interactive rounded-3xl border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 glass rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">History Cache</h3>
                  <p className="text-[11px] text-gray-500">{historySize}</p>
                </div>
              </div>
              <button onClick={onPurge} className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors bg-red-500/10 px-3 py-1.5 rounded-lg active:scale-95">
                Purge
              </button>
            </div>
          </div>

          <button onClick={onClose} className="w-full mt-10 py-5 glass-royal text-white text-sm font-bold rounded-2xl hover:scale-[1.01] active:scale-98 transition-all shadow-xl tracking-widest uppercase">
            Synchronize
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const App: React.FC = () => {
  // --- STATE ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Configuration
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Zephyr');
  const [personality, setPersonality] = useState<PersonalityType>('Professional');
  const [isNeuralPrivacy, setIsNeuralPrivacy] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Attachments & Tools
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isCodeReviewEnabled, setIsCodeReviewEnabled] = useState(false);
  
  // Voice Runtime
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [userSpeechText, setUserSpeechText] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  
  // UI Helpers
  const [currentPresets, setCurrentPresets] = useState<PresetPrompt[]>([]);

  // --- REFS ---
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputDuckingGainRef = useRef<GainNode | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesSetRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceWatchdogRef = useRef<number | null>(null);
  const isMutedRef = useRef(false);

  // Noise Immunity Logic Refs
  const vadConfidenceRef = useRef(0);
  const speechIntentLockRef = useRef({ isArmed: false, lastHumanSpeechTs: 0 });
  const isProcessingRef = useRef(false);

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('gemini_royal_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) setCurrentId(parsed[0].id);
      } catch (e) { console.error(e); }
    }
    const savedConfig = localStorage.getItem('gemini_royal_config');
    if (savedConfig) {
      try {
        const c = JSON.parse(savedConfig);
        setSelectedVoice(c.voice || 'Zephyr');
        setPersonality(c.personality || 'Professional');
        setIsNeuralPrivacy(c.privacy || false);
        setSelectedModelId(c.model || MODELS[0].id);
      } catch (e) {}
    }
    const shuffled = [...PRESET_PROMPTS].sort(() => 0.5 - Math.random());
    setCurrentPresets(shuffled.slice(0, 4));
  }, []);

  useEffect(() => {
    if (!isNeuralPrivacy) localStorage.setItem('gemini_royal_v5', JSON.stringify(conversations));
    else localStorage.removeItem('gemini_royal_v5');
  }, [conversations, isNeuralPrivacy]);

  useEffect(() => {
    localStorage.setItem('gemini_royal_config', JSON.stringify({ voice: selectedVoice, personality, privacy: isNeuralPrivacy, model: selectedModelId }));
  }, [selectedVoice, personality, isNeuralPrivacy, selectedModelId]);

  // --- VOICE WATCHDOG ---
  useEffect(() => {
    if (appMode === 'voice') {
      voiceWatchdogRef.current = window.setInterval(() => {
        // Recovery logic if stuck in idle but overlay is up
        if (voiceStatus === 'idle' && appMode === 'voice') {
          console.debug('[Runtime Watchdog] Recovering session to ARMED');
          setVoiceStatus('armed');
        }
      }, 500);
    } else {
      if (voiceWatchdogRef.current) clearInterval(voiceWatchdogRef.current);
    }
    return () => { if (voiceWatchdogRef.current) clearInterval(voiceWatchdogRef.current); };
  }, [appMode, voiceStatus]);

  // --- HANDLERS ---
  const handleNewChat = useCallback(() => {
    const id = Date.now().toString();
    const newChat: Conversation = { id, title: 'New Conversation', messages: [], updatedAt: Date.now() };
    setConversations(prev => [newChat, ...prev]);
    setCurrentId(id);
    return id;
  }, []);

  const handleRefresh = useCallback(() => {
    // Reshuffle presets from the 30 available prompts
    const shuffled = [...PRESET_PROMPTS].sort(() => 0.5 - Math.random());
    setCurrentPresets(shuffled.slice(0, 4));

    // If there is an active conversation, clear its messages to start fresh
    if (currentId) {
      setConversations(prev => prev.map(c => 
        c.id === currentId ? { ...c, messages: [] } : c
      ));
    }
  }, [currentId]);

  const handleSendMessage = async (e?: React.FormEvent, presetPrompt?: string) => {
    if (e) e.preventDefault();
    const content = presetPrompt || inputValue;
    if ((!content.trim() && attachments.length === 0) || isTyping) return;

    let targetId = currentId || handleNewChat();
    const currentAtts = [...attachments];
    setAttachments([]);
    if (!presetPrompt) setInputValue('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now(), attachments: currentAtts };
    setConversations(prev => prev.map(c => 
      c.id === targetId 
        ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now(), title: c.messages.length === 0 ? content.substring(0, 40) : c.title }
        : c
    ));

    setIsTyping(true);
    abortControllerRef.current = new AbortController();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentMessages = conversations.find(c => c.id === targetId)?.messages || [];
      const history = currentMessages.flatMap(m => {
        const parts: any[] = [{ text: m.content }];
        m.attachments?.forEach(att => parts.push(att.type.startsWith('image/') ? { inlineData: { data: att.data, mimeType: att.type } } : { text: `[File: ${att.name}]\n${att.data}` }));
        return { role: m.role === 'assistant' ? 'model' : 'user', parts };
      });

      const nextParts: any[] = [{ text: content }];
      currentAtts.forEach(att => nextParts.push(att.type.startsWith('image/') ? { inlineData: { data: att.data, mimeType: att.type } } : { text: `[File: ${att.name}]\n${att.data}` }));

      let systemPrompt = `You are Gemini Royal. Personality: ${personality}.`;
      if (isCodeReviewEnabled) systemPrompt += `\nCRITICAL: CODE REVIEW MODE. Provide rigorous architectural/security feedback.`;

      const config: any = { systemInstruction: systemPrompt, temperature: 0.7 };
      if (isSearchEnabled) config.tools = [{ googleSearch: {} }];

      const stream = await ai.models.generateContentStream({ model: selectedModelId, contents: [...history, { role: 'user', parts: nextParts }], config });

      let fullResponse = '';
      const assistantId = (Date.now() + 1).toString();
      setConversations(prev => prev.map(c => c.id === targetId ? { ...c, messages: [...c.messages, { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() }] } : c));

      for await (const chunk of stream) {
        if (abortControllerRef.current?.signal.aborted) break;
        fullResponse += chunk.text;
        const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        setConversations(prev => prev.map(c => 
          c.id === targetId 
            ? { ...c, messages: c.messages.map(m => m.id === assistantId ? { ...m, content: fullResponse, groundingChunks: chunks } : m) } 
            : c
        ));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error(err);
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const startVoiceMode = async () => {
    if (appMode === 'voice') return stopVoiceMode();
    setAppMode('voice');
    setVoiceStatus('armed'); // Initial state: ARMED
    speechIntentLockRef.current.isArmed = true; 

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      
      // Layer 1 & 4: Hardware Front-end & Ducking
      const inputDuckingGain = inputCtx.createGain();
      inputDuckingGain.gain.value = 1.0;
      inputDuckingGainRef.current = inputDuckingGain;

      const hpFilter = inputCtx.createBiquadFilter();
      hpFilter.type = 'highpass'; hpFilter.frequency.value = 85;

      const lpFilter = inputCtx.createBiquadFilter();
      lpFilter.type = 'lowpass'; lpFilter.frequency.value = 7500;

      const outputGain = outputCtx.createGain();
      outputGain.connect(outputCtx.destination);
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      outputGainNodeRef.current = outputGain;

      // Audio Constraints for Noise Suppression/Echo Cancellation
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          noiseSuppression: true, 
          echoCancellation: true, 
          autoGainControl: true,
          sampleRate: 16000 
        } 
      });

      const sessionPromise = ai.live.connect({
        model: VOICE_MODEL,
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
            const analyser = inputCtx.createAnalyser();
            analyser.fftSize = 512;
            const freqData = new Uint8Array(analyser.frequencyBinCount);

            // Audio Graph: Source -> Ducking -> filters -> processor/analyser
            source.connect(inputDuckingGain);
            inputDuckingGain.connect(hpFilter);
            hpFilter.connect(lpFilter);
            lpFilter.connect(scriptProcessor);
            lpFilter.connect(analyser);
            scriptProcessor.connect(inputCtx.destination);

            let silenceStart = 0;
            let speechStart = 0;

            scriptProcessor.onaudioprocess = (e) => { 
              if (isMutedRef.current || isProcessingRef.current) return;

              // Layer 2: Neural-like VAD Gating (Heuristic)
              analyser.getByteFrequencyData(freqData);
              // Focus on vocal formants (300Hz - 3400Hz)
              // 16000Hz SR / 512 bins = 31.25Hz per bin. 
              // 300Hz is bin 10, 3400Hz is bin 108 approx.
              let vocalEnergy = 0;
              for(let i = 10; i < 110; i++) vocalEnergy += freqData[i];
              vocalEnergy /= 100;
              
              const currentRms = vocalEnergy / 255;
              const hasSpeechFormants = vocalEnergy > 45; // Threshold for vocal presence
              
              if (hasSpeechFormants) {
                vadConfidenceRef.current = Math.min(1.0, vadConfidenceRef.current + 0.1);
                silenceStart = 0;
                if (speechStart === 0) speechStart = Date.now();
              } else {
                vadConfidenceRef.current = Math.max(0, vadConfidenceRef.current - 0.05);
                if (silenceStart === 0) silenceStart = Date.now();
                speechStart = 0;
              }

              const now = Date.now();
              // Transition: ARMED -> LISTENING
              if (voiceStatus === 'armed' && vadConfidenceRef.current > 0.7 && (now - speechStart > 300)) {
                setVoiceStatus('listening');
              }

              // Transition: LISTENING -> PROCESSING
              if (voiceStatus === 'listening' && silenceStart !== 0 && (now - silenceStart > 600)) {
                 setVoiceStatus('processing');
                 isProcessingRef.current = true;
              }

              // Layer 3: Speech Intent Lock Check
              if (voiceStatus === 'listening' || (voiceStatus === 'armed' && vadConfidenceRef.current > 0.4)) {
                sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(e.inputBuffer.getChannelData(0)) })); 
              }
            };
          },
          onmessage: async (m: LiveServerMessage) => {
            if (m.serverContent?.inputTranscription) setUserSpeechText(m.serverContent.inputTranscription.text);
            if (m.serverContent?.outputTranscription) { 
              setAiSpeechText(prev => prev + m.serverContent.outputTranscription.text); 
            }
            
            const audioData = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              // Transition: LISTENING/PROCESSING -> SPEAKING
              setVoiceStatus('speaking');
              isProcessingRef.current = false;
              
              // Layer 4: AI Output Ducking (Duck input by -18dB approx)
              if (inputDuckingGainRef.current) inputDuckingGainRef.current.gain.setTargetAtTime(0.12, inputAudioContextRef.current!.currentTime, 0.05);

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer; source.connect(outputGain);
              source.addEventListener('ended', () => {
                sourcesSetRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesSetRef.current.add(source);
            }

            if (m.serverContent?.interrupted) { 
              sourcesSetRef.current.forEach(s => { try { s.stop(); } catch(e) {} }); 
              setAiSpeechText(''); 
              setVoiceStatus('armed');
              isProcessingRef.current = false;
              if (inputDuckingGainRef.current) inputDuckingGainRef.current.gain.setTargetAtTime(1.0, inputAudioContextRef.current!.currentTime, 0.1);
            }

            if (m.serverContent?.turnComplete) { 
              // Transition: SPEAKING -> ARMED (Reset Loop)
              setTimeout(() => {
                if (appMode === 'voice') {
                  setVoiceStatus('armed');
                  isProcessingRef.current = false;
                  // Restore input gain
                  if (inputDuckingGainRef.current) inputDuckingGainRef.current.gain.setTargetAtTime(1.0, inputAudioContextRef.current!.currentTime, 0.2);
                }
              }, 300);

              if (userSpeechText || aiSpeechText) setVoiceTranscript(prev => [...prev, { role: 'user', text: userSpeechText }, { role: 'assistant', text: aiSpeechText }].filter(t => t.text.trim()));
              setUserSpeechText(''); setAiSpeechText('');
            }
          },
          onclose: () => { if (appMode === 'voice') stopVoiceMode(); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
          inputAudioTranscription: {}, outputAudioTranscription: {},
          systemInstruction: `Sophisticated royal system. Personality: ${personality}. Noise immunity enabled. Intent Lock active.`
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) { stopVoiceMode(); }
  };

  const stopVoiceMode = useCallback(() => {
    if (liveSessionRef.current) try { liveSessionRef.current.close?.(); } catch(e) {}
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    sourcesSetRef.current.forEach(s => { try { s.stop(); } catch (e) {} });
    setAppMode('chat');
    setVoiceStatus('idle');
    isProcessingRef.current = false;
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAtts: FileAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const p = new Promise<FileAttachment>((res) => {
        reader.onload = (ev) => {
          const r = ev.target?.result as string;
          res({ name: file.name, type: file.type, size: file.size, data: r.split(',')[1] || r, previewUrl: file.type.startsWith('image/') ? r : undefined });
        };
        if (file.type.startsWith('image/') || file.type === 'application/pdf') reader.readAsDataURL(file);
        else reader.readAsText(file);
      });
      newAtts.push(await p);
    }
    setAttachments(prev => [...prev, ...newAtts]);
    setIsPlusMenuOpen(false);
  };

  const getHistorySize = useMemo(() => {
    const s = JSON.stringify(conversations).length;
    return s < 1024 ? s + ' B' : (s / 1024).toFixed(1) + ' KB';
  }, [conversations]);

  return (
    <div className="flex h-screen text-gray-100 overflow-hidden font-sans bg-bg-dark safe-top safe-bottom">
      <Sidebar 
        conversations={conversations} currentId={currentId} isOpen={isSidebarOpen} 
        onNewChat={handleNewChat} onSelectChat={setCurrentId} onDeleteChat={(id) => setConversations(prev => prev.filter(c => c.id !== id))}
        onRenameChat={(id, t) => setConversations(prev => prev.map(c => c.id === id ? { ...c, title: t } : c))}
        onClose={() => setIsSidebarOpen(false)} selectedModelId={selectedModelId} onModelChange={setSelectedModelId}
      />
      
      <main className="flex-1 flex flex-col relative h-full">
        <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-8 border-b border-white/5 z-[200] glass">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 sm:p-2 md:hidden text-gray-400 active:scale-90 transition-all"><Menu size={20} className="sm:size-[22px]" /></button>
            <div className="flex flex-col">
              <h1 className="text-xs sm:text-lg font-bold flex items-center gap-1 sm:gap-2">Gemini Royal <Sparkles size={14} className="text-blue-400 animate-pulse sm:size-4" /></h1>
              <span className="text-[8px] sm:text-[10px] text-blue-500 font-extrabold uppercase tracking-widest opacity-80 leading-none">Quantum Runtime</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={handleRefresh} className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-400 transition-all active:rotate-180 duration-500">
              <RefreshCw size={16} className="sm:size-[18px]" />
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-400 transition-all"><Fingerprint size={16} className="sm:size-[18px]" /></button>
          </div>
        </header>

        <ChatInterface 
          messages={conversations.find(c => c.id === currentId)?.messages || []} 
          isTyping={isTyping} presets={currentPresets} 
          onPresetClick={(t) => handleSendMessage(undefined, t)}
          onRegenerate={() => { /* logic to retry last assistant message */ }}
        />

        <div className="px-3 pb-3 sm:px-4 sm:pb-8 z-[300] relative">
          <div className="max-w-3xl mx-auto flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center justify-center gap-3 sm:gap-4 py-0.5 sm:py-1">
              <AnimatePresence>
                {isSearchEnabled && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-bold text-blue-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] bg-blue-500/10 px-3 py-0.5 sm:px-4 sm:py-1 rounded-full border border-blue-500/20 shadow-lg shadow-blue-500/5">
                    <Search size={8} className="sm:size-[10px]" /> Web Engine Online
                  </motion.div>
                )}
                {isCodeReviewEnabled && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-bold text-purple-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] bg-purple-500/10 px-3 py-0.5 sm:px-4 sm:py-1 rounded-full border border-purple-500/20 shadow-lg shadow-purple-500/5">
                    <Code size={8} className="sm:size-[10px]" /> Architect Level Active
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <AnimatePresence>
                {attachments.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3 p-2 sm:p-3 glass rounded-xl sm:rounded-2xl border border-white/10 shadow-xl"
                  >
                    {attachments.map((att, idx) => (
                      <div key={idx} className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden glass border border-white/20">
                        {att.previewUrl ? <img src={att.previewUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center p-1.5"><File size={20} className="text-blue-400 sm:size-6" /><span className="text-[7px] text-gray-500 truncate w-full text-center mt-0.5 uppercase font-bold">{att.name}</span></div>}
                        <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0.5 right-0.5 p-0.5 sm:p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={8} className="sm:size-[10px]" /></button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <form 
                onSubmit={handleSendMessage} 
                className="relative glass rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-2xl p-1.5 sm:p-2 flex items-end gap-1 sm:gap-2 group/input focus-within:ring-2 focus-within:ring-blue-500/30 transition-all"
                style={{ backgroundColor: 'rgba(13, 20, 38, 0.98)', backdropFilter: 'blur(32px)' }}
              >
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                <div className="relative">
                  <button type="button" onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)} className={`p-2.5 sm:p-4 rounded-full transition-all ${isPlusMenuOpen ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-blue-400 hover:bg-white/5'}`}><Plus size={20} className={`sm:size-6 transition-transform duration-500 ${isPlusMenuOpen ? 'rotate-45' : ''}`} /></button>
                  <AnimatePresence>
                    {isPlusMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-[310]" onClick={() => setIsPlusMenuOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: -20 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute bottom-full left-0 mb-4 rounded-[1.5rem] sm:rounded-[2rem] border border-white/15 shadow-2xl p-1.5 sm:p-2 w-56 sm:w-64 z-[320] bg-[#0f172a] overflow-hidden">
                          <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-white/10 transition-all text-xs sm:text-sm font-semibold tracking-tight"><div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl glass-royal flex items-center justify-center text-blue-400"><Upload size={16} className="sm:size-[18px]" /></div>Upload Files</button>
                          <button onClick={() => { setIsSearchEnabled(!isSearchEnabled); setIsPlusMenuOpen(false); }} className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-white/10 transition-all text-xs sm:text-sm font-semibold tracking-tight ${isSearchEnabled ? 'text-blue-400' : 'text-gray-300'}`}><div className="flex items-center gap-2.5 sm:gap-3"><div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl glass flex items-center justify-center transition-all ${isSearchEnabled ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400'}`}><Globe size={16} className="sm:size-[18px]" /></div>Search Web</div><div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all ${isSearchEnabled ? 'bg-blue-500 border-blue-500' : 'border-white/10'}`} /></button>
                          <button onClick={() => { setIsCodeReviewEnabled(!isCodeReviewEnabled); setIsPlusMenuOpen(false); }} className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-white/10 transition-all text-xs sm:text-sm font-semibold tracking-tight ${isCodeReviewEnabled ? 'text-purple-400' : 'text-gray-300'}`}><div className="flex items-center gap-2.5 sm:gap-3"><div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl glass flex items-center justify-center transition-all ${isCodeReviewEnabled ? 'bg-purple-600/30 text-purple-400' : 'text-gray-400'}`}><Code size={16} className="sm:size-[18px]" /></div>Code Review</div><div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all ${isCodeReviewEnabled ? 'bg-purple-500 border-purple-500' : 'border-white/10'}`} /></button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                <textarea 
                  value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Send a message..."
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  className="flex-1 max-h-32 sm:max-h-40 py-3 sm:py-4 bg-transparent border-none focus:ring-0 resize-none text-[15px] sm:text-[18px] text-white placeholder-gray-500 font-medium tracking-tight" rows={1}
                />
                <div className="flex gap-1 pr-1 pb-1">
                  <button type="button" onClick={startVoiceMode} className="p-2.5 sm:p-4 text-gray-400 hover:text-blue-400 transition-all active:scale-90"><Mic size={20} className="sm:size-[22px]" /></button>
                  <button type="submit" disabled={(!inputValue.trim() && attachments.length === 0) || isTyping} className={`p-2.5 sm:p-4 rounded-full transition-all duration-300 ${(!inputValue.trim() && attachments.length === 0) || isTyping ? 'bg-white/5 text-gray-600' : 'glass-royal text-white shadow-xl shadow-blue-500/20 active:scale-95'}`}><Send size={20} className="sm:size-[22px]" /></button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {appMode === 'voice' && <VoiceOverlay onClose={stopVoiceMode} status={voiceStatus} userText={userSpeechText} aiText={aiSpeechText} transcript={voiceTranscript} onToggleMute={(m) => isMutedRef.current = m} onToggleOutputMute={(m) => { if (outputGainNodeRef.current) outputGainNodeRef.current.gain.value = m ? 0 : 1; }} personality={personality} />}
          {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} personality={personality} onPersonalityChange={setPersonality} onPurge={() => { setConversations([]); setCurrentId(null); setIsSettingsOpen(false); }} historySize={getHistorySize} isNeuralPrivacy={isNeuralPrivacy} onTogglePrivacy={setIsNeuralPrivacy} />}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
