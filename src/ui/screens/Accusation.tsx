import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import type { AccusationEvaluation } from '../../engine';
import { useGame } from '../../state/store';
import { Avatar } from '../components/Avatar';
import { ConfirmDialog } from '../components/Dialog';
import { evidenceIcon } from '../evidenceMeta';
import { Icon } from '../components/Icon';
import { useCaseRoute } from '../hooks';

export function Accusation() {
  const { c, progress } = useCaseRoute();
  const accuse = useGame((s) => s.accuse);
  const navigate = useNavigate();
  const [suspectId, setSuspectId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [failure, setFailure] = useState<AccusationEvaluation | null>(null);

  if (!c || !progress) return null;
  if (progress.solved) return <Navigate to={`/enquete/${c.id}/resolution`} replace />;

  const max = c.solution.maxEvidence;
  const suspect = c.suspects.find((s) => s.id === suspectId);
  const pieces = progress.evidence.map((id) => c.evidence.find((e) => e.id === id)).filter((e) => !!e);

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < max ? [...cur, id] : cur));

  const submit = () => {
    setConfirm(false);
    if (!suspectId) return;
    const { evaluation } = accuse(c.id, suspectId, selected);
    if (!evaluation) return;
    if (evaluation.result === 'correct') navigate(`/enquete/${c.id}/resolution`);
    else setFailure(evaluation);
  };

  if (failure) {
    return (
      <div className="screen">
        <header className="screen-header">
          <div>
            <p className="eyebrow">Accusation</p>
            <h1>L’accusation ne tient pas</h1>
          </div>
        </header>
        <section className="result result-fail" role="alert">
          <p className="result-title">
            <Icon name="warning" />
            {failure.result === 'wrongSuspect' ? 'Ce n’est pas la bonne personne' : 'Preuves insuffisantes'}
          </p>
          {failure.feedback.map((f, i) => (
            <p key={i}>{f}</p>
          ))}
          <p className="small">
            Pénalité : −{failure.result === 'wrongSuspect' ? c.scoring.wrongSuspect : c.scoring.insufficientEvidence} points.
            Tu peux poursuivre l’enquête et accuser à nouveau.
          </p>
        </section>
        <div className="stack">
          <button
            type="button"
            className="button button-primary button-block"
            onClick={() => navigate(`/enquete/${c.id}`)}
          >
            Poursuivre l’enquête
          </button>
          <button
            type="button"
            className="button button-ghost button-block"
            onClick={() => {
              setFailure(null);
              setSelected([]);
            }}
          >
            Revoir mon accusation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Accusation</p>
          <h1>Qui ment ?</h1>
        </div>
      </header>
      <p className="muted">
        Un nom ne suffit pas : présente les pièces qui démontrent la culpabilité. Tu peux en choisir jusqu’à {max}.
      </p>

      <fieldset className="pick">
        <legend>
          <span className="step">1</span> Désigne le coupable
        </legend>
        <div className="suspect-pick">
          {c.suspects.map((s) => (
            <label key={s.id} className="suspect-pick-option">
              <input
                type="radio"
                name="suspect"
                value={s.id}
                checked={suspectId === s.id}
                onChange={() => setSuspectId(s.id)}
              />
              <Avatar suspect={s} size={52} />
              <span>{s.name.split(' ')[0]}</span>
              <span className="pick-check" aria-hidden="true">
                <Icon name="check" size={16} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="pick">
        <legend>
          <span className="step">2</span> Sélectionne les preuves ({selected.length}/{max})
        </legend>
        {pieces.map((e) => {
          const checked = selected.includes(e.id);
          const disabled = !checked && selected.length >= max;
          return (
            <label key={e.id} className={`pick-option${disabled ? ' is-disabled' : ''}`}>
              <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(e.id)} />
              <span className="pick-icon">
                <Icon name={evidenceIcon(e)} />
              </span>
              <span>
                <span className="pick-who">{e.title}</span>
                {e.summary}
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="form-action">
        <button
          type="button"
          className="button button-danger button-block"
          disabled={!suspectId || selected.length === 0}
          onClick={() => setConfirm(true)}
        >
          <Icon name="gavel" size={18} /> Accuser
        </button>
        {(!suspectId || selected.length === 0) && (
          <p className="small muted center">Choisis un suspect et au moins une preuve.</p>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        title="Confirmer l’accusation ?"
        confirmLabel={`Accuser ${suspect?.name.split(' ')[0] ?? ''}`}
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
              Une erreur coûte des points ({c.scoring.wrongSuspect} pour un mauvais suspect, {c.scoring.insufficientEvidence}{' '}
              pour des preuves insuffisantes), mais l’enquête continue.
            </p>
          </>
        }
      />
    </div>
  );
}
