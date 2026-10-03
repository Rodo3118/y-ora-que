import { useI18n } from '../i18n/LanguageContext';
import type { ErrorCode } from '../lib/types';

interface ErrorMessageProps {
  code: ErrorCode | 'network';
  onRetry: () => void;
}

export function ErrorMessage({ code, onRetry }: ErrorMessageProps) {
  const { t } = useI18n();

  return (
    <div className="card flex flex-col items-start gap-3 border-terracota-200 bg-terracota-50/70 p-6" role="alert">
      <p className="font-display text-lg font-semibold text-terracota-700">⚠️ {t.errors[code]}</p>
      <button type="button" onClick={onRetry} className="btn-primary">
        {t.tryAgain}
      </button>
    </div>
  );
}
