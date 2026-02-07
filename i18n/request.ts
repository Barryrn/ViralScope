import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
  let locale: Locale = defaultLocale;

  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

    if (localeCookie && locales.includes(localeCookie as Locale)) {
      locale = localeCookie as Locale;
    }
  } catch {
    // Cookies might not be available during static generation
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
