import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cases } from '../../cases';
import { completionRatio, type Case } from '../../engine';
import { useGame } from '../../state/store';
import { ConfirmDialog } from '../components/Dialog';
import { Icon } from '../components/Icon';

function CaseCard({ c, number }: { c: Case; number: number }) {
  const navigate = useNavigate();
  const progress = useGame((s) => s.save.progress[c.id]);
  const hydrated = useGame((s) => s.hydrated);
  const startCase = useGame((s) => s.startCase);
  const restartCase = useGame((s) => s.restartCase);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const ratio = progress ? completionRatio(c, progress) : 0;
  const status = !progress ? 'Nouvelle enquête' : progress.solved ? 'Affaire résolue' : `En cours · ${Math.round(ratio * 100)} %`;

  const open = () => {
    startCase(c.id);
    navigate(progress?.solved ? `/enquete/${c.id}/resolution` : `/enquete/${c.id}`);
  };

  return (
    <article className="case-card" aria-labelledby={`case-${c.id}`}>
      <p className="eyebrow">Enquête n° {number} · {c.difficulty}</p>
      <h2 id={`case-${c.id}`}>{c.title}</h2>
      <p className="case-tagline">{c.tagline}</p>
      <ul className="case-meta">
        <li>
          <Icon name="clock" size={18} /> {c.duration}
        </li>
        <li>
          <Icon name="people" size={18} /> {c.suspects.length} suspects
        </li>
      </ul>
      <div className="progress-line">
        <span className="progress-label">{status}</span>
        <div
          className="progress-bar"
          role="progressbar"
          aria-label="Avancement de l’enquête"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(ratio * 100)}
        >
          <span style={{ width: `${ratio * 100}%` }} />
        </div>
      </div>
      <div className="case-actions">
        <button type="button" className="button button-primary button-block" onClick={open} disabled={!hydrated}>
          {!progress ? 'Commencer' : progress.solved ? 'Revoir la résolution' : 'Reprendre'}
        </button>
        {progress && (
          <button type="button" className="button button-ghost button-block" onClick={() => setConfirmRestart(true)}>
            <Icon name="restart" size={18} /> Recommencer
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirmRestart}
        title="Recommencer l’enquête ?"
        message="Toute ta progression sur cette enquête sera effacée : messages, pièces, contradictions, indices et score."
        confirmLabel="Tout effacer et recommencer"
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

export function Home() {
  const instant = useGame((s) => s.save.settings.instantMessages);
  const setInstant = useGame((s) => s.setInstantMessages);
  const loadStatus = useGame((s) => s.loadStatus);

  return (
    <main className="home" id="contenu">
      <header className="home-hero">
        <div className="logo" aria-hidden="true">
          <span>?</span>
        </div>
        <h1>Qui ment ?</h1>
        <p className="home-lead">
          Un téléphone, des conversations, des alibis. Lis entre les lignes, rassemble les preuves et démontre qui ment.
        </p>
      </header>

      {loadStatus === 'invalid' && (
        <p className="notice" role="alert">
          <Icon name="warning" size={18} /> Une sauvegarde endommagée a été ignorée. Les parties valides ont été conservées.
        </p>
      )}
      {loadStatus === 'unavailable' && (
        <p className="notice" role="alert">
          <Icon name="warning" size={18} /> Le stockage local est indisponible : ta progression ne sera pas sauvegardée.
        </p>
      )}

      {cases.map((c, i) => (
        <CaseCard key={c.id} c={c} number={i + 1} />
      ))}

      <section className="panel" aria-labelledby="how-to">
        <h2 id="how-to">Comment jouer</h2>
        <ol className="how-list">
          <li>Lis les messages et interroge chaque suspect en privé.</li>
          <li>Les déclarations et les pièces s’ajoutent à ton carnet.</li>
          <li>Confronte une déclaration à une pièce pour révéler un mensonge.</li>
          <li>Accuse le coupable en présentant les preuves qui le démontrent.</li>
        </ol>
      </section>

      <section className="panel" aria-labelledby="settings">
        <h2 id="settings">Réglages</h2>
        <label className="toggle">
          <input type="checkbox" checked={instant} onChange={(e) => setInstant(e.target.checked)} />
          <span className="toggle-track" aria-hidden="true" />
          <span className="toggle-text">
            Messages instantanés
            <small>Affiche les messages sans délai de saisie.</small>
          </span>
        </label>
      </section>

      <p className="home-footer">Progression sauvegardée automatiquement sur cet appareil. Jouable hors ligne.</p>
    </main>
  );
}
