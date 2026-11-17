import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { getCase } from '../cases';
import { getNextMessage, type Case, type CaseProgress, type Message } from '../engine';
import { gameStore, useGame } from '../state/store';

/** Enquête et progression de la route courante. */
export function useCaseRoute(): { c: Case | undefined; progress: CaseProgress | undefined; caseId: string } {
  const { caseId = '' } = useParams();
  const c = getCase(caseId);
  const progress = useGame((s) => s.save.progress[caseId]);
  return { c, progress, caseId };
}

/** Préférence système « réduire les animations ». */
export function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** Délai de « saisie » d'un message : lié à sa longueur, borné. */
export function typingDelay(message: Message): number {
  if (message.from === 'player') return 450;
  if (message.from === 'system') return 700;
  return Math.min(2400, 700 + message.text.length * 18);
}

/**
 * Fait arriver les messages en attente, conversation par conversation, avec un délai
 * de saisie. Chaque message n'est programmé qu'une fois ; la révélation passe par le
 * moteur, qui empêche tout doublon.
 */
export function useMessageScheduler(c: Case | undefined, progress: CaseProgress | undefined) {
  const instant = useGame((s) => s.save.settings.instantMessages);
  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    if (!c || !progress) return;
    const scheduled = timers.current;
    if (instant) {
      if (progress.openConversations.some((id) => getNextMessage(c, progress, id))) {
        gameStore.getState().revealAll(c.id);
      }
      return;
    }
    for (const conversationId of progress.openConversations) {
      const next = getNextMessage(c, progress, conversationId);
      if (!next || scheduled.has(next.id)) continue;
      const handle = window.setTimeout(() => {
        scheduled.delete(next.id);
        const state = gameStore.getState();
        const current = state.save.progress[c.id];
        // Le message a pu être affiché entre-temps (bouton « accélérer ») : on ne saute rien.
        if (current && getNextMessage(c, current, conversationId)?.id === next.id) {
          state.revealNext(c.id, conversationId);
        }
      }, typingDelay(next));
      scheduled.set(next.id, handle);
    }
  }, [c, progress, instant]);

  useEffect(() => {
    const scheduled = timers.current;
    return () => {
      scheduled.forEach((h) => window.clearTimeout(h));
      scheduled.clear();
    };
  }, []);
}
