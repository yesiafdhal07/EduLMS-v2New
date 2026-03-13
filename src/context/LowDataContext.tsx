'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LowDataContextType {
    isLowDataMode: boolean;
    toggleLowDataMode: () => void;
    enableLowDataMode: () => void;
    disableLowDataMode: () => void;
}

const LowDataContext = createContext<LowDataContextType | undefined>(undefined);

const LOW_DATA_KEY = 'edulms_low_data_mode';

/**
 * Low Data Mode Provider
 * Reduces bandwidth usage by disabling heavy media loading
 */
export function LowDataModeProvider({ children }: { children: ReactNode }) {
    const [isLowDataMode, setIsLowDataMode] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(LOW_DATA_KEY);
        if (saved === 'true') {
            setIsLowDataMode(true);
        }
        
        // Also detect slow connection
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
            const connection = (navigator as any).connection;
            if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
                setIsLowDataMode(true);
            }
        }
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(LOW_DATA_KEY, String(isLowDataMode));
        
        // Add/remove body class for global CSS targeting
        if (isLowDataMode) {
            document.body.classList.add('low-data-mode');
        } else {
            document.body.classList.remove('low-data-mode');
        }
    }, [isLowDataMode]);

    const toggleLowDataMode = () => setIsLowDataMode(prev => !prev);
    const enableLowDataMode = () => setIsLowDataMode(true);
    const disableLowDataMode = () => setIsLowDataMode(false);

    return (
        <LowDataContext.Provider value={{ 
            isLowDataMode, 
            toggleLowDataMode, 
            enableLowDataMode, 
            disableLowDataMode 
        }}>
            {children}
        </LowDataContext.Provider>
    );
}

/**
 * Hook to access Low Data Mode state
 */
export function useLowDataMode() {
    const context = useContext(LowDataContext);
    if (context === undefined) {
        throw new Error('useLowDataMode must be used within a LowDataModeProvider');
    }
    return context;
}

export default LowDataContext;
