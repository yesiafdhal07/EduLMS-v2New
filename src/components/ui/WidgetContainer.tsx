'use client';

import { useState, useEffect, ReactNode } from 'react';
import { GripVertical, X, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface WidgetProps {
    id: string;
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    isExpanded?: boolean;
    onRemove?: () => void;
}

export function WidgetContainer({ id, title, icon, children, isExpanded = true, onRemove }: WidgetProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(!isExpanded);

    return (
        <div 
            className={`
                group relative rounded-2xl border transition-all duration-300
                bg-gradient-to-br from-white/[0.03] to-white/[0.01]
                hover:from-white/[0.05] hover:to-white/[0.02]
                ${isCollapsed ? 'h-auto' : ''}
            `}
            style={{
                border: '1px solid rgba(99, 102, 241, 0.1)',
                boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header */}
            <div className={`
                flex items-center justify-between px-4 py-3 border-b transition-all duration-300
                ${isHovered ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-white/5'}
            `}>
                <div className="flex items-center gap-2">
                    {/* Drag Handle - visible on hover */}
                    <div className={`
                        cursor-grab opacity-0 group-hover:opacity-100 transition-opacity
                        text-slate-500 hover:text-indigo-400
                    `}>
                        <GripVertical size={14} />
                    </div>
                    
                    {icon && (
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            {icon}
                        </div>
                    )}
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                    </button>
                    {onRemove && (
                        <button 
                            onClick={onRemove}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all"
                            title="Remove widget"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={`
                transition-all duration-300 overflow-hidden
                ${isCollapsed ? 'max-h-0 py-0 border-0' : 'py-4 px-4'}
            `}>
                {children}
            </div>
        </div>
    );
}

// Hook for managing widget layout persistence
export function useWidgetLayout(defaultWidgets: string[]) {
    const [widgetOrder, setWidgetOrder] = useState<string[]>(defaultWidgets);
    const STORAGE_KEY = 'guru-dashboard-widgets';

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Validate that all default widgets exist
                const validWidgets = defaultWidgets.filter(w => parsed.includes(w));
                if (validWidgets.length > 0) {
                    setWidgetOrder(validWidgets);
                }
            } catch (e) {
                console.error('Failed to load widget layout:', e);
            }
        }
    }, [defaultWidgets.join(',')]);

    const saveLayout = (order: string[]) => {
        setWidgetOrder(order);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    };

    const resetLayout = () => {
        setWidgetOrder(defaultWidgets);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { widgetOrder, saveLayout, resetLayout };
}