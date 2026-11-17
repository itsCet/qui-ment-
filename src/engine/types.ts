/**
 * Format typé des enquêtes et de la progression.
 * Les enquêtes sont de pures données : aucune fonction, aucun code exécutable.
 */

export type Id = string;

/* ------------------------------------------------------------------ */
/* Conditions et effets (données structurées)                          */
/* ------------------------------------------------------------------ */

export type Condition =
  | { type: 'flag'; flag: string; value?: boolean }
  | { type: 'hasEvidence'; evidenceId: Id }
  | { type: 'knowsStatement'; statementId: Id }
  | { type: 'contradictionFound'; contradictionId: Id }
  | { type: 'choiceMade'; choiceId: Id }
  | { type: 'messageRevealed'; messageId: Id }
  | { type: 'conversationOpen'; conversationId: Id }
  | { type: 'solved' }
  | { type: 'all'; conditions: Condition[] }
  | { type: 'any'; conditions: Condition[] }
  | { type: 'not'; condition: Condition };

export type Effect =
  | { type: 'revealMessage'; messageId: Id }
  | { type: 'unlockQuestion'; choiceId: Id }
  | { type: 'addEvidence'; evidenceId: Id }
  | { type: 'addStatement'; statementId: Id }
  | { type: 'setFlag'; flag: string; value?: boolean }
  | { type: 'openConversation'; conversationId: Id };

/* ------------------------------------------------------------------ */
/* Données narratives                                                  */
/* ------------------------------------------------------------------ */

export interface Suspect {
  id: Id;
  name: string;
  /** Initiales affichées dans l'avatar. */
  initials: string;
  age: number;
  role: string;
  bio: string;
  /** Teinte de l'avatar (0-360). L'information n'est jamais portée par la couleur seule. */
  hue: number;
  /** Forme de l'avatar, pour distinguer sans la couleur. */
  shape: 'circle' | 'square' | 'hexagon' | 'diamond';
  /** Conversation privée avec ce suspect (questions posées depuis la fiche). */
  conversationId: Id;
}

/** Expéditeur : un suspect, le joueur, ou une note système. */
export type Sender = Id | 'player' | 'system';

export interface Message {
  id: Id;
  from: Sender;
  text: string;
  /** Heure fixe (messages d'historique). Sinon l'horloge narrative est utilisée. */
  time?: string;
  /** Message déjà présent à l'ouverture (historique), révélé sans délai. */
  history?: boolean;
  /** Pièce jointe : une preuve affichée dans la bulle. */
  attachment?: Id;
  condition?: Condition;
  /** Appliqués une seule fois, au moment où le message est révélé. */
  effects?: Effect[];
}

export interface Choice {
  id: Id;
  /** Libellé du bouton. */
  label: string;
  /** Texte envoyé par le joueur (par défaut : le libellé). */
  text?: string;
  condition?: Condition;
  /** Si vrai, la question n'apparaît qu'après un effet `unlockQuestion`. */
  locked?: boolean;
  effects?: Effect[];
}

export interface Conversation {
  id: Id;
  title: string;
  kind: 'group' | 'private' | 'notes';
  participants: Id[];
  /** Ouverte dès le début de l'enquête. */
  initiallyOpen?: boolean;
  subtitle?: string;
  messages: Message[];
  choices: Choice[];
}

export type EvidenceContent =
  | { type: 'photo'; visual: string; caption: string }
  | { type: 'log'; app: string; columns: string[]; rows: string[][]; note?: string }
  | { type: 'receipt'; shop: string; lines: [string, string][]; footer: string }
  | { type: 'quote'; author: Id; time: string; text: string; context?: string }
  | { type: 'object'; icon: string; note: string };

export interface Evidence {
  id: Id;
  title: string;
  /** Résumé court affiché dans la liste. */
  summary: string;
  description: string;
  /** Pourquoi Sam détient cette pièce. */
  source: string;
  /** Heure de référence éventuelle, pour l'affichage. */
  time?: string;
  content: EvidenceContent;
}

export interface Statement {
  id: Id;
  suspectId: Id;
  text: string;
  /** Contexte affiché sous la déclaration. */
  context?: string;
}

export interface Contradiction {
  id: Id;
  statementId: Id;
  /** Une seule de ces preuves suffit. */
  evidenceIds: Id[];
  title: string;
  explanation: string;
  effects?: Effect[];
}

export interface MismatchFeedback {
  statementId: Id;
  evidenceId: Id;
  text: string;
}

export interface Objective {
  id: Id;
  title: string;
  description: string;
  completeWhen: Condition;
  /** Trois niveaux d'indices progressifs. */
  hints: [string, string, string];
}

export interface EvidenceRequirement {
  /** Au moins une de ces preuves doit être présentée. */
  anyOf: Id[];
  /** Ce que la preuve doit démontrer (affiché en cas de manque). */
  missingFeedback: string;
}

export interface Solution {
  culpritId: Id;
  requirements: EvidenceRequirement[];
  maxEvidence: number;
  wrongSuspectFeedback: Record<Id, string>;
  resolution: {
    summary: string;
    timeline: { time: string; text: string; key?: boolean }[];
    decisive: { evidenceId: Id; text: string }[];
    falseLeads: { title: string; text: string }[];
    epilogue: string;
  };
}

export interface ScoringRules {
  start: number;
  /** Coût d'un indice selon son niveau (index 0 = niveau 1). */
  hintCost: [number, number, number];
  wrongSuspect: number;
  insufficientEvidence: number;
}

export interface Case {
  id: Id;
  title: string;
  tagline: string;
  duration: string;
  difficulty: string;
  /** Présentation de l'affaire (dossier). */
  intro: string[];
  playerName: string;
  /** Horloge narrative : heure de départ et heure limite (HH:MM). */
  clock: { start: string; perChoiceMinutes: number; max: string; deadlineLabel: string };
  suspects: Suspect[];
  conversations: Conversation[];
  evidence: Evidence[];
  statements: Statement[];
  contradictions: Contradiction[];
  mismatchFeedback: MismatchFeedback[];
  defaultMismatchFeedback: string;
  objectives: Objective[];
  solution: Solution;
  scoring: ScoringRules;
}

/* ------------------------------------------------------------------ */
/* Progression (sérialisable)                                          */
/* ------------------------------------------------------------------ */

export type ThreadEntry = { kind: 'message'; id: Id; time: string } | { kind: 'choice'; id: Id; time: string };

export type AccusationResult = 'correct' | 'wrongSuspect' | 'insufficientEvidence';

export interface AccusationRecord {
  suspectId: Id;
  evidenceIds: Id[];
  result: AccusationResult;
}

export interface ContradictionAttempt {
  statementId: Id;
  evidenceId: Id;
  contradictionId: Id | null;
}

export interface CaseProgress {
  caseId: Id;
  /** Fil d'affichage de chaque conversation, dans l'ordre de révélation. */
  threads: Record<Id, ThreadEntry[]>;
  revealedMessages: Id[];
  choicesMade: Id[];
  evidence: Id[];
  statements: Id[];
  contradictions: Id[];
  flags: Record<string, boolean>;
  unlockedQuestions: Id[];
  openConversations: Id[];
  /** Sources (message:/choice:/contradiction:) dont les effets ont été appliqués. */
  appliedEffectSources: Id[];
  /** Niveau d'indice révélé par objectif (0 à 3). */
  hintsUsed: Record<Id, number>;
  accusations: AccusationRecord[];
  attempts: ContradictionAttempt[];
  /** Nombre d'entrées lues par conversation (badges de non-lus). */
  seen: Record<Id, number>;
  /** Minutes depuis minuit de l'horloge narrative. */
  clockMinutes: number;
  solved: boolean;
}
