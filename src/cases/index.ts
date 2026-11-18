import type { Case } from '../engine/types';
import { leCadeauDisparu } from './le-cadeau-disparu';
import { leDernierSignal } from './le-dernier-signal';

/** Registre des enquêtes. Ajouter une enquête ici suffit : les écrans sont génériques. */
export const cases: Case[] = [leCadeauDisparu, leDernierSignal];

export function getCase(id: string | undefined): Case | undefined {
  return cases.find((c) => c.id === id);
}
