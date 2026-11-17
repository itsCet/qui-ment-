import { describe, expect, it } from 'vitest';
import { cases } from '.';
import {
  accuse,
  attemptContradiction,
  computeScore,
  createProgress,
  evaluateAccusation,
  getAvailableChoices,
  getCurrentObjective,
  makeChoice,
  requestHint,
  revealAllPending,
  validateCase,
  type CaseProgress,
} from '../engine';
import { choose, exhaust, seededRandom } from '../test/helpers';
import { leCadeauDisparu as c } from './le-cadeau-disparu';

/** Parcours de référence jusqu'au moment de l'accusation. */
function investigate(): CaseProgress {
  let p = revealAllPending(c, createProgress(c));
  p = choose(c, p, 'ch_ines_aprem');
  p = choose(c, p, 'ch_hugo_aprem');
  p = choose(c, p, 'ch_clara_aprem');
  p = choose(c, p, 'ch_yanis_aprem');
  p = choose(c, p, 'ch_yanis_enveloppe');
  p = choose(c, p, 'ch_notes_serrure');
  p = choose(c, p, 'ch_ines_qui');
  p = choose(c, p, 'ch_notes_routeur');
  p = choose(c, p, 'ch_notes_cuisine');
  p = choose(c, p, 'ch_notes_salon');
  return p;
}

describe('intégrité de l’enquête', () => {
  it.each(cases.map((cs) => [cs.id, cs] as const))('%s : tous les identifiants référencés existent', (_id, cs) => {
    expect(validateCase(cs)).toEqual([]);
  });

  it('respecte le cahier des charges narratif', () => {
    expect(c.suspects).toHaveLength(4);
    expect(c.evidence.length).toBeGreaterThanOrEqual(6);
    expect(c.contradictions.length).toBeGreaterThanOrEqual(3);
    expect(c.solution.resolution.falseLeads.length).toBeGreaterThanOrEqual(2);
    for (const o of c.objectives) expect(o.hints).toHaveLength(3);
  });

  it('rend accessibles toutes les preuves, déclarations et contradictions', () => {
    const p = exhaust(c, createProgress(c));
    expect(new Set(p.evidence)).toEqual(new Set(c.evidence.map((e) => e.id)));
    expect(new Set(p.statements)).toEqual(new Set(c.statements.map((s) => s.id)));
    expect(new Set(p.contradictions)).toEqual(new Set(c.contradictions.map((ct) => ct.id)));
    // Tous les choix ont été proposés au moins une fois (aucun contenu mort).
    const allChoices = c.conversations.flatMap((cv) => cv.choices.map((ch) => ch.id));
    expect(new Set(p.choicesMade)).toEqual(new Set(allChoices));
  });

  it('n’a pas d’impasse : un parcours aléatoire peut toujours mener à la solution', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const rand = seededRandom(seed);
      let p = revealAllPending(c, createProgress(c));
      // Exploration aléatoire partielle.
      for (let step = 0; step < 15; step++) {
        const options = p.openConversations.flatMap((id) => getAvailableChoices(c, p, id));
        if (options.length === 0) break;
        p = revealAllPending(c, makeChoice(c, p, options[Math.floor(rand() * options.length)].id));
      }
      // Depuis n'importe quel état, tout reste atteignable.
      const done = exhaust(c, p);
      expect(done.evidence).toContain('ev_journal_routeur');
      expect(done.evidence).toContain('ev_msg_yanis_1633');
      const r = accuse(c, done, 'yanis', ['ev_journal_routeur', 'ev_msg_yanis_1633']);
      expect(r.evaluation?.result).toBe('correct');
    }
  });
});

describe('validation des accusations', () => {
  it('accepte le coupable avec les preuves décisives', () => {
    expect(evaluateAccusation(c, 'yanis', ['ev_journal_routeur', 'ev_msg_yanis_1633']).result).toBe('correct');
    expect(
      evaluateAccusation(c, 'yanis', ['ev_journal_routeur', 'ev_msg_yanis_1633', 'ev_journal_serrure', 'ev_chargeur']).result,
    ).toBe('correct');
  });

  it('refuse un nom correct sans justification suffisante', () => {
    const r = evaluateAccusation(c, 'yanis', ['ev_capture_pret']);
    expect(r.result).toBe('insufficientEvidence');
    expect(r.feedback).toHaveLength(2);
    expect(evaluateAccusation(c, 'yanis', ['ev_journal_routeur']).result).toBe('insufficientEvidence');
    expect(evaluateAccusation(c, 'yanis', ['ev_msg_yanis_1633', 'ev_journal_serrure']).result).toBe('insufficientEvidence');
  });

  it('refuse les mauvais suspects avec un retour propre à chacun', () => {
    for (const s of ['ines', 'hugo', 'clara']) {
      const r = evaluateAccusation(c, s, ['ev_journal_routeur', 'ev_msg_yanis_1633']);
      expect(r.result).toBe('wrongSuspect');
      expect(r.feedback[0]).toBe(c.solution.wrongSuspectFeedback[s]);
    }
  });

  it('refuse les preuves non découvertes, trop nombreuses ou absentes', () => {
    const p = revealAllPending(c, createProgress(c));
    expect(accuse(c, p, 'yanis', ['ev_journal_routeur']).error).toBe('unknownEvidence');
    expect(accuse(c, p, 'yanis', []).error).toBe('noEvidence');
    const full = investigate();
    const five = ['ev_journal_routeur', 'ev_msg_yanis_1633', 'ev_journal_serrure', 'ev_chargeur', 'ev_photo_salon'];
    expect(accuse(c, full, 'yanis', five).error).toBe('tooManyEvidence');
    expect(accuse(c, full, 'personne', ['ev_journal_routeur']).error).toBe('noSuspect');
  });
});

describe('parcours complet', () => {
  it('mène à la bonne résolution avec le score maximal', () => {
    let p = investigate();
    expect(getCurrentObjective(c, p)?.id).toBe('obj_mensonges');

    let r = attemptContradiction(c, p, 'st_clara_restee', 'ev_ticket_vase');
    expect(r.outcome.kind).toBe('found');
    p = revealAllPending(c, r.progress);
    p = choose(c, p, 'ch_clara_verite');
    expect(p.statements).toContain('st_clara_aveu');

    r = attemptContradiction(c, p, 'st_yanis_salle', 'ev_journal_routeur');
    expect(r.outcome.kind).toBe('found');
    p = revealAllPending(c, r.progress);
    p = choose(c, p, 'ch_yanis_wifi');

    r = attemptContradiction(c, p, 'st_yanis_ignorait', 'ev_msg_yanis_1633');
    p = revealAllPending(c, r.progress);
    r = attemptContradiction(c, p, 'st_yanis_chargeur', 'ev_chargeur');
    p = revealAllPending(c, r.progress);
    expect(p.contradictions).toHaveLength(4);
    expect(getCurrentObjective(c, p)?.id).toBe('obj_accuser');

    const result = accuse(c, p, 'yanis', ['ev_journal_routeur', 'ev_msg_yanis_1633', 'ev_journal_serrure']);
    expect(result.evaluation?.result).toBe('correct');
    p = revealAllPending(c, result.progress);
    expect(p.solved).toBe(true);
    expect(getCurrentObjective(c, p)).toBeNull();
    expect(p.revealedMessages).toContain('g_fin_2');
    expect(computeScore(c, p).total).toBe(100);
    // Une partie résolue ne peut plus être ré-accusée.
    expect(accuse(c, p, 'hugo', ['ev_journal_routeur']).error).toBe('alreadySolved');
  });

  it('après une mauvaise accusation, l’enquête continue et le score en tient compte', () => {
    let p = investigate();
    let r = accuse(c, p, 'clara', ['ev_ticket_vase']);
    expect(r.evaluation?.result).toBe('wrongSuspect');
    p = r.progress;
    expect(p.solved).toBe(false);

    // L'enquête continue : de nouvelles actions restent possibles.
    const ct = attemptContradiction(c, p, 'st_yanis_salle', 'ev_journal_routeur');
    expect(ct.outcome.kind).toBe('found');
    p = revealAllPending(c, ct.progress);
    p = choose(c, p, 'ch_yanis_wifi');

    r = accuse(c, p, 'yanis', ['ev_journal_routeur']);
    expect(r.evaluation?.result).toBe('insufficientEvidence');
    p = r.progress;

    p = requestHint(c, p, 'obj_mensonges');
    r = accuse(c, p, 'yanis', ['ev_journal_routeur', 'ev_msg_yanis_1633']);
    expect(r.evaluation?.result).toBe('correct');
    const score = computeScore(c, r.progress);
    expect(score.total).toBe(100 - 25 - 15 - 5);
    expect(score.lines.map((l) => l.points)).toEqual([100, -5, -25, -15]);
  });

  it('donne un retour contextuel aux rapprochements erronés, sans pénalité', () => {
    const p = investigate();
    const r = attemptContradiction(c, p, 'st_hugo_depart', 'ev_photo_salon');
    expect(r.outcome).toEqual({ kind: 'mismatch', text: expect.stringContaining('veste') });
    const generic = attemptContradiction(c, p, 'st_ines_depart', 'ev_chargeur');
    expect(generic.outcome).toEqual({ kind: 'mismatch', text: c.defaultMismatchFeedback });
    expect(computeScore(c, generic.progress).total).toBe(100);
  });

  it('refuse les confrontations avec des éléments non découverts', () => {
    const p = revealAllPending(c, createProgress(c));
    expect(attemptContradiction(c, p, 'st_clara_restee', 'ev_ticket_vase').outcome.kind).toBe('invalid');
  });
});
