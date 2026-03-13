'use client';

import { ReactNode, useRef } from 'react';
import { LogOut, BookOpen, GraduationCap } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

interface NavItemProps {
    icon: ReactNode;
    label: string;
    description?: string;
    active?: boolean;
    onClick: () => void;
    className?: string;
    role?: 'guru' | 'siswa';
}

function NavItem({ icon, label, description, active, onClick, className = '', role = 'guru' }: NavItemProps) {
    const activeClass = role === 'guru'
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
        : "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30";

    const inactiveClass = "text-slate-400 hover:bg-white/5 hover:text-white";

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${active ? activeClass : inactiveClass} ${className}`}
        >
            <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                {icon}
            </div>
            <div className="text-left">
                <p className={`font-bold text-sm ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{label}</p>
                {description && <p className={`text-[10px] ${active ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-400'}`}>{description}</p>}
            </div>
            {active && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full"></div>
            )}
        </button>
    );
}


interface DashboardSidebarProps {
    role: 'guru' | 'siswa';
    onLogout: () => void;
    children?: ReactNode; // For NavItems
    className?: string; // For FocusMode hiding
    extraContent?: ReactNode; // For XP Bar etc
}

export function DashboardSidebar({ role, onLogout, children, className = '', extraContent }: DashboardSidebarProps) {
    const isGuru = role === 'guru';
    const sidebarRef = useRef<HTMLElement>(null);
    const brandRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);

    const theme = {
        iconBg: isGuru ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-emerald-500 shadow-emerald-500/20',
        accentText: isGuru ? 'text-indigo-400' : 'text-emerald-400',
        logoutHover: 'hover:bg-rose-500/10 text-rose-400',
        logoutIconHover: 'group-hover:bg-rose-500/20'
    };

    useGSAP(() => {
        if (!sidebarRef.current) return;

        // Sidebar slides in from the left with elastic easing
        gsap.fromTo(sidebarRef.current, 
            { x: -100, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 1.2,
                ease: 'elastic.out(1, 0.75)',
                clearProps: "all"
            }
        );

        // Brand logo bounces in
        if (brandRef.current) {
            gsap.fromTo(brandRef.current, 
                { scale: 0.5, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.8,
                    delay: 0.3,
                    ease: 'back.out(2)',
                    clearProps: "all"
                }
            );
        }

        // Nav items stagger in
        const navItems = navRef.current?.children;
        if (navItems && navItems.length > 0) {
            gsap.fromTo(navItems, 
                { x: -30, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.08,
                    delay: 0.5,
                    ease: 'power2.out',
                    clearProps: "all"
                }
            );
        }
    }, { scope: sidebarRef });

    return (
        <aside ref={sidebarRef} className={`w-72 bg-slate-900/50 backdrop-blur-xl text-white p-8 hidden md:flex flex-col border-r border-white/10 shadow-2xl z-50 h-screen sticky top-0 ${className}`}>
            {/* Brand Logo */}
            <div ref={brandRef} className="flex items-center gap-4 mb-14 shrink-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl rotate-3 group transform hover:rotate-0 transition-all ${theme.iconBg}`}>
                    {isGuru ? <BookOpen size={28} className="text-white" /> : <GraduationCap size={28} className="text-white" />}
                </div>
                <div>
                    <span className="text-2xl font-black tracking-tighter block leading-none">Klola</span>
                    <span className={`text-[10px] font-black tracking-[0.3em] uppercase ${theme.accentText}`}>Kelas</span>
                </div>
            </div>

            {/* Navigation Items */}
            <nav ref={navRef} className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                {children}
            </nav>

            {/* Extra Content (XP Bar, etc) */}
            {extraContent && (
                <div className="mt-4 mb-4 shrink-0">
                    {extraContent}
                </div>
            )}

            {/* Logout Section */}
            <div className="pt-8 border-t border-white/10 mt-6 box-border shrink-0">
                <button
                    type="button"
                    onClick={onLogout}
                    className={`flex items-center gap-4 p-4 w-full rounded-2xl transition-all duration-300 group ${theme.logoutHover}`}
                >
                    <div className={`p-2 rounded-xl bg-transparent transition-colors ${theme.logoutIconHover}`}>
                        <LogOut size={20} />
                    </div>
                    <span className="font-bold text-sm">Keluar Sistem</span>
                </button>
            </div>
        </aside>
    );
}

// Export NavItem separately for composition
export { NavItem as SidebarNavItem };
