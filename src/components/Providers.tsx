'use client';

import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';

interface ProvidersProps {
    children: ReactNode;
    locale?: string;
    messages?: Record<string, unknown>;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
    // Create QueryClient instance once per component lifecycle
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <NextIntlClientProvider locale={locale} messages={messages}>
                <ThemeProvider defaultTheme="dark">
                    <ToastProvider>
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </ToastProvider>
                </ThemeProvider>
            </NextIntlClientProvider>
        </QueryClientProvider>
    );
}

