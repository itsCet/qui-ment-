import { isConditionMet } from './conditions';
import type {
  AccusationResult,
  Case,
  CaseProgress,
  Choice,
  Contradiction,
  Conversation,
  Effect,
  Id,
  Message,
  Objective,
} from './types';

/* ------------------------------------------------------------------ */
/* Horloge narrative                                                    */
/* ------------------------------------------------------------------ */

export function parseClock(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function advanceClock(c: Case, p: CaseProgress, minutes: number): CaseProgress {
  const max = parseClock(c.clock.max);
  return { ...p, clockMinutes: Math.min(max, p.clockMinutes + minutes) };
}

/* ------------------------------------------------------------------ */
/* Index                                                                */
/* ------------------------------------------------------------------ */

const indexCache = new WeakMap<Case, CaseIndex>();

interface CaseIndex {
  messages: Map<Id, { message: Message; conversation: Conversation }>;
  choices: Map<Id, { choice: Choice; conversation: Conversation }>;
  conversations: Map<Id, Conversation>;
}

export function indexCase(c: Case): CaseIndex {
  const cached = indexCache.get(c);
  if (cached) return cached;
  const index: CaseIndex = { messages: new Map(), choices: new Map(), conversations: new Map() };
  for (const conversation of c.conversations) {
    index.conversations.set(conversation.id, conversation);
    for (const message of conversation.messages) index.messages.set(message.id, { message, conversation });
    for (const choice of conversation.choices) index.choices.set(choice.id, { choice, conversation });
  }
  indexCache.set(c, index);
  return index;
}

/* ------------------------------------------------------------------ */
/* Création                                                             */
/* ------------------------------------------------------------------ */

export function createProgress(c: Case): CaseProgress {
  const base: CaseProgress = {
    caseId: c.id,
    threads: {},
    revealedMessages: [],
    choicesMade: [],
    evidence: [],
    statements: [],
    contradictions: [],
    flags: {},
    unlockedQuestions: [],
    openConversations: c.conversations.filter((cv) => cv.initiallyOpen).map((cv) => cv.id),
    appliedEffectSources: [],
    hintsUsed: {},
    accusations: [],
    attempts: [],
    seen: {},
    clockMinutes: parseClock(c.clock.start),
    solved: false,
  };
  const withEvidence = { ...base, evidence: [...new Set(c.initialEvidence ?? [])] };
  const revealed = revealHistory(c, withEvidence);
  // L'historique présent à l'ouverture est considéré comme déjà lu.
  const seen: Record<Id, number> = {};
  for (const [id, thread] of Object.entries(revealed.threads)) seen[id] = thread.length;
  return { ...revealed, seen };
}

/* ------------------------------------------------------------------ */
/* Messages                                                             */
/* ------------------------------------------------------------------ */

/** Prochain message révélable d'une conversation (ou null). */
export function getNextMessage(c: Case, p: CaseProgress, conversationId: Id): Message | null {
  if (!p.openConversations.includes(conversationId)) return null;
  const conversation = indexCase(c).conversations.get(conversationId);
  if (!conversation) return null;
  for (const message of conversation.messages) {
    if (p.revealedMessages.includes(message.id)) continue;
    if (isConditionMet(p, message.condition)) return message;
  }
  return null;
}

/**
 * Révèle un message. Sans effet si le message est déjà révélé (pas de doublon).
 * `force` est utilisé par l'effet `revealMessage`, qui ignore la condition.
 */
export function revealMessage(c: Case, p: CaseProgress, messageId: Id, force = false): CaseProgress {
  if (p.revealedMessages.includes(messageId)) return p;
  const entry = indexCase(c).messages.get(messageId);
  if (!entry) return p;
  const { message, conversation } = entry;
  if (!force) {
    if (!p.openConversations.includes(conversation.id)) return p;
    if (!isConditionMet(p, message.condition)) return p;
  }
  let next: CaseProgress = {
    ...p,
    openConversations: p.openConversations.includes(conversation.id)
      ? p.openConversations
      : [...p.openConversations, conversation.id],
    revealedMessages: [...p.revealedMessages, message.id],
    threads: {
      ...p.threads,
      [conversation.id]: [
        ...(p.threads[conversation.id] ?? []),
        { kind: 'message', id: message.id, time: message.time ?? formatClock(p.clockMinutes) },
      ],
    },
  };
  if (message.attachment) next = addEvidence(next, message.attachment);
  if (message.effects) next = applyEffects(c, next, message.effects, `message:${message.id}`);
  return next;
}

/** Révèle le prochain message d'une conversation, s'il existe. */
export function revealNext(c: Case, p: CaseProgress, conversationId: Id): CaseProgress {
  const next = getNextMessage(c, p, conversationId);
  return next ? revealHistory(c, revealMessage(c, p, next.id)) : p;
}

/** Révèle immédiatement les messages d'historique devenus disponibles. */
export function revealHistory(c: Case, p: CaseProgress): CaseProgress {
  let current = p;
  let changed = true;
  while (changed) {
    changed = false;
    for (const conversationId of current.openConversations) {
      const next = getNextMessage(c, current, conversationId);
      if (next?.history) {
        current = revealMessage(c, current, next.id);
        changed = true;
      }
    }
  }
  return current;
}

/** Révèle tous les messages en attente (mode « accélérer » / tests). */
export function revealAllPending(c: Case, p: CaseProgress): CaseProgress {
  let current = p;
  let changed = true;
  while (changed) {
    changed = false;
    for (const conversationId of current.openConversations) {
      const next = getNextMessage(c, current, conversationId);
      if (next) {
        current = revealMessage(c, current, next.id);
        changed = true;
      }
    }
  }
  return current;
}

/** Révèle tous les messages en attente d'une seule conversation (bouton « accélérer »). */
export function revealAllPendingIn(c: Case, p: CaseProgress, conversationId: Id): CaseProgress {
  let current = p;
  for (let next = getNextMessage(c, current, conversationId); next; next = getNextMessage(c, current, conversationId)) {
    current = revealHistory(c, revealMessage(c, current, next.id));
  }
  return current;
}

/* ------------------------------------------------------------------ */
/* Choix                                                                */
/* ------------------------------------------------------------------ */

export function isChoiceVisible(p: CaseProgress, choice: Choice): boolean {
  if (p.choicesMade.includes(choice.id)) return false;
  if (choice.locked && !p.unlockedQuestions.includes(choice.id)) return false;
  return isConditionMet(p, choice.condition);
}

/** Choix proposés : seulement quand aucun message n'est en attente dans la conversation. */
export function getAvailableChoices(c: Case, p: CaseProgress, conversationId: Id): Choice[] {
  if (!p.openConversations.includes(conversationId)) return [];
  if (getNextMessage(c, p, conversationId)) return [];
  const conversation = indexCase(c).conversations.get(conversationId);
  if (!conversation) return [];
  return conversation.choices.filter((choice) => isChoiceVisible(p, choice));
}

/** Questions visibles (fiche suspect), même si une réponse est encore en cours. */
export function getVisibleQuestions(c: Case, p: CaseProgress, conversationId: Id): Choice[] {
  if (!p.openConversations.includes(conversationId)) return [];
  const conversation = indexCase(c).conversations.get(conversationId);
  return conversation ? conversation.choices.filter((choice) => isChoiceVisible(p, choice)) : [];
}

export function makeChoice(c: Case, p: CaseProgress, choiceId: Id): CaseProgress {
  const entry = indexCase(c).choices.get(choiceId);
  if (!entry) return p;
  const { choice, conversation } = entry;
  const available = getAvailableChoices(c, p, conversation.id);
  if (!available.some((ch) => ch.id === choiceId)) return p;

  let next = advanceClock(c, p, c.clock.perChoiceMinutes);
  next = {
    ...next,
    choicesMade: [...next.choicesMade, choice.id],
    threads: {
      ...next.threads,
      [conversation.id]: [
        ...(next.threads[conversation.id] ?? []),
        { kind: 'choice', id: choice.id, time: formatClock(next.clockMinutes) },
      ],
    },
  };
  // Le joueur a lui-même écrit ce message : il est lu.
  next = { ...next, seen: { ...next.seen, [conversation.id]: next.threads[conversation.id].length } };
  if (choice.effects) next = applyEffects(c, next, choice.effects, `choice:${choice.id}`);
  return revealHistory(c, next);
}

/* ------------------------------------------------------------------ */
/* Effets                                                               */
/* ------------------------------------------------------------------ */

function addEvidence(p: CaseProgress, evidenceId: Id): CaseProgress {
  return p.evidence.includes(evidenceId) ? p : { ...p, evidence: [...p.evidence, evidenceId] };
}

/** Applique une liste d'effets une seule fois par source. */
export function applyEffects(c: Case, p: CaseProgress, effects: Effect[], sourceId: Id): CaseProgress {
  if (p.appliedEffectSources.includes(sourceId)) return p;
  let next: CaseProgress = { ...p, appliedEffectSources: [...p.appliedEffectSources, sourceId] };
  for (const effect of effects) next = applyEffect(c, next, effect);
  return next;
}

function applyEffect(c: Case, p: CaseProgress, effect: Effect): CaseProgress {
  switch (effect.type) {
    case 'revealMessage':
      return revealMessage(c, p, effect.messageId, true);
    case 'unlockQuestion':
      return p.unlockedQuestions.includes(effect.choiceId)
        ? p
        : { ...p, unlockedQuestions: [...p.unlockedQuestions, effect.choiceId] };
    case 'addEvidence':
      return addEvidence(p, effect.evidenceId);
    case 'addStatement':
      return p.statements.includes(effect.statementId) ? p : { ...p, statements: [...p.statements, effect.statementId] };
    case 'setFlag':
      return { ...p, flags: { ...p.flags, [effect.flag]: effect.value ?? true } };
    case 'openConversation':
      return p.openConversations.includes(effect.conversationId)
        ? p
        : { ...p, openConversations: [...p.openConversations, effect.conversationId] };
    case 'setClock': {
      const target = Math.min(parseClock(c.clock.max), parseClock(effect.time));
      return target > p.clockMinutes ? { ...p, clockMinutes: target } : p;
    }
    default: {
      const exhaustive: never = effect;
      throw new Error(`Effet inconnu : ${JSON.stringify(exhaustive)}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Lecture / non-lus                                                    */
/* ------------------------------------------------------------------ */

export function unreadCount(p: CaseProgress, conversationId: Id): number {
  const total = p.threads[conversationId]?.length ?? 0;
  return Math.max(0, total - (p.seen[conversationId] ?? 0));
}

export function markSeen(p: CaseProgress, conversationId: Id): CaseProgress {
  const total = p.threads[conversationId]?.length ?? 0;
  if ((p.seen[conversationId] ?? 0) === total) return p;
  return { ...p, seen: { ...p.seen, [conversationId]: total } };
}

/* ------------------------------------------------------------------ */
/* Contradictions                                                       */
/* ------------------------------------------------------------------ */

export type ContradictionOutcome =
  | { kind: 'found'; contradiction: Contradiction }
  | { kind: 'already'; contradiction: Contradiction }
  | { kind: 'mismatch'; text: string }
  | { kind: 'invalid' };

export function attemptContradiction(
  c: Case,
  p: CaseProgress,
  statementId: Id,
  evidenceId: Id,
): { progress: CaseProgress; outcome: ContradictionOutcome } {
  if (!p.statements.includes(statementId) || !p.evidence.includes(evidenceId)) {
    return { progress: p, outcome: { kind: 'invalid' } };
  }
  const contradiction = c.contradictions.find(
    (ct) => ct.statementId === statementId && ct.evidenceIds.includes(evidenceId),
  );
  const attempts = [...p.attempts, { statementId, evidenceId, contradictionId: contradiction?.id ?? null }].slice(-100);

  if (!contradiction) {
    const feedback = c.mismatchFeedback.find((f) => f.statementId === statementId && f.evidenceId === evidenceId);
    return {
      progress: { ...p, attempts },
      outcome: { kind: 'mismatch', text: feedback?.text ?? c.defaultMismatchFeedback },
    };
  }
  if (p.contradictions.includes(contradiction.id)) {
    return { progress: { ...p, attempts }, outcome: { kind: 'already', contradiction } };
  }
  let next: CaseProgress = { ...p, attempts, contradictions: [...p.contradictions, contradiction.id] };
  if (contradiction.effects) next = applyEffects(c, next, contradiction.effects, `contradiction:${contradiction.id}`);
  return { progress: revealHistory(c, next), outcome: { kind: 'found', contradiction } };
}

/* ------------------------------------------------------------------ */
/* Accusation                                                           */
/* ------------------------------------------------------------------ */

export interface AccusationEvaluation {
  result: AccusationResult;
  /** Retours expliquant ce qui manque ou pourquoi le suspect est innocent. */
  feedback: string[];
}

/** Validation pure d'une accusation, indépendante de la progression. */
export function evaluateAccusation(c: Case, suspectId: Id, evidenceIds: Id[]): AccusationEvaluation {
  const { solution } = c;
  if (suspectId !== solution.culpritId) {
    return {
      result: 'wrongSuspect',
      feedback: [solution.wrongSuspectFeedback[suspectId] ?? 'Ton dossier ne permet pas de démontrer sa culpabilité.'],
    };
  }
  const missing = solution.requirements
    .filter((req) => !req.anyOf.some((id) => evidenceIds.includes(id)))
    .map((req) => req.missingFeedback);
  return missing.length === 0
    ? { result: 'correct', feedback: [] }
    : { result: 'insufficientEvidence', feedback: missing };
}

export type AccuseError = 'alreadySolved' | 'noSuspect' | 'unknownEvidence' | 'tooManyEvidence' | 'noEvidence';

export function accuse(
  c: Case,
  p: CaseProgress,
  suspectId: Id,
  evidenceIds: Id[],
): { progress: CaseProgress; evaluation: AccusationEvaluation | null; error?: AccuseError } {
  if (p.solved) return { progress: p, evaluation: null, error: 'alreadySolved' };
  if (!c.suspects.some((s) => s.id === suspectId)) return { progress: p, evaluation: null, error: 'noSuspect' };
  const unique = [...new Set(evidenceIds)];
  if (unique.length === 0) return { progress: p, evaluation: null, error: 'noEvidence' };
  if (unique.length > c.solution.maxEvidence) return { progress: p, evaluation: null, error: 'tooManyEvidence' };
  if (!unique.every((id) => p.evidence.includes(id))) return { progress: p, evaluation: null, error: 'unknownEvidence' };

  const evaluation = evaluateAccusation(c, suspectId, unique);
  const progress: CaseProgress = {
    ...p,
    accusations: [...p.accusations, { suspectId, evidenceIds: unique, result: evaluation.result }],
    solved: evaluation.result === 'correct',
  };
  return { progress, evaluation };
}

/* ------------------------------------------------------------------ */
/* Objectifs et indices                                                 */
/* ------------------------------------------------------------------ */

export function isObjectiveComplete(p: CaseProgress, objective: Objective): boolean {
  return isConditionMet(p, objective.completeWhen);
}

export function getCurrentObjective(c: Case, p: CaseProgress): Objective | null {
  return c.objectives.find((o) => !isObjectiveComplete(p, o)) ?? null;
}

export function requestHint(c: Case, p: CaseProgress, objectiveId: Id): CaseProgress {
  if (!c.objectives.some((o) => o.id === objectiveId)) return p;
  const level = p.hintsUsed[objectiveId] ?? 0;
  if (level >= 3) return p;
  return { ...p, hintsUsed: { ...p.hintsUsed, [objectiveId]: level + 1 } };
}

/* ------------------------------------------------------------------ */
/* Avancement global                                                    */
/* ------------------------------------------------------------------ */

/** L'enquête est-elle terminée (résolution consultable) ? */
export function isResolved(c: Case, p: CaseProgress): boolean {
  return c.solution.resolvedWhen ? isConditionMet(p, c.solution.resolvedWhen) : p.solved;
}

export function completionRatio(c: Case, p: CaseProgress): number {
  if (isResolved(c, p)) return 1;
  const done = c.objectives.filter((o) => isObjectiveComplete(p, o)).length;
  return done / c.objectives.length;
}

