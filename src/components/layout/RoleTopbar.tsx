'use client';

import type { ReactNode } from 'react';
import type { AppRole } from '@/types';
import { getRoleTheme } from '@/lib/theme/roleTheme';

export function RoleTopbar({
  role,
  kicker,
  title,
  subtitle,
  right,
}: {
  role: AppRole;
  kicker?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const theme = getRoleTheme(role);

  // Universe-specific title font class
  const isAdmin = role === 'admin';
  const isGuru = role === 'guru';
  const isKepsek = role === 'kepala_sekolah';

  const titleFont = isAdmin
    ? 'font-geist-mono'
    : isGuru || isKepsek
    ? 'font-fraunces'
    : 'font-space-grotesk';

  return (
    <header className="mb-6 shrink-0 relative">
      <div className="flex flex-col gap-3">
        {/* Top row: kicker + right actions */}
        {(kicker || right) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            {kicker && (
              <div className="flex items-center gap-2">
                <div className="universe-status-dot" />
                <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${theme.accentText} opacity-70`}>
                  {kicker}
                </p>
              </div>
            )}
            {right && (
              <div className="flex items-center gap-3 flex-wrap sm:ml-auto w-full sm:w-auto">
                {right}
              </div>
            )}
          </div>
        )}

        {/* Title row */}
        <div>
          <h1 className={`${titleFont} text-2xl md:text-3xl font-black text-white tracking-tight leading-tight`}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Premium Divider (Phase 6) */}
      <div className="relative mt-5">
        <div className={`h-px bg-gradient-to-r ${theme.navItemGlow} opacity-40 w-full`} />
        <div className={`absolute top-0 left-0 w-24 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent animate-marquee-reverse opacity-50`} />
      </div>
    </header>
  );
}
