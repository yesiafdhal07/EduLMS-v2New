'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/ui';

export function LandingNavbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const t = useTranslations('landing');
    const tAuth = useTranslations('auth');

    const navLinks = [
        { name: t('features'), href: '/features' },
        { name: t('pricing'), href: '/pricing' },
        { name: t('about'), href: '/about' },
        { name: t('contact'), href: '/contact' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                        <GraduationCap size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">Edu<span className="text-indigo-400">LMS</span></span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-bold transition-colors ${isActive(link.href) ? 'text-indigo-400' : 'text-slate-300 hover:text-white'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <LocaleSwitcher />
                    <Link
                        href="/login"
                        className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                    >
                        {tAuth('login')}
                    </Link>
                    <Link
                        href="/register"
                        className="px-5 py-2.5 bg-white text-indigo-950 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all shadow-lg shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5"
                    >
                        {tAuth('register')}
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-300 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 right-0 bg-slate-900 border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`text-base font-bold py-2 ${isActive(link.href) ? 'text-indigo-400' : 'text-slate-300'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="h-px bg-white/10 my-2"></div>
                    <Link
                        href="/login"
                        className="py-2 text-slate-300 font-bold"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {tAuth('login')}
                    </Link>
                    <Link
                        href="/register"
                        className="py-3 bg-indigo-600 text-center text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {tAuth('register')}
                    </Link>
                </div>
            )}
        </nav>
    );
}

