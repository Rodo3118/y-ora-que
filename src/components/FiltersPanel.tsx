import { useI18n } from '../i18n/LanguageContext';
import type { Filtros, HoraDelDia, IdealPara, Precio } from '../lib/types';
import { ChipSelect } from './ChipSelect';

const PRECIOS: Precio[] = ['$', '$$', '$$$'];
const IDEAL_PARA: IdealPara[] = ['pareja', 'amigos', 'familia', 'solo'];
const HORAS: HoraDelDia[] = ['mañana', 'tarde', 'noche'];

interface FiltersPanelProps {
  filtros: Filtros;
  onChange: (filtros: Filtros) => void;
  zonas: string[];
}

export function FiltersPanel({ filtros, onChange, zonas }: FiltersPanelProps) {
  const { t } = useI18n();

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <ChipSelect
        label={t.filterPresupuesto}
        value={filtros.presupuesto}
        onChange={(presupuesto) => onChange({ ...filtros, presupuesto })}
        options={PRECIOS.map((p) => ({ value: p, label: t.precioLabels[p] }))}
      />
      <ChipSelect
        label={t.filterConQuien}
        value={filtros.con_quien}
        onChange={(con_quien) => onChange({ ...filtros, con_quien })}
        options={IDEAL_PARA.map((p) => ({ value: p, label: t.idealParaLabels[p] }))}
      />
      <ChipSelect
        label={t.filterHora}
        value={filtros.hora_del_dia}
        onChange={(hora_del_dia) => onChange({ ...filtros, hora_del_dia })}
        options={HORAS.map((h) => ({ value: h, label: t.horaLabels[h] }))}
      />
      <ChipSelect
        label={t.filterZona}
        value={filtros.zona}
        onChange={(zona) => onChange({ ...filtros, zona })}
        options={zonas.map((z) => ({ value: z, label: z }))}
      />
    </div>
  );
}
