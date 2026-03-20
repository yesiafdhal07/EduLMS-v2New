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
import { EliminatedSection } from '@/components/landing/EliminatedSection';
import { CalculatorSection } from '@/components/landing/CalculatorSection';
import { NodesConnection } from '@/components/landing/NodesConnection';
import { EntranceAnimation } from '@/components/ui';

export default function LandingPage() {
  return (
    <EntranceAnimation>
      <div className="min-h-screen bg-[#0A0A0F] text-[#f0f0f5] overflow-hidden font-outfit selection:bg-cyan-500/20">
        <LandingNavbar />

        <main>
          <HeroSection />

          {/* Stats Section — Floating overlap */}
          <section className="relative z-20 -mt-16 px-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
            <LandingStats />
          </section>

          <LogoMarquee />

          <EliminatedSection />

          <FeaturesGrid />

          <CalculatorSection />

          <NodesConnection />

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
