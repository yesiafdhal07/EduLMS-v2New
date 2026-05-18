'use client';

import type { ReactNode } from 'react';
import type { AppRole } from '@/types';
import { getRoleTheme } from '@/lib/theme/roleTheme';

export function RoleSectionHeader({
  role,
  title,
  description,
  right,
}: {
  role: AppRole;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  const theme = getRoleTheme(role);

  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${theme.accentBgStrong}`} />
          {title}
        </h3>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

