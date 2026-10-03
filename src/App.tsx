import { useState } from 'react';
import { ErrorMessage } from './components/ErrorMessage';
import { LanguageToggle } from './components/LanguageToggle';
import { LoadingState } from './components/LoadingState';
import { PromptForm } from './components/PromptForm';
import { ResultsList } from './components/ResultsList';
import { useI18n } from './i18n/LanguageContext';
import { ApiRequestError, fetchRecommendations } from './lib/api';
import type { ErrorCode, Filtros, RecommendResponseBody } from './lib/types';
import { getZonas } from './lib/venues';

type Status = 'idle' | 'loading' | 'success' | 'error';

const ZONAS = getZonas();

function App() {
  const { t, idioma } = useI18n();

  const [texto, setTexto] = useState('');
  const [filtros, setFiltros] = useState<Filtros>({});
  const [status, setStatus] = useState<Status>('idle');
  const [resultado, setResultado] = useState<RecommendResponseBody | null>(null);
  const [errorCode, setErrorCode] = useState<ErrorCode | 'network'>('unknown_error');

  async function handleSubmit() {
    setStatus('loading');
    try {
      const data = await fetchRecommendations({ texto, filtros, idioma });
      setResultado(data);
      setStatus('success');
    } catch (err) {
      setErrorCode(err instanceof ApiRequestError ? err.code : 'unknown_error');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="border-b border-piedra-200/70 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-terracota-600">{t.brand}</h1>
            <p className="text-sm text-piedra-500">{t.tagline}</p>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <section className="mb-8 text-center sm:text-left">
          <h2 className="font-display text-3xl font-bold text-piedra-900 sm:text-4xl">{t.heroTitle}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-piedra-600 sm:mx-0">{t.heroSubtitle}</p>
        </section>

        <section className="mb-10">
          <PromptForm
            texto={texto}
            onTextoChange={setTexto}
            filtros={filtros}
            onFiltrosChange={setFiltros}
            zonas={ZONAS}
            onSubmit={handleSubmit}
            loading={status === 'loading'}
          />
        </section>

        <section>
          {status === 'loading' && <LoadingState />}
          {status === 'error' && <ErrorMessage code={errorCode} onRetry={handleSubmit} />}
          {status === 'success' && resultado && <ResultsList resultado={resultado} />}
          {status === 'idle' && <p className="text-center text-piedra-400">{t.noResultsYet}</p>}
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-5 text-center text-xs text-piedra-400">{t.footerBuiltWith}</footer>
    </div>
  );
}

export default App;
