import { useI18n } from '../i18n/LanguageContext';
import type { RecommendResponseBody } from '../lib/types';
import { ResultCard } from './ResultCard';

interface ResultsListProps {
  resultado: RecommendResponseBody;
}

export function ResultsList({ resultado }: ResultsListProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-5">
      <div className="card border-verde-200 bg-verde-50/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-verde-700">{t.planSummaryTitle}</p>
        <p className="mt-1 font-display text-lg text-piedra-800">{resultado.plan_resumen}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resultado.recomendaciones.map((rec, i) => (
          <ResultCard key={rec.venue_id} recomendacion={rec} index={i} />
        ))}
      </div>
    </div>
  );
}
