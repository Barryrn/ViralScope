'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locales, type Locale } from '@/i18n/config';
import { IconLanguage } from '@tabler/icons-react';

const languageNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
};

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    localStorage.setItem('NEXT_LOCALE', newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    router.refresh();
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 h-8 px-3 text-sm border rounded-md opacity-50">
        <IconLanguage className="size-4" />
        <span>{languageNames[locale]}</span>
      </div>
    );
  }

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger size="sm" className="gap-1.5">
        <IconLanguage className="size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {languageNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
