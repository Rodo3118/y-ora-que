import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { translations, type Idioma } from './translations';

interface LanguageContextValue {
  idioma: Idioma;
  t: typeof translations.es;
  toggleIdioma: () => void;
  setIdioma: (idioma: Idioma) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLanguage(): Idioma {
  if (typeof navigator === 'undefined') return 'es';
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>(detectInitialLanguage);

  const value = useMemo<LanguageContextValue>(
    () => ({
      idioma,
      t: translations[idioma],
      toggleIdioma: () => setIdioma((prev) => (prev === 'es' ? 'en' : 'es')),
      setIdioma,
    }),
    [idioma],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used within a LanguageProvider');
  return ctx;
}
