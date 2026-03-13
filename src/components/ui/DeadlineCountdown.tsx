'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface DeadlineCountdownProps {
    deadline: string | Date;
    title?: string;
    variant?: 'compact' | 'full';
    className?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

/**
 * Anti-Procrastination Deadline Countdown
 * Shows real-time countdown with urgency colors
 */
export function DeadlineCountdown({ 
    deadline, 
    title, 
    variant = 'compact',
    className = ''
}: DeadlineCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [mounted, setMounted] = useState(false);

    const deadlineDate = useMemo(() => new Date(deadline), [deadline]);

    useEffect(() => {
        setMounted(true);
        
        const calculateTimeLeft = (): TimeLeft => {
            const now = new Date().getTime();
            const target = deadlineDate.getTime();
            const difference = target - now;

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / (1000 * 60)) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                total: difference
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [deadlineDate]);

    // Prevent hydration mismatch
    if (!mounted || !timeLeft) {
        return <span className="text-slate-400 text-sm">Memuat...</span>;
    }

    // Already passed
    if (timeLeft.total <= 0) {
        return (
            <div className={`flex items-center gap-2 text-rose-400 ${className}`}>
                <AlertTriangle size={16} />
                <span className="font-bold text-sm">Deadline terlewat!</span>
            </div>
        );
    }

    // Determine urgency level
    const hoursRemaining = timeLeft.total / (1000 * 60 * 60);
    let urgencyClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let icon = <CheckCircle size={16} className="text-emerald-400" />;

    if (hoursRemaining < 2) {
        urgencyClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse';
        icon = <AlertTriangle size={16} className="text-rose-400" />;
    } else if (hoursRemaining < 24) {
        urgencyClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        icon = <Clock size={16} className="text-amber-400" />;
    }

    // Format display string
    const formatTime = () => {
        const parts: string[] = [];
        
        if (timeLeft.days > 0) {
            parts.push(`${timeLeft.days}h`);
        }
        if (timeLeft.hours > 0 || timeLeft.days > 0) {
            parts.push(`${timeLeft.hours}j`);
        }
        parts.push(`${timeLeft.minutes}m`);
        
        if (variant === 'full' || hoursRemaining < 1) {
            parts.push(`${timeLeft.seconds}d`);
        }

        return parts.join(' ');
    };

    if (variant === 'compact') {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${urgencyClass} ${className}`}>
                {icon}
                <span>Sisa {formatTime()}</span>
            </div>
        );
    }

    // Full variant with title
    return (
        <div className={`flex flex-col gap-2 p-4 rounded-2xl border ${urgencyClass} ${className}`}>
            {title && (
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-bold text-sm truncate">{title}</span>
                </div>
            )}
            <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-black/20 rounded-xl p-2">
                    <span className="text-2xl font-black block">{timeLeft.days}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-70">Hari</span>
                </div>
                <div className="bg-black/20 rounded-xl p-2">
                    <span className="text-2xl font-black block">{timeLeft.hours}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-70">Jam</span>
                </div>
                <div className="bg-black/20 rounded-xl p-2">
                    <span className="text-2xl font-black block">{timeLeft.minutes}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-70">Menit</span>
                </div>
                <div className="bg-black/20 rounded-xl p-2">
                    <span className="text-2xl font-black block">{timeLeft.seconds}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-70">Detik</span>
                </div>
            </div>
        </div>
    );
}

export default DeadlineCountdown;
