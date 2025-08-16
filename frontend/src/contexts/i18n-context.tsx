"use client";

import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useSettings } from '@/contexts/settings-context';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps): React.JSX.Element {
  const { settings } = useSettings();

  // Update i18n language when settings change
  React.useEffect(() => {
    if (settings.language && i18n.language !== settings.language) {
      console.log('Changing language to:', settings.language);
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
