import { describe, expect, it } from 'vitest';
import {
  attemptContradiction,
  computeScore,
  createProgress,
  getAvailableChoices,
  getCurrentObjective,
  isResolved,
  makeChoice,
  requestHint,
  revealAllPending,
  type CaseProgress,
} from '../engine';
import { createGameStore } from '../state/store';
import { choose, exhaust, memoryStorage, seededRandom } from '../test/helpers';
import { apresLaSeance as c } from './apres-la-seance';
import { leCadeauDisparu } from './le-cadeau-disparu';
import { leDernierSignal } from './le-dernier-signal';

const start = () => revealAllPending(c, createProgress(c));
const ids = (p: CaseProgress, conv: string) => getAvailableChoices(c, p, conv).map((ch) => ch.id);

function confront(p: CaseProgress, statementId: string, evidenceId: string): CaseProgress {
  const r = attemptContradiction(c, p, statementId, evidenceId);
  if (r.outcome.kind !== 'found') throw new Error(`Pas de contradiction : ${statementId} + ${evidenceId}`);
  return revealAllPending(c, r.progress);
}

/** Actes 1 et 2 : jusqu'aux aveux de Salomé. */
function acts12(p: CaseProgress): CaseProgress {
  let next = choose(c, p, 'ch_a_soiree');
  next = choose(c, next, 'ch_a_relance');
  next = choose(c, next, 'ch_i_piste');
  next = choose(c, next, 'ch_s_soiree');
  return choose(c, next, 'ch_s_extrait');
}

/** Actes 3 à 5 jusqu'à la préparation de la confrontation. */
function acts345(p: CaseProgress): CaseProgress {
  let next = p.flags.d1_ok ? p : choose(c, choose(c, p, 'ch_i_message'), 'ch_d1_programme');
  if (!next.contradictions.includes('c_miroir')) next = confront(next, 'st_nina_cles', 'ev_miroir_intact');
  next = choose(c, next, 'ch_d2_avant');
  next = choose(c, next, 'ch_n_miroir');
  next = choose(c, next, 'ch_n_emporte');
  next = confront(next, 'st_nina_affaires', 'ev_sac_nina');
  next = choose(c, next, 'ch_i_serie');
  next = choose(c, next, 'ch_n_disque');
  return confront(next, 'st_nina_prete', 'ev_msg_disque');
}

function finale(p: CaseProgress): CaseProgress {
  let next = choose(c, p, 'ch_f_nina');
  next = choose(c, next, 'ch_f_disque');
  next = choose(c, next, 'ch_f_programme');
  return choose(c, next, 'ch_n_confrontation');
}

describe('« Après la séance » : contenu', () => {
  it('trois suspects, six objectifs, trois déductions, des pièces progressives', () => {
    expect(c.suspects.filter((s) => !s.npc).map((s) => s.id)).toEqual(['adrien', 'salome', 'nina']);
    expect(c.objectives).toHaveLength(6);
    for (const o of c.objectives) expect(o.hints).toHaveLength(3);
    const p = createProgress(c);
    for (const late of ['ev_comparaison', 'ev_programmation', 'ev_miroir_casse', 'ev_inventaire']) {
      expect(p.evidence).not.toContain(late);
    }
    // Le refus écrit de Lucas est visible dès l'acte 1, sans mise en avant.
    expect(start().evidence).toContain('ev_msg_disque');
    expect(start().evidence).toContain('ev_sac_nina');
  });

  it('les portraits ne distinguent pas Nina (même style, fichiers remplaçables)', () => {
    for (const s of c.suspects.filter((x) => !x.npc)) expect(s.avatar).toBe(`/photos/rialto/portrait-${s.id}.webp`);
  });

  it('jamais plus de trois réponses proposées à la fois', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const rand = seededRandom(seed);
      let p = start();
      for (let step = 0; step < 40; step++) {
        for (const cv of p.openConversations) expect(getAvailableChoices(c, p, cv).length).toBeLessThanOrEqual(3);
        const options = p.openConversations.flatMap((id) => getAvailableChoices(c, p, id));
        if (options.length === 0) break;
        p = revealAllPending(c, makeChoice(c, p, options[Math.floor(rand() * options.length)].id));
        for (const ct of c.contradictions) {
          for (const ev of ct.evidenceIds) {
            const r = attemptContradiction(c, p, ct.statementId, ev);
            if (r.outcome.kind === 'found' && rand() < 0.5) p = revealAllPending(c, r.progress);
          }
        }
      }
    }
  });

  it('n’a pas d’impasse : depuis tout état, on atteint la fin', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const rand = seededRandom(seed);
      let p = start();
      for (let step = 0; step < 15; step++) {
        const options = p.openConversations.flatMap((id) => getAvailableChoices(c, p, id));
        if (options.length === 0) break;
        p = revealAllPending(c, makeChoice(c, p, options[Math.floor(rand() * options.length)].id));
      }
      p = exhaust(c, p);
      expect(isResolved(c, p)).toBe(true);
    }
  });

  it('parcours principal : entre 60 et 75 messages narratifs courts', () => {
    const p = finale(acts345(acts12(choose(c, start(), 'ch_n_soiree'))));
    const index = new Map(c.conversations.flatMap((cv) => cv.messages.map((m) => [m.id, m] as const)));
    const narrative = p.revealedMessages
      .map((id) => index.get(id)!)
      .filter((m) => !m.history && m.from !== 'player');
    expect(narrative.length).toBeGreaterThanOrEqual(60);
    expect(narrative.length).toBeLessThanOrEqual(75);
  });
});

describe('« Après la séance » : parcours', () => {
  it('parcours complet, score 100', () => {
    let p = start();
    expect(getCurrentObjective(c, p)?.id).toBe('obj_depart');
    // Nina s'appuie sur un fait vu par le joueur : le message de 22:05.
    p = choose(c, p, 'ch_n_soiree');
    expect(p.statements).toEqual(expect.arrayContaining(['st_nina_avant', 'st_nina_cles', 'st_nina_2205']));
    p = acts12(p);
    expect(p.flags.salome_aveu).toBe(true);
    expect(p.evidence).toContain('ev_historique_montage');
    expect(getCurrentObjective(c, p)?.id).toBe('obj_message');
    p = acts345(p);
    expect(p.revealedMessages).toEqual(expect.arrayContaining(['n_a4', 'n_a5', 'n_a6']));
    expect(getCurrentObjective(c, p)?.id).toBe('obj_confronter');
    p = finale(p);
    expect(p.revealedMessages).toEqual(expect.arrayContaining(['nn_c6', 'i_z3']));
    expect(isResolved(c, p)).toBe(true);
    expect(computeScore(c, p).total).toBe(100);
  });

  it('autre ordre : Salomé et Adrien d’abord, le miroir repéré avant de vérifier le message', () => {
    let p = start();
    p = choose(c, p, 'ch_s_soiree');
    p = choose(c, p, 'ch_s_film');
    p = choose(c, p, 'ch_a_soiree');
    p = choose(c, p, 'ch_a_menace');
    p = choose(c, p, 'ch_a_relance');
    p = choose(c, p, 'ch_i_piste');
    p = choose(c, p, 'ch_s_extrait');
    p = choose(c, p, 'ch_n_soiree');
    // Le joueur repère le miroir tôt : la question d'Inès attend la vérification du message.
    p = confront(p, 'st_nina_cles', 'ev_miroir_intact');
    expect(ids(p, 'conv_ines')).toEqual(['ch_i_message']);
    p = choose(c, p, 'ch_i_message');
    expect(ids(p, 'conv_ines')).toEqual(['ch_d1_vivant', 'ch_d1_programme', 'ch_d1_tiers']);
    p = choose(c, p, 'ch_d1_programme');
    expect(ids(p, 'conv_ines')).toEqual(['ch_d2_avant', 'ch_d2_meurtre', 'ch_d2_adrien']);
    p = finale(acts345(p));
    expect(isResolved(c, p)).toBe(true);
  });

  it('les mauvaises déductions sont expliquées, coûtent peu et se corrigent', () => {
    let p = acts12(choose(c, start(), 'ch_n_soiree'));
    p = choose(c, p, 'ch_i_message');
    p = choose(c, p, 'ch_d1_vivant');
    expect(p.revealedMessages).toContain('i_d1x');
    expect(p.flags.d1_ok).toBeUndefined();
    p = choose(c, p, 'ch_d1_programme');
    expect(p.flags.d1_ok).toBe(true);
    p = confront(p, 'st_nina_cles', 'ev_miroir_intact');
    p = choose(c, p, 'ch_d2_meurtre');
    expect(p.revealedMessages).toContain('i_d2x');
    p = choose(c, p, 'ch_d2_avant');
    // Le miroir établit une présence cachée, pas un meurtre : l'interface le dit.
    expect(p.revealedMessages).toContain('i_d2b');
    p = choose(c, p, 'ch_n_miroir');
    p = choose(c, p, 'ch_n_emporte');
    p = confront(p, 'st_nina_affaires', 'ev_video_disque');
    p = choose(c, p, 'ch_i_serie');
    p = choose(c, p, 'ch_n_disque');
    p = confront(p, 'st_nina_prete', 'ev_msg_disque');
    p = choose(c, p, 'ch_f_adrien');
    p = choose(c, p, 'ch_f_nina');
    p = choose(c, p, 'ch_f_disque');
    p = choose(c, p, 'ch_f_programme');
    p = choose(c, p, 'ch_n_confrontation');
    expect(isResolved(c, p)).toBe(true);
    expect(computeScore(c, p).total).toBe(85);
  });

  it('les rapprochements trompeurs reçoivent un retour, sans pénalité', () => {
    const p = choose(c, start(), 'ch_n_soiree');
    const avant = attemptContradiction(c, p, 'st_nina_avant', 'ev_miroir_intact');
    expect(avant.outcome).toEqual({ kind: 'mismatch', text: expect.stringContaining('miroir') });
    expect(computeScore(c, avant.progress).total).toBe(100);
  });

  it('les indices sont progressifs et comptés', () => {
    let p = start();
    p = requestHint(c, p, 'obj_depart');
    p = requestHint(c, p, 'obj_depart');
    expect(p.hintsUsed.obj_depart).toBe(2);
    expect(computeScore(c, p).total).toBe(91);
    // Le premier indice ne nomme pas de coupable.
    expect(c.objectives.flatMap((o) => o.hints.slice(0, 1)).join(' ')).not.toMatch(/Nina (a|est) (tué|frappé|coupable)/);
  });
});

describe('« Après la séance » : sauvegarde', () => {
  it('reprend au bon endroit sans rejouer, sans toucher aux autres niveaux', () => {
    const storage = memoryStorage();
    const first = createGameStore(storage);
    first.getState().hydrate();
    for (const other of [leCadeauDisparu.id, leDernierSignal.id]) {
      first.getState().startCase(other);
      first.getState().revealAll(other);
    }
    first.getState().startCase(c.id);
    first.getState().revealAll(c.id);
    first.getState().choose(c.id, 'ch_n_soiree');
    first.getState().revealAll(c.id);
    first.getState().confront(c.id, 'st_nina_cles', 'ev_miroir_intact');
    const before = first.getState().save;

    const second = createGameStore(storage);
    second.getState().hydrate();
    expect(second.getState().save.progress).toEqual(before.progress);
    const restored = second.getState().save.progress[c.id];
    second.getState().choose(c.id, 'ch_n_soiree');
    expect(second.getState().save.progress[c.id]).toBe(restored);
    expect(restored.contradictions).toEqual(['c_miroir']);
    expect(new Set(restored.revealedMessages).size).toBe(restored.revealedMessages.length);
  });
});
