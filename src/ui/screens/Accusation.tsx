import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import type { AccusationEvaluation, Evidence } from '../../engine';
import { useGame } from '../../state/store';
import { ConfirmDialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { evidenceIcon } from '../evidenceMeta';
import { useCaseRoute } from '../hooks';
import { ContactAvatar } from '../phone/ContactAvatar';
import { NavBar } from '../phone/NavBar';

export function Accusation() {
  const { c, progress } = useCaseRoute();
  const accuse = useGame((s) => s.accuse);
  const navigate = useNavigate();
  const [suspectId, setSuspectId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [failure, setFailure] = useState<AccusationEvaluation | null>(null);
  if (!c || !progress) return null;
  const base = `/enquete/${c.id}`;
  if (progress.solved) return <Navigate to={`${base}/resolution`} replace />;

  const max = c.solution.maxEvidence;
  const suspect = c.suspects.find((s) => s.id === suspectId);
  const pieces = progress.evidence.map((id) => c.evidence.find((e) => e.id === id)).filter((e): e is Evidence => !!e);
  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < max ? [...cur, id] : cur));

  const submit = () => {
    setConfirm(false);
    if (!suspectId) return;
    const { evaluation } = accuse(c.id, suspectId, selected);
    if (!evaluation) return;
    if (evaluation.result === 'correct') navigate(`${base}/resolution`);
    else setFailure(evaluation);
  };

  if (failure) {
    return (
      <div className="app-page grouped">
        <NavBar back={{ to: `${base}/enquete`, label: 'Enquête' }} title="Accusation" />
        <section className="group-section">
          <div className="result result-fail" role="alert">
            <p className="result-title">
              <Icon name="warning" />
              {failure.result === 'wrongSuspect' ? 'Ce n’est pas la bonne personne' : 'Preuves insuffisantes'}
            </p>
            {failure.feedback.map((f, i) => (
              <p key={i}>{f}</p>
            ))}
            <p className="small">
              −{failure.result === 'wrongSuspect' ? c.scoring.wrongSuspect : c.scoring.insufficientEvidence} points. Tu peux
              poursuivre l’enquête et accuser à nouveau.
            </p>
          </div>
        </section>
        <section className="group-section stack">
          <button type="button" className="button-wide button-primary" onClick={() => navigate(base)}>
            Poursuivre l’enquête
          </button>
          <button
            type="button"
            className="button-wide"
            onClick={() => {
              setFailure(null);
              setSelected([]);
            }}
          >
            Revoir mon accusation
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="app-page grouped">
      <NavBar back={{ to: `${base}/enquete`, label: 'Enquête' }} largeTitle="Qui ment ?" />
      <p className="section-intro">Désigne le coupable, puis présente jusqu’à {max} pièces qui le démontrent.</p>

      <fieldset className="group-section pick">
        <legend className="section-label">1. Le coupable</legend>
        <div className="suspect-pick">
          {c.suspects.map((s) => (
            <label key={s.id} className="suspect-option">
              <input type="radio" name="suspect" checked={suspectId === s.id} onChange={() => setSuspectId(s.id)} />
              <ContactAvatar suspect={s} size={56} />
              <span>{s.name.split(' ')[0]}</span>
              <span className="suspect-check" aria-hidden="true">
                <Icon name="check" size={14} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="group-section pick">
        <legend className="section-label">
          2. Les preuves ({selected.length}/{max})
        </legend>
        <div className="grouped-list">
          {pieces.map((e) => {
            const checked = selected.includes(e.id);
            const disabled = !checked && selected.length >= max;
            return (
              <label key={e.id} className={`list-row pick-row${disabled ? ' is-disabled' : ''}`}>
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(e.id)} />
                {e.image ? (
                  <img className="thumb" src={e.image} alt="" loading="lazy" />
                ) : (
                  <span className="thumb thumb-icon">
                    <Icon name={evidenceIcon(e)} size={20} />
                  </span>
                )}
                <span className="list-row-text">
                  <span className="list-row-title">{e.title}</span>
                  <span className="list-row-sub">{e.summary}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="form-action">
        <button
          type="button"
          className="button-wide button-danger"
          disabled={!suspectId || selected.length === 0}
          onClick={() => setConfirm(true)}
        >
          Accuser
        </button>
        {(!suspectId || selected.length === 0) && (
          <p className="small muted center">Choisis un suspect et au moins une preuve.</p>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        title="Confirmer l’accusation ?"
        confirmLabel={`Accuser ${suspect?.name.split(' ')[0] ?? ''}`}
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={submit}
        message={
          <>
            <p>
              Tu accuses <strong>{suspect?.name}</strong> en présentant :
            </p>
            <ul>
              {selected.map((id) => (
                <li key={id}>{c.evidence.find((e) => e.id === id)?.title}</li>
              ))}
            </ul>
            <p className="small muted">
              Une erreur coûte des points ({c.scoring.wrongSuspect} pour un mauvais suspect, {c.scoring.insufficientEvidence} pour
              des preuves insuffisantes), mais l’enquête continue.
            </p>
          </>
        }
      />
    </div>
  );
}
