import { createStore, useStore } from 'zustand';
import { cases, getCase } from '../cases';
import {
  accuse as engineAccuse,
  attemptContradiction,
  createProgress,
  makeChoice,
  markSeen as engineMarkSeen,
  requestHint,
  revealAllPending,
  revealAllPendingIn,
  revealNext,
  type AccusationEvaluation,
  type AccuseError,
  type CaseProgress,
  type ContradictionOutcome,
} from '../engine';
import {
  browserStorage,
  emptySave,
  loadSave,
  writeSave,
  type KeyValueStorage,
  type LoadStatus,
  type SaveFile,
} from '../save/storage';

export interface GameState {
  /** Faux tant que la sauvegarde n'a pas été lue : aucune partie ne peut démarrer avant. */
  hydrated: boolean;
  loadStatus: LoadStatus | null;
  save: SaveFile;

  hydrate(): void;
  startCase(caseId: string): void;
  restartCase(caseId: string): void;
  revealNext(caseId: string, conversationId: string): void;
  revealAll(caseId: string): void;
  revealConversation(caseId: string, conversationId: string): void;
  choose(caseId: string, choiceId: string): void;
  confront(caseId: string, statementId: string, evidenceId: string): ContradictionOutcome;
  accuse(
    caseId: string,
    suspectId: string,
    evidenceIds: string[],
  ): { evaluation: AccusationEvaluation | null; error?: AccuseError };
  requestHint(caseId: string, objectiveId: string): void;
  markSeen(caseId: string, conversationId: string): void;
  setInstantMessages(value: boolean): void;
}

export function createGameStore(storage: KeyValueStorage | null) {
  return createStore<GameState>()((set, get) => {
    /** Applique une transformation de progression puis sauvegarde immédiatement. */
    const update = (caseId: string, fn: (p: CaseProgress) => CaseProgress, persist = true) => {
      const { hydrated, save } = get();
      const c = getCase(caseId);
      const current = save.progress[caseId];
      if (!hydrated || !c || !current) return;
      const next = fn(current);
      if (next === current) return;
      const newSave: SaveFile = { ...save, activeCaseId: caseId, progress: { ...save.progress, [caseId]: next } };
      set({ save: newSave });
      if (persist) writeSave(storage, newSave);
    };

    const commit = (newSave: SaveFile) => {
      set({ save: newSave });
      writeSave(storage, newSave);
    };

    return {
      hydrated: false,
      loadStatus: null,
      save: emptySave(),

      hydrate() {
        if (get().hydrated) return;
        const { save, status } = loadSave(
          storage,
          cases.map((c) => c.id),
        );
        set({ save, loadStatus: status, hydrated: true });
        // Réécrit une sauvegarde nettoyée si des données invalides ont été écartées.
        if (status === 'invalid') writeSave(storage, save);
      },

      startCase(caseId) {
        const { hydrated, save } = get();
        const c = getCase(caseId);
        if (!hydrated || !c) return;
        if (save.progress[caseId]) {
          // Reprise : on ne réécrase jamais une partie existante.
          if (save.activeCaseId !== caseId) commit({ ...save, activeCaseId: caseId });
          return;
        }
        commit({ ...save, activeCaseId: caseId, progress: { ...save.progress, [caseId]: createProgress(c) } });
      },

      restartCase(caseId) {
        const { hydrated, save } = get();
        const c = getCase(caseId);
        if (!hydrated || !c) return;
        commit({ ...save, activeCaseId: caseId, progress: { ...save.progress, [caseId]: createProgress(c) } });
      },

      revealNext(caseId, conversationId) {
        const c = getCase(caseId);
        if (c) update(caseId, (p) => revealNext(c, p, conversationId));
      },

      revealAll(caseId) {
        const c = getCase(caseId);
        if (c) update(caseId, (p) => revealAllPending(c, p));
      },

      revealConversation(caseId, conversationId) {
        const c = getCase(caseId);
        if (c) update(caseId, (p) => revealAllPendingIn(c, p, conversationId));
      },

      choose(caseId, choiceId) {
        const c = getCase(caseId);
        if (c) update(caseId, (p) => makeChoice(c, p, choiceId));
      },

      confront(caseId, statementId, evidenceId) {
        const c = getCase(caseId);
        let outcome: ContradictionOutcome = { kind: 'invalid' };
        if (c) {
          update(caseId, (p) => {
            const r = attemptContradiction(c, p, statementId, evidenceId);
            outcome = r.outcome;
            return r.progress;
          });
        }
        return outcome;
      },

      accuse(caseId, suspectId, evidenceIds) {
        const c = getCase(caseId);
        let result: { evaluation: AccusationEvaluation | null; error?: AccuseError } = {
          evaluation: null,
          error: 'noSuspect',
        };
        if (c) {
          update(caseId, (p) => {
            const r = engineAccuse(c, p, suspectId, evidenceIds);
            result = { evaluation: r.evaluation, error: r.error };
            return r.progress;
          });
        }
        return result;
      },

      requestHint(caseId, objectiveId) {
        const c = getCase(caseId);
        if (c) update(caseId, (p) => requestHint(c, p, objectiveId));
      },

      markSeen(caseId, conversationId) {
        update(caseId, (p) => engineMarkSeen(p, conversationId));
      },

      setInstantMessages(value) {
        const { save, hydrated } = get();
        if (!hydrated) return;
        commit({ ...save, settings: { ...save.settings, instantMessages: value } });
      },
    };
  });
}

export const gameStore = createGameStore(browserStorage());

export function useGame<T>(selector: (state: GameState) => T): T {
  return useStore(gameStore, selector);
}
