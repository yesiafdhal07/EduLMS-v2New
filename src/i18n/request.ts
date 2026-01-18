import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // Get the locale from the request
    let locale = await requestLocale;

    // Validate that the incoming locale is supported
    if (!locale || !routing.locales.includes(locale as 'id' | 'en')) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
