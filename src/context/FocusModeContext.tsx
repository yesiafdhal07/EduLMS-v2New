'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FocusModeContextType {
    isFocusMode: boolean;
    toggleFocusMode: () => void;
    enableFocusMode: () => void;
    disableFocusMode: () => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

const FOCUS_MODE_KEY = 'edulms_focus_mode';

/**
 * Focus Mode Provider
 * Allows hiding distracting UI elements for better concentration
 */
export function FocusModeProvider({ children }: { children: ReactNode }) {
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(FOCUS_MODE_KEY);
        if (saved === 'true') {
            setIsFocusMode(true);
        }
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(FOCUS_MODE_KEY, String(isFocusMode));
        
        // Add/remove body class for global CSS targeting
        if (isFocusMode) {
            document.body.classList.add('focus-mode-active');
        } else {
            document.body.classList.remove('focus-mode-active');
        }
    }, [isFocusMode]);

    const toggleFocusMode = () => setIsFocusMode(prev => !prev);
    const enableFocusMode = () => setIsFocusMode(true);
    const disableFocusMode = () => setIsFocusMode(false);

    return (
        <FocusModeContext.Provider value={{ 
            isFocusMode, 
            toggleFocusMode, 
            enableFocusMode, 
            disableFocusMode 
        }}>
            {children}
        </FocusModeContext.Provider>
    );
}

/**
 * Hook to access Focus Mode state
 */
export function useFocusMode() {
    const context = useContext(FocusModeContext);
    if (context === undefined) {
        throw new Error('useFocusMode must be used within a FocusModeProvider');
    }
    return context;
}

export default FocusModeContext;
