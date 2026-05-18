import { Metadata } from 'next';
import { EntranceAnimation } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Klolakelas - Revolusi Manajemen Sekolah & Ekosistem Digital Pendidikan',
  description: 'Platform manajemen sekolah tercanggih dengan fitur absensi QR, otomatisasi nilai AI, dan dashboard analitik real-time. Dirancang untuk meningkatkan efisiensi guru dan performa siswa.',
  keywords: ['LMS', 'Sistem Informasi Sekolah', 'Manajemen Kelas', 'Absensi Digital', 'E-Rapor', 'Otomatisasi Guru'],
  openGraph: {
    title: 'Klolakelas | Sistem Operasi Pendidikan Masa Depan',
    description: 'Transformasi digital sekolah tanpa ribet. Pantau absensi, kelola materi, dan analisis nilai dalam satu dashboard.',
    url: 'https://klolakelas.com',
    siteName: 'Klolakelas',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Klolakelas Dashboard Preview',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Klolakelas - Kendali Sekolah di Ujung Jari',
    description: 'Otomatisasi administrasi sekolah, fokuslah mengajar.',
    images: ['/og-image.png'],
  },
};

// Import our new modular components
import { AmbientBackground } from '@/components/landing-new/AmbientBackground';
import { FloatingNavbar } from '@/components/landing-new/FloatingNavbar';
import { Hero } from '@/components/landing-new/Hero';
import { LiveTicker } from '@/components/landing-new/LiveTicker';
import { ZPatternFeatures } from '@/components/landing-new/ZPatternFeatures';
import { NetworkVisualization } from '@/components/landing-new/NetworkVisualization';
import { RoleSwitcher } from '@/components/landing-new/RoleSwitcher';
import { ComparisonTable } from '@/components/landing-new/ComparisonTable';
import { InfrastructureBento } from '@/components/landing-new/InfrastructureBento';
import { MigrationTimeline } from '@/components/landing-new/MigrationTimeline';
import { Pricing } from '@/components/landing-new/Pricing';
import { FAQ } from '@/components/landing-new/FAQ';
import { WallOfLove } from '@/components/landing-new/WallOfLove';
import { FinalCTA } from '@/components/landing-new/FinalCTA';
import { Footer } from '@/components/landing-new/Footer';
import { ScrollReveal } from '@/components/landing-new/ScrollReveal';

export default function LandingPage() {
  return (
    <EntranceAnimation>
      <ScrollReveal />
      <div className="min-h-screen bg-[#0F1014] text-slate-200 font-sans selection:bg-[#B4A3FF]/30 selection:text-[#B4A3FF] relative overflow-hidden scroll-smooth">
        
        {/* Ambient & Layout Components */}
        <AmbientBackground />
        <FloatingNavbar />

        <main className="relative z-10 pt-32">
          <Hero />
          <LiveTicker />
          <ZPatternFeatures />
          <NetworkVisualization />
          <RoleSwitcher />
          <ComparisonTable />
          <InfrastructureBento />
          <MigrationTimeline />
          <Pricing />
          <FAQ />
          <WallOfLove />
          <FinalCTA />
        </main>

        <Footer />
        


      </div>
    </EntranceAnimation>
  );
}
