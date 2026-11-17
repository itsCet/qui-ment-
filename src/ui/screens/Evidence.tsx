import { useState } from 'react';
import { Link } from 'react-router';
import type { ContradictionOutcome, Evidence } from '../../engine';
import { useGame } from '../../state/store';
import { Avatar } from '../components/Avatar';
import { Dialog } from '../components/Dialog';
import { EvidenceDetail } from '../components/EvidenceView';
import { evidenceIcon, evidenceKindLabel } from '../evidenceMeta';
import { Icon } from '../components/Icon';
import { useCaseRoute } from '../hooks';

type Tab = 'confronter' | 'pieces' | 'contradictions';

export function EvidenceScreen() {
  const { c, progress } = useCaseRoute();
  const confront = useGame((s) => s.confront);
  const [tab, setTab] = useState<Tab>('confronter');
  const [statementId, setStatementId] = useState<string | null>(null);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ContradictionOutcome | null>(null);
  const [detail, setDetail] = useState<Evidence | null>(null);

  if (!c || !progress) return null;

  const statements = progress.statements
    .map((id) => c.statements.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const pieces = progress.evidence
    .map((id) => c.evidence.find((e) => e.id === id))
    .filter((e): e is Evidence => !!e);
  const found = c.contradictions.filter((ct) => progress.contradictions.includes(ct.id));

  const submit = () => {
    if (!statementId || !evidenceId) return;
    setOutcome(confront(c.id, statementId, evidenceId));
  };

  const resetSelection = () => {
    setOutcome(null);
    setStatementId(null);
    setEvidenceId(null);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'confronter', label: 'Confronter' },
    { id: 'pieces', label: `Pièces (${pieces.length})` },
    { id: 'contradictions', label: `Mensonges (${found.length}/${c.contradictions.length})` },
  ];

  const suspectOfOutcome =
    outcome?.kind === 'found'
      ? c.suspects.find((s) => s.id === c.statements.find((st) => st.id === outcome.contradiction.statementId)?.suspectId)
      : undefined;

  return (
    <div className="screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Carnet de preuves</p>
          <h1>Carnet</h1>
        </div>
      </header>

      <div className="segmented" role="tablist" aria-label="Sections du carnet">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className="segment"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'confronter' && (
        <div role="tabpanel" aria-label="Confronter">
          {outcome ? (
            <section
              className={`result ${outcome.kind === 'found' ? 'result-success' : 'result-neutral'}`}
              role="status"
              aria-live="polite"
            >
              {outcome.kind === 'found' && (
                <>
                  <p className="result-title">
                    <Icon name="check" /> Contradiction révélée : {outcome.contradiction.title}
                  </p>
                  <p>{outcome.contradiction.explanation}</p>
                  {suspectOfOutcome && (
                    <Link className="button button-ghost button-block" to={`/enquete/${c.id}/suspects/${suspectOfOutcome.id}`}>
                      <Icon name="people" size={18} /> Voir la fiche de {suspectOfOutcome.name.split(' ')[0]}
                    </Link>
                  )}
                </>
              )}
              {outcome.kind === 'already' && (
                <>
                  <p className="result-title">
                    <Icon name="check" /> Déjà révélée : {outcome.contradiction.title}
                  </p>
                  <p>{outcome.contradiction.explanation}</p>
                </>
              )}
              {outcome.kind === 'mismatch' && (
                <>
                  <p className="result-title">
                    <Icon name="close" /> Pas de contradiction
                  </p>
                  <p>{outcome.text}</p>
                  <p className="small muted">Aucune pénalité : tu peux réessayer librement.</p>
                </>
              )}
              {outcome.kind === 'invalid' && <p>Sélection invalide.</p>}
              <button type="button" className="button button-primary button-block" onClick={resetSelection}>
                Nouveau rapprochement
              </button>
            </section>
          ) : (
            <>
              <fieldset className="pick">
                <legend>
                  <span className="step">1</span> Choisis une déclaration
                </legend>
                {statements.length === 0 ? (
                  <p className="muted">Aucune déclaration. Interroge les suspects dans leurs conversations privées.</p>
                ) : (
                  statements.map((st) => {
                    const suspect = c.suspects.find((s) => s.id === st.suspectId);
                    const refuted = c.contradictions.some(
                      (ct) => ct.statementId === st.id && progress.contradictions.includes(ct.id),
                    );
                    return (
                      <label key={st.id} className="pick-option">
                        <input
                          type="radio"
                          name="statement"
                          value={st.id}
                          checked={statementId === st.id}
                          onChange={() => setStatementId(st.id)}
                        />
                        {suspect && <Avatar suspect={suspect} size={32} />}
                        <span>
                          <span className="pick-who">
                            {suspect?.name.split(' ')[0]}
                            {refuted && <span className="tag">Contredite</span>}
                          </span>
                          « {st.text} »
                        </span>
                      </label>
                    );
                  })
                )}
              </fieldset>

              <fieldset className="pick">
                <legend>
                  <span className="step">2</span> Choisis une pièce
                </legend>
                {pieces.map((e) => (
                  <label key={e.id} className="pick-option">
                    <input
                      type="radio"
                      name="evidence"
                      value={e.id}
                      checked={evidenceId === e.id}
                      onChange={() => setEvidenceId(e.id)}
                    />
                    <span className="pick-icon">
                      <Icon name={evidenceIcon(e)} />
                    </span>
                    <span>
                      <span className="pick-who">{e.title}</span>
                      {e.summary}
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className="form-action">
                <button
                  type="button"
                  className="button button-amber button-block"
                  disabled={!statementId || !evidenceId}
                  onClick={submit}
                >
                  Confronter
                </button>
                {(!statementId || !evidenceId) && (
                  <p className="small muted center">Sélectionne une déclaration et une pièce.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'pieces' && (
        <ul className="evidence-list" role="tabpanel" aria-label="Pièces">
          {pieces.map((e) => (
            <li key={e.id}>
              <button type="button" className="evidence-row" onClick={() => setDetail(e)}>
                <span className="pick-icon">
                  <Icon name={evidenceIcon(e)} />
                </span>
                <span className="evidence-text">
                  <span className="evidence-kind">{evidenceKindLabel(e)}</span>
                  <span className="evidence-title">{e.title}</span>
                  <span className="evidence-summary">{e.summary}</span>
                </span>
                <Icon name="chevron" />
              </button>
            </li>
          ))}
          {pieces.length < c.evidence.length && (
            <li className="small muted center">
              {c.evidence.length - pieces.length} pièce{c.evidence.length - pieces.length > 1 ? 's' : ''} restent à découvrir.
            </li>
          )}
        </ul>
      )}

      {tab === 'contradictions' && (
        <div role="tabpanel" aria-label="Mensonges révélés">
          {found.length === 0 ? (
            <p className="muted panel">
              Aucun mensonge révélé pour l’instant. Dans « Confronter », rapproche une déclaration d’une pièce qui la contredit.
            </p>
          ) : (
            <ul className="statement-list">
              {found.map((ct) => (
                <li key={ct.id} className="statement refuted">
                  <p className="refuted-tag">
                    <Icon name="check" size={14} /> {ct.title}
                  </p>
                  <p>{ct.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Dialog open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? ''} variant="sheet">
        {detail && <EvidenceDetail c={c} evidence={detail} />}
      </Dialog>
    </div>
  );
}
