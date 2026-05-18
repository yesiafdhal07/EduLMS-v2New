'use client';

import React, { useState, ReactNode } from 'react';
import { Menu, X, LogOut, Home, BookOpen, GraduationCap, Users, Shield, Crown, LayoutDashboard } from 'lucide-react';
import type { AppRole } from '@/types';
import { getRoleTheme } from '@/lib/theme/roleTheme';

interface NavItem {
    label: string;
    icon: any;
    onClick: () => void;
    active?: boolean;
}

interface MobileNavigationProps {
    role: AppRole;
    items: NavItem[];
    onLogout: () => void;
    extraContent?: ReactNode;
}

export function MobileNavigation({ role, items, onLogout, extraContent }: MobileNavigationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const theme = getRoleTheme(role);
    const BrandIcon = theme.icon;

    // Special Case: Siswa Bottom Nav (Duolingo Style)
    const isSiswa = role === 'siswa';

    return (
        <>
            {/* Header Mobile (All Roles) */}
            <div className={`md:hidden fixed top-0 left-0 right-0 h-16 ${theme.sidebarBg} backdrop-blur-2xl border-b ${theme.sidebarBorder} z-[60] flex items-center justify-between px-5`}>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.iconBg} shadow-lg`}>
                        <BrandIcon size={16} className="text-white" />
                    </div>
                    <span className={`
                        ${(role === 'guru' || role === 'kepala_sekolah') ? 'font-fraunces' : isSiswa ? 'font-space-grotesk' : 'font-geist-mono'}
                        text-base font-black tracking-tight text-white
                    `}>
                        Klola<span className={theme.accentText}>kelas</span>
                    </span>
                </div>

                {!isSiswa && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/5 active:scale-95 transition-transform`}
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                )}
                
                {isSiswa && (
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onLogout}
                            className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-colors"
                            aria-label="Logout"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar Drawer (Guru, Admin, Kepsek) */}
            {!isSiswa && (
                <div className={`
                    md:hidden fixed inset-0 z-[55] transition-all duration-500
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}>
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setIsOpen(false)} 
                    />
                    <div className={`
                        absolute left-0 top-0 bottom-0 w-[280px] ${theme.sidebarBg} border-r ${theme.sidebarBorder}
                        transition-transform duration-500 ease-out flex flex-col pt-20
                        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="flex-1 overflow-y-auto px-4 space-y-1 py-4">
                            {extraContent}
                            <div className="h-4" />
                            {items.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        item.onClick();
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all
                                        ${item.active 
                                            ? `${theme.navItemActive} translate-x-2` 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.active ? theme.navItemIconActive : 'bg-white/5'}`}>
                                        <item.icon size={18} />
                                    </div>
                                    <span className={`text-sm font-black tracking-tight ${item.active ? 'text-white' : ''}`}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        
                        <div className="p-4 border-t border-white/5 bg-black/20">
                            <button
                                onClick={onLogout}
                                className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                            >
                                <LogOut size={16} />
                                <span>Keluar Sistem</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Nav (Siswa Only) */}
            {isSiswa && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#060A10]/80 backdrop-blur-2xl border-t border-emerald-500/10 z-50 flex items-center justify-around px-2 pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    {items.map((item, i) => (
                        <button
                            key={i}
                            onClick={item.onClick}
                            className={`
                                flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all relative
                                ${item.active ? 'text-emerald-400' : 'text-slate-500'}
                            `}
                        >
                            {item.active && (
                                <div className="absolute -top-1 w-8 h-1 bg-emerald-500 rounded-full blur-[2px]" />
                            )}
                            <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} className={item.active ? 'animate-bounce' : ''} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {item.label.split(' ')[0]}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Content Spacer for Mobile */}
            <div className="md:hidden h-16 shrink-0" />
            {isSiswa && <div className="md:hidden h-20 shrink-0" />}
        </>
    );
}
