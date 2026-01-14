
import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Settings, ChevronLeft, Edit2, Check, X, LogOut, Moon } from 'lucide-react';
import { Conversation, MODELS } from '../types';

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
  conversations,
  currentId,
  isOpen,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onClose,
  selectedModelId,
  onModelChange
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
    if (editValue.trim()) {
      onRenameChat(id, editValue);
    }
    setEditingId(null);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-md transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 w-72 glass z-[70] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 border-r border-white/10
      `}>
        <div className="p-4 flex flex-col h-full">
          <button 
            onClick={() => { onNewChat(); if (window.innerWidth < 768) onClose(); }}
            className="flex items-center gap-3 w-full p-4 mb-6 rounded-2xl glass-royal border border-blue-500/20 hover:bg-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all text-white font-semibold group shadow-lg"
          >
            <Plus size={20} className="text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-sm">New Chat</span>
          </button>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 px-1">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 py-2 opacity-60">Recents</h3>
            {conversations.length === 0 ? (
              <div className="px-3 py-8 text-xs text-gray-500 text-center opacity-40">Your story starts here.</div>
            ) : (
              conversations.sort((a, b) => b.updatedAt - a.updatedAt).map((chat) => (
                <div 
                  key={chat.id}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all relative border ${
                    currentId === chat.id 
                      ? 'glass-royal border-blue-500/30 text-white shadow-md' 
                      : 'hover:bg-white/5 border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                  onClick={() => { onSelectChat(chat.id); if (window.innerWidth < 768) onClose(); }}
                >
                  <MessageSquare size={16} className={currentId === chat.id ? 'text-blue-400' : 'text-gray-600'} />
                  
                  {editingId === chat.id ? (
                    <input
                      autoFocus
                      className="flex-1 bg-transparent border-none focus:ring-0 text-xs outline-none font-medium"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={(e) => handleConfirmRename(e as any, chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename(e as any, chat.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                  ) : (
                    <span className="flex-1 text-xs truncate font-medium">{chat.title}</span>
                  )}
                  
                  <div className={`flex items-center gap-1.5 ${editingId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    {editingId === chat.id ? (
                      <Check size={14} className="text-blue-400 hover:scale-125 transition-transform" onClick={(e) => handleConfirmRename(e, chat.id)} />
                    ) : (
                      <>
                        <Edit2 size={12} className="hover:text-blue-400 transition-colors" onClick={(e) => handleStartRename(e, chat.id, chat.title)} />
                        <Trash2 size={12} className="hover:text-red-400 transition-colors" onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} />
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 mt-auto border-t border-white/5 space-y-3">
             <div className="relative group/model">
              <button className="flex items-center justify-between w-full p-3.5 rounded-2xl glass hover:bg-white/10 transition-all text-xs font-semibold text-gray-300 border border-white/5">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                   <span className="truncate">{MODELS.find(m => m.id === selectedModelId)?.name}</span>
                </div>
                <ChevronLeft size={14} className="-rotate-90 group-hover/model:rotate-90 transition-transform duration-300" />
              </button>
              <div className="absolute bottom-full left-0 w-full mb-3 glass rounded-2xl overflow-hidden hidden group-hover/model:block animate-in fade-in slide-in-from-bottom-3 duration-300 border border-white/10 z-[80] shadow-2xl">
                {MODELS.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => onModelChange(m.id)}
                    className={`w-full text-left p-4 text-xs transition-all hover:bg-blue-600/30 ${selectedModelId === m.id ? 'bg-blue-600/20 text-white font-bold' : 'text-gray-400'}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="flex items-center gap-3 w-full p-3.5 rounded-2xl hover:bg-white/5 transition-colors text-xs font-medium text-gray-400 group">
              <Settings size={18} className="group-hover:rotate-45 transition-transform" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-1/2 -right-12 md:hidden p-3 glass text-white rounded-full -translate-y-1/2 shadow-xl border-l-0 rounded-l-none"
        >
          <ChevronLeft size={24} />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
