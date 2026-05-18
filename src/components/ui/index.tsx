export { StatCard } from './StatCard';
export { Modal, ModalFooter } from './Modal';
export { NavItem } from './NavItem';
export { Spinner } from './Spinner';
export { ErrorBanner, SuccessBanner } from './Banners';
export { ToastProvider, useToast } from './Toast';
export { NotificationBell } from './NotificationBell';
export { Skeleton, CardSkeleton, TableSkeleton, StatsSkeleton, ChartSkeleton, DashboardSkeleton } from './Skeleton';
export { EmptyState } from './EmptyState';
export { Breadcrumb } from './Breadcrumb';
export { ThemeProvider, useTheme } from './ThemeProvider';
export { ThemeToggle } from './ThemeToggle';
export { SearchBar } from './SearchBar';
export { Footer } from './Footer';
export { LocaleSwitcher } from './LocaleSwitcher';
export { ResponsiveTable, Table, TableHead, TableBody, TableRow, TableCell } from './ResponsiveTable';
export { OnboardingModal, HelpButton } from './OnboardingModal';
export { EntranceAnimation } from './EntranceAnimation';
export { AnnouncementBoard } from './AnnouncementBoard';
export { ReminderWidget } from './ReminderWidget';
export { DeadlineCountdown } from './DeadlineCountdown';
export { FocusModeToggle } from './FocusModeToggle';
export { LowDataToggle } from './LowDataToggle';
export { TiltCard } from './TiltCard';
export { HoloCard } from './HoloCard';
export { AnimatedTabContent } from './AnimatedTabContent';
export { PageTransitionProvider } from './PageTransitionProvider';
export { CommandPalette } from './CommandPalette';
export type { CommandItem } from './CommandPalette';
export { KPICard } from './KPICard';
export { AlertCard } from './AlertCard';
export { ProgressRing } from './ProgressRing';
export { DetailDrawer } from './DetailDrawer';
export { DataTable } from './DataTable';
export type { Column } from './DataTable';
export { TrendChart } from './TrendChart';
export { UniverseSkeleton } from './UniverseSkeleton';
export { ProfileSettingsModal } from './ProfileSettingsModal';
export { ErrorBoundary } from './ErrorBoundary';
export { QuickAddModal } from './QuickAddModal';

// Attendance stat component used in AttendancePanel
export function AttendanceStat({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
    return (
        <div className={`${bg} p-6 rounded-3xl text-center`}>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
        </div>
    );
}
