import { useState } from 'react';
import { Link } from 'react-router';
import { computeScore, getCurrentObjective, hintCostUpTo, isObjectiveComplete, isResolved, unreadCount } from '../../engine';
import { useGame } from '../../state/store';
import { Icon } from '../components/Icon';
import { useCaseRoute } from '../hooks';
import { ContactAvatar, ConversationAvatar } from '../phone/ContactAvatar';
import { NavBar } from '../phone/NavBar';
import { scoringText } from '../scoreText';

/** Appli « Enquête » : dossier, objectif, indices, progression, score et accusation. */
export function EnqueteApp() {
  const { c, progress } = useCaseRoute();
  const requestHint = useGame((s) => s.requestHint);
  const [showHints, setShowHints] = useState(false);
  if (!c || !progress) return null;
  const base = `/enquete/${c.id}`;
  const objective = getCurrentObjective(c, progress);
  const score = computeScore(c, progress);
  const level = objective ? (progress.hintsUsed[objective.id] ?? 0) : 0;
  const inquiry = c.conversations.filter((cv) => cv.section === 'enquete' && progress.openConversations.includes(cv.id));
  const files = c.suspects.filter((s) => !s.npc && s.items?.length);

  return (
    <div className="app-page grouped">
      <NavBar back={{ to: base, label: 'Accueil' }} largeTitle="Enquête" />

      <section className="group-section">
        <h2 className="section-label">{objective ? 'Objectif actuel' : isResolved(c, progress) ? 'Affaire résolue' : 'Enquête'}</h2>
        <div className="group-card objective-card">
          {objective ? (
            <>
              <p className="objective-title">{objective.title}</p>
              <p>{objective.description}</p>
              {!showHints ? (
                <button type="button" className="pill" onClick={() => setShowHints(true)}>
                  <Icon name="bulb" size={16} /> Besoin d’un indice ?
                </button>
              ) : (
                <div className="hints">
                  {objective.hints.slice(0, level).map((h, i) => (
                    <p key={i} className="hint">
                      <span className="hint-level">Indice {i + 1}</span>
                      {h}
                    </p>
                  ))}
                  {level < 3 ? (
                    <button type="button" className="pill pill-amber" onClick={() => requestHint(c.id, objective.id)}>
                      Révéler l’indice {level + 1} (−{c.scoring.hintCost[level]} points)
                    </button>
                  ) : (
                    <p className="small muted">Tous les indices de cet objectif sont révélés.</p>
                  )}
                  <p className="small muted">
                    Indices utilisés pour cet objectif : {level}/3 (−{hintCostUpTo(c, level)} points).
                  </p>
                </div>
              )}
            </>
          ) : (
            <Link to={`${base}/resolution`} className="pill pill-primary">
              Voir la résolution
            </Link>
          )}
        </div>
      </section>

      {inquiry.length > 0 && (
        <section className="group-section">
          <h2 className="section-label">Conversations et auditions</h2>
          <ul className="grouped-list">
            {inquiry.map((cv) => {
              const unread = unreadCount(progress, cv.id);
              return (
                <li key={cv.id}>
                  <Link to={`${base}/echanges/${cv.id}`} className="list-row">
                    <ConversationAvatar c={c} conversation={cv} size={40} />
                    <span className="list-row-text">
                      <span className="list-row-title">{cv.title}</span>
                      {cv.subtitle && <span className="list-row-sub">{cv.subtitle}</span>}
                    </span>
                    {unread > 0 && (
                      <span className="badge-count" aria-label={`${unread} non lu${unread > 1 ? 's' : ''}`}>
                        {unread}
                      </span>
                    )}
                    <Icon name="chevron" size={16} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {files.length > 0 && (
        <section className="group-section">
          <h2 className="section-label">Fiches et effets présentés</h2>
          <ul className="grouped-list">
            {files.map((s) => (
              <li key={s.id}>
                <Link to={`${base}/contacts/${s.id}`} className="list-row">
                  <ContactAvatar suspect={s} size={40} />
                  <span className="list-row-text">
                    <span className="list-row-title">{s.name}</span>
                    <span className="list-row-sub">{s.role}</span>
                  </span>
                  <Icon name="chevron" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="group-section">
        <h2 className="section-label">L’affaire</h2>
        <div className="group-card prose">
          {c.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section className="group-section">
        <h2 className="section-label">Progression</h2>
        <ul className="grouped-list">
          {c.objectives.map((o) => {
            const done = isObjectiveComplete(progress, o);
            return (
              <li key={o.id} className={`list-row static${done ? ' is-done' : ''}`}>
                <span className={`check-dot${done ? ' done' : ''}`} aria-hidden="true">
                  {done && <Icon name="check" size={14} />}
                </span>
                <span className="list-row-text">
                  {o.title}
                  <span className="visually-hidden">{done ? ' (terminé)' : ' (à faire)'}</span>
                </span>
              </li>
            );
          })}
          <li className="list-row static">
            <span className="list-row-text">
              Pièces : {progress.evidence.filter((id) => !c.evidence.find((e) => e.id === id)?.everyday).length}/
              {c.evidence.filter((e) => !e.everyday).length} · Mensonges : {progress.contradictions.length}/
              {c.contradictions.length}
            </span>
          </li>
        </ul>
      </section>

      {!progress.solved && !c.solution.noAccusation && (
        <section className="group-section">
          <Link to={`${base}/accusation`} className="button-wide button-danger">
            {c.solution.prompt ?? 'Accuser quelqu’un'}
          </Link>
          <p className="section-foot">
            {progress.accusations.length === 0
              ? 'Un nom ne suffit pas : il faudra présenter les preuves.'
              : `${progress.accusations.length} accusation${progress.accusations.length > 1 ? 's' : ''} rejetée${progress.accusations.length > 1 ? 's' : ''}.`}
          </p>
        </section>
      )}

      <section className="group-section">
        <h2 className="section-label">Score</h2>
        <div className="group-card">
          <p className="objective-title">
            {score.total}/{score.max}
          </p>
          <p className="small muted">
            {scoringText(c)}
          </p>
        </div>
      </section>
    </div>
  );
}
