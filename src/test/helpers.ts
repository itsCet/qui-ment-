import {
  attemptContradiction,
  getAvailableChoices,
  makeChoice,
  revealAllPending,
  type Case,
  type CaseProgress,
} from '../engine';
import type { KeyValueStorage } from '../save/storage';

export function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

/** Joue un choix après avoir révélé tous les messages en attente. Échoue si le choix est indisponible. */
export function choose(c: Case, p: CaseProgress, choiceId: string): CaseProgress {
  const ready = revealAllPending(c, p);
  const next = makeChoice(c, ready, choiceId);
  if (next === ready) throw new Error(`Choix indisponible : ${choiceId}`);
  return revealAllPending(c, next);
}

/** Explore tout ce qui est accessible : tous les messages, tous les choix, toutes les confrontations. */
export function exhaust(c: Case, start: CaseProgress): CaseProgress {
  let p = revealAllPending(c, start);
  let changed = true;
  while (changed) {
    changed = false;
    for (const conversationId of p.openConversations) {
      for (const choice of getAvailableChoices(c, p, conversationId)) {
        p = revealAllPending(c, makeChoice(c, p, choice.id));
        changed = true;
      }
    }
    for (const st of p.statements) {
      for (const ev of p.evidence) {
        const r = attemptContradiction(c, p, st, ev);
        if (r.outcome.kind === 'found') {
          p = revealAllPending(c, r.progress);
          changed = true;
        }
      }
    }
  }
  return p;
}

/** Générateur pseudo-aléatoire déterministe (tests reproductibles). */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
