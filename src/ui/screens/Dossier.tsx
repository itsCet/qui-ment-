import { useState } from 'react';
import { Link } from 'react-router';
import {
  computeScore,
  getCurrentObjective,
  hintCostUpTo,
  isObjectiveComplete,
  unreadCount,
  type Case,
  type CaseProgress,
  type Objective,
} from '../../engine';
import { useGame } from '../../state/store';
import { Dialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { useCaseRoute } from '../hooks';

function HintDialog({
  c,
  progress,
  objective,
  open,
  onClose,
}: {
  c: Case;
  progress: CaseProgress;
  objective: Objective;
  open: boolean;
  onClose: () => void;
}) {
  const requestHint = useGame((s) => s.requestHint);
  const level = progress.hintsUsed[objective.id] ?? 0;
  const nextCost = level < 3 ? c.scoring.hintCost[level] : 0;
  return (
    <Dialog open={open} onClose={onClose} title="Indices" variant="sheet">
      <p className="muted">
        Objectif : <strong>{objective.title}</strong>
      </p>
      <ol className="hint-list">
        {objective.hints.slice(0, level).map((hint, i) => (
          <li key={i}>
            <span className="hint-level">Niveau {i + 1}</span>
            <p>{hint}</p>
          </li>
        ))}
      </ol>
      {level < 3 ? (
        <button
          type="button"
          className="button button-amber button-block"
          onClick={() => requestHint(c.id, objective.id)}
        >
          <Icon name="bulb" size={18} /> Révéler l’indice niveau {level + 1} (−{nextCost} points)
        </button>
      ) : (
        <p className="muted">Tous les indices de cet objectif sont révélés.</p>
      )}
      <p className="small muted">
        Indices utilisés pour cet objectif : {level}/3, soit −{hintCostUpTo(c, level)} points.
      </p>
    </Dialog>
  );
}

export function Dossier() {
  const { c, progress } = useCaseRoute();
  const [hintOpen, setHintOpen] = useState(false);
  if (!c || !progress) return null;

  const objective = getCurrentObjective(c, progress);
  const score = computeScore(c, progress);
  const unread = progress.openConversations.reduce((sum, id) => sum + unreadCount(progress, id), 0);

  return (
    <div className="screen">
      <header className="screen-header">
        <Link to="/" className="icon-button" aria-label="Retour à l’accueil">
          <Icon name="back" />
        </Link>
        <div>
          <p className="eyebrow">Dossier de l’enquête</p>
          <h1>{c.title}</h1>
        </div>
      </header>

      {objective ? (
        <section className="objective" aria-labelledby="objective-title">
          <p className="eyebrow amber">
            <Icon name="spark" size={16} /> Objectif actuel
          </p>
          <h2 id="objective-title">{objective.title}</h2>
          <p>{objective.description}</p>
          <button type="button" className="button button-ghost" onClick={() => setHintOpen(true)}>
            <Icon name="bulb" size={18} /> Besoin d’un indice ?
          </button>
          <HintDialog c={c} progress={progress} objective={objective} open={hintOpen} onClose={() => setHintOpen(false)} />
        </section>
      ) : (
        <section className="objective solved">
          <p className="eyebrow amber">
            <Icon name="check" size={16} /> Affaire résolue
          </p>
          <Link className="button button-primary" to={`/enquete/${c.id}/resolution`}>
            Voir la résolution
          </Link>
        </section>
      )}

      <section className="panel" aria-labelledby="resume">
        <h2 id="resume">L’affaire</h2>
        {c.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <nav className="quick-grid" aria-label="Accès rapide">
        <Link to={`/enquete/${c.id}/conversations`} className="quick-card">
          <Icon name="chat" />
          <span className="quick-title">Conversations</span>
          <span className="quick-meta">{unread > 0 ? `${unread} non lu${unread > 1 ? 's' : ''}` : 'À jour'}</span>
        </Link>
        <Link to={`/enquete/${c.id}/suspects`} className="quick-card">
          <Icon name="people" />
          <span className="quick-title">Suspects</span>
          <span className="quick-meta">
            {progress.statements.length} déclaration{progress.statements.length > 1 ? 's' : ''}
          </span>
        </Link>
        <Link to={`/enquete/${c.id}/preuves`} className="quick-card">
          <Icon name="clip" />
          <span className="quick-title">Carnet</span>
          <span className="quick-meta">
            {progress.evidence.length}/{c.evidence.length} pièces · {progress.contradictions.length}/
            {c.contradictions.length} contradictions
          </span>
        </Link>
        <Link to={`/enquete/${c.id}/${progress.solved ? 'resolution' : 'accusation'}`} className="quick-card">
          <Icon name="gavel" />
          <span className="quick-title">{progress.solved ? 'Résolution' : 'Accuser'}</span>
          <span className="quick-meta">
            {progress.accusations.length} tentative{progress.accusations.length > 1 ? 's' : ''}
          </span>
        </Link>
      </nav>

      <section className="panel" aria-labelledby="objectives">
        <h2 id="objectives">Progression</h2>
        <ul className="checklist">
          {c.objectives.map((o) => {
            const done = isObjectiveComplete(progress, o);
            return (
              <li key={o.id} className={done ? 'done' : ''}>
                <Icon name={done ? 'check' : 'chevron'} size={18} />
                <span>
                  {o.title}
                  <span className="visually-hidden">{done ? ' (terminé)' : ' (à faire)'}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel" aria-labelledby="score">
        <h2 id="score">
          Score actuel : {score.total}/{score.max}
        </h2>
        <p className="small muted">
          Tu pars de {c.scoring.start} points. Chaque indice coûte {c.scoring.hintCost.join(', ')} points selon son niveau.
          Accuser le mauvais suspect coûte {c.scoring.wrongSuspect} points ; accuser la bonne personne sans preuves
          suffisantes en coûte {c.scoring.insufficientEvidence}. Les confrontations ratées dans le carnet et le temps passé
          à lire ne comptent pas.
        </p>
      </section>
    </div>
  );
}
