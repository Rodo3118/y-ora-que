import type { FormEvent } from 'react';
import { useI18n } from '../i18n/LanguageContext';
import type { Filtros } from '../lib/types';
import { FiltersPanel } from './FiltersPanel';

export const MAX_TEXTO_LENGTH = 400;

interface PromptFormProps {
  texto: string;
  onTextoChange: (texto: string) => void;
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
  zonas: string[];
  onSubmit: () => void;
  loading: boolean;
}

export function PromptForm({ texto, onTextoChange, filtros, onFiltrosChange, zonas, onSubmit, loading }: PromptFormProps) {
  const { t } = useI18n();
  const canSubmit = texto.trim().length > 0 && !loading;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (canSubmit) onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-7">
      <label htmlFor="texto" className="mb-2 block font-display text-lg font-semibold text-piedra-800">
        {t.promptLabel}
      </label>
      <textarea
        id="texto"
        value={texto}
        onChange={(e) => onTextoChange(e.target.value.slice(0, MAX_TEXTO_LENGTH))}
        placeholder={t.promptPlaceholder}
        rows={3}
        maxLength={MAX_TEXTO_LENGTH}
        className="w-full resize-none rounded-xl border border-piedra-200 bg-white px-4 py-3 text-piedra-800 placeholder:text-piedra-400 focus:border-terracota-400 focus:outline-none focus:ring-2 focus:ring-terracota-200"
      />
      <p className="mt-1 text-right text-xs text-piedra-400">{t.charsRemaining(MAX_TEXTO_LENGTH - texto.length)}</p>

      <div className="my-5 border-t border-piedra-200/70 pt-5">
        <p className="mb-3 font-display text-base font-semibold text-piedra-700">{t.filtersTitle}</p>
        <FiltersPanel filtros={filtros} onChange={onFiltrosChange} zonas={zonas} />
      </div>

      <button type="submit" disabled={!canSubmit} className="btn-primary w-full sm:w-auto">
        {loading ? t.submitLoading : t.submit}
      </button>
    </form>
  );
}
