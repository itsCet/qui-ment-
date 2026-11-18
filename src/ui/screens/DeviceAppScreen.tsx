import { Navigate, useParams } from 'react-router';
import { isChoiceVisible } from '../../engine';
import { useGame } from '../../state/store';
import { useCaseRoute } from '../hooks';
import { AppIcon } from '../phone/AppIcon';
import { NavBar } from '../phone/NavBar';

/** Applis « maison » du téléphone (serrure, box) : affichent un journal. */
export function DeviceAppScreen() {
  const { c, progress } = useCaseRoute();
  const { appId = '' } = useParams();
  const choose = useGame((s) => s.choose);
  const revealConversation = useGame((s) => s.revealConversation);
  if (!c || !progress) return null;
  const base = `/enquete/${c.id}`;
  const app = c.device.apps.find((a) => a.id === appId);
  if (!app) return <Navigate to={base} replace />;

  const evidence = c.evidence.find((e) => e.id === app.evidenceId);
  const owned = progress.evidence.includes(app.evidenceId);
  const notes = c.conversations.find((cv) => cv.kind === 'notes');
  const choice = notes?.choices.find((ch) => ch.id === app.openChoiceId);
  const made = progress.choicesMade.includes(app.openChoiceId);
  const canOpen =
    !!notes && !!choice && progress.openConversations.includes(notes.id) && (made || isChoiceVisible(progress, choice));
  const content = evidence?.content.type === 'log' ? evidence.content : null;

  return (
    <div className={`app-page device-app device-${app.icon}`}>
      <NavBar back={{ to: base, label: 'Accueil' }} largeTitle={app.label} />
      {owned && content ? (
        <>
          <p className="device-sub">{content.app}</p>
          <ul className="log-list" aria-label={content.app}>
            {content.rows.map((row, i) => (
              <li key={i} className="log-row">
                <span className="log-main">{row.length > 2 ? row[0] : row[1]}</span>
                <span className="log-meta">{row.length > 2 ? `${row[1]} → ${row[2]}` : row[0]}</span>
              </li>
            ))}
          </ul>
          <p className="device-note">{content.note}</p>
          <p className="device-note">{evidence?.description}</p>
        </>
      ) : (
        <div className="device-empty">
          <span className="device-empty-icon">
            <AppIcon id={app.icon === 'lock' ? 'serrure' : 'box'} />
          </span>
          <p>{app.lockedText}</p>
          {canOpen && notes ? (
            <button
              type="button"
              className="pill pill-primary"
              onClick={() => {
                // La note en cours d'écriture est terminée avant de consulter l'appli.
                revealConversation(c.id, notes.id);
                if (!made) choose(c.id, app.openChoiceId);
                revealConversation(c.id, notes.id);
              }}
            >
              Consulter l’historique
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
