import { describe, expect, it } from 'vitest';
import { leCadeauDisparu as c } from '../cases/le-cadeau-disparu';
import { createProgress, revealAllPending } from '../engine';
import { createGameStore } from '../state/store';
import { memoryStorage } from '../test/helpers';
import { emptySave, loadSave, SAVE_KEY, SAVE_VERSION, writeSave } from './storage';

const ids = [c.id];

describe('sauvegarde', () => {
  it('fait un aller-retour sans perte', () => {
    const storage = memoryStorage();
    const progress = revealAllPending(c, createProgress(c));
    const save = { ...emptySave(), activeCaseId: c.id, progress: { [c.id]: progress } };
    expect(writeSave(storage, save)).toBe(true);
    const { save: loaded, status } = loadSave(storage, ids);
    expect(status).toBe('restored');
    expect(loaded).toEqual(save);
  });

  it('gère une sauvegarde absente, corrompue ou d’une autre version', () => {
    expect(loadSave(memoryStorage(), ids).status).toBe('empty');
    expect(loadSave(null, ids).status).toBe('unavailable');
    expect(loadSave(memoryStorage({ [SAVE_KEY]: '{pas du json' }), ids).status).toBe('invalid');
    expect(loadSave(memoryStorage({ [SAVE_KEY]: JSON.stringify({ version: 99, progress: {} }) }), ids).status).toBe(
      'invalid',
    );
    expect(loadSave(memoryStorage({ [SAVE_KEY]: '42' }), ids).save).toEqual(emptySave());
  });

  it('écarte une progression invalide ou une enquête inconnue sans tout perdre', () => {
    const good = createProgress(c);
    const raw = {
      version: SAVE_VERSION,
      activeCaseId: 'inconnue',
      progress: { [c.id]: good, inconnue: { ...good, caseId: 'inconnue' } },
      settings: { instantMessages: 'oui' },
    };
    const { save, status } = loadSave(memoryStorage({ [SAVE_KEY]: JSON.stringify(raw) }), ids);
    expect(status).toBe('invalid');
    expect(Object.keys(save.progress)).toEqual([c.id]);
    expect(save.activeCaseId).toBeNull();
    expect(save.settings.instantMessages).toBe(false);

    const broken = { ...raw, progress: { [c.id]: { ...good, evidence: 'pas un tableau' } } };
    expect(loadSave(memoryStorage({ [SAVE_KEY]: JSON.stringify(broken) }), ids).save.progress).toEqual({});
  });
});

describe('store et restauration', () => {
  it('ne démarre aucune partie avant la restauration', () => {
    const storage = memoryStorage();
    const store = createGameStore(storage);
    store.getState().startCase(c.id);
    expect(store.getState().save.progress[c.id]).toBeUndefined();
    expect(storage.data[SAVE_KEY]).toBeUndefined();
  });

  it('reprend exactement au bon endroit sans répéter messages ni effets', () => {
    const storage = memoryStorage();
    const first = createGameStore(storage);
    first.getState().hydrate();
    first.getState().startCase(c.id);
    first.getState().revealAll(c.id);
    first.getState().choose(c.id, 'ch_notes_serrure');
    first.getState().revealAll(c.id);
    first.getState().choose(c.id, 'ch_ines_aprem');
    const before = first.getState().save.progress[c.id];

    // « Fermeture » de l'application : un nouveau store relit la sauvegarde.
    const second = createGameStore(storage);
    second.getState().hydrate();
    expect(second.getState().loadStatus).toBe('restored');
    const restored = second.getState().save.progress[c.id];
    expect(restored).toEqual(before);

    // Démarrer à nouveau ne doit pas écraser la partie existante.
    second.getState().startCase(c.id);
    expect(second.getState().save.progress[c.id]).toBe(restored);

    // Rejouer un choix déjà fait n'a aucun effet.
    second.getState().choose(c.id, 'ch_notes_serrure');
    expect(second.getState().save.progress[c.id]).toBe(restored);

    // La suite continue normalement, sans doublon.
    second.getState().revealAll(c.id);
    const after = second.getState().save.progress[c.id];
    expect(new Set(after.revealedMessages).size).toBe(after.revealedMessages.length);
    expect(after.evidence.filter((e) => e === 'ev_journal_serrure')).toHaveLength(1);
    expect(after.statements).toContain('st_ines_depart');
  });

  it('sauvegarde après chaque action importante', () => {
    const storage = memoryStorage();
    const store = createGameStore(storage);
    store.getState().hydrate();
    store.getState().startCase(c.id);
    const read = () => JSON.parse(storage.data[SAVE_KEY]).progress[c.id];
    store.getState().revealAll(c.id);
    expect(read().revealedMessages).toContain('g19');
    store.getState().choose(c.id, 'ch_notes_cuisine');
    expect(read().choicesMade).toContain('ch_notes_cuisine');
    store.getState().requestHint(c.id, 'obj_versions');
    expect(read().hintsUsed.obj_versions).toBe(1);
    store.getState().accuse(c.id, 'hugo', ['ev_photo_salon']);
    expect(read().accusations).toHaveLength(1);
  });

  it('recommencer remplace la progression par une partie neuve', () => {
    const storage = memoryStorage();
    const store = createGameStore(storage);
    store.getState().hydrate();
    store.getState().startCase(c.id);
    store.getState().revealAll(c.id);
    store.getState().restartCase(c.id);
    expect(store.getState().save.progress[c.id]).toEqual(createProgress(c));
  });
});
