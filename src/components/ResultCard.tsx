import { useI18n } from '../i18n/LanguageContext';
import { CATEGORY_STYLE } from '../lib/categoryStyles';
import type { Recommendation } from '../lib/types';

interface ResultCardProps {
  recomendacion: Recommendation;
  index: number;
}

export function ResultCard({ recomendacion, index }: ResultCardProps) {
  const { t } = useI18n();
  const { venue, razon, horario_sugerido } = recomendacion;
  const style = CATEGORY_STYLE[venue.categoria];
  const showApproxNotice = venue.verificar?.horario || venue.verificar?.precio;

  return (
    <article className="card flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-terracota-500">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terracota-500 text-xs text-white">
            {index + 1}
          </span>
          <span className="uppercase tracking-wide">{t.orderLabel}</span>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
          {style.emoji} {t.categoriaLabels[venue.categoria]}
        </span>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold text-piedra-900">{venue.nombre}</h3>
        <p className="mt-1 text-sm text-piedra-500">
          {venue.zona} · {venue.precio}
        </p>
      </div>

      <p className="text-sm text-piedra-600">{venue.descripcion}</p>

      <div className="rounded-xl bg-cantera-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-cantera-700">{t.reasonLabel}</p>
        <p className="mt-1 text-sm text-piedra-700">{razon}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div>
          <span className="font-semibold text-piedra-700">{t.suggestedTimeLabel}: </span>
          <span className="text-piedra-600">{horario_sugerido}</span>
        </div>
      </div>

      {showApproxNotice && <p className="text-xs italic text-piedra-400">{t.approxNotice}</p>}

      <div className="flex flex-wrap gap-1.5">
        {venue.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-piedra-100 px-2.5 py-1 text-xs text-piedra-500">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
