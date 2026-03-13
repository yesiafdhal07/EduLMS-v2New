'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, X, ChevronDown, ChevronUp } from 'lucide-react';

type TimerMode = 'focus' | 'break';

interface PomodoroTimerProps {
    defaultFocusMinutes?: number;
    defaultBreakMinutes?: number;
    className?: string;
}

/**
 * Smart Study Timer (Pomodoro Technique)
 * Floating widget for focus sessions
 */
export function PomodoroTimer({ 
    defaultFocusMinutes = 25, 
    defaultBreakMinutes = 5,
    className = ''
}: PomodoroTimerProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(defaultFocusMinutes * 60);
    const [sessions, setSessions] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio on client side
    useEffect(() => {
        audioRef.current = new Audio('/sounds/bell.mp3');
        audioRef.current.volume = 0.5;
    }, []);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer completed
            audioRef.current?.play().catch(() => {
                // Audio blocked by browser, ignore
            });
            
            if (mode === 'focus') {
                setSessions(prev => prev + 1);
                setMode('break');
                setTimeLeft(defaultBreakMinutes * 60);
            } else {
                setMode('focus');
                setTimeLeft(defaultFocusMinutes * 60);
            }
            setIsRunning(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, timeLeft, mode, defaultFocusMinutes, defaultBreakMinutes]);

    const toggleTimer = useCallback(() => {
        setIsRunning(prev => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(mode === 'focus' ? defaultFocusMinutes * 60 : defaultBreakMinutes * 60);
    }, [mode, defaultFocusMinutes, defaultBreakMinutes]);

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setIsRunning(false);
        setTimeLeft(newMode === 'focus' ? defaultFocusMinutes * 60 : defaultBreakMinutes * 60);
    }, [defaultFocusMinutes, defaultBreakMinutes]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Progress percentage
    const maxTime = mode === 'focus' ? defaultFocusMinutes * 60 : defaultBreakMinutes * 60;
    const progress = ((maxTime - timeLeft) / maxTime) * 100;

    return (
        <div className={`fixed bottom-24 md:bottom-8 right-4 z-40 ${className}`}>
            {/* Collapsed State */}
            {isCollapsed ? (
                <button
                    onClick={() => setIsCollapsed(false)}
                    className={`
                        flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl
                        transition-all duration-300 hover:scale-105
                        ${isRunning 
                            ? 'bg-violet-500 text-white animate-pulse' 
                            : 'bg-white/10 backdrop-blur-xl text-white border border-white/20'
                        }
                    `}
                    title="Buka Pomodoro Timer"
                >
                    <Brain size={20} />
                    {isRunning && (
                        <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                    )}
                    <ChevronUp size={16} />
                </button>
            ) : (
                /* Expanded Widget */
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-white/10 min-w-[280px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {mode === 'focus' ? (
                                <Brain className="text-violet-400" size={20} />
                            ) : (
                                <Coffee className="text-emerald-400" size={20} />
                            )}
                            <span className="font-bold text-white text-sm uppercase tracking-wider">
                                {mode === 'focus' ? 'Fokus' : 'Istirahat'}
                            </span>
                        </div>
                        <button 
                            onClick={() => setIsCollapsed(true)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronDown size={18} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Timer Display */}
                    <div className="relative mb-5">
                        {/* Progress Ring */}
                        <svg className="w-40 h-40 mx-auto -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={mode === 'focus' ? '#8b5cf6' : '#10b981'}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 45}`}
                                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                                className="transition-all duration-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white font-mono tracking-tight">
                                {formatTime(timeLeft)}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                                Sesi ke-{sessions + 1}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <button
                            onClick={resetTimer}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                            title="Reset"
                        >
                            <RotateCcw size={18} className="text-slate-300" />
                        </button>
                        <button
                            onClick={toggleTimer}
                            className={`
                                p-4 rounded-2xl shadow-lg transition-all transform active:scale-95
                                ${isRunning 
                                    ? 'bg-rose-500 hover:bg-rose-600' 
                                    : mode === 'focus' 
                                        ? 'bg-violet-500 hover:bg-violet-600' 
                                        : 'bg-emerald-500 hover:bg-emerald-600'
                                }
                            `}
                            title={isRunning ? 'Pause' : 'Start'}
                        >
                            {isRunning ? (
                                <Pause size={24} className="text-white" />
                            ) : (
                                <Play size={24} className="text-white ml-0.5" />
                            )}
                        </button>
                        <button
                            onClick={() => switchMode(mode === 'focus' ? 'break' : 'focus')}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                            title="Ganti Mode"
                        >
                            {mode === 'focus' ? (
                                <Coffee size={18} className="text-emerald-400" />
                            ) : (
                                <Brain size={18} className="text-violet-400" />
                            )}
                        </button>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => switchMode('focus')}
                            className={`
                                flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                                ${mode === 'focus' 
                                    ? 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/50' 
                                    : 'text-slate-400 hover:bg-white/5'
                                }
                            `}
                        >
                            Fokus {defaultFocusMinutes}m
                        </button>
                        <button
                            onClick={() => switchMode('break')}
                            className={`
                                flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                                ${mode === 'break' 
                                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' 
                                    : 'text-slate-400 hover:bg-white/5'
                                }
                            `}
                        >
                            Istirahat {defaultBreakMinutes}m
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PomodoroTimer;
