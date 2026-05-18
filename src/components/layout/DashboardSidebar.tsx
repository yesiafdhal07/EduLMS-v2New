'use client';

import { ReactNode, useState, useEffect } from 'react';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppRole } from '@/types';
import { getRoleTheme } from '@/lib/theme/roleTheme';

interface NavItemProps {
    icon: ReactNode;
    label: string;
    description?: string;
    active?: boolean;
    onClick: () => void;
    className?: string;
    role?: AppRole;
    shortcut?: string;
}

function NavItem({ icon, label, description, active, onClick, className = '', role = 'guru', shortcut }: NavItemProps) {
    const theme = getRoleTheme(role);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group relative overflow-hidden
                ${active
                    ? `${theme.navItemActive} shadow-lg shadow-indigo-500/10`
                    : `${theme.navItemInactive} hover:bg-white/[0.06]`
                }
                ${className}
            `}
        >
            {/* Active indicator gradient */}
            {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full" />
            )}

            {/* Icon */}
            <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                ${active 
                    ? 'bg-indigo-500/20 text-indigo-300 group-hover:text-white' 
                    : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-300 group-hover:bg-white/[0.08]'}
            `}>
                {icon}
            </div>

            {/* Text - only visible when expanded */}
            <div className={`text-left min-w-0 flex-1 transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                <p className={`
                    font-fraunces
                    font-black text-[13px] leading-none truncate ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}
                `}>
                    {label}
                </p>
                {description && (
                    <p className={`text-[10px] mt-0.5 truncate leading-none ${active ? 'text-slate-400' : 'text-slate-600 group-hover:text-slate-500'}`}>
                        {description}
                    </p>
                )}
            </div>

            {/* Keyboard shortcut hint - only visible when expanded */}
            {shortcut && isExpanded && (
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-1.5 py-0.5 text-[9px] font-geist-mono bg-white/[0.08] text-slate-500 rounded">
                        {shortcut}
                    </span>
                </div>
            )}
        </button>
    );
}


interface DashboardSidebarProps {
    role: AppRole;
    onLogout: () => void;
    children?: ReactNode;
    className?: string;
    extraContent?: ReactNode;
}

export function DashboardSidebar({ role, onLogout, children, className = '', extraContent }: DashboardSidebarProps) {
    const theme = getRoleTheme(role);
    const IconComponent = theme.icon;
    
    // Collapsible state
    const [isExpanded, setIsExpanded] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-collapse on smaller screens
    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth >= 1280);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate actual width based on state
    const sidebarWidth = isExpanded || isHovered ? 'w-64' : 'w-16';
    const showLabels = isExpanded || isHovered;

    return (
        <aside
            className={`
                ${sidebarWidth} ${theme.sidebarBg} text-white
                hidden md:flex flex-col ${theme.sidebarBorder}
                shadow-2xl z-50 h-full relative shrink-0
                transition-all duration-300 ease-out
                ${className}
            `}
            style={{ 
                animation: 'slideInLeft 0.4s cubic-bezier(0.0, 0.0, 0.2, 1) forwards',
                background: 'linear-gradient(180deg, rgba(13, 21, 38, 0.95) 0%, rgba(20, 30, 53, 0.95) 100%)',
                backdropFilter: 'blur(12px)',
                borderRight: '1px solid rgba(99, 102, 241, 0.1)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-white hover:bg-indigo-400 transition-all shadow-lg"
            >
                {isExpanded || isHovered ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            </button>

            {/* Brand Header */}
            <div className={`flex items-center gap-3 px-4 pt-6 pb-5 shrink-0 transition-all duration-300 ${showLabels ? 'px-5' : 'justify-center'}`}>
                <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0
                    bg-gradient-to-br from-indigo-500 to-violet-600
                    transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/30
                `}>
                    <span className="text-xl">☀</span>
                </div>
                {showLabels && (
                    <div className="min-w-0 animate-fade-in">
                        <span className="font-fraunces text-[17px] font-black tracking-tight block leading-none text-white">
                            Klola<span className="text-indigo-400">kelas</span>
                        </span>
                        <span className="text-[9px] font-black tracking-[0.25em] uppercase mt-0.5 block truncate text-indigo-400/60">
                            {theme.label}
                        </span>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="mx-4 h-px bg-gradient-to-r from-indigo-500/20 via-indigo-500/10 to-transparent mb-3 shrink-0" />

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-hide px-2 space-y-1 pb-2">
                {children}
            </nav>

            {/* Extra Content (e.g. class selector) */}
            {extraContent && showLabels && (
                <div className="px-3 mb-3 shrink-0 animate-fade-in">
                    {extraContent}
                </div>
            )}

            {/* Logout */}
            <div className="px-2 py-4 border-t border-white/[0.06] shrink-0">
                <button
                    type="button"
                    onClick={onLogout}
                    className={`
                        flex items-center gap-3 p-2.5 w-full rounded-xl
                        transition-all duration-200 group
                        text-slate-500 hover:text-rose-400 hover:bg-rose-500/10
                        border border-transparent hover:border-rose-500/20
                        ${showLabels ? '' : 'justify-center'}
                    `}
                >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-rose-500/20 transition-colors shrink-0">
                        <LogOut size={14} />
                    </div>
                    {showLabels && (
                        <span className="font-bold text-[12px] animate-fade-in">Keluar</span>
                    )}
                </button>
            </div>
        </aside>
    );
}

export { NavItem as SidebarNavItem };
