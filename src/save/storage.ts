import type { CaseProgress } from '../engine/types';

export const SAVE_KEY = 'qui-ment:save';
export const SAVE_VERSION = 1;

export interface Settings {
  /** Les messages arrivent sans délai ni indicateur de saisie. */
  instantMessages: boolean;
}

export interface SaveFile {
  version: number;
  activeCaseId: string | null;
  progress: Record<string, CaseProgress>;
  settings: Settings;
}

export type LoadStatus = 'empty' | 'restored' | 'invalid' | 'unavailable';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const defaultSettings: Settings = { instantMessages: false };

export function emptySave(): SaveFile {
  return { version: SAVE_VERSION, activeCaseId: null, progress: {}, settings: { ...defaultSettings } };
}

/** Stockage du navigateur, ou null si indisponible (navigation privée stricte…). */
export function browserStorage(): KeyValueStorage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const probe = '__qui-ment-probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Validation défensive                                                */
/* ------------------------------------------------------------------ */

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isRecordOf = <T>(v: unknown, check: (x: unknown) => x is T): v is Record<string, T> =>
  isObject(v) && Object.values(v).every(check);
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';

function isThreadEntry(v: unknown): boolean {
  return (
    isObject(v) &&
    (v.kind === 'message' || v.kind === 'choice') &&
    typeof v.id === 'string' &&
    typeof v.time === 'string'
  );
}

export function isValidProgress(v: unknown): v is CaseProgress {
  if (!isObject(v)) return false;
  return (
    typeof v.caseId === 'string' &&
    isObject(v.threads) &&
    Object.values(v.threads).every((t) => Array.isArray(t) && t.every(isThreadEntry)) &&
    isStringArray(v.revealedMessages) &&
    isStringArray(v.choicesMade) &&
    isStringArray(v.evidence) &&
    isStringArray(v.statements) &&
    isStringArray(v.contradictions) &&
    isRecordOf(v.flags, isBoolean) &&
    isStringArray(v.unlockedQuestions) &&
    isStringArray(v.openConversations) &&
    isStringArray(v.appliedEffectSources) &&
    isRecordOf(v.hintsUsed, isNumber) &&
    Array.isArray(v.accusations) &&
    v.accusations.every(
      (a) =>
        isObject(a) &&
        typeof a.suspectId === 'string' &&
        isStringArray(a.evidenceIds) &&
        (a.result === 'correct' || a.result === 'wrongSuspect' || a.result === 'insufficientEvidence'),
    ) &&
    Array.isArray(v.attempts) &&
    isRecordOf(v.seen, isNumber) &&
    isNumber(v.clockMinutes) &&
    isBoolean(v.solved)
  );
}

/**
 * Lit et valide la sauvegarde. Les données corrompues ou d'une version inconnue
 * sont ignorées (statut `invalid`) sans faire planter l'application.
 * `knownCaseIds` permet d'écarter les enquêtes qui n'existent plus.
 */
export function loadSave(
  storage: KeyValueStorage | null,
  knownCaseIds: string[],
): { save: SaveFile; status: LoadStatus; pruned?: boolean } {
  if (!storage) return { save: emptySave(), status: 'unavailable' };
  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return { save: emptySave(), status: 'unavailable' };
  }
  if (raw === null) return { save: emptySave(), status: 'empty' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { save: emptySave(), status: 'invalid' };
  }
  const migrated = migrate(parsed);
  if (!migrated) return { save: emptySave(), status: 'invalid' };

  const progress: Record<string, CaseProgress> = {};
  let dropped = false;
  // Une enquête retirée du jeu n'est pas une sauvegarde endommagée : on l'efface sans alerte.
  let pruned = false;
  for (const [caseId, p] of Object.entries(migrated.progress)) {
    if (!knownCaseIds.includes(caseId)) pruned = true;
    else if (isValidProgress(p) && p.caseId === caseId) progress[caseId] = p;
    else dropped = true;
  }
  const activeCaseId =
    migrated.activeCaseId && progress[migrated.activeCaseId] ? migrated.activeCaseId : null;
  const settings: Settings = {
    instantMessages: isObject(migrated.settings) && isBoolean(migrated.settings.instantMessages)
      ? migrated.settings.instantMessages
      : defaultSettings.instantMessages,
  };
  return {
    save: { version: SAVE_VERSION, activeCaseId, progress, settings },
    status: dropped ? 'invalid' : 'restored',
    pruned,
  };
}

interface RawSave {
  activeCaseId: string | null;
  progress: Record<string, unknown>;
  settings: unknown;
}

/** Point d'entrée des migrations de format. Retourne null si la donnée est inexploitable. */
export function migrate(data: unknown): RawSave | null {
  if (!isObject(data) || !isNumber(data.version)) return null;
  // Version 1 : format actuel. Les futures versions ajouteront leurs étapes ici.
  if (data.version !== SAVE_VERSION) return null;
  if (!isObject(data.progress)) return null;
  const activeCaseId = typeof data.activeCaseId === 'string' ? data.activeCaseId : null;
  return { activeCaseId, progress: data.progress, settings: data.settings };
}

export function writeSave(storage: KeyValueStorage | null, save: SaveFile): boolean {
  if (!storage) return false;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(storage: KeyValueStorage | null): void {
  try {
    storage?.removeItem(SAVE_KEY);
  } catch {
    /* rien à faire */
  }
}
