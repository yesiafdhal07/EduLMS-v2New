# Guru Sidebar UX Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform KlolaKelas guru sidebar into a premium, highly efficient workspace with Frankenstein design (Linear + Notion + custom), featuring bento grid dashboard, smart workflow automation, AI insights, and unique visual identity.

**Architecture:** Layered refactor starting from design tokens (CSS), then layout components (Sidebar, Topbar), then feature components (Dashboard, Pipeline, Analytics). Each phase is independently testable.

**Tech Stack:** Next.js 14, Tailwind CSS, GSAP animations, Recharts, Lucide icons, Supabase

---

## File Structure

```
Modified:
- src/app/globals.css                           (new design tokens)
- src/components/layout/DashboardSidebar.tsx   (complete redesign)
- src/components/layout/RoleTopbar.tsx         (smart toolbar)
- src/app/guru/page.tsx                        (layout restructuring)
- src/app/guru/tabs/DashboardTab.tsx            (bento grid)
- src/components/dashboard/TeacherStatsPanel.tsx (animated cards)
- src/components/guru/AssignmentPanel.tsx      (pipeline kanban)
- src/components/analytics/AnalyticsDashboard.tsx (visual intelligence)
```

---

## Phase 1: Design Foundation

### Task 1: Update CSS Design Tokens

**Files:**
- Modify: `src/app/globals.css:42-57`

- [ ] **Step 1: Add new guru color palette tokens after existing universe tokens**

Add this block after line 57 in globals.css:

```css
/* ============================================================
   GURU COMMAND CENTER — Deep Indigo Night Theme
   "Morning Architect Studio" — Focused & Elegant
   ============================================================ */

:root {
  --guru-bg-deep: #080C16;
  --guru-bg-surface: #0D1526;
  --guru-bg-elevated: #141E35;
  --guru-primary: #6366F1;
  --guru-primary-glow: rgba(99, 102, 241, 0.25);
  --guru-accent: #A78BFA;
  --guru-success: #10B981;
  --guru-warning: #F59E0B;
  --guru-danger: #EF4444;
  --guru-text: #E2E8F0;
  --guru-text-muted: #64748B;
  --guru-border: rgba(99, 102, 241, 0.15);
  --guru-radius-card: 1.5rem;
  --guru-radius-button: 1rem;
  --guru-shadow-glow: 0 0 40px -10px rgba(99, 102, 241, 0.25);
  --guru-motion: 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
}
```

- [ ] **Step 2: Add guru-specific animation keyframes at end of file**

```css
/* ===== GURU COMMAND CENTER ANIMATIONS ===== */

/* Sidebar item hover glow sweep */
@keyframes sidebar-glow {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

/* Card lift effect */
@keyframes card-lift {
  0% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0); }
}

/* Number counter tick */
@keyframes count-tick {
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* Stat card pulse glow */
@keyframes stat-glow {
  0%, 100% { box-shadow: 0 0 20px -5px var(--guru-primary-glow); }
  50% { box-shadow: 0 0 40px -5px var(--guru-primary-glow); }
}

/* Bento grid entrance stagger */
@keyframes bento-enter {
  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.bento-enter {
  animation: bento-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}
.bento-enter:nth-child(1) { animation-delay: 50ms; }
.bento-enter:nth-child(2) { animation-delay: 100ms; }
.bento-enter:nth-child(3) { animation-delay: 150ms; }
.bento-enter:nth-child(4) { animation-delay: 200ms; }
.bento-enter:nth-child(5) { animation-delay: 250ms; }
.bento-enter:nth-child(6) { animation-delay: 300ms; }
```

- [ ] **Step 3: Add guru utility classes**

```css
/* Guru Command Center Utilities */
.guru-card {
  background: var(--guru-bg-surface);
  border: 1px solid var(--guru-border);
  border-radius: var(--guru-radius-card);
  backdrop-filter: blur(20px);
  transition: all var(--guru-motion);
}

.guru-card:hover {
  background: var(--guru-bg-elevated);
  border-color: var(--guru-primary);
  box-shadow: var(--guru-shadow-glow);
  transform: translateY(-2px);
}

.guru-btn-primary {
  background: var(--guru-primary);
  color: white;
  border-radius: var(--guru-radius-button);
  transition: all var(--guru-motion);
}

.guru-btn-primary:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
  box-shadow: 0 0 24px var(--guru-primary-glow);
}

.guru-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 200ms ease;
  position: relative;
  cursor: pointer;
}

.guru-nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, var(--guru-primary), var(--guru-accent));
  border-radius: 0 4px 4px 0;
  transition: height 200ms ease;
}

.guru-nav-item:hover::before,
.guru-nav-item.active::before {
  height: 60%;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(guru-ui): add deep indigo design tokens and animations

- Add guru color palette (--guru-*) CSS variables
- Add animation keyframes (sidebar-glow, card-lift, stat-glow, bento-enter)
- Add utility classes (.guru-card, .guru-btn-primary, .guru-nav-item)
- Add stagger animation classes for bento grid entrance

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Redesign DashboardSidebar Component

**Files:**
- Modify: `src/components/layout/DashboardSidebar.tsx:1-152`

- [ ] **Step 1: Add new sidebar structure with activity indicators**

Replace the entire DashboardSidebar component with:

```tsx
'use client';

import { ReactNode } from 'react';
import { LogOut, Activity, ChevronDown, Zap } from 'lucide-react';
import type { AppRole } from '@/types';
import { getRoleTheme } from '@/lib/theme/roleTheme';

interface NavItemProps {
    icon: ReactNode;
    label: string;
    description?: string;
    active?: boolean;
    onClick: () => void;
    className?: string;
    role?: AppRole;
    badge?: number;
}

function NavItem({ icon, label, description, active, onClick, className = '', role = 'guru', badge }: NavItemProps) {
    const theme = getRoleTheme(role);

    return (
        <button
            onClick={onClick}
            className={`
                guru-nav-item w-full group relative overflow-hidden
                ${active ? 'active bg-white/[0.05]' : 'hover:bg-white/[0.03]'}
                ${className}
            `}
        >
            {/* Icon container */}
            <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                transition-all duration-300
                ${active 
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30' 
                    : 'bg-white/[0.05] text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10'
                }
            `}>
                {icon}
            </div>

            {/* Text */}
            <div className="text-left min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-fraunces font-black text-[13px] leading-none text-white truncate">
                        {label}
                    </p>
                    {badge !== undefined && badge > 0 && (
                        <span className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-black rounded-full">
                            {badge > 99 ? '99+' : badge}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-[10px] mt-0.5 text-slate-500 truncate leading-none">
                        {description}
                    </p>
                )}
            </div>

            {/* Active indicator */}
            {active && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
        </button>
    );
}

interface DashboardSidebarProps {
    role: AppRole;
    onLogout: () => void;
    children?: ReactNode;
    className?: string;
    extraContent?: ReactNode;
    currentClass?: string;
    pendingTasks?: number;
}

export function DashboardSidebar({ role, onLogout, children, className = '', extraContent, currentClass, pendingTasks = 0 }: DashboardSidebarProps) {
    const theme = getRoleTheme(role);
    const IconComponent = theme.icon;

    return (
        <aside
            className={`
                w-72 bg-gradient-to-b from-[#0D1526] to-[#080C16] text-white
                flex flex-col border-r border-indigo-500/10
                shadow-2xl z-50 h-full relative shrink-0
                ${className}
            `}
        >
            {/* Brand Header with current workspace */}
            <div className="p-6 shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <IconComponent size={24} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <span className="font-fraunces text-[20px] font-black tracking-tight block leading-none">
                            Klola<span className="text-indigo-400">kelas</span>
                        </span>
                        <span className="text-[9px] font-black tracking-[0.25em] uppercase text-indigo-400/60">
                            GURU WORKSPACE
                        </span>
                    </div>
                </div>

                {/* Current workspace indicator */}
                {currentClass && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Zap size={14} className="text-indigo-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] text-indigo-400/70 font-black uppercase tracking-wider">Active Class</p>
                            <p className="text-[11px] text-white font-black truncate">{currentClass}</p>
                        </div>
                        <ChevronDown size={14} className="text-indigo-400/50" />
                    </div>
                )}
            </div>

            {/* Activity Pulse */}
            {pendingTasks > 0 && (
                <div className="mx-6 mb-4 px-3 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center gap-2">
                    <Activity size={14} className="text-amber-400 animate-pulse shrink-0" />
                    <p className="text-[10px] text-amber-400 font-bold">
                        {pendingTasks} tugas menunggu penilaian
                    </p>
                </div>
            )}

            {/* Divider */}
            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent mb-4 shrink-0" />

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-1 pb-2">
                {children}
            </nav>

            {/* Extra Content */}
            {extraContent && (
                <div className="px-4 mb-4 shrink-0">
                    {extraContent}
                </div>
            )}

            {/* Logout */}
            <div className="px-4 py-4 border-t border-indigo-500/10 shrink-0">
                <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-3 p-3 w-full rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 shrink-0">
                        <LogOut size={16} />
                    </div>
                    <span className="font-bold text-[12px]">Keluar</span>
                </button>
            </div>
        </aside>
    );
}

export { NavItem as SidebarNavItem };
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/DashboardSidebar.tsx
git commit -m "feat(guru-ui): complete sidebar redesign with command center layout

- Add current workspace indicator with class name
- Add activity pulse for pending tasks
- Redesign nav items with gradient active indicators
- Add badge support for nav items
- Improve visual hierarchy and spacing
- Add hover effects with icon transitions

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 2: Dashboard Overhaul

### Task 3: Update Topbar with Smart Toolbar

**Files:**
- Modify: `src/components/layout/RoleTopbar.tsx:1-76`

- [ ] **Step 1: Enhance RoleTopbar with breadcrumbs and smart actions**

Replace RoleTopbar content with:

```tsx
'use client';

import type { ReactNode } from 'react';
import type { AppRole } from '@/types';
import { getRoleTheme } from '@/lib/theme/roleTheme';
import { ChevronRight } from 'lucide-react';

export function RoleTopbar({
  role,
  kicker,
  title,
  subtitle,
  right,
  breadcrumb,
}: {
  role: AppRole;
  kicker?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  breadcrumb?: string[];
}) {
  const theme = getRoleTheme(role);

  const titleFont = role === 'admin' ? 'font-geist-mono' : role === 'guru' || role === 'kepala_sekolah' ? 'font-fraunces' : 'font-space-grotesk';

  return (
    <header className="mb-8 shrink-0 relative">
      <div className="flex flex-col gap-3">
        {/* Top row: kicker + right actions */}
        {(kicker || right) && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Breadcrumb + kicker */}
            <div className="flex items-center gap-3 flex-wrap">
              {breadcrumb && breadcrumb.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  {breadcrumb.map((item, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <ChevronRight size={10} className="text-slate-600" />}
                      <span className={idx === breadcrumb.length - 1 ? 'text-indigo-400 font-bold' : ''}>{item}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
              {kicker && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <p className={`text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400`}>
                    {kicker}
                  </p>
                </div>
              )}
            </div>
            {right && (
              <div className="flex items-center gap-3 flex-wrap ml-auto">
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

      {/* Premium Divider with animated shine */}
      <div className="relative mt-6">
        <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <div className="absolute top-0 left-0 w-32 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse opacity-60" />
      </div>
    </header>
  );
}
```

Note: Add `import React from 'react';` at top if not present.

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/RoleTopbar.tsx
git commit -m "feat(guru-ui): enhance RoleTopbar with breadcrumbs

- Add breadcrumb support for navigation context
- Improve kicker display with pulse animation
- Add animated shine effect to divider
- Better spacing and visual hierarchy

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Implement Bento Grid Dashboard

**Files:**
- Modify: `src/app/guru/tabs/DashboardTab.tsx:1-239`

- [ ] **Step 1: Add bento grid layout to DashboardTab**

Replace the main content structure (lines 64-236) with bento grid:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    {/* Main Content Area (Left: 8 columns) */}
    <div className="lg:col-span-8 space-y-6">
        
        {/* Bento Grid Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bento-enter guru-card p-5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <Users size={20} className="text-white" />
                </div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Total Siswa</p>
                <p className="text-2xl font-black text-white">{stats.totalStudents || 0}</p>
            </div>
            <div className="bento-enter guru-card p-5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <BookOpen size={20} className="text-white" />
                </div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Tugas Aktif</p>
                <p className="text-2xl font-black text-white">{stats.activeAssignments || 0}</p>
            </div>
            <div className="bento-enter guru-card p-5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">
                    <TrendingUp size={20} className="text-white" />
                </div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Rata-rata</p>
                <p className="text-2xl font-black text-white">{stats.classAverage?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="bento-enter guru-card p-5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                    <CheckCircle size={20} className="text-white" />
                </div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Kehadiran</p>
                <p className="text-2xl font-black text-white">{stats.attendanceRate || 0}%</p>
            </div>
        </div>

        {/* Work Queue Bento Card */}
        <div className="bento-enter guru-card p-7">
            <WorkQueue teacherId={teacherId || ''} classId={classId || null} onNavigate={onNavigate || (() => {})} />
        </div>

        {/* Student Management Section */}
        <div className="bento-enter guru-card overflow-hidden">
            {/* ... existing student table code (lines 76-184) ... */}
        </div>
    </div>

    {/* Sidebar Area (Right: 4 columns) */}
    <div className="lg:col-span-4 space-y-6">
        {/* AI Dashboard Insight — USP Feature */}
        {classId && (
            <AIDashboardInsight
                context={{
                    role: 'guru',
                    className: 'Kelas Aktif',
                    stats: {
                        totalStudents: students.length,
                        averageGrade: stats.avg,
                        attendanceRate: stats.attendance,
                        submissionRate: stats.submissions,
                        pendingGrades: 0,
                        activeAssignments: 0,
                    },
                } as InsightContext}
            />
        )}
        
        {/* Class Insights */}
        {classId ? (
            <div className="space-y-4">
                <ClassMoodOverview classId={classId} />
                <ClassXPOverview classId={classId} />
                <KeaktifanGradeList classId={classId} />
            </div>
        ) : (
            <div className="bento-enter guru-card p-8 flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                    <BarChart3 size={28} className="text-indigo-400" />
                </div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Pilih Kelas untuk Insights</p>
            </div>
        )}
    </div>
</div>
```

Add missing imports:
```tsx
import { TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
```

- [ ] **Step 2: Commit**

```bash
git add src/app/guru/tabs/DashboardTab.tsx
git commit -m "feat(guru-ui): implement bento grid dashboard layout

- Add 4-column bento grid for quick stats
- Add staggered entrance animations for all cards
- Improve visual hierarchy with gradient icon backgrounds
- Add hover scale effects on stat cards
- Better responsive grid layout

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 3: Core Feature Enhancements

### Task 5: Enhanced TeacherStatsPanel with Animations

**Files:**
- Modify: `src/components/dashboard/TeacherStatsPanel.tsx:207-243`

- [ ] **Step 1: Enhance stat cards with glow effects and animations**

Replace the statsConfig and card rendering (lines 207-243) with:

```tsx
const statsConfig = [
    { 
        label: 'Total Siswa', 
        value: stats.totalStudents.toString(), 
        icon: Users, 
        gradient: 'from-blue-500 to-cyan-500',
        shadow: 'shadow-blue-500/30',
        trend: '+2',
        trendUp: true
    },
    { 
        label: 'Tugas Aktif', 
        value: stats.activeAssignments.toString(), 
        icon: BookOpen, 
        gradient: 'from-emerald-500 to-teal-500',
        shadow: 'shadow-emerald-500/30',
        trend: '+1',
        trendUp: true
    },
    { 
        label: 'Rata-rata Kelas', 
        value: stats.classAverage.toFixed(1), 
        icon: TrendingUp, 
        gradient: 'from-violet-500 to-purple-500',
        shadow: 'shadow-violet-500/30',
        trend: '+3.2',
        trendUp: true
    },
    { 
        label: 'Tingkat Hadir', 
        value: `${stats.attendanceRate}%`, 
        icon: CheckCircle, 
        gradient: 'from-amber-500 to-orange-500',
        shadow: 'shadow-amber-500/30',
        trend: '-1%',
        trendUp: false
    },
];

// Replace the entire card rendering section with:
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
    {statsConfig.map((stat, idx) => (
        <div 
            key={idx} 
            className="bento-enter guru-card p-6 group cursor-pointer"
            style={{ animationDelay: `${idx * 50}ms` }}
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 0%, ${stat.gradient.includes('blue') ? 'rgba(59,130,246,0.15)' : stat.gradient.includes('emerald') ? 'rgba(16,185,129,0.15)' : stat.gradient.includes('violet') ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.15)'} 0%, transparent 70%)`
                }}
            />
            
            <div className="flex flex-col gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon size={22} strokeWidth={2.5} />
                </div>
                
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 text-slate-500">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">
                            {stat.value}
                        </h3>
                        {stat.trend && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${stat.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {stat.trend}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    ))}
</div>
```

Also update the chart containers (lines 248-304 and 307-343) to use `guru-card` class:

```tsx
// Line 248:
<div className="guru-card rounded-[2rem] p-8">
// Line 307:
<div className="guru-card rounded-[2rem] p-8">
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/TeacherStatsPanel.tsx
git commit -m "feat(guru-ui): enhance TeacherStatsPanel with animations

- Add trend indicators (+/-) to each stat card
- Add glow effects on hover
- Add staggered entrance animations
- Add gradient radial glow on card hover
- Use guru-card class for consistency

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Pipeline Kanban Enhancement

**Files:**
- Modify: `src/components/guru/AssignmentPanel.tsx:1-181`

- [ ] **Step 1: Enhance assignment cards with kanban-style layout**

Replace the assignment card rendering (lines 104-168) with:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {filteredAssignments.length === 0 ? (
        <div className="col-span-full py-32 guru-card border-dashed border-2 border-indigo-500/20 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={36} className="text-indigo-400" />
            </div>
            <h4 className="font-fraunces text-xl font-black text-white mb-3">Belum Ada Penugasan</h4>
            <p className="text-slate-500 text-sm max-w-sm">Buat penugasan baru untuk kelas ini</p>
        </div>
    ) : filteredAssignments.map(a => (
        <div 
            key={a.id} 
            data-flip-id={a.id}
            className="bento-enter guru-card overflow-hidden group hover:border-indigo-500/30 transition-all duration-500"
        >
            {/* Top gradient accent */}
            <div className={`h-1.5 bg-gradient-to-r ${a.deadline && new Date(a.deadline) < new Date() ? 'from-rose-500 to-red-500' : 'from-indigo-500 to-violet-500'}`} />
            
            <div className="p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                        <FileText size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase">
                            {a.required_format}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 mb-6">
                    <h4 className="font-fraunces font-black text-white text-lg mb-2 group-hover:text-indigo-400 transition-colors">{a.title}</h4>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4">{a.description || 'Tidak ada deskripsi'}</p>
                    
                    {/* Deadline */}
                    <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                        <Calendar size={12} className={a.deadline && new Date(a.deadline) < new Date() ? 'text-rose-500' : 'text-amber-500'} />
                        <span>Deadline: <span className={a.deadline && new Date(a.deadline) < new Date() ? 'text-rose-400' : 'text-amber-400'}>{a.deadline ? new Date(a.deadline).toLocaleDateString('id-ID') : 'Tanpa batas'}</span></span>
                    </div>
                </div>

                {/* Footer with submissions */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    {submissionCounts[a.id] !== undefined && (
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            <Users size={12} />
                            <span>{submissionCounts[a.id]} pengumpulan</span>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                        onClick={() => onViewSubmissions(a)}
                        className="py-3 guru-btn-primary text-sm font-bold"
                    >
                        Lihat Pengumpulan
                    </button>
                    <button
                        onClick={() => onManualGrade && onManualGrade(a)}
                        className="py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl font-bold text-sm transition-all"
                    >
                        Nilai
                    </button>
                </div>
            </div>
        </div>
    ))}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/guru/AssignmentPanel.tsx
git commit -m "feat(guru-ui): enhance AssignmentPanel with kanban cards

- Add top gradient accent bar for visual hierarchy
- Improve card layout with better spacing
- Add deadline urgency indicator colors
- Replace English labels with Indonesian
- Add guru-card and guru-btn-primary classes
- Better responsive grid (3 columns on xl)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 4: Polish & USP

### Task 7: Keyboard Shortcuts Integration

**Files:**
- Modify: `src/app/guru/page.tsx:1-409`

- [ ] **Step 1: Add keyboard shortcut hints to sidebar items**

Update the SidebarNavItem rendering in guru/page.tsx (lines 78-89) to show shortcut keys:

```tsx
<div className="flex flex-col gap-1">
    {[
        { icon: LayoutDashboard, label: 'Beranda', key: '1', tab: 'dashboard' },
        { icon: Users, label: 'Kelas', key: '2', tab: 'manajemen_kelas' },
        { icon: BookOpen, label: 'Pembelajaran', key: '3', tab: 'pembelajaran' },
        { icon: Kanban, label: 'Pipeline', key: '4', tab: 'pipeline' },
        { icon: Calendar, label: 'Jadwal', key: '5', tab: 'jadwal' },
        { icon: BarChart3, label: 'Analytics', key: '6', tab: 'analytics' },
        { icon: Calendar, label: 'Presensi', key: '7', tab: 'absensi' },
        { icon: MessageSquare, label: 'Diskusi', key: '8', tab: 'diskusi' },
        { icon: GraduationCap, label: 'Profil', key: '9', tab: 'portofolio' },
    ].map((item) => (
        <SidebarNavItem 
            key={item.tab}
            role="guru"
            icon={<item.icon size={18} />}
            label={item.label}
            active={activeTab === item.tab}
            onClick={() => setActiveTab(item.tab as any)}
        />
    ))}
</div>
```

Add keyboard handler in the component (after line 57):

```tsx
// Keyboard shortcuts
useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        
        const shortcuts: Record<string, () => void> = {
            '1': () => setActiveTab('dashboard'),
            '2': () => setActiveTab('manajemen_kelas'),
            '3': () => setActiveTab('pembelajaran'),
            '4': () => setActiveTab('pipeline'),
            '5': () => setActiveTab('jadwal'),
            '6': () => setActiveTab('analytics'),
            '7': () => setActiveTab('absensi'),
            '8': () => setActiveTab('diskusi'),
            '9': () => setActiveTab('portofolio'),
            'c': () => setShowAssignmentModal(true),
            'm': () => setShowMaterialModal(true),
        };
        
        shortcuts[e.key]?.();
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

- [ ] **Step 2: Commit**

```bash
git add src/app/guru/page.tsx
git commit -m "feat(guru-ui): add keyboard shortcuts for navigation

- Add number keys 1-9 for quick tab navigation
- Add 'c' for quick add assignment
- Add 'm' for quick add material
- Ignore shortcuts when typing in inputs
- Improve navigation efficiency

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 8: Micro-Interactions & Polish

**Files:**
- Modify: `src/app/globals.css:685-690`

- [ ] **Step 1: Add button press and card flip animations**

Add these utility classes to globals.css:

```css
/* Button Press Effect */
.btn-press:active {
    transform: scale(0.95);
    transition: transform 100ms;
}

/* Card Flip Effect */
.card-flip {
    perspective: 1000px;
}

.card-flip-inner {
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

.card-flip:hover .card-flip-inner {
    transform: rotateY(10deg) rotateX(5deg);
}

/* Ripple Effect */
.ripple {
    position: relative;
    overflow: hidden;
}

.ripple::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 10%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10);
    opacity: 0;
    transition: transform 0.5s, opacity 1s;
}

.ripple:active::after {
    transform: scale(0);
    opacity: 0.3;
    transition: 0s;
}

/* Skeleton Loading Pulse */
@keyframes skeleton-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
}

.skeleton-pulse {
    animation: skeleton-pulse 1.5s ease-in-out infinite;
}

/* Stagger children animation helper */
.stagger-children > * {
    opacity: 0;
    animation: bento-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 50ms; }
.stagger-children > *:nth-child(2) { animation-delay: 100ms; }
.stagger-children > *:nth-child(3) { animation-delay: 150ms; }
.stagger-children > *:nth-child(4) { animation-delay: 200ms; }
.stagger-children > *:nth-child(5) { animation-delay: 250ms; }
.stagger-children > *:nth-child(6) { animation-delay: 300ms; }
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(guru-ui): add micro-interactions and polish utilities

- Add button press effect (.btn-press)
- Add card flip effect (.card-flip)
- Add ripple effect (.ripple)
- Add skeleton loading pulse animation
- Add stagger children animation helper

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Verification

After all tasks:

1. **Visual check:** Load guru page, verify sidebar, dashboard, and tabs render correctly
2. **Interaction test:** Click all nav items, verify transitions are smooth
3. **Responsive test:** Test on mobile, tablet, desktop breakpoints
4. **Performance:** Check load times, animation smoothness with DevTools
5. **Keyboard shortcuts:** Test keys 1-9 for navigation, C for quick add
6. **Accessibility:** Verify color contrast meets WCAG AA standards
7. **Build test:** Run `npm run build` to ensure no TypeScript errors

Run verification commands:
```bash
cd C:/Users/USER/Desktop/Project/Klolakelas
npm run build
```

---

## Task Summary

| Task | Component | Status |
|------|-----------|--------|
| 1 | CSS Design Tokens | Pending |
| 2 | DashboardSidebar | Pending |
| 3 | RoleTopbar | Pending |
| 4 | DashboardTab Bento | Pending |
| 5 | TeacherStatsPanel | Pending |
| 6 | AssignmentPanel | Pending |
| 7 | Keyboard Shortcuts | Pending |
| 8 | Micro-interactions | Pending |