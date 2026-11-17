import type { Case, CaseProgress } from './types';

export interface ScoreLine {
  label: string;
  points: number;
}

export interface ScoreReport {
  total: number;
  max: number;
  lines: ScoreLine[];
  rank: string;
}

/** Coût cumulé des indices révélés pour un objectif à un niveau donné. */
export function hintCostUpTo(c: Case, level: number): number {
  return c.scoring.hintCost.slice(0, level).reduce((sum, v) => sum + v, 0);
}

/**
 * Le score dépend uniquement des indices et des accusations erronées.
 * La vitesse de lecture et les confrontations ratées n'interviennent pas.
 */
export function computeScore(c: Case, p: CaseProgress): ScoreReport {
  const lines: ScoreLine[] = [{ label: 'Points de départ', points: c.scoring.start }];

  const hintLevels = Object.values(p.hintsUsed);
  const hintCount = hintLevels.reduce((sum, lvl) => sum + lvl, 0);
  const hintPenalty = hintLevels.reduce((sum, lvl) => sum + hintCostUpTo(c, lvl), 0);
  if (hintCount > 0) {
    lines.push({ label: `Indices consultés (${hintCount})`, points: -hintPenalty });
  }

  const wrong = p.accusations.filter((a) => a.result === 'wrongSuspect').length;
  if (wrong > 0) {
    lines.push({ label: `Mauvais suspect accusé (${wrong})`, points: -wrong * c.scoring.wrongSuspect });
  }
  const weak = p.accusations.filter((a) => a.result === 'insufficientEvidence').length;
  if (weak > 0) {
    lines.push({ label: `Accusation sans preuves suffisantes (${weak})`, points: -weak * c.scoring.insufficientEvidence });
  }

  const raw = lines.reduce((sum, l) => sum + l.points, 0);
  const total = Math.max(0, Math.min(c.scoring.start, raw));
  return { total, max: c.scoring.start, lines, rank: rankFor(total) };
}

export function rankFor(total: number): string {
  if (total >= 90) return 'Fin limier';
  if (total >= 70) return 'Enquêteur solide';
  if (total >= 40) return 'Intuition à affiner';
  return 'Affaire classée de justesse';
}
