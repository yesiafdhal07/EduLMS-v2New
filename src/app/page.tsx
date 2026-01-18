'use client';

import LandingStats from '@/components/ui/LandingStats';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { EntranceAnimation } from '@/components/ui';

export default function LandingPage() {
  return (
    <EntranceAnimation>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden font-outfit">
        <LandingNavbar />

        <main>
          <HeroSection />

          {/* Stats Section Wrapper */}
          <section className="relative z-10 -mt-20 px-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
            <LandingStats />
          </section>

          <FeaturesGrid />

          <Testimonials />

          <CTASection />
        </main>

        <LandingFooter />
      </div>
    </EntranceAnimation>
  );
}
