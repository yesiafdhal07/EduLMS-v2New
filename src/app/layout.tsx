import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Fraunces, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";
import { getLocale, getMessages } from "next-intl/server";
import { validateEnv } from "@/lib/env";

// Validate env vars at startup
validateEnv();

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

// Universe Fonts
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz"], display: "swap" }); // Guru: Literary, warm
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" }); // Siswa: Bold, modern
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" }); // Admin: Technical mono

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Klolakelas - Platform Manajemen Sekolah Modern',
  description: 'Platform manajemen kelas & pembelajaran AI untuk sekolah Indonesia. Analitik cerdas, komunikasi orang tua, dan gamifikasi siswa.',
  keywords: ["LMS", "sekolah", "pembelajaran", "guru", "siswa", "tugas", "penilaian", "online", "AI", "rapor"],
  manifest: "/manifest.json",
  applicationName: "Klolakelas",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Klolakelas",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Klolakelas | Platform Pembelajaran Digital",
    description: "Platform manajemen kelas & pembelajaran AI untuk sekolah Indonesia.",
    type: "website",
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512, alt: "Klolakelas" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${fraunces.variable} ${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased text-slate-900`} suppressHydrationWarning>
        <Toaster richColors position="top-center" />
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
