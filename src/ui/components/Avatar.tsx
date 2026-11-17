import type { Suspect } from '../../engine/types';

const shapes: Record<Suspect['shape'], string> = {
  circle: 'M50 4a46 46 0 1 1 0 92 46 46 0 0 1 0-92z',
  square: 'M22 4h56a18 18 0 0 1 18 18v56a18 18 0 0 1-18 18H22A18 18 0 0 1 4 78V22A18 18 0 0 1 22 4z',
  hexagon: 'M50 3l41 23.5v47L50 97 9 73.5v-47z',
  diamond: 'M50 2l48 48-48 48L2 50z',
};

/** Avatar local : forme + initiales (l'identité ne repose pas sur la couleur seule). */
export function Avatar({ suspect, size = 44 }: { suspect: Suspect; size?: number }) {
  const fill = `hsl(${suspect.hue} 38% 30%)`;
  const ring = `hsl(${suspect.hue} 55% 62%)`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="avatar">
      <path d={shapes[suspect.shape]} fill={fill} stroke={ring} strokeWidth="4" />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="34"
        fontWeight="650"
        fill="#f4f6fb"
        fontFamily="system-ui, sans-serif"
      >
        {suspect.initials}
      </text>
    </svg>
  );
}

/** Avatar du joueur et des notes. */
export function SystemAvatar({ label, size = 44 }: { label: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="avatar">
      <rect x="4" y="4" width="92" height="92" rx="26" fill="#1c2742" stroke="#f2b544" strokeWidth="4" />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="30"
        fontWeight="650"
        fill="#f2b544"
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}
