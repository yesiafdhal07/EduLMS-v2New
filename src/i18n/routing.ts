import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    // List of all supported locales
    locales: ['id', 'en'],

    // Default locale when no locale is detected
    defaultLocale: 'id',

    // Prefix the default locale in the URL (false = /guru, true = /id/guru)
    localePrefix: 'as-needed'
});

export type Locale = (typeof routing.locales)[number];
