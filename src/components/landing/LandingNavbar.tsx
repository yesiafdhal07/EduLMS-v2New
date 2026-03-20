'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/ui';

export function LandingNavbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const t = useTranslations('landing');
    const tAuth = useTranslations('auth');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t('features'), href: '/features' },
        { name: t('pricing'), href: '/pricing' },
        { name: t('about'), href: '/about' },
        { name: t('contact'), href: '/contact' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled 
                ? 'bg-[#0A0A0F]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-lg shadow-black/20' 
                : 'bg-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all group-hover:scale-105">
                        <GraduationCap size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">
                        Klola<span className="text-cyan-400">kelas</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                isActive(link.href)
                                    ? 'text-cyan-400 bg-cyan-400/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <LocaleSwitcher />
                    <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                    >
                        {tAuth('login')}
                    </Link>
                    <Link
                        href="/register"
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#0A0A0F] rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                        {tAuth('register')}
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 right-0 bg-[#0A0A0F]/95 backdrop-blur-2xl border-b border-white/[0.06] p-6 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-top-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                                isActive(link.href)
                                    ? 'text-cyan-400 bg-cyan-400/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="h-px bg-white/[0.06] my-3"></div>
                    <Link
                        href="/login"
                        className="px-4 py-3 text-gray-400 font-semibold hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {tAuth('login')}
                    </Link>
                    <Link
                        href="/register"
                        className="py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-center text-[#0A0A0F] rounded-xl font-bold shadow-lg shadow-cyan-500/20"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {tAuth('register')}
                    </Link>
                </div>
            )}
        </nav>
    );
}
