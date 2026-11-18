import type { Evidence } from '../engine/types';
import type { IconName } from './components/Icon';

export function evidenceIcon(e: Evidence): IconName {
  switch (e.content.type) {
    case 'photo':
      return 'photo';
    case 'log':
      return 'log';
    case 'receipt':
      return 'receipt';
    case 'quote':
      return 'quote';
    case 'object':
      return 'plug';
    case 'document':
      return 'note';
    case 'note':
      return 'note';
  }
}

export function evidenceKindLabel(e: Evidence): string {
  switch (e.content.type) {
    case 'photo':
      return 'Photo';
    case 'log':
      return 'Journal';
    case 'receipt':
      return 'Ticket';
    case 'quote':
      return 'Message';
    case 'object':
      return 'Objet';
    case 'document':
      return 'Document';
    case 'note':
      return 'Note';
  }
}

/** Pièce utile à l'enquête (les photos du quotidien restent dans Photos). */
export function isClue(e: Evidence): boolean {
  return !e.everyday;
}

/** « jeu. 19 nov. · 22:31 », selon les informations disponibles. */
export function evidenceWhen(e: Evidence): string {
  return [e.date, e.time].filter(Boolean).join(' · ');
}

const MONTHS: Record<string, number> = {
  janv: 1, févr: 2, mars: 3, avr: 4, mai: 5, juin: 6, juil: 7, août: 8, sept: 9, oct: 10, nov: 11, déc: 12,
};

/** Clé de tri chronologique à partir de « jeu. 19 nov. » et « 22:31 » (0 si inconnue). */
export function evidenceSortKey(e: Evidence): number {
  const match = e.date?.match(/(\d{1,2})\s+([a-zéû]+)/i);
  const day = match ? Number(match[1]) : 0;
  const month = match ? (MONTHS[match[2].replace('.', '').toLowerCase()] ?? 0) : 0;
  const [h, m] = (e.time ?? '00:00').split(':').map(Number);
  return ((month * 32 + day) * 24 + (h || 0)) * 60 + (m || 0);
}
