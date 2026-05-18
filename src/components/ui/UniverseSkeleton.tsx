'use client';

import React from 'react';
import { getRoleTheme } from '@/lib/theme/roleTheme';
import type { AppRole } from '@/types';

interface UniverseSkeletonProps {
    role: AppRole;
    type: 'card' | 'list' | 'stats' | 'chart' | 'table';
    count?: number;
    className?: string;
}

export function UniverseSkeleton({ role, type, count = 1, className = '' }: UniverseSkeletonProps) {
    const theme = getRoleTheme(role);

    const renderSkeleton = () => {
        switch (type) {
            case 'stats':
                return (
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="universe-card p-6 min-h-[120px] flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
                                    <div className="w-12 h-4 rounded-full bg-white/5 animate-pulse" />
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="w-1/2 h-3 rounded bg-white/5 animate-pulse" />
                                    <div className="w-3/4 h-6 rounded-lg bg-white/5 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'card':
                return (
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
                        {Array.from({ length: count }).map((_, i) => (
                            <div key={i} className="universe-card p-6 aspect-[4/3] flex flex-col">
                                <div className="w-full h-32 rounded-2xl bg-white/5 animate-pulse mb-4" />
                                <div className="space-y-3">
                                    <div className="w-1/4 h-3 rounded bg-white/5 animate-pulse" />
                                    <div className="w-full h-5 rounded-lg bg-white/5 animate-pulse" />
                                    <div className="w-2/3 h-4 rounded bg-white/5 animate-pulse" />
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between">
                                    <div className="w-20 h-4 rounded bg-white/5 animate-pulse" />
                                    <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'list':
                return (
                    <div className={`space-y-3 ${className}`}>
                        {Array.from({ length: count }).map((_, i) => (
                            <div key={i} className="universe-card p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-1/3 h-4 rounded bg-white/5 animate-pulse" />
                                    <div className="w-1/2 h-3 rounded bg-white/5 animate-pulse" />
                                </div>
                                <div className="w-20 h-8 rounded-xl bg-white/5 animate-pulse" />
                            </div>
                        ))}
                    </div>
                );

            case 'chart':
                return (
                    <div className={`universe-card p-8 min-h-[300px] flex flex-col ${className}`}>
                        <div className="flex justify-between items-end h-48 gap-4 mb-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className="flex-1 bg-white/5 rounded-t-lg animate-pulse"
                                    style={{ height: `${20 + ((i * 13) % 70)}%`, animationDelay: `${i * 100}ms` }}
                                />
                            ))}
                        </div>
                        <div className="h-px bg-white/10 w-full mb-4" />
                        <div className="flex justify-between gap-4">
                             <div className="w-1/4 h-4 rounded bg-white/5 animate-pulse" />
                             <div className="w-1/4 h-4 rounded bg-white/5 animate-pulse" />
                        </div>
                    </div>
                );

            case 'table':
                return (
                    <div className={`universe-card overflow-hidden ${className}`}>
                        <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                            <div className="w-1/4 h-5 rounded bg-white/5 animate-pulse" />
                        </div>
                        <div className="p-0">
                            {Array.from({ length: count }).map((_, i) => (
                                <div key={i} className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                                        <div className="w-1/3 h-4 rounded bg-white/5 animate-pulse" />
                                    </div>
                                    <div className="w-24 h-4 rounded bg-white/5 animate-pulse" />
                                    <div className="w-24 h-4 rounded bg-white/5 animate-pulse hidden md:block" />
                                    <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse ml-4" />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="relative isolate overflow-hidden">
            {renderSkeleton()}
            {/* Cinematic Shimmer Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer -translate-x-full" />
        </div>
    );
}
