import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cases } from '../../cases';
import { completionRatio, formatClock, isResolved, parseClock, type Case } from '../../engine';
import { useGame } from '../../state/store';
import { ConfirmDialog, Dialog } from '../components/Dialog';
import { AppIcon, StatusIcons } from '../phone/AppIcon';

function CaseNotification({ c, number }: { c: Case; number: number }) {
  const navigate = useNavigate();
  const progress = useGame((s) => s.save.progress[c.id]);
  const hydrated = useGame((s) => s.hydrated);
  const startCase = useGame((s) => s.startCase);
  const restartCase = useGame((s) => s.restartCase);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const ratio = progress ? completionRatio(c, progress) : 0;
  const resolved = !!progress && isResolved(c, progress);
  const status = !progress ? 'Nouvelle enquête' : resolved ? 'Affaire résolue' : `En cours · ${Math.round(ratio * 100)} %`;

  const open = () => {
    startCase(c.id);
    navigate(resolved ? `/enquete/${c.id}/resolution` : `/enquete/${c.id}`);
  };

  return (
    <article className="lock-card" aria-labelledby={`case-${c.id}`}>
      <div className="lock-card-head">
        <span className="lock-card-icon">
          <AppIcon id="enquete" />
        </span>
        <span className="lock-card-app">Enquête n° {number}</span>
        <span className="lock-card-meta">{c.duration}</span>
      </div>
      <h2 id={`case-${c.id}`}>{c.title}</h2>
      <p>{c.tagline}</p>
      <p className="lock-card-status">
        {status}
        {progress && !resolved && (
          <span
            className="lock-progress"
            role="progressbar"
            aria-label="Avancement"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(ratio * 100)}
          >
            <span style={{ width: `${ratio * 100}%` }} />
          </span>
        )}
      </p>
      <div className="lock-card-actions">
        <button type="button" className="pill pill-primary" onClick={open} disabled={!hydrated}>
          {!progress ? 'Commencer' : resolved ? 'Revoir la résolution' : 'Reprendre'}
        </button>
        {progress && (
          <button type="button" className="pill" onClick={() => setConfirmRestart(true)}>
            Recommencer
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirmRestart}
        title="Recommencer l’enquête ?"
        message="Toute ta progression sur cette enquête sera effacée : messages, pièces, contradictions, indices et score."
        confirmLabel="Tout effacer"
        danger
        onCancel={() => setConfirmRestart(false)}
        onConfirm={() => {
          setConfirmRestart(false);
          restartCase(c.id);
          navigate(`/enquete/${c.id}`);
        }}
      />
    </article>
  );
}

export function LockScreen() {
  const instant = useGame((s) => s.save.settings.instantMessages);
  const setInstant = useGame((s) => s.setInstantMessages);
  const loadStatus = useGame((s) => s.loadStatus);
  const activeId = useGame((s) => s.save.activeCaseId);
  const first = cases.find((c) => c.id === activeId) ?? cases[0];
  const firstProgress = useGame((s) => s.save.progress[first.id]);
  const [sheet, setSheet] = useState<'help' | 'settings' | null>(null);

  const time = formatClock(firstProgress?.clockMinutes ?? parseClock(first.clock.start));

  return (
    <div className="lock" id="contenu">
      <div className="status-bar status-bar-light">
        <span className="status-time">{time}</span>
        <StatusIcons />
      </div>
      <div className="lock-top">
        <p className="lock-brand">Qui ment ?</p>
        <p className="lock-date">
          {first.device.date.weekday} {first.device.date.day} {first.device.date.month}
        </p>
        <p className="lock-time" aria-hidden="true">
          {time}
        </p>
      </div>

      {loadStatus === 'invalid' && (
        <p className="lock-notice" role="alert">
          Une sauvegarde endommagée a été ignorée. Les parties valides ont été conservées.
        </p>
      )}
      {loadStatus === 'unavailable' && (
        <p className="lock-notice" role="alert">
          Le stockage local est indisponible : ta progression ne sera pas sauvegardée.
        </p>
      )}

      <div className="lock-stack">
        {cases.map((c, i) => (
          <CaseNotification key={c.id} c={c} number={i + 1} />
        ))}
      </div>

      <div className="lock-footer">
        <button type="button" className="pill pill-glass" onClick={() => setSheet('help')}>
          Comment jouer
        </button>
        <button type="button" className="pill pill-glass" onClick={() => setSheet('settings')}>
          Réglages
        </button>
      </div>

      <Dialog open={sheet === 'help'} onClose={() => setSheet(null)} title="Comment jouer" variant="sheet">
        <ol className="how-list">
          <li>Chaque enquête se joue sur un téléphone : le tien, ou la copie de celui d’un proche. Tout se passe dans ses applis.</li>
          <li>Dans Échanges, interroge chaque personne en choisissant tes réponses.</li>
          <li>Notes, Photos, Fichiers et les autres applis te donnent des pièces. Elles s’ajoutent au Carnet.</li>
          <li>Dans le Carnet, confronte une déclaration à une pièce pour révéler un mensonge.</li>
          <li>Dans Enquête, désigne le coupable en présentant les preuves qui le démontrent.</li>
        </ol>
        <p className="muted small">La progression est sauvegardée automatiquement sur cet appareil.</p>
      </Dialog>

      <Dialog open={sheet === 'settings'} onClose={() => setSheet(null)} title="Réglages" variant="sheet">
        <label className="settings-row">
          <span>
            Messages instantanés
            <small>Affiche les messages sans délai de saisie.</small>
          </span>
          <input type="checkbox" className="switch" checked={instant} onChange={(e) => setInstant(e.target.checked)} />
        </label>
      </Dialog>
    </div>
  );
}
