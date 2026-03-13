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
    <div className="flex animate-marquee hover:pause-animation items-center">
        {items.map((logo, idx) => (
            <div key={idx} className="mx-8 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-default">
                <logo.icon size={32} className="text-white" />
                <span className="text-xl font-bold text-white whitespace-nowrap">{logo.name}</span>
            </div>
        ))}
    </div>
);

export function LogoMarquee() {
    return (
        <section className="py-12 border-y border-white/5 bg-white/5 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay pointer-events-none"></div>
             
             <div className="max-w-7xl mx-auto px-6 relative z-10">
                <p className="text-center text-slate-500 text-sm font-semibold uppercase tracking-widest mb-8">
                    Dipercaya oleh 500+ Sekolah Unggulan
                </p>
                
                <div className="flex overflow-hidden mask-linear-fade">
                    <LogoTicker items={[...logos, ...logos]} />
                    <LogoTicker items={[...logos, ...logos]} />
                </div>
            </div>
        </section>
    );
}
