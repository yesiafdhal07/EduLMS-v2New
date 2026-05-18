import { BookOpen, Crown, GraduationCap, Shield } from 'lucide-react';
import type { AppRole } from '@/types';

export type RoleKey = AppRole | 'default';

export interface RoleTheme {
  role: RoleKey;
  label: string;
  subtitle: string;

  // Brand / accents
  accent: 'rose' | 'amber' | 'indigo' | 'emerald' | 'neutral';
  accentText: string;
  accentBorder: string;
  accentBgSoft: string;
  accentBgStrong: string;

  // Surfaces
  pageBg: string;
  shellBg: string;
  sidebarBg: string;
  sidebarBorder: string;

  // Nav
  navItemActive: string;
  navItemInactive: string;
  navItemIconActive: string;
  navItemIconInactive: string;
  navItemGlow: string;

  // Entrance splash
  splashGradient: string;
  splashIconBg: string;
  splashIconShadow: string;
  splashIconGlow: string;
  splashTextAccent: string;
  splashDots: [string, string, string];
  splashBlob1: string;
  splashBlob2: string;

  // Icon
  icon: typeof Shield;
  iconBg: string;
}

const BASE = {
  pageBg: 'bg-[#0A0B0E]',
  shellBg: 'bg-[#0A0B0E] text-white',
  sidebarBorder: 'border-r border-white/10',
} as const;

const THEMES: Record<RoleKey, RoleTheme> = {
  admin: {
    role: 'admin',
    label: 'Admin',
    subtitle: 'Global Command',
    accent: 'rose',
    accentText: 'text-rose-400',
    accentBorder: 'border-rose-500/25',
    accentBgSoft: 'bg-rose-500/10',
    accentBgStrong: 'bg-rose-500/20',
    pageBg: 'bg-[#050506]',
    shellBg: 'bg-[#050506] text-white',
    sidebarBg: 'bg-[#07070A]/95 backdrop-blur-2xl',
    sidebarBorder: 'border-r border-rose-500/10',
    navItemActive: 'bg-rose-500/10 text-white border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]',
    navItemInactive: 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300 border border-transparent',
    navItemIconActive: 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    navItemIconInactive: 'bg-white/5 text-slate-500 group-hover:text-slate-300',
    navItemGlow: 'from-rose-500/15 to-transparent',
    splashGradient: 'from-slate-950 via-rose-950/20 to-slate-950',
    splashIconBg: 'from-rose-500 to-rose-700',
    splashIconShadow: 'shadow-rose-500/50',
    splashIconGlow: 'bg-rose-500/30',
    splashTextAccent: 'text-rose-400',
    splashDots: ['bg-rose-600', 'bg-rose-500', 'bg-rose-400'],
    splashBlob1: 'bg-rose-500/15',
    splashBlob2: 'bg-rose-900/20',
    icon: Shield,
    iconBg: 'bg-rose-500 shadow-rose-500/30',
  },
  kepala_sekolah: {
    role: 'kepala_sekolah',
    label: 'Kepsek',
    subtitle: 'Observation Deck',
    accent: 'amber',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500/25',
    accentBgSoft: 'bg-amber-500/10',
    accentBgStrong: 'bg-amber-500/20',
    pageBg: 'bg-[#040712]',
    shellBg: 'bg-[#040712] text-white',
    sidebarBg: 'bg-[#050A1A]/95 backdrop-blur-2xl',
    sidebarBorder: 'border-r border-amber-500/10',
    navItemActive: 'bg-amber-500/10 text-white border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]',
    navItemInactive: 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300 border border-transparent',
    navItemIconActive: 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    navItemIconInactive: 'bg-white/5 text-slate-500 group-hover:text-slate-300',
    navItemGlow: 'from-amber-500/15 to-transparent',
    splashGradient: 'from-[#040712] via-amber-950/10 to-[#040712]',
    splashIconBg: 'from-amber-500 to-amber-700',
    splashIconShadow: 'shadow-amber-500/50',
    splashIconGlow: 'bg-amber-500/30',
    splashTextAccent: 'text-amber-400',
    splashDots: ['bg-amber-600', 'bg-amber-500', 'bg-amber-400'],
    splashBlob1: 'bg-amber-500/15',
    splashBlob2: 'bg-amber-900/20',
    icon: Crown,
    iconBg: 'bg-amber-500 shadow-amber-500/30',
  },
  guru: {
    role: 'guru',
    label: 'Kelas',
    subtitle: 'Indigo Studio',
    accent: 'indigo',
    accentText: 'text-indigo-400',
    accentBorder: 'border-indigo-500/25',
    accentBgSoft: 'bg-indigo-500/10',
    accentBgStrong: 'bg-indigo-500/20',
    pageBg: 'bg-[#0C0B12]',
    shellBg: 'bg-[#0C0B12] text-white',
    sidebarBg: 'bg-[#0A0916]/95 backdrop-blur-3xl',
    sidebarBorder: 'border-r border-indigo-500/5',
    navItemActive: 'bg-indigo-500/10 text-white border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]',
    navItemInactive: 'text-slate-500 hover:bg-white/[0.02] hover:text-slate-300 border border-transparent',
    navItemIconActive: 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]',
    navItemIconInactive: 'bg-white/[0.03] text-slate-500 group-hover:text-slate-300',
    navItemGlow: 'from-indigo-500/15 to-transparent',
    splashGradient: 'from-[#030408] via-indigo-950/10 to-[#030408]',
    splashIconBg: 'from-indigo-500 to-indigo-700',
    splashIconShadow: 'shadow-indigo-500/50',
    splashIconGlow: 'bg-indigo-500/30',
    splashTextAccent: 'text-indigo-400',
    splashDots: ['bg-indigo-600', 'bg-indigo-500', 'bg-indigo-400'],
    splashBlob1: 'bg-indigo-500/10',
    splashBlob2: 'bg-indigo-900/20',
    icon: BookOpen,
    iconBg: 'bg-indigo-600 shadow-indigo-600/30',
  },
  siswa: {
    role: 'siswa',
    label: 'Kelas',
    subtitle: 'Learning Universe',
    accent: 'emerald',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/25',
    accentBgSoft: 'bg-emerald-500/10',
    accentBgStrong: 'bg-emerald-500/20',
    pageBg: 'bg-[#080C12]',
    shellBg: 'bg-[#080C12] text-white',
    sidebarBg: 'bg-[#060A10]/95 backdrop-blur-2xl',
    sidebarBorder: 'border-r border-emerald-500/10',
    navItemActive: 'bg-emerald-500/10 text-white border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    navItemInactive: 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300 border border-transparent',
    navItemIconActive: 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    navItemIconInactive: 'bg-white/5 text-slate-500 group-hover:text-slate-300',
    navItemGlow: 'from-emerald-500/15 to-transparent',
    splashGradient: 'from-[#020504] via-emerald-950/20 to-[#020504]',
    splashIconBg: 'from-emerald-500 to-emerald-700',
    splashIconShadow: 'shadow-emerald-500/50',
    splashIconGlow: 'bg-emerald-500/30',
    splashTextAccent: 'text-emerald-400',
    splashDots: ['bg-emerald-600', 'bg-emerald-500', 'bg-emerald-400'],
    splashBlob1: 'bg-emerald-500/15',
    splashBlob2: 'bg-emerald-900/20',
    icon: GraduationCap,
    iconBg: 'bg-emerald-500 shadow-emerald-500/30',
  },
  orang_tua: {
    role: 'orang_tua',
    label: 'Orang Tua',
    subtitle: 'Family Observation',
    accent: 'indigo',
    accentText: 'text-violet-400',
    accentBorder: 'border-violet-500/25',
    accentBgSoft: 'bg-violet-500/10',
    accentBgStrong: 'bg-violet-500/20',
    pageBg: 'bg-[#0A0812]',
    shellBg: 'bg-[#0A0812] text-white',
    sidebarBg: 'bg-[#080610]/95 backdrop-blur-2xl',
    sidebarBorder: 'border-r border-violet-500/10',
    navItemActive: 'bg-violet-500/10 text-white border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]',
    navItemInactive: 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300 border border-transparent',
    navItemIconActive: 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]',
    navItemIconInactive: 'bg-white/5 text-slate-500 group-hover:text-slate-300',
    navItemGlow: 'from-violet-500/15 to-transparent',
    splashGradient: 'from-[#030208] via-violet-950/10 to-[#030208]',
    splashIconBg: 'from-violet-500 to-violet-700',
    splashIconShadow: 'shadow-violet-500/50',
    splashIconGlow: 'bg-violet-500/30',
    splashTextAccent: 'text-violet-400',
    splashDots: ['bg-violet-600', 'bg-violet-500', 'bg-violet-400'],
    splashBlob1: 'bg-violet-500/15',
    splashBlob2: 'bg-violet-900/20',
    icon: Shield,
    iconBg: 'bg-violet-600 shadow-violet-600/30',
  },
  default: {
    role: 'default',
    label: 'Klola',
    subtitle: 'Sistem Operasi Sekolah',
    accent: 'neutral',
    accentText: 'text-[#86EAA5]',
    accentBorder: 'border-white/10',
    accentBgSoft: 'bg-white/5',
    accentBgStrong: 'bg-white/10',
    pageBg: BASE.pageBg,
    shellBg: BASE.shellBg,
    sidebarBg: 'bg-slate-900/50 backdrop-blur-xl',
    sidebarBorder: BASE.sidebarBorder,
    navItemActive: 'bg-white/10 text-white border border-white/10',
    navItemInactive: 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent',
    navItemIconActive: 'bg-white/20 text-white',
    navItemIconInactive: 'bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10',
    navItemGlow: 'from-white/10 to-transparent',
    splashGradient: 'from-[#0F1014] to-[#12141A]',
    splashIconBg: 'from-[#B4A3FF] to-[#86EAA5]',
    splashIconShadow: 'shadow-[#B4A3FF]/20',
    splashIconGlow: 'bg-[#B4A3FF]/10',
    splashTextAccent: 'text-[#86EAA5]',
    splashDots: ['bg-[#B4A3FF]', 'bg-[#86EAA5]', 'bg-[#FFC38B]'],
    splashBlob1: 'bg-[#B4A3FF]/10',
    splashBlob2: 'bg-[#86EAA5]/10',
    icon: GraduationCap,
    iconBg: 'bg-[#B4A3FF] shadow-[#B4A3FF]/20',
  },
};

export function getRoleTheme(role?: RoleKey | null, userAccentColor?: string): RoleTheme {
  if (!role) return THEMES.default;
  const baseTheme = THEMES[role] || THEMES.default;
  
  // Tailwind doesn't support dynamic arbitrary values in JIT, so we map known hex colors from AvatarSelector to static classes
  const COLOR_MAP: Record<string, Partial<RoleTheme>> = {
    '#6366f1': { // Indigo
      accentText: 'text-indigo-400',
      navItemActive: 'bg-indigo-500/10 text-white border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]',
      navItemIconActive: 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]',
      splashIconBg: 'bg-indigo-500',
      iconBg: 'bg-indigo-500 shadow-indigo-500/30',
      splashTextAccent: 'text-indigo-400',
      splashIconShadow: 'shadow-indigo-500/50',
      splashIconGlow: 'bg-indigo-500/30',
    },
    '#10b981': { // Emerald
      accentText: 'text-emerald-400',
      navItemActive: 'bg-emerald-500/10 text-white border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
      navItemIconActive: 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      splashIconBg: 'bg-emerald-500',
      iconBg: 'bg-emerald-500 shadow-emerald-500/30',
      splashTextAccent: 'text-emerald-400',
      splashIconShadow: 'shadow-emerald-500/50',
      splashIconGlow: 'bg-emerald-500/30',
    },
    '#f43f5e': { // Rose
      accentText: 'text-rose-400',
      navItemActive: 'bg-rose-500/10 text-white border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]',
      navItemIconActive: 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]',
      splashIconBg: 'bg-rose-500',
      iconBg: 'bg-rose-500 shadow-rose-500/30',
      splashTextAccent: 'text-rose-400',
      splashIconShadow: 'shadow-rose-500/50',
      splashIconGlow: 'bg-rose-500/30',
    },
    '#f59e0b': { // Amber
      accentText: 'text-amber-400',
      navItemActive: 'bg-amber-500/10 text-white border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]',
      navItemIconActive: 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      splashIconBg: 'bg-amber-500',
      iconBg: 'bg-amber-500 shadow-amber-500/30',
      splashTextAccent: 'text-amber-400',
      splashIconShadow: 'shadow-amber-500/50',
      splashIconGlow: 'bg-amber-500/30',
    },
    '#06b6d4': { // Cyan
      accentText: 'text-cyan-400',
      navItemActive: 'bg-cyan-500/10 text-white border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]',
      navItemIconActive: 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]',
      splashIconBg: 'bg-cyan-500',
      iconBg: 'bg-cyan-500 shadow-cyan-500/30',
      splashTextAccent: 'text-cyan-400',
      splashIconShadow: 'shadow-cyan-500/50',
      splashIconGlow: 'bg-cyan-500/30',
    },
    '#8b5cf6': { // Violet
      accentText: 'text-violet-400',
      navItemActive: 'bg-violet-500/10 text-white border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]',
      navItemIconActive: 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]',
      splashIconBg: 'bg-violet-500',
      iconBg: 'bg-violet-500 shadow-violet-500/30',
      splashTextAccent: 'text-violet-400',
      splashIconShadow: 'shadow-violet-500/50',
      splashIconGlow: 'bg-violet-500/30',
    },
    '#ec4899': { // Pink
      accentText: 'text-pink-400',
      navItemActive: 'bg-pink-500/10 text-white border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.1)]',
      navItemIconActive: 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]',
      splashIconBg: 'bg-pink-500',
      iconBg: 'bg-pink-500 shadow-pink-500/30',
      splashTextAccent: 'text-pink-400',
      splashIconShadow: 'shadow-pink-500/50',
      splashIconGlow: 'bg-pink-500/30',
    },
    '#84cc16': { // Lime
      accentText: 'text-lime-400',
      navItemActive: 'bg-lime-500/10 text-white border border-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.1)]',
      navItemIconActive: 'bg-lime-500 text-white shadow-[0_0_15px_rgba(132,204,22,0.4)]',
      splashIconBg: 'bg-lime-500',
      iconBg: 'bg-lime-500 shadow-lime-500/30',
      splashTextAccent: 'text-lime-400',
      splashIconShadow: 'shadow-lime-500/50',
      splashIconGlow: 'bg-lime-500/30',
    },
  };
  
  if (userAccentColor && COLOR_MAP[userAccentColor.toLowerCase()]) {
    return {
      ...baseTheme,
      ...COLOR_MAP[userAccentColor.toLowerCase()]
    };
  }
  
  return baseTheme;
}

