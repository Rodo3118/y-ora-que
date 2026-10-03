import { useI18n } from '../i18n/LanguageContext';

export function LoadingState() {
  const { t } = useI18n();

  return (
    <div className="card flex flex-col items-center gap-4 p-10 text-center" role="status" aria-live="polite">
      <div className="flex gap-1.5">
        <span className="h-3 w-3 animate-bounce rounded-full bg-terracota-500 [animation-delay:-0.2s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-cantera-500 [animation-delay:-0.1s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-verde-500" />
      </div>
      <p className="font-medium text-piedra-600">{t.loadingHint}</p>
    </div>
  );
}
