import type { Categoria } from './types';

export const CATEGORY_STYLE: Record<Categoria, { emoji: string; badge: string }> = {
  cultura: { emoji: '🏛️', badge: 'bg-cantera-100 text-cantera-700' },
  comida: { emoji: '🍽️', badge: 'bg-terracota-100 text-terracota-700' },
  café: { emoji: '☕', badge: 'bg-piedra-200 text-piedra-700' },
  bar: { emoji: '🍹', badge: 'bg-verde-100 text-verde-700' },
  naturaleza: { emoji: '🌵', badge: 'bg-verde-100 text-verde-700' },
  familia: { emoji: '👨‍👩‍👧', badge: 'bg-cantera-100 text-cantera-700' },
};
