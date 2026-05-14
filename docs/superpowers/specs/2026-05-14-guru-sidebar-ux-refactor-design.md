# KlolaKelas Guru Panel — UX/UI Refactor Design Spec

## Context

Guru sidebar panel currently uses a generic layout with basic indigo theme. The goal is to transform it into a premium, highly efficient, and delightful workspace that feels uniquely "KlolaKelas." Using a Frankenstein approach, we'll combine the best design patterns from Linear (glassmorphism + subtle depth), Notion (clean bento grid), and custom innovations (unique visual identity, strong USPs). The result should maximize workflow efficiency, be intuitive to use, and carry a distinctive personality that makes KlolaKelas memorable.

---

## Design Philosophy

**Personality:** "Morning Architect Studio" — A focused, elegant workspace where teachers craft their lessons with clarity and intention. Calm but not boring. Professional but with warmth.

**Core Principles:**
1. **Zero friction** — Every action reachable within 2 clicks
2. **Bento-first** — Information density with visual hierarchy
3. **Smart defaults** — Contextual intelligence everywhere
4. **Delight micro-moments** — Subtle animations that reward interaction

---

## Visual Identity

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--guru-bg-deep` | `#080C16` | Main background |
| `--guru-bg-surface` | `#0D1526` | Card/sidebar backgrounds |
| `--guru-bg-elevated` | `#141E35` | Elevated panels |
| `--guru-primary` | `#6366F1` | Indigo — primary actions |
| `--guru-accent` | `#A78BFA` | Violet — highlights, glows |
| `--guru-success` | `#10B981` | Emerald — positive states |
| `--guru-warning` | `#F59E0B` | Amber — warnings, pending |
| `--guru-danger` | `#EF4444` | Rose — errors, destructive |
| `--guru-text` | `#E2E8F0` | Primary text |
| `--guru-text-muted` | `#64748B` | Secondary text |
| `--guru-border` | `rgba(99,102,241,0.15)` | Subtle indigo borders |

### Typography

- **Display:** `Fraunces` (existing) — Headings, titles, logo
- **UI:** `Outfit` (existing) — Body, labels, navigation
- **Mono:** `Geist Mono` (existing) — Stats, numbers, badges

### Spatial System

- Border radius: `1.5rem` (24px) for cards, `1rem` (16px) for buttons
- Spacing scale: 4px base unit
- Shadow: Layered indigo glow effect on hover

---

## Component Designs

### 1. Sidebar — "Command Center" Layout

**Structure:**
- Logo + branding with current workspace indicator
- Navigation items with icons, labels, descriptions
- Active state: Gradient left border + glow background
- Hover state: Lift effect + icon color transition
- Keyboard shortcuts displayed
- Mini workspace preview at top

### 2. Bento Grid Dashboard

**Quick Stats Cards:**
- Glassmorphism with gradient backgrounds
- Animated number counters on load
- Hover: Slight lift + glow intensify

**AI Insights Panel:**
- Contextual AI suggestions
- Anomaly detection highlights

**Work Queue:**
- Pending tasks count
- Due today count
- Recently graded count

### 3. Topbar — "Smart Toolbar"

- Breadcrumb: Role → Tab → Section
- Class Selector with search
- Quick Actions (`C` shortcut)
- Notification bell with badge
- Profile avatar

### 4. Pipeline Kanban

- Columns: To Do → In Progress → Review → Done
- Drag-and-drop cards
- Color-coded by priority
- Progress indicators

### 5. Command Palette

- Trigger: `Cmd+K` or `C` button
- Fuzzy search across all actions
- AI-suggested next actions
- Recent actions learned

### 6. Analytics Dashboard

- Grade distribution donut chart
- Attendance trend area chart
- Student performance bar chart
- AI-generated insights

### 7. Attendance System

- QR Code session generation
- Real-time live dashboard
- Weekly/monthly reports
- Manual override with logging

### 8. Discussion Forum

- Anonymous student posting
- Teacher moderation tools
- Sentiment visualization
- Trending highlights

---

## Unique Selling Points

1. **Morning Ritual Welcome** — Daily greeting, agenda preview
2. **Smart Workflow Automation** — Keyboard shortcuts, AI grading
3. **Visual Intelligence Dashboard** — One-glance class health
4. **Modular Bento Workspace** — Drag-and-drop widgets
5. **Premium Micro-Interactions** — Satisfying animations

---

## Implementation Order

### Phase 1: Foundation
1. Design tokens & CSS variables
2. New Sidebar component
3. Updated Topbar

### Phase 2: Dashboard
4. Bento grid layout
5. Animated stat cards
6. Quick actions toolbar

### Phase 3: Core Features
7. Pipeline Kanban
8. Analytics enhancements
9. Attendance polish

### Phase 4: Polish & USP
10. Command Palette improvements
11. AI Insights integration
12. Micro-interactions
13. Keyboard shortcuts