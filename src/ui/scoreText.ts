import type { Case } from '../engine/types';

/** Explication du score, construite à partir des règles réellement utilisées par l'enquête. */
export function scoringText(c: Case): string {
  const s = c.scoring;
  const parts = [`Tu pars de ${s.start} points.`, `Chaque indice coûte ${s.hintCost.join(', ')} points selon son niveau.`];
  if (!c.solution.noAccusation) {
    parts.push(
      `Accuser le mauvais suspect coûte ${s.wrongSuspect} points ; accuser la bonne personne sans preuves suffisantes en coûte ${s.insufficientEvidence}.`,
    );
  }
  if (s.mistake) parts.push(`Chaque mauvaise réponse coûte ${s.mistake} points, et tu peux toujours réessayer.`);
  parts.push('Les confrontations ratées et le temps de lecture ne comptent pas.');
  return parts.join(' ');
}
