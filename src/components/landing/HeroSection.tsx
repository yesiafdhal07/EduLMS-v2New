'use client';

// ============================================================
// HERO SECTION - Landing Page
// Komponen utama untuk menampilkan hero section di landing page
// Features: Animasi, gradients, lazy loading images, i18n support
// ============================================================

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Sparkles, PlayCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * HeroSection Component
 * Menampilkan hero section dengan:
 * - Headline dan subheadline dari i18n
 * - CTA buttons untuk register dan learn more
 * - Preview mockup dengan lazy loading
 * - Background decorations dengan blur effects
 * 
 * Dibungkus dengan React.memo untuk mencegah re-render yang tidak perlu
 */
function HeroSectionBase() {
    // Hook untuk internationalization - ambil teks berdasarkan locale
    const t = useTranslations('landing');

    return (
        <section className="relative z-10 pt-32 pb-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

                    {/* Badge - animasi fade-in dari bawah */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles size={16} className="text-indigo-400" />
                        <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                            Platform LMS #1
                        </span>
                    </div>

                    {/* Headline - teks dari i18n untuk multi-bahasa */}
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                        {t('heroTitle')}
                    </h1>

                    {/* Subheadline - penjelasan singkat */}
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        {t('heroSubtitle')}
                    </p>

                    {/* CTA Buttons - responsive flex */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        {/* Primary CTA - Register */}
                        <Link
                            href="/register"
                            className="group px-8 py-4 bg-white text-indigo-950 rounded-2xl text-lg font-black flex items-center gap-3 shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all"
                        >
                            {t('getStarted')}
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform text-indigo-500" />
                        </Link>
                        {/* Secondary CTA - Learn More */}
                        <Link
                            href="/features"
                            className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all flex items-center gap-3"
                        >
                            <PlayCircle size={20} className="text-slate-400" />
                            {t('learnMore')}
                        </Link>
                    </div>

                    {/* Mockup Preview - dengan lazy loading untuk performa */}
                    <div className="mt-20 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                        {/* Gradient overlay di bagian bawah */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 bottom-0 h-40"></div>
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/20 bg-slate-800">
                            {/* 
                              Next.js Image Optimization:
                              - Automatic WebP/AVIF conversion
                              - Lazy loading by default (priority=false)
                              - Responsive sizing
                              - Blur placeholder for better UX
                            */}
                            <Image
                                src="https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=2070&auto=format&fit=crop"
                                alt="Tampilan dashboard Math-LMS menunjukkan statistik nilai dan progress siswa"
                                className="w-full opacity-80"
                                width={2070}
                                height={1380}
                                priority={false}
                                loading="lazy"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                            />
                        </div>

                        {/* Floating Element - status indicator */}
                        <div className="absolute -left-12 top-1/3 p-4 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl animate-bounce delay-700 hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <Sparkles size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Status</p>
                                    <p className="text-white font-bold">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decorations - blur effects untuk estetika */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px] animate-pulse"></div>
                <div className="absolute top-1/3 -right-64 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] animate-pulse delay-1000"></div>
            </div>
        </section>
    );
}

// Export dengan React.memo untuk mencegah re-render yang tidak perlu
// Komponen ini tidak menerima props yang berubah, jadi memo sangat efektif
export const HeroSection = memo(HeroSectionBase);
