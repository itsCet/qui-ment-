/** Icônes d'applis du téléphone fictif (dessins originaux, aucune marque). */

export type AppIconId = 'echanges' | 'photos' | 'notes' | 'contacts' | 'serrure' | 'box' | 'carnet' | 'enquete';

function Tile({ id, from, to, children }: { id: string; from: string; to: string; children: React.ReactNode }) {
  const gid = `g-${id}`;
  return (
    <svg viewBox="0 0 60 60" className="app-icon-svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="60" height="60" rx="13.5" fill={`url(#${gid})`} />
      {children}
    </svg>
  );
}

export function AppIcon({ id }: { id: AppIconId }) {
  switch (id) {
    case 'echanges':
      return (
        <Tile id={id} from="#67e07a" to="#22b14c">
          <path d="M30 14c-9.4 0-17 6.1-17 13.6 0 4.3 2.5 8.1 6.4 10.6-.3 2.4-1.5 4.6-3.4 6.2 3.4.2 6.6-1 9-3 1.6.4 3.3.6 5 .6 9.4 0 17-6.1 17-13.6S39.4 14 30 14z" fill="#fff" />
        </Tile>
      );
    case 'photos':
      return (
        <svg viewBox="0 0 60 60" className="app-icon-svg" aria-hidden="true" focusable="false">
          <rect width="60" height="60" rx="13.5" fill="#fff" />
          <rect x="11" y="15" width="38" height="30" rx="5" fill="#ffb648" />
          <circle cx="38" cy="24" r="4" fill="#fff6d8" />
          <path d="M11 39l11-12 9 9 6-5 12 10v4a5 5 0 0 1-5 5H16a5 5 0 0 1-5-5z" fill="#e2563c" />
          <path d="M11 41l11-10 9 8 6-4 12 9v1a5 5 0 0 1-5 5H16a5 5 0 0 1-5-5z" fill="#b8352a" />
        </svg>
      );
    case 'notes':
      return (
        <svg viewBox="0 0 60 60" className="app-icon-svg" aria-hidden="true" focusable="false">
          <rect width="60" height="60" rx="13.5" fill="#fffdf6" />
          <path d="M0 13.5A13.5 13.5 0 0 1 13.5 0h33A13.5 13.5 0 0 1 60 13.5V18H0z" fill="#ffcc2f" />
          <path d="M8 28h44M8 36h44M8 44h44" stroke="#d9d6cc" strokeWidth="1.4" />
          <path d="M6 20h48" stroke="#e8b600" strokeWidth="1" strokeDasharray="1.5 2.5" />
        </svg>
      );
    case 'contacts':
      return (
        <Tile id={id} from="#d7d9de" to="#a9adb6">
          <circle cx="30" cy="24" r="8.5" fill="#fff" />
          <path d="M14 46c1.7-8 8.2-12.5 16-12.5S44.3 38 46 46z" fill="#fff" />
        </Tile>
      );
    case 'serrure':
      return (
        <Tile id={id} from="#3c4552" to="#1d232c">
          <rect x="18" y="27" width="24" height="19" rx="4" fill="#f4f6f8" />
          <path d="M23 27v-5a7 7 0 0 1 14 0v5" fill="none" stroke="#f4f6f8" strokeWidth="3.4" />
          <circle cx="30" cy="35" r="2.6" fill="#1d232c" />
          <path d="M29 36h2v5h-2z" fill="#1d232c" />
        </Tile>
      );
    case 'box':
      return (
        <Tile id={id} from="#4aa8ff" to="#1663d6">
          <path d="M13 26a24 24 0 0 1 34 0M18 31.5a16.5 16.5 0 0 1 24 0M23 37a9 9 0 0 1 14 0" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="30" cy="42.5" r="3" fill="#fff" />
        </Tile>
      );
    case 'carnet':
      return (
        <Tile id={id} from="#b9875a" to="#7c5230">
          <rect x="16" y="12" width="28" height="36" rx="3" fill="#f7efe1" />
          <path d="M21 22h18M21 28h18M21 34h12" stroke="#b9a587" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M38 8v16l-3-2.5-3 2.5V8" fill="#d6453a" />
        </Tile>
      );
    case 'enquete':
      return (
        <Tile id={id} from="#33405f" to="#151b2c">
          <circle cx="26" cy="26" r="10" fill="none" stroke="#fff" strokeWidth="3.4" />
          <path d="M33.5 33.5l10 10" stroke="#f2b544" strokeWidth="4.4" strokeLinecap="round" />
        </Tile>
      );
  }
}

/** Icônes de la barre d'état (décoratives). */
export function StatusIcons() {
  return (
    <span className="status-icons" aria-hidden="true">
      <svg width="18" height="12" viewBox="0 0 18 12">
        <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" />
        <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" />
        <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
      </svg>
      <svg width="16" height="12" viewBox="0 0 16 12">
        <path d="M8 11.5l2.6-3a3.6 3.6 0 0 0-5.2 0zM3.2 6.4a6.8 6.8 0 0 1 9.6 0l1.4-1.6a8.9 8.9 0 0 0-12.4 0zM.4 3.3a10.9 10.9 0 0 1 15.2 0L17 1.7A13 13 0 0 0-1 1.7z" fill="currentColor" />
      </svg>
      <svg width="26" height="12" viewBox="0 0 26 12">
        <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.45" />
        <rect x="2" y="2" width="15" height="8" rx="1.6" fill="currentColor" />
        <path d="M24 4v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.5" />
      </svg>
    </span>
  );
}
