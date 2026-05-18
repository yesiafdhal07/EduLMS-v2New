'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    action: () => void;
    danger?: boolean;
    disabled?: boolean;
}

export interface ContextMenuSeparator {
    type: 'separator';
}

export type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator;

interface ContextMenuState {
    x: number;
    y: number;
    items: ContextMenuEntry[];
}

function isSeparator(entry: ContextMenuEntry): entry is ContextMenuSeparator {
    return 'type' in entry && entry.type === 'separator';
}

export function useContextMenu() {
    const [menu, setMenu] = useState<ContextMenuState | null>(null);

    const show = useCallback((e: React.MouseEvent, items: ContextMenuEntry[]) => {
        e.preventDefault();
        e.stopPropagation();

        // Calculate position, ensuring menu stays within viewport
        const x = Math.min(e.clientX, window.innerWidth - 220);
        const y = Math.min(e.clientY, window.innerHeight - 300);

        setMenu({ x, y, items });
    }, []);

    const close = useCallback(() => setMenu(null), []);

    return { menu, show, close };
}

interface ContextMenuPortalProps {
    menu: ContextMenuState | null;
    onClose: () => void;
}

export function ContextMenuPortal({ menu, onClose }: ContextMenuPortalProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Close on click outside or Escape
    useEffect(() => {
        if (!menu) return;

        const handleClick = () => onClose();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            const actionItems = menu.items.filter(i => !isSeparator(i)) as ContextMenuItem[];

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, actionItems.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = actionItems[selectedIndex];
                if (item && !item.disabled) {
                    item.action();
                    onClose();
                }
            }
        };

        window.addEventListener('click', handleClick);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [menu, onClose, selectedIndex]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [menu]);

    if (!menu) return null;

    let actionIdx = 0;

    return (
        <div
            ref={menuRef}
            className="mc-context-menu fixed animate-in fade-in zoom-in-95 duration-100"
            style={{ left: menu.x, top: menu.y }}
            onClick={e => e.stopPropagation()}
        >
            {menu.items.map((entry, i) => {
                if (isSeparator(entry)) {
                    return <div key={`sep-${i}`} className="mc-context-separator" />;
                }

                const currentIdx = actionIdx++;
                const isSelected = currentIdx === selectedIndex;
                const Icon = entry.icon;

                return (
                    <button
                        key={entry.id}
                        className={`mc-context-item ${isSelected ? (entry.danger ? 'bg-red-500/10 text-red-400' : 'bg-rose-500/10 text-rose-300') : ''}`}
                        data-danger={entry.danger || undefined}
                        disabled={entry.disabled}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!entry.disabled) {
                                entry.action();
                                onClose();
                            }
                        }}
                    >
                        {Icon && <Icon size={14} className="shrink-0 opacity-60" />}
                        <span className="flex-1 truncate">{entry.label}</span>
                        {entry.disabled && <span className="text-[8px] text-slate-600 uppercase tracking-widest">N/A</span>}
                    </button>
                );
            })}
        </div>
    );
}
