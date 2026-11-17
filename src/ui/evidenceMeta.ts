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
  }
}
