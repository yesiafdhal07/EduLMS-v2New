'use client';

import type { ReactNode } from 'react';
import type { AppRole } from '@/types';
import { getRoleTheme } from '@/lib/theme/roleTheme';

import { RoleBackground } from './RoleBackground';

const ROLE_TO_UNIVERSE: Record<AppRole, string> = {
  guru: 'guru',
  siswa: 'siswa',
  kepala_sekolah: 'kepala_sekolah',
  admin: 'admin',
  orang_tua: 'orang_tua',
};

export function RoleShell({
  role,
  children,
  className = '',
}: {
  role: AppRole;
  children: ReactNode;
  className?: string;
}) {
  const theme = getRoleTheme(role);
  const universe = ROLE_TO_UNIVERSE[role] || role;

  return (
    <div
      className={`h-screen w-full ${theme.shellBg} ${className} relative isolate flex overflow-hidden`}
      data-universe={universe}
    >
      <RoleBackground role={role} />
      {children}
    </div>
  );
}
