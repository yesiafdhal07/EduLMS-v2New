'use client';

import LandingStats from '@/components/ui/LandingStats';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LogoMarquee } from '@/components/landing/LogoMarquee';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FAQSection } from '@/components/landing/FAQSection';
import { EntranceAnimation } from '@/components/ui';

export default function LandingPage() {
  return (
    <EntranceAnimation>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden font-outfit selection:bg-indigo-500/30">
        <LandingNavbar />

        <main>
          <HeroSection />

          {/* Stats Section Wrapper - Floating overlap */}
          <section className="relative z-20 -mt-20 px-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
            <LandingStats />
          </section>

          <LogoMarquee />
          
          <FeaturesGrid />
          
          <HowItWorks />
          
          <Testimonials />
          
          <FAQSection />
          
          <CTASection />
        </main>

        <LandingFooter />
      </div>
    </EntranceAnimation>
  );
}
