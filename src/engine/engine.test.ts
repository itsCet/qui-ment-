import { describe, expect, it } from 'vitest';
import {
  applyEffects,
  createProgress,
  getAvailableChoices,
  getNextMessage,
  isConditionMet,
  makeChoice,
  markSeen,
  requestHint,
  revealAllPending,
  revealMessage,
  revealNext,
  unreadCount,
  type Case,
  type CaseProgress,
} from '.';

/** Mini-enquête synthétique pour tester le moteur isolément. */
const mini: Case = {
  id: 'mini',
  title: 'Mini',
  tagline: '',
  duration: '',
  difficulty: '',
  intro: [],
  playerName: 'Sam',
  clock: { start: '10:00', perChoiceMinutes: 5, max: '10:12', deadlineLabel: '' },
  suspects: [
    { id: 'a', name: 'A', initials: 'A', age: 1, role: '', bio: '', hue: 0, shape: 'circle', conversationId: 'c1' },
    { id: 'b', name: 'B', initials: 'B', age: 1, role: '', bio: '', hue: 0, shape: 'square', conversationId: 'c2' },
  ],
  conversations: [
    {
      id: 'c1',
      title: 'C1',
      kind: 'private',
      participants: ['a'],
      initiallyOpen: true,
      messages: [
        { id: 'h1', from: 'a', text: 'historique', history: true, time: '09:00' },
        { id: 'm1', from: 'a', text: 'bonjour', attachment: 'e1' },
        { id: 'm2', from: 'a', text: 'réponse', condition: { type: 'choiceMade', choiceId: 'q1' }, effects: [{ type: 'addStatement', statementId: 's1' }] },
      ],
      choices: [
        {
          id: 'q1',
          label: 'Question 1',
          effects: [
            { type: 'setFlag', flag: 'f' },
            { type: 'unlockQuestion', choiceId: 'q2' },
            { type: 'openConversation', conversationId: 'c2' },
            { type: 'addEvidence', evidenceId: 'e2' },
          ],
        },
        { id: 'q2', label: 'Question 2', locked: true },
        { id: 'q3', label: 'Question 3', condition: { type: 'flag', flag: 'f' } },
      ],
    },
    {
      id: 'c2',
      title: 'C2',
      kind: 'private',
      participants: ['b'],
      messages: [
        { id: 'x1', from: 'b', text: 'salut' },
        { id: 'x2', from: 'b', text: 'caché', condition: { type: 'flag', flag: 'jamais' } },
      ],
      choices: [{ id: 'r1', label: 'Révéler', effects: [{ type: 'revealMessage', messageId: 'x2' }] }],
    },
  ],
  evidence: [
    { id: 'e1', title: '', summary: '', description: '', source: '', content: { type: 'object', icon: '', note: '' } },
    { id: 'e2', title: '', summary: '', description: '', source: '', content: { type: 'object', icon: '', note: '' } },
  ],
  statements: [{ id: 's1', suspectId: 'a', text: '' }],
  contradictions: [],
  mismatchFeedback: [],
  defaultMismatchFeedback: '',
  objectives: [],
  solution: {
    culpritId: 'a',
    maxEvidence: 2,
    requirements: [],
    wrongSuspectFeedback: { b: '' },
    resolution: { summary: '', timeline: [], decisive: [], falseLeads: [], epilogue: '' },
  },
  scoring: { start: 100, hintCost: [5, 10, 15], wrongSuspect: 25, insufficientEvidence: 15 },
};

describe('conditions', () => {
  const base = createProgress(mini);
  const p: CaseProgress = {
    ...base,
    flags: { on: true, off: false },
    evidence: ['e1'],
    statements: ['s1'],
    contradictions: ['k1'],
    choicesMade: ['q1'],
  };

  it('évalue chaque type de condition', () => {
    expect(isConditionMet(p, undefined)).toBe(true);
    expect(isConditionMet(p, { type: 'flag', flag: 'on' })).toBe(true);
    expect(isConditionMet(p, { type: 'flag', flag: 'off' })).toBe(false);
    expect(isConditionMet(p, { type: 'flag', flag: 'off', value: false })).toBe(true);
    expect(isConditionMet(p, { type: 'flag', flag: 'absent', value: false })).toBe(true);
    expect(isConditionMet(p, { type: 'hasEvidence', evidenceId: 'e1' })).toBe(true);
    expect(isConditionMet(p, { type: 'hasEvidence', evidenceId: 'e2' })).toBe(false);
    expect(isConditionMet(p, { type: 'knowsStatement', statementId: 's1' })).toBe(true);
    expect(isConditionMet(p, { type: 'contradictionFound', contradictionId: 'k1' })).toBe(true);
    expect(isConditionMet(p, { type: 'choiceMade', choiceId: 'q1' })).toBe(true);
    expect(isConditionMet(p, { type: 'messageRevealed', messageId: 'h1' })).toBe(true);
    expect(isConditionMet(p, { type: 'conversationOpen', conversationId: 'c1' })).toBe(true);
    expect(isConditionMet(p, { type: 'conversationOpen', conversationId: 'c2' })).toBe(false);
    expect(isConditionMet(p, { type: 'solved' })).toBe(false);
  });

  it('combine all / any / not', () => {
    const yes = { type: 'flag', flag: 'on' } as const;
    const no = { type: 'flag', flag: 'off' } as const;
    expect(isConditionMet(p, { type: 'all', conditions: [yes, yes] })).toBe(true);
    expect(isConditionMet(p, { type: 'all', conditions: [yes, no] })).toBe(false);
    expect(isConditionMet(p, { type: 'any', conditions: [no, yes] })).toBe(true);
    expect(isConditionMet(p, { type: 'any', conditions: [no, no] })).toBe(false);
    expect(isConditionMet(p, { type: 'not', condition: no })).toBe(true);
  });
});

describe('messages', () => {
  it('révèle l’historique immédiatement et le reste un par un', () => {
    const p = createProgress(mini);
    expect(p.revealedMessages).toEqual(['h1']);
    expect(getNextMessage(mini, p, 'c1')?.id).toBe('m1');
    const p2 = revealNext(mini, p, 'c1');
    expect(p2.revealedMessages).toEqual(['h1', 'm1']);
    expect(p2.threads.c1.map((t) => t.id)).toEqual(['h1', 'm1']);
    expect(p2.threads.c1[0].time).toBe('09:00');
    expect(p2.threads.c1[1].time).toBe('10:00');
  });

  it('ajoute la pièce jointe comme preuve, sans doublon', () => {
    const p = revealNext(mini, createProgress(mini), 'c1');
    expect(p.evidence).toEqual(['e1']);
    const again = revealMessage(mini, p, 'm1');
    expect(again).toBe(p);
    expect(again.revealedMessages.filter((id) => id === 'm1')).toHaveLength(1);
  });

  it('ne révèle pas un message dont la condition est fausse ou la conversation fermée', () => {
    const p = createProgress(mini);
    expect(revealMessage(mini, p, 'm2')).toBe(p);
    expect(revealMessage(mini, p, 'x1')).toBe(p);
    expect(getNextMessage(mini, p, 'c2')).toBeNull();
  });
});

describe('choix et effets', () => {
  it('ne propose les choix qu’après les messages en attente', () => {
    const p = createProgress(mini);
    expect(getAvailableChoices(mini, p, 'c1')).toEqual([]);
    const ready = revealAllPending(mini, p);
    expect(getAvailableChoices(mini, ready, 'c1').map((c) => c.id)).toEqual(['q1']);
  });

  it('applique tous les types d’effets d’un choix', () => {
    let p = revealAllPending(mini, createProgress(mini));
    p = makeChoice(mini, p, 'q1');
    expect(p.flags.f).toBe(true);
    expect(p.unlockedQuestions).toContain('q2');
    expect(p.openConversations).toContain('c2');
    expect(p.evidence).toEqual(['e1', 'e2']);
    expect(p.threads.c1.at(-1)).toMatchObject({ kind: 'choice', id: 'q1' });
    p = revealAllPending(mini, p);
    expect(p.statements).toEqual(['s1']);
    expect(getAvailableChoices(mini, p, 'c1').map((c) => c.id)).toEqual(['q2', 'q3']);
  });

  it('refuse un choix déjà fait, verrouillé ou inconnu', () => {
    let p = revealAllPending(mini, createProgress(mini));
    expect(makeChoice(mini, p, 'q2')).toBe(p);
    expect(makeChoice(mini, p, 'inconnu')).toBe(p);
    p = makeChoice(mini, p, 'q1');
    p = revealAllPending(mini, p);
    expect(makeChoice(mini, p, 'q1')).toBe(p);
    expect(p.choicesMade.filter((id) => id === 'q1')).toHaveLength(1);
  });

  it('applique les effets d’une source une seule fois', () => {
    const p = createProgress(mini);
    const effects = [{ type: 'setFlag', flag: 'compteur' } as const, { type: 'addEvidence', evidenceId: 'e2' } as const];
    const once = applyEffects(mini, p, effects, 'source:1');
    const twice = applyEffects(mini, { ...once, flags: { ...once.flags, compteur: false } }, effects, 'source:1');
    expect(once.flags.compteur).toBe(true);
    expect(twice.flags.compteur).toBe(false);
    expect(twice.evidence.filter((e) => e === 'e2')).toHaveLength(1);
  });

  it('l’effet revealMessage révèle un message même si sa condition est fausse', () => {
    let p = revealAllPending(mini, createProgress(mini));
    p = revealAllPending(mini, makeChoice(mini, p, 'q1'));
    p = makeChoice(mini, p, 'r1');
    expect(p.revealedMessages).toContain('x2');
  });

  it('borne l’horloge narrative', () => {
    let p = revealAllPending(mini, createProgress(mini));
    p = revealAllPending(mini, makeChoice(mini, p, 'q1'));
    p = revealAllPending(mini, makeChoice(mini, p, 'q3'));
    p = revealAllPending(mini, makeChoice(mini, p, 'q2'));
    expect(p.clockMinutes).toBe(10 * 60 + 12);
  });
});

describe('non-lus et indices', () => {
  it('compte les messages non lus', () => {
    const p = revealAllPending(mini, createProgress(mini));
    expect(unreadCount(p, 'c1')).toBe(2);
    expect(unreadCount(markSeen(p, 'c1'), 'c1')).toBe(0);
  });

  it('limite les indices à trois niveaux', () => {
    const withObjective: Case = {
      ...mini,
      objectives: [{ id: 'o', title: '', description: '', completeWhen: { type: 'solved' }, hints: ['1', '2', '3'] }],
    };
    let p = createProgress(withObjective);
    for (let i = 0; i < 5; i++) p = requestHint(withObjective, p, 'o');
    expect(p.hintsUsed.o).toBe(3);
    expect(requestHint(withObjective, p, 'inconnu')).toBe(p);
  });
});
