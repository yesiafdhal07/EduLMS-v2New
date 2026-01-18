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

// Attendance stat component used in AttendancePanel
export function AttendanceStat({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
    return (
        <div className={`${bg} p-6 rounded-3xl text-center`}>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
        </div>
    );
}
