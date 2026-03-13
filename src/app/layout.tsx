import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";
import { getLocale, getMessages } from "next-intl/server";
import { validateEnv } from "@/lib/env";

// Validate env vars at startup
validateEnv();

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: 'Klolakelas - Platform Manajemen Sekolah Modern',
  description: 'Sistem manajemen pembelajaran modern untuk sekolah masa depan.',
  keywords: ["LMS", "sekolah", "pembelajaran", "guru", "siswa", "tugas", "penilaian", "online"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Klolakelas | Platform Pembelajaran Digital",
    description: "Platform manajemen kelas dan pembelajaran modern.",
    type: "website",
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
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-slate-900`} suppressHydrationWarning>
        <Toaster richColors position="top-center" />
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
