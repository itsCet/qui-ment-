import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { computeScore } from '../../engine';
import { useGame } from '../../state/store';
import { Avatar } from '../components/Avatar';
import { ConfirmDialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { useCaseRoute } from '../hooks';

export function Resolution() {
  const { c, progress } = useCaseRoute();
  const restartCase = useGame((s) => s.restartCase);
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  if (!c || !progress) return null;
  if (!progress.solved) return <Navigate to={`/enquete/${c.id}/accusation`} replace />;

  const { resolution } = c.solution;
  const culprit = c.suspects.find((s) => s.id === c.solution.culpritId);
  const score = computeScore(c, progress);
  const group = c.conversations.find((cv) => cv.kind === 'group');

  return (
    <div className="screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow amber">Affaire résolue</p>
          <h1>{c.title}</h1>
        </div>
      </header>

      <section className="verdict">
        {culprit && <Avatar suspect={culprit} size={72} />}
        <div>
          <p className="eyebrow">Coupable</p>
          <p className="verdict-name">{culprit?.name}</p>
        </div>
      </section>
      <p className="lead">{resolution.summary}</p>

      <section className="panel score-card" aria-labelledby="score">
        <h2 id="score">
          Score : {score.total}/{score.max} · {score.rank}
        </h2>
        <table className="score-table">
          <tbody>
            {score.lines.map((l) => (
              <tr key={l.label}>
                <th scope="row">{l.label}</th>
                <td>{l.points < 0 ? `−${Math.abs(l.points)}` : l.points}</td>
              </tr>
            ))}
            <tr className="score-total">
              <th scope="row">Total</th>
              <td>{score.total}</td>
            </tr>
          </tbody>
        </table>
        <p className="small muted">
          Le score part de {c.scoring.start}. Indices : −{c.scoring.hintCost.join(' / −')} selon le niveau. Mauvais suspect : −
          {c.scoring.wrongSuspect}. Preuves insuffisantes : −{c.scoring.insufficientEvidence}. La vitesse de lecture et les
          confrontations ratées ne comptent pas.
        </p>
      </section>

      <section className="panel" aria-labelledby="timeline">
        <h2 id="timeline">Reconstitution</h2>
        <ol className="timeline">
          {resolution.timeline.map((t) => (
            <li key={t.time + t.text} className={t.key ? 'key' : ''}>
              <time>{t.time}</time>
              <p>
                {t.key && <span className="visually-hidden">Moment clé : </span>}
                {t.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel" aria-labelledby="decisive">
        <h2 id="decisive">Les preuves décisives</h2>
        <ul className="explain-list">
          {resolution.decisive.map((d) => {
            const e = c.evidence.find((x) => x.id === d.evidenceId);
            const had = progress.evidence.includes(d.evidenceId);
            return (
              <li key={d.evidenceId}>
                <p className="explain-title">
                  {e?.title}
                  {had && (
                    <span className="tag">
                      <Icon name="check" size={12} /> trouvée
                    </span>
                  )}
                </p>
                <p>{d.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel" aria-labelledby="false-leads">
        <h2 id="false-leads">Les fausses pistes</h2>
        <ul className="explain-list">
          {resolution.falseLeads.map((f) => (
            <li key={f.title}>
              <p className="explain-title">{f.title}</p>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" aria-labelledby="epilogue">
        <h2 id="epilogue">Épilogue</h2>
        <p>{resolution.epilogue}</p>
        {group && (
          <Link to={`/enquete/${c.id}/conversations/${group.id}`} className="button button-ghost button-block">
            <Icon name="chat" size={18} /> Lire les derniers messages du groupe
          </Link>
        )}
      </section>

      <div className="stack">
        <button type="button" className="button button-primary button-block" onClick={() => setConfirm(true)}>
          <Icon name="restart" size={18} /> Rejouer l’enquête
        </button>
        <Link to="/" className="button button-ghost button-block">
          Retour à l’accueil
        </Link>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Rejouer l’enquête ?"
        message="Ta partie actuelle et son score seront effacés."
        confirmLabel="Rejouer"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          restartCase(c.id);
          navigate(`/enquete/${c.id}`);
        }}
      />
    </div>
  );
}
