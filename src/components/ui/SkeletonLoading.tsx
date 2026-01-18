'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Base Skeleton component with pulse animation
 */
export function Skeleton({ className, style }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-lg bg-slate-200/50 dark:bg-slate-700/50',
                className
            )}
            style={style}
        />
    );
}

/**
 * Skeleton for stat cards (dashboard summary)
 */
export function SkeletonCard() {
    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10">
            <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </div>
        </div>
    );
}

/**
 * Grid of skeleton cards for dashboard loading state
 */
export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

/**
 * Skeleton for table rows
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="border-b border-white/5">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                </td>
            ))}
        </tr>
    );
}

/**
 * Full skeleton table with header and rows
 */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center gap-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-24 ml-auto rounded-xl" />
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="py-4 px-4 text-left">
                                    <Skeleton className="h-3 w-20" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, i) => (
                            <SkeletonTableRow key={i} columns={columns} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/**
 * Skeleton for assignment/material cards in list view
 */
export function SkeletonListItem() {
    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/10 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
    );
}

/**
 * Skeleton for a list of items
 */
export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonListItem key={i} />
            ))}
        </div>
    );
}

/**
 * Skeleton for chart/graph areas
 */
export function SkeletonChart() {
    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="h-64 flex items-end justify-between gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1 rounded-t-lg"
                        style={{ height: `${30 + Math.random() * 60}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Full page loading skeleton for dashboard
 */
export function SkeletonDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SkeletonCardGrid count={4} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SkeletonChart />
                <SkeletonTable rows={5} columns={3} />
            </div>
        </div>
    );
}
