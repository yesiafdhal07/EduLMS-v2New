'use client';

import { Building2, GraduationCap, School, Library } from 'lucide-react';

const logos = [
    { name: 'SMAN 1 Jakarta', icon: School },
    { name: 'SMA Taruna Nusantara', icon: GraduationCap },
    { name: 'Global Jaya School', icon: Building2 },
    { name: 'Binus School', icon: Library },
    { name: 'Mentari Intercultural', icon: School },
    { name: 'Al-Azhar School', icon: GraduationCap },
    { name: 'Penabur International', icon: Building2 },
    { name: 'British School Jakarta', icon: Library },
];

const LogoTicker = ({ items }: { items: typeof logos }) => (
    <div className="flex animate-marquee items-center">
        {items.map((logo, idx) => (
            <div key={idx} className="mx-10 flex items-center gap-3 opacity-30 hover:opacity-70 transition-all duration-500 cursor-default group">
                <logo.icon size={28} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                <span className="text-lg font-semibold text-gray-400 whitespace-nowrap group-hover:text-white transition-colors">{logo.name}</span>
            </div>
        ))}
    </div>
);

export function LogoMarquee() {
    return (
        <section className="py-14 border-y border-white/[0.04] bg-white/[0.015] relative overflow-hidden">
             <div className="max-w-7xl mx-auto px-6 relative z-10">
                <p className="text-center text-gray-600 text-xs font-semibold uppercase tracking-[0.25em] mb-8">
                    Dipercaya oleh sekolah-sekolah terbaik di Indonesia
                </p>
                
                <div className="flex overflow-hidden">
                    <LogoTicker items={[...logos, ...logos]} />
                    <LogoTicker items={[...logos, ...logos]} />
                </div>
            </div>

            {/* Fade edges */}
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0A0A0F] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0A0A0F] to-transparent z-10 pointer-events-none"></div>
        </section>
    );
}
