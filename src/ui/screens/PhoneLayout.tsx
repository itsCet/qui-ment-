import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Outlet, useMatch, useNavigate } from 'react-router';
import { formatClock, indexCase, type Case, type CaseProgress } from '../../engine';
import { useCaseRoute, useMessageScheduler } from '../hooks';
import { AppIcon, StatusIcons, type AppIconId } from '../phone/AppIcon';

interface Banner {
  id: number;
  app: AppIconId;
  appName: string;
  title: string;
  text: string;
  to: string;
}

/** Bannières de notification pour ce qui arrive hors de l'écran courant. */
function useBanners(c: Case | undefined, progress: CaseProgress | undefined, activeConversation: string | undefined) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const previous = useRef<CaseProgress | undefined>(undefined);
  const counter = useRef(0);

  useEffect(() => {
    const prev = previous.current;
    previous.current = progress;
    if (!c || !progress || !prev || prev.caseId !== progress.caseId) return;
    const base = `/enquete/${c.id}`;
    const index = indexCase(c);
    const added: Banner[] = [];

    for (const cv of c.conversations) {
      if (cv.id === activeConversation || cv.kind === 'notes') continue;
      const before = prev.threads[cv.id]?.length ?? 0;
      const entries = progress.threads[cv.id] ?? [];
      const last = entries.slice(before).filter((e) => e.kind === 'message').at(-1);
      if (!last) continue;
      const message = index.messages.get(last.id)?.message;
      if (!message || message.from === 'player' || message.from === 'system') continue;
      const author = c.suspects.find((s) => s.id === message.from)?.name.split(' ')[0] ?? '';
      added.push({
        id: ++counter.current,
        app: 'echanges',
        appName: 'Échanges',
        title: cv.kind === 'group' ? cv.title : author,
        text: cv.kind === 'group' ? `${author} : ${message.text}` : message.text,
        to: `${base}/echanges/${cv.id}`,
      });
    }

    const newEvidence = progress.evidence
      .slice(prev.evidence.length)
      .filter((id) => !c.evidence.find((e) => e.id === id)?.everyday);
    if (newEvidence.length > 0) {
      const first = c.evidence.find((e) => e.id === newEvidence[0]);
      added.push({
        id: ++counter.current,
        app: 'carnet',
        appName: 'Carnet',
        title: newEvidence.length > 1 ? `${newEvidence.length} nouvelles pièces` : 'Nouvelle pièce',
        text: newEvidence.length > 1 ? 'Ajoutées à ton carnet de preuves.' : (first?.title ?? ''),
        to: `${base}/carnet`,
      });
    }

    if (added.length === 0) return;
    window.setTimeout(() => setBanners((b) => [...b, ...added].slice(-2)), 0);
    window.setTimeout(() => setBanners((b) => b.filter((x) => !added.some((a) => a.id === x.id))), 4500);
  }, [c, progress, activeConversation]);

  return [banners, setBanners] as const;
}

export function PhoneLayout() {
  const { c, progress } = useCaseRoute();
  const navigate = useNavigate();
  const homeMatch = useMatch('/enquete/:caseId');
  const chatMatch = useMatch('/enquete/:caseId/echanges/:conversationId');
  const activeConversation = chatMatch?.params.conversationId;

  useMessageScheduler(c, progress);
  const [banners, setBanners] = useBanners(c, progress, activeConversation);

  if (!c || !progress) return <Navigate to="/" replace />;
  const onHome = !!homeMatch;

  return (
    <div className={`phone${onHome ? ' phone-home' : ''}`}>
      <div className="status-bar">
        <span className="status-time" aria-label={`Heure de l’enquête : ${formatClock(progress.clockMinutes)}`}>
          {formatClock(progress.clockMinutes)}
        </span>
        <StatusIcons />
      </div>

      <main className="phone-screen" id="contenu">
        <Outlet />
      </main>

      <div className="banners" role="status" aria-live="polite">
        {banners.map((b) => (
          <button
            key={b.id}
            type="button"
            className="banner"
            onClick={() => {
              setBanners((list) => list.filter((x) => x.id !== b.id));
              navigate(b.to);
            }}
          >
            <span className="banner-icon">
              <AppIcon id={b.app} />
            </span>
            <span className="banner-body">
              <span className="banner-top">
                <span className="banner-title">{b.title}</span>
                <span className="banner-app">{b.appName}</span>
              </span>
              <span className="banner-text">{b.text}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="home-bar">
        {onHome ? (
          <Link to="/" className="home-bar-button" aria-label="Verrouiller le téléphone (menu du jeu)">
            <span className="home-bar-line" />
          </Link>
        ) : (
          <Link to={`/enquete/${c.id}`} className="home-bar-button" aria-label="Écran d’accueil">
            <span className="home-bar-line" />
          </Link>
        )}
      </div>
    </div>
  );
}
