'use client';

import { ReactNode, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ResponsiveTableProps {
    children: ReactNode;
    className?: string;
}

export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
    return (
        <div className={`overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
            <div className="inline-block min-w-full align-middle">
                {children}
            </div>
        </div>
    );
}

interface TableProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children, className = '' }: TableProps) {
    return (
        <table
            className={`min-w-full divide-y divide-slate-200 dark:divide-white/10 ${className}`}
            role="table"
        >
            {children}
        </table>
    );
}

export function TableHead({ children, className = '' }: TableProps) {
    return (
        <thead className={`bg-slate-50 dark:bg-white/5 ${className}`}>
            {children}
        </thead>
    );
}

export function TableBody({ children, className = '' }: TableProps) {
    return (
        <tbody
            className={`divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-transparent ${className}`}
        >
            {children}
        </tbody>
    );
}

export function TableRow({ children, className = '' }: TableProps) {
    return (
        <tr
            className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${className}`}
        >
            {children}
        </tr>
    );
}

interface TableCellProps {
    children: ReactNode;
    className?: string;
    header?: boolean;
    scope?: 'col' | 'row';
}

export function TableCell({ children, className = '', header = false, scope }: TableCellProps) {
    const baseClasses = 'px-4 py-3 text-sm';
    const headerClasses = 'font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider text-xs';
    const cellClasses = 'text-slate-700 dark:text-slate-300';

    if (header) {
        return (
            <th
                scope={scope || 'col'}
                className={`${baseClasses} ${headerClasses} ${className}`}
            >
                {children}
            </th>
        );
    }

    return (
        <td className={`${baseClasses} ${cellClasses} ${className}`}>
            {children}
        </td>
    );
}

// ========================================
// NEW: Mobile Card View Components
// ========================================

interface MobileCardListProps<T> {
    data: T[];
    renderCard: (item: T, index: number) => ReactNode;
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
    className?: string;
}

export function MobileCardList<T>({
    data,
    renderCard,
    keyExtractor,
    emptyMessage = 'Tidak ada data',
    className = '',
}: MobileCardListProps<T>) {
    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {data.map((item, index) => (
                <div key={keyExtractor(item)}>
                    {renderCard(item, index)}
                </div>
            ))}
        </div>
    );
}

interface DataCardProps {
    title: string;
    subtitle?: string;
    badge?: ReactNode;
    fields: { label: string; value: ReactNode }[];
    actions?: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function DataCard({
    title,
    subtitle,
    badge,
    fields,
    actions,
    className = '',
    onClick,
}: DataCardProps) {
    return (
        <div
            onClick={onClick}
            className={`
                bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4
                ${onClick ? 'cursor-pointer hover:bg-white/10 transition-all' : ''}
                ${className}
            `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">{title}</h4>
                    {subtitle && (
                        <p className="text-sm text-slate-400 truncate">{subtitle}</p>
                    )}
                </div>
                {badge && <div className="ml-2 shrink-0">{badge}</div>}
            </div>

            {/* Fields */}
            <div className="space-y-2 mb-3">
                {fields.map((field, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{field.label}</span>
                        <span className="text-white font-medium">{field.value}</span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            {actions && (
                <div className="pt-3 border-t border-white/10 flex gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

// View Toggle Button
interface ViewToggleProps {
    view: 'table' | 'card';
    onChange: (view: 'table' | 'card') => void;
    className?: string;
}

export function ViewToggle({ view, onChange, className = '' }: ViewToggleProps) {
    return (
        <div className={`flex bg-white/5 rounded-lg p-1 ${className}`}>
            <button
                onClick={() => onChange('table')}
                className={`p-2 rounded-md transition-all ${
                    view === 'table' 
                        ? 'bg-indigo-500 text-white' 
                        : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Table view"
            >
                <List size={18} />
            </button>
            <button
                onClick={() => onChange('card')}
                className={`p-2 rounded-md transition-all ${
                    view === 'card' 
                        ? 'bg-indigo-500 text-white' 
                        : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Card view"
            >
                <LayoutGrid size={18} />
            </button>
        </div>
    );
}

// Hook for responsive view
export function useResponsiveView(defaultView: 'table' | 'card' = 'table') {
    const [view, setView] = useState<'table' | 'card'>(defaultView);
    
    // Auto-switch to card view on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768 && view === 'table') {
        // Only suggest card view, don't force
    }
    
    return { view, setView };
}
