
import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Settings, ChevronLeft, Edit2, Check, X, LogOut, Moon, User } from 'lucide-react';
import { Conversation, MODELS } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  isOpen: boolean;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onClose: () => void;
  selectedModelId: string;
  onModelChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations, currentId, isOpen, onNewChat, onSelectChat, onDeleteChat, onRenameChat, onClose, selectedModelId, onModelChange
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartRename = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(title);
  };

  const handleConfirmRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editValue.trim()) onRenameChat(id, editValue);
    setEditingId(null);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[400] md:hidden backdrop-blur-lg"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      <aside className={`
        fixed inset-y-0 left-0 w-80 glass z-[500] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 border-r border-white/5 shadow-2xl
      `}>
        <div className="p-5 flex flex-col h-full">
          <button 
            onClick={() => { onNewChat(); if (window.innerWidth < 768) onClose(); }}
            className="flex items-center gap-3 w-full p-4 mb-8 rounded-[1.5rem] glass-royal border border-blue-500/30 hover:bg-blue-600/40 hover:scale-[1.02] active:scale-95 transition-all text-white font-bold group shadow-[0_10px_30px_-5px_rgba(30,64,175,0.4)]"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors"><Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /></div>
            <span className="text-sm tracking-tight">New Conversation</span>
          </button>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5 px-0.5">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 py-3 opacity-60">Chronology</h3>
            {conversations.length === 0 ? (
              <div className="px-4 py-12 text-xs text-gray-500 text-center font-medium opacity-30 italic">No cycles detected.</div>
            ) : (
              conversations.sort((a, b) => b.updatedAt - a.updatedAt).map((chat) => (
                <div 
                  key={chat.id}
                  className={`group flex items-center gap-3.5 px-4 py-4 rounded-[1.25rem] cursor-pointer transition-all relative border ${
                    currentId === chat.id 
                      ? 'glass-royal border-blue-500/40 text-white shadow-lg' 
                      : 'hover:bg-white/5 border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                  onClick={() => { onSelectChat(chat.id); if (window.innerWidth < 768) onClose(); }}
                >
                  <MessageSquare size={16} className={currentId === chat.id ? 'text-blue-300' : 'text-gray-600 group-hover:text-blue-400'} />
                  {editingId === chat.id ? (
                    <input
                      autoFocus className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] outline-none font-semibold"
                      value={editValue} onChange={(e) => setEditValue(e.target.value)} onClick={(e) => e.stopPropagation()}
                      onBlur={(e) => handleConfirmRename(e as any, chat.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename(e as any, chat.id)}
                    />
                  ) : (
                    <span className="flex-1 text-[13px] truncate font-semibold tracking-tight">{chat.title}</span>
                  )}
                  <div className={`flex items-center gap-2 ${editingId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    {editingId === chat.id ? (
                      <Check size={14} className="text-blue-400" onClick={(e) => handleConfirmRename(e, chat.id)} />
                    ) : (
                      <Trash2 size={13} className="hover:text-red-400 transition-colors" onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-6 mt-auto border-t border-white/10 space-y-4">
             <div className="relative group/model">
              <button className="flex items-center justify-between w-full p-4 rounded-2xl glass hover:bg-white/10 transition-all text-[13px] font-bold text-gray-300 border border-white/5">
                <div className="flex items-center gap-2.5">
                   <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse" />
                   <span className="truncate">{MODELS.find(m => m.id === selectedModelId)?.name}</span>
                </div>
                <ChevronLeft size={16} className="-rotate-90 group-hover/model:rotate-90 transition-transform duration-500" />
              </button>
              <div className="absolute bottom-full left-0 w-full mb-3 glass rounded-2xl overflow-hidden hidden group-hover/model:block animate-in fade-in slide-in-from-bottom-3 duration-300 border border-white/10 z-[510] shadow-2xl">
                {MODELS.map(m => (
                  <button 
                    key={m.id} onClick={() => onModelChange(m.id)}
                    className={`w-full text-left p-4 text-[13px] transition-all hover:bg-blue-600/40 border-b border-white/5 last:border-none ${selectedModelId === m.id ? 'bg-blue-600/30 text-white font-bold' : 'text-gray-400'}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center"><User size={20} className="text-gray-400" /></div>
                 <div className="flex flex-col">
                   <span className="text-[12px] font-bold text-white leading-tight">Elite Member</span>
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Core</span>
                 </div>
               </div>
               <button className="p-2 text-gray-500 hover:text-white transition-all"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
