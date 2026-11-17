import { useEffect, useRef, useState } from 'react';
import { Navigate, NavLink, Outlet, useMatch } from 'react-router';
import { formatClock, unreadCount, type Case, type CaseProgress } from '../../engine';
import { Icon, type IconName } from '../components/Icon';
import { useCaseRoute, useMessageScheduler } from '../hooks';

interface Toast {
  id: number;
  text: string;
}

/** Notifications discrètes : nouvelles pièces, déclarations et messages hors écran. */
function useToasts(c: Case | undefined, progress: CaseProgress | undefined) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const previous = useRef<CaseProgress | undefined>(undefined);
  const counter = useRef(0);

  useEffect(() => {
    const prev = previous.current;
    previous.current = progress;
    if (!c || !progress || !prev || prev.caseId !== progress.caseId) return;
    const texts: string[] = [];
    const newEvidence = progress.evidence.slice(prev.evidence.length);
    if (newEvidence.length === 1) {
      const e = c.evidence.find((x) => x.id === newEvidence[0]);
      if (e) texts.push(`Nouvelle pièce au carnet : ${e.title}`);
    } else if (newEvidence.length > 1) {
      texts.push(`${newEvidence.length} nouvelles pièces au carnet`);
    }
    const speakers = progress.statements
      .slice(prev.statements.length)
      .map((id) => c.suspects.find((s) => s.id === c.statements.find((x) => x.id === id)?.suspectId)?.name.split(' ')[0])
      .filter(Boolean);
    if (speakers.length > 0) texts.push(`Déclaration notée : ${[...new Set(speakers)].join(', ')}`);
    const newConversations = progress.openConversations.slice(prev.openConversations.length);
    if (newConversations.length === 1) {
      const cv = c.conversations.find((x) => x.id === newConversations[0]);
      if (cv) texts.push(`Conversation disponible : ${cv.title}`);
    } else if (newConversations.length > 1) {
      texts.push(`${newConversations.length} nouvelles conversations disponibles`);
    }
    if (texts.length === 0) return;
    const added = texts.map((text) => ({ id: ++counter.current, text }));
    // Mise à jour différée : on réagit à un changement du store, pas au rendu.
    window.setTimeout(() => setToasts((t) => [...t, ...added].slice(-2)), 0);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => !added.some((a) => a.id === x.id)));
    }, 4200);
  }, [c, progress]);

  return toasts;
}

export function CaseLayout() {
  const { c, progress } = useCaseRoute();
  const conversationMatch = useMatch('/enquete/:caseId/conversations/:conversationId');
  const activeConversation = conversationMatch?.params.conversationId;

  useMessageScheduler(c, progress);
  const toasts = useToasts(c, progress);

  if (!c || !progress) return <Navigate to="/" replace />;

  const unread = progress.openConversations
    .filter((id) => id !== activeConversation)
    .reduce((sum, id) => sum + unreadCount(progress, id), 0);

  const tabs: { to: string; label: string; icon: IconName; badge?: number; end?: boolean }[] = [
    { to: `/enquete/${c.id}`, label: 'Dossier', icon: 'folder', end: true },
    { to: `/enquete/${c.id}/conversations`, label: 'Messages', icon: 'chat', badge: unread },
    { to: `/enquete/${c.id}/suspects`, label: 'Suspects', icon: 'people' },
    { to: `/enquete/${c.id}/preuves`, label: 'Carnet', icon: 'clip' },
    progress.solved
      ? { to: `/enquete/${c.id}/resolution`, label: 'Résolution', icon: 'check' }
      : { to: `/enquete/${c.id}/accusation`, label: 'Accuser', icon: 'gavel' },
  ];

  return (
    <div className="case-layout">
      <div className="status-strip" aria-label="Horloge de l’enquête">
        <span>
          <Icon name="clock" size={16} /> {formatClock(progress.clockMinutes)}
        </span>
        <span className="status-deadline">{c.clock.deadlineLabel}</span>
      </div>

      <main className="case-main" id="contenu">
        <Outlet />
      </main>

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <Icon name="spark" size={18} />
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      <nav className="tabbar" aria-label="Navigation de l’enquête">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className="tab">
            <span className="tab-icon">
              <Icon name={tab.icon} />
              {tab.badge ? (
                <span className="badge" aria-label={`${tab.badge} non lu${tab.badge > 1 ? 's' : ''}`}>
                  {tab.badge}
                </span>
              ) : null}
            </span>
            <span className="tab-label">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
