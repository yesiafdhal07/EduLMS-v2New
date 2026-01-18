'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
            <Link
                href="/"
                className="text-slate-400 hover:text-indigo-400 transition-colors"
            >
                <Home size={16} />
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-slate-500" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-white font-bold">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}
