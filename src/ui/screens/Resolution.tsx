import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { computeScore } from '../../engine';
import { useGame } from '../../state/store';
import { ConfirmDialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { useCaseRoute } from '../hooks';
import { ContactAvatar } from '../phone/ContactAvatar';
import { NavBar } from '../phone/NavBar';

export function Resolution() {
  const { c, progress } = useCaseRoute();
  const restartCase = useGame((s) => s.restartCase);
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  if (!c || !progress) return null;
  const base = `/enquete/${c.id}`;
  if (!progress.solved) return <Navigate to={`${base}/accusation`} replace />;

  const { resolution } = c.solution;
  const culprit = c.suspects.find((s) => s.id === c.solution.culpritId);
  const score = computeScore(c, progress);
  const group = c.conversations.find((cv) => cv.kind === 'group');

  return (
    <div className="app-page grouped">
      <NavBar back={{ to: base, label: 'Accueil' }} largeTitle="Affaire résolue" />

      <section className="contact-hero verdict">
        {culprit && <ContactAvatar suspect={culprit} size={88} />}
        <p className="section-label">Coupable</p>
        <h2>{culprit?.name}</h2>
        <p>{resolution.summary}</p>
      </section>

      <section className="group-section">
        <h2 className="section-label">Score</h2>
        <div className="group-card">
          <p className="score-big">
            {score.total}
            <span>/{score.max}</span>
          </p>
          <p className="score-rank">{score.rank}</p>
          <table className="score-table">
            <tbody>
              {score.lines.map((l) => (
                <tr key={l.label}>
                  <th scope="row">{l.label}</th>
                  <td>{l.points < 0 ? `−${Math.abs(l.points)}` : l.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted">
            Indices : −{c.scoring.hintCost.join(' / −')} selon le niveau. Mauvais suspect : −{c.scoring.wrongSuspect}. Preuves
            insuffisantes : −{c.scoring.insufficientEvidence}. La vitesse de lecture ne compte pas.
          </p>
        </div>
      </section>

      <section className="group-section">
        <h2 className="section-label">Reconstitution</h2>
        <ol className="grouped-list timeline">
          {resolution.timeline.map((t) => (
            <li key={t.time + t.text} className={`list-row static${t.key ? ' key' : ''}`}>
              <time>{t.time}</time>
              <span className="list-row-text">
                {t.key && <span className="key-tag">Moment clé</span>}
                {t.text}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="group-section">
        <h2 className="section-label">Preuves décisives</h2>
        <ul className="grouped-list">
          {resolution.decisive.map((d) => {
            const e = c.evidence.find((x) => x.id === d.evidenceId);
            return (
              <li key={d.evidenceId} className="list-block">
                <p className="list-row-title">
                  {e?.title}
                  {progress.evidence.includes(d.evidenceId) && (
                    <span className="found-tag">
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

      <section className="group-section">
        <h2 className="section-label">Fausses pistes</h2>
        <ul className="grouped-list">
          {resolution.falseLeads.map((f) => (
            <li key={f.title} className="list-block">
              <p className="list-row-title">{f.title}</p>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="group-section">
        <h2 className="section-label">Épilogue</h2>
        <div className="group-card prose">
          <p>{resolution.epilogue}</p>
        </div>
      </section>

      <section className="group-section stack">
        {group && (
          <Link to={`${base}/echanges/${group.id}`} className="button-wide">
            Lire les derniers messages du groupe
          </Link>
        )}
        <button type="button" className="button-wide button-primary" onClick={() => setConfirm(true)}>
          Rejouer l’enquête
        </button>
        <Link to="/" className="button-wide">
          Retour au menu
        </Link>
      </section>

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
          navigate(base);
        }}
      />
    </div>
  );
}
