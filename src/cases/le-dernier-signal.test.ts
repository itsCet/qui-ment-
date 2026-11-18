import { describe, expect, it } from 'vitest';
import {
  accuse,
  attemptContradiction,
  computeScore,
  createProgress,
  getAvailableChoices,
  getCurrentObjective,
  isResolved,
  makeChoice,
  revealAllPending,
  unreadCount,
  type CaseProgress,
} from '../engine';
import { createGameStore } from '../state/store';
import { choose, exhaust, memoryStorage, seededRandom } from '../test/helpers';
import { leCadeauDisparu } from './le-cadeau-disparu';
import { leDernierSignal as c } from './le-dernier-signal';

const DECISIVE = ['ev_sauvegarde', 'ev_journal_acces', 'ev_journal_coupole'];

function confront(p: CaseProgress, statementId: string, evidenceId: string): CaseProgress {
  const r = attemptContradiction(c, p, statementId, evidenceId);
  if (r.outcome.kind !== 'found') throw new Error(`Pas de contradiction : ${statementId} + ${evidenceId}`);
  return revealAllPending(c, r.progress);
}

/** Parcours de référence jusqu'à l'accusation. */
function investigate(): CaseProgress {
  let p = revealAllPending(c, createProgress(c));
  // Phase 1 : un départ plausible
  p = choose(c, p, 'ch_ca_pourquoi');
  p = choose(c, p, 'ch_ca_demission');
  p = choose(c, p, 'ch_m_depart');
  expect(getCurrentObjective(c, p)?.id).toBe('obj_telephone');
  // Phase 2 : quelqu'un utilise son téléphone
  p = choose(c, p, 'ch_m_telephone');
  p = choose(c, p, 'ch_notes_sauvegarde');
  p = confront(p, 'st_m_telephone', 'ev_sauvegarde');
  p = choose(c, p, 'ch_noe_vu');
  p = confront(p, 'st_elias_message', 'ev_photo_bureau');
  expect(getCurrentObjective(c, p)?.id).toBe('obj_galerie');
  // Phase 3 : la galerie
  p = choose(c, p, 'ch_noe_badge');
  p = confront(p, 'st_noe_badge', 'ev_msg_badge');
  p = choose(c, p, 'ch_noe_aveu');
  p = choose(c, p, 'ch_m_galerie');
  p = confront(p, 'st_m_galerie', 'ev_bon_intervention');
  p = choose(c, p, 'ch_m_soiree');
  p = choose(c, p, 'ch_m_porte');
  p = confront(p, 'st_m_soiree', 'ev_journal_acces');
  p = confront(p, 'st_m_porte', 'ev_journal_acces');
  expect(getCurrentObjective(c, p)?.id).toBe('obj_auteur');
  return p;
}

function rescue(p: CaseProgress): CaseProgress {
  let next = choose(c, p, 'ch_se_lieu_b');
  next = choose(c, next, 'ch_se_acces_nord');
  next = choose(c, next, 'ch_se_porte_manuel');
  return next;
}

describe('« Le dernier signal » : contenu', () => {
  it('respecte le cahier des charges', () => {
    expect(c.suspects.filter((s) => !s.npc).map((s) => s.id)).toEqual(['elias', 'camille', 'noe', 'marianne']);
    expect(c.objectives).toHaveLength(6);
    for (const o of c.objectives) expect(o.hints).toHaveLength(3);
    expect(c.conversations.filter((cv) => cv.archive)).toHaveLength(4);
    expect(c.evidence.filter((e) => e.everyday).length).toBeGreaterThanOrEqual(4);
  });

  it('la copie ne contient que des pièces antérieures à la synchronisation', () => {
    const p = createProgress(c);
    for (const id of ['ev_photo_bureau', 'ev_journal_acces', 'ev_journal_coupole', 'ev_sauvegarde']) {
      expect(p.evidence).not.toContain(id);
    }
    expect(p.evidence).toContain('ev_plan_photo');
    expect(p.evidence).toContain('ev_msg_badge');
    // Les archives sont lues, sans badge de non-lus.
    expect(unreadCount(p, 'arch_groupe')).toBe(0);
  });

  it('chaque pièce, déclaration, contradiction et choix est accessible', () => {
    let p = exhaust(c, createProgress(c));
    p = revealAllPending(c, accuse(c, p, 'marianne', DECISIVE).progress);
    p = exhaust(c, p);
    expect(new Set(p.evidence)).toEqual(new Set(c.evidence.map((e) => e.id)));
    expect(new Set(p.statements)).toEqual(new Set(c.statements.map((s) => s.id)));
    expect(new Set(p.contradictions)).toEqual(new Set(c.contradictions.map((ct) => ct.id)));
    const all = c.conversations.flatMap((cv) => cv.choices.map((ch) => ch.id));
    expect(new Set(p.choicesMade)).toEqual(new Set(all));
    expect(isResolved(c, p)).toBe(true);
  });

  it('n’a pas d’impasse depuis un état aléatoire', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const rand = seededRandom(seed);
      let p = revealAllPending(c, createProgress(c));
      for (let step = 0; step < 20; step++) {
        const options = p.openConversations.flatMap((id) => getAvailableChoices(c, p, id));
        if (options.length === 0) break;
        p = revealAllPending(c, makeChoice(c, p, options[Math.floor(rand() * options.length)].id));
      }
      p = exhaust(c, p);
      const r = accuse(c, p, 'marianne', DECISIVE);
      expect(r.evaluation?.result).toBe('correct');
      p = exhaust(c, revealAllPending(c, r.progress));
      expect(isResolved(c, p)).toBe(true);
    }
  });
});

describe('« Le dernier signal » : parcours', () => {
  it('mène à la résolution complète sans erreur, score 100', () => {
    let p = investigate();
    const r = accuse(c, p, 'marianne', DECISIVE);
    expect(r.evaluation?.result).toBe('correct');
    p = revealAllPending(c, r.progress);
    expect(p.revealedMessages).toContain('ma_c5');
    expect(p.openConversations).toContain('conv_secours');
    expect(isResolved(c, p)).toBe(false);
    expect(getCurrentObjective(c, p)?.id).toBe('obj_secours');

    p = rescue(p);
    expect(p.flags.secours_ok).toBe(true);
    expect(p.revealedMessages).toContain('ca_fin3');
    expect(p.openConversations).toContain('conv_elias');
    p = choose(c, p, 'ch_el_ca_va');
    p = choose(c, p, 'ch_el_camille');
    p = choose(c, p, 'ch_el_fin');
    expect(isResolved(c, p)).toBe(true);
    expect(getCurrentObjective(c, p)).toBeNull();
    expect(computeScore(c, p).total).toBe(100);
  });

  it('refuse les mauvaises accusations avec un retour, puis permet de continuer', () => {
    let p = investigate();
    let r = accuse(c, p, 'noe', ['ev_journal_acces']);
    expect(r.evaluation?.result).toBe('wrongSuspect');
    expect(r.evaluation?.feedback[0]).toContain('un badge identifie un badge');
    p = r.progress;
    r = accuse(c, p, 'marianne', ['ev_journal_acces', 'ev_sauvegarde']);
    expect(r.evaluation?.result).toBe('insufficientEvidence');
    expect(r.evaluation?.feedback[0]).toContain('Noé');
    p = r.progress;
    expect(isResolved(c, p)).toBe(false);
    r = accuse(c, p, 'marianne', DECISIVE);
    expect(r.evaluation?.result).toBe('correct');
    expect(computeScore(c, r.progress).total).toBe(100 - 25 - 15);
  });

  it('les mauvaises réponses aux secours sont expliquées, comptées, et on peut réessayer', () => {
    let p = revealAllPending(c, accuse(c, investigate(), 'marianne', DECISIVE).progress);
    p = choose(c, p, 'ch_se_lieu_sentier');
    expect(p.revealedMessages).toContain('se_ls');
    p = choose(c, p, 'ch_se_lieu_b');
    p = choose(c, p, 'ch_se_acces_sud');
    expect(p.revealedMessages).toContain('se_as');
    p = choose(c, p, 'ch_se_acces_nord');
    p = choose(c, p, 'ch_se_porte_distance');
    p = choose(c, p, 'ch_se_porte_manuel');
    expect(p.flags.secours_ok).toBe(true);
    const score = computeScore(c, p);
    expect(score.total).toBe(70);
    expect(score.lines.at(-1)).toEqual({ label: 'Mauvaises réponses (3)', points: -30 });
  });

  it('les questions sur la galerie restent verrouillées tant que la contradiction manque', () => {
    let p = revealAllPending(c, createProgress(c));
    expect(getAvailableChoices(c, p, 'conv_noe').map((ch) => ch.id)).not.toContain('ch_noe_vu');
    p = choose(c, p, 'ch_ca_pourquoi');
    p = choose(c, p, 'ch_m_telephone');
    expect(getAvailableChoices(c, p, 'conv_noe').map((ch) => ch.id)).not.toContain('ch_noe_vu');
    p = choose(c, p, 'ch_notes_sauvegarde');
    p = confront(p, 'st_m_telephone', 'ev_sauvegarde');
    expect(getAvailableChoices(c, p, 'conv_noe').map((ch) => ch.id)).toContain('ch_noe_vu');
  });
});

describe('sauvegardes séparées', () => {
  it('chaque niveau garde sa progression et reprend au bon endroit', () => {
    const storage = memoryStorage();
    const first = createGameStore(storage);
    first.getState().hydrate();
    first.getState().startCase(leCadeauDisparu.id);
    first.getState().revealAll(leCadeauDisparu.id);
    first.getState().choose(leCadeauDisparu.id, 'ch_notes_cuisine');
    first.getState().startCase(c.id);
    first.getState().revealAll(c.id);
    first.getState().choose(c.id, 'ch_ca_pourquoi');
    const level1 = first.getState().save.progress[leCadeauDisparu.id];
    const level2 = first.getState().save.progress[c.id];

    const second = createGameStore(storage);
    second.getState().hydrate();
    expect(second.getState().save.progress[leCadeauDisparu.id]).toEqual(level1);
    expect(second.getState().save.progress[c.id]).toEqual(level2);
    expect(second.getState().save.activeCaseId).toBe(c.id);

    second.getState().restartCase(c.id);
    expect(second.getState().save.progress[leCadeauDisparu.id]).toEqual(level1);
    expect(second.getState().save.progress[c.id].choicesMade).toEqual([]);
  });
});
