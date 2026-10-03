import { useI18n } from '../i18n/LanguageContext';

export function LanguageToggle() {
  const { idioma, toggleIdioma } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleIdioma}
      className="flex items-center gap-1 rounded-full border border-piedra-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-piedra-700 shadow-sm transition-colors hover:border-terracota-300 hover:text-terracota-600"
      aria-label="Toggle language / Cambiar idioma"
    >
      <span className={idioma === 'es' ? 'text-terracota-600' : 'text-piedra-400'}>ES</span>
      <span className="text-piedra-300">/</span>
      <span className={idioma === 'en' ? 'text-terracota-600' : 'text-piedra-400'}>EN</span>
    </button>
  );
}
