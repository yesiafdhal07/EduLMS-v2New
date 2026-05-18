'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
    MessageCircle, X, Send, Loader2, Sparkles, Trash2, 
    Minimize2, Maximize2, Bot, User 
} from 'lucide-react';
import { 
    sendStreamingChatMessage, createUserMessage, getQuickPrompts,
    type ChatMessage, type ChatContext 
} from '@/lib/services/ai-chat.service';
import type { AppRole } from '@/types';

interface AIChatbotProps {
    userRole: AppRole;
    userName: string;
    schoolName?: string;
    className?: string;
    stats?: ChatContext['stats'];
}

const ROLE_ACCENT: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    guru: { bg: 'bg-indigo-500', border: 'border-indigo-500/30', text: 'text-indigo-400', glow: 'shadow-indigo-500/30' },
    admin: { bg: 'bg-rose-500', border: 'border-rose-500/30', text: 'text-rose-400', glow: 'shadow-rose-500/30' },
    kepala_sekolah: { bg: 'bg-amber-500', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
    siswa: { bg: 'bg-emerald-500', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
    orang_tua: { bg: 'bg-violet-500', border: 'border-violet-500/30', text: 'text-violet-400', glow: 'shadow-violet-500/30' },
};

const ROLE_LABEL: Record<string, string> = {
    guru: 'Asisten Guru',
    admin: 'Asisten Admin',
    kepala_sekolah: 'Penasihat Kepsek',
    siswa: 'Tutor Pintar',
    orang_tua: 'Asisten Orang Tua',
};

export function AIChatbot({ userRole, userName, schoolName, className, stats }: AIChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickPrompts, setShowQuickPrompts] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const accent = ROLE_ACCENT[userRole] || ROLE_ACCENT.guru;
    const quickPrompts = getQuickPrompts(userRole);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const context: ChatContext = {
        userRole: userRole as ChatContext['userRole'],
        userName,
        schoolName,
        className,
        stats,
    };

    // Streaming message ref to avoid stale closures
    const streamingMsgRef = useRef<ChatMessage | null>(null);

    const handleSend = async (text?: string) => {
        const content = text || input.trim();
        if (!content || isLoading) return;

        const userMsg = createUserMessage(content);
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setShowQuickPrompts(false);

        // Create a placeholder streaming message
        const streamId = `msg_${Date.now()}_stream`;
        const streamingMsg: ChatMessage = {
            id: streamId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        };
        streamingMsgRef.current = streamingMsg;
        setMessages(prev => [...prev, streamingMsg]);

        // Stream tokens in real-time
        const finalMsg = await sendStreamingChatMessage(newMessages, context, (partialText) => {
            setMessages(prev => prev.map(m => 
                m.id === streamId ? { ...m, content: partialText } : m
            ));
        });

        // Replace streaming placeholder with final message
        if (finalMsg) {
            setMessages(prev => prev.map(m => 
                m.id === streamId ? finalMsg : m
            ));
        }
        streamingMsgRef.current = null;
        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        setMessages([]);
        setShowQuickPrompts(true);
    };

    // Global keyboard shortcut: Alt+A to toggle chatbot
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const chatWidth = isExpanded ? 'w-[600px]' : 'w-[380px]';
    const chatHeight = isExpanded ? 'h-[80vh]' : 'h-[520px]';

    return (
        <>
            {/* ── Floating Button ── */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-[90] w-14 h-14 ${accent.bg} rounded-2xl flex items-center justify-center text-white shadow-2xl ${accent.glow} hover:scale-110 active:scale-95 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                aria-label="Buka AI Chat"
                title="Kelas AI (Alt+A)"
            >
                <MessageCircle size={24} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <Sparkles size={10} className={accent.text} />
                </span>
            </button>

            {/* ── Chat Window ── */}
            {isOpen && (
                <div 
                    className={`fixed bottom-6 right-6 z-[100] ${chatWidth} ${chatHeight} flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-90 slide-in-from-bottom-4 duration-300`}
                    style={{ 
                        background: 'linear-gradient(180deg, #0c0b1d 0%, #08071a 100%)',
                        maxWidth: 'calc(100vw - 2rem)',
                        maxHeight: 'calc(100vh - 2rem)',
                    }}
                >
                    {/* ── Header ── */}
                    <div className={`flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl ${accent.bg} flex items-center justify-center relative`}>
                                <Bot size={20} className="text-white" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0c0b1d]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white tracking-tight">Kelas AI</h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                    {ROLE_LABEL[userRole] || 'Asisten'} · Online
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {messages.length > 0 && (
                                <button
                                    onClick={handleClear}
                                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all"
                                    title="Hapus percakapan"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                                title={isExpanded ? 'Perkecil' : 'Perbesar'}
                            >
                                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                                title="Tutup (Alt+A)"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* ── Messages ── */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        {/* Welcome message */}
                        {messages.length === 0 && (
                            <div className="text-center py-6 animate-in fade-in duration-500">
                                <div className={`w-16 h-16 rounded-3xl ${accent.bg}/10 border ${accent.border} flex items-center justify-center mx-auto mb-4`}>
                                    <Sparkles size={28} className={accent.text} />
                                </div>
                                <h4 className="text-lg font-black text-white mb-1">
                                    Halo, {userName.split(' ')[0]}! 👋
                                </h4>
                                <p className="text-xs text-slate-400 max-w-[260px] mx-auto leading-relaxed">
                                    Saya <strong className={accent.text}>Kelas AI</strong>, asisten cerdas Anda. Tanyakan apa saja atau pilih pintasan di bawah.
                                </p>
                            </div>
                        )}

                        {/* Quick prompts */}
                        {showQuickPrompts && messages.length === 0 && (
                            <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200" style={{ animationFillMode: 'both' }}>
                                {quickPrompts.map((qp, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(qp.prompt)}
                                        className={`text-left p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:${accent.border} transition-all duration-300 group`}
                                    >
                                        <span className="text-base mb-1 block">{qp.icon}</span>
                                        <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors leading-tight">
                                            {qp.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Message bubbles */}
                        {messages.map((msg, idx) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                            >
                                {/* Avatar */}
                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10' : `${accent.bg}/20`}`}>
                                    {msg.role === 'user' 
                                        ? <User size={14} className="text-white" />
                                        : <Bot size={14} className={accent.text} />
                                    }
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                                    msg.role === 'user'
                                        ? `${accent.bg} text-white rounded-tr-lg`
                                        : 'bg-white/[0.05] border border-white/10 text-slate-200 rounded-tl-lg'
                                }`}>
                                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                                    <p className={`text-[8px] mt-1.5 ${msg.role === 'user' ? 'text-white/40 text-right' : 'text-slate-600'}`}>
                                        {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-2.5 animate-in fade-in duration-200">
                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${accent.bg}/20`}>
                                    <Bot size={14} className={accent.text} />
                                </div>
                                <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-tl-lg px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={14} className={`animate-spin ${accent.text}`} />
                                        <span className="text-xs text-slate-500">Kelas AI sedang berpikir...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Input Area ── */}
                    <div className="px-4 pb-4 pt-2 border-t border-white/5 shrink-0">
                        <div className="flex items-end gap-2">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ketik pesan..."
                                    rows={1}
                                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all resize-none max-h-[100px]"
                                    style={{ scrollbarWidth: 'none' }}
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className={`w-11 h-11 rounded-2xl ${accent.bg} flex items-center justify-center text-white disabled:opacity-30 disabled:scale-95 hover:scale-105 active:scale-95 transition-all shadow-lg ${accent.glow}`}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <p className="text-[8px] text-slate-600 text-center mt-2 font-bold uppercase tracking-widest">
                            Kelas AI · Powered by DeepSeek · <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-slate-500">Alt+A</kbd>
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
