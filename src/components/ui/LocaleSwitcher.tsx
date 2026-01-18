'use client';

import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const locales = [
    { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', label: 'English', flag: '🇺🇸' }
];

// Cookie name used by next-intl
const LOCALE_COOKIE = 'NEXT_LOCALE';

export function LocaleSwitcher() {
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLocale = locales.find(l => l.code === locale) || locales[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const switchLocale = (newLocale: string) => {
        // Set cookie for next-intl (expires in 1 year)
        document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=31536000`;

        // Reload page to apply new locale
        window.location.reload();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300"
                aria-label="Change language"
            >
                <Globe size={18} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-300">{currentLocale.flag}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {locales.map((loc) => (
                        <button
                            key={loc.code}
                            type="button"
                            onClick={() => switchLocale(loc.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${locale === loc.code ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300'
                                }`}
                        >
                            <span className="text-lg">{loc.flag}</span>
                            <span className="text-sm font-medium">{loc.label}</span>
                            {locale === loc.code && (
                                <span className="ml-auto text-indigo-400">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

