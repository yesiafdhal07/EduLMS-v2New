'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { useLowDataMode } from '@/context/LowDataContext';

interface LowDataToggleProps {
    className?: string;
    showLabel?: boolean;
}

/**
 * Low Data Mode Toggle
 * Reduces bandwidth by hiding heavy images/videos
 */
export function LowDataToggle({ className = '', showLabel = false }: LowDataToggleProps) {
    const { isLowDataMode, toggleLowDataMode } = useLowDataMode();

    return (
        <button
            onClick={toggleLowDataMode}
            className={`
                flex items-center gap-2 p-2.5 rounded-xl transition-all duration-300 relative group
                ${isLowDataMode 
                    ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/50' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }
                ${className}
            `}
            title={isLowDataMode ? 'Mode Hemat Data: AKTIF' : 'Aktifkan Mode Hemat Data'}
            aria-label={isLowDataMode ? 'Disable Low Data Mode' : 'Enable Low Data Mode'}
        >
            {isLowDataMode ? <WifiOff size={20} /> : <Wifi size={20} />}
            {showLabel && (
                <span className="text-xs font-bold">
                    {isLowDataMode ? 'Hemat ON' : 'Hemat Data'}
                </span>
            )}
            
            {/* Tooltip */}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {isLowDataMode ? 'Matikan Hemat Data' : 'Mode Hemat Data'}
            </span>
        </button>
    );
}

export default LowDataToggle;
