'use client';

import { CSSProperties, memo } from 'react';

interface SkeletonProps {
    className?: string;
    style?: CSSProperties;
}

/**
 * Skeleton - Memoized loading placeholder component
 * Supports both light and dark mode with smooth animation
 */
export const Skeleton = memo(function Skeleton({ className = '', style }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] rounded-lg ${className}`}
            style={style}
        />
    );
});

export function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-lg dark:shadow-none">
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-white/10">
                <Skeleton className="h-6 w-48" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-50 dark:border-white/5">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-14 h-14 rounded-xl" />
                        <div>
                            <Skeleton className="h-8 w-20 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-3 mb-6">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <div className="h-64 flex items-end gap-2 justify-center">
                {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                    <Skeleton key={i} className="w-8 rounded-t-lg" style={{ height: `${h}%` }} />
                ))}
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <StatsSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartSkeleton />
                <CardSkeleton />
            </div>
            <TableSkeleton rows={5} />
        </div>
    );
}
