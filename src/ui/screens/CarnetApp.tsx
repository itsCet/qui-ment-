import { useState } from 'react';
import { Link } from 'react-router';
import type { ContradictionOutcome, Evidence } from '../../engine';
import { useGame } from '../../state/store';
import { Dialog } from '../components/Dialog';
import { EvidenceDetail } from '../components/EvidenceView';
import { Icon } from '../components/Icon';
import { evidenceIcon, evidenceKindLabel } from '../evidenceMeta';
import { useCaseRoute } from '../hooks';
import { ContactAvatar } from '../phone/ContactAvatar';
import { NavBar } from '../phone/NavBar';

type Tab = 'pieces' | 'confronter' | 'mensonges';

function Thumb({ evidence }: { evidence: Evidence }) {
  return evidence.image ? (
    <img className="thumb" src={evidence.image} alt="" loading="lazy" />
  ) : (
    <span className="thumb thumb-icon">
      <Icon name={evidenceIcon(evidence)} size={20} />
    </span>
  );
}

export function CarnetApp() {
  const { c, progress } = useCaseRoute();
  const confront = useGame((s) => s.confront);
  const [tab, setTab] = useState<Tab>('pieces');
  const [statementId, setStatementId] = useState<string | null>(null);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ContradictionOutcome | null>(null);
  const [detail, setDetail] = useState<Evidence | null>(null);
  if (!c || !progress) return null;
  const base = `/enquete/${c.id}`;

  const statements = progress.statements
    .map((id) => c.statements.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const pieces = progress.evidence.map((id) => c.evidence.find((e) => e.id === id)).filter((e): e is Evidence => !!e);
  const found = c.contradictions.filter((ct) => progress.contradictions.includes(ct.id));
  const reset = () => {
    setOutcome(null);
    setStatementId(null);
    setEvidenceId(null);
  };
  const outcomeSuspect =
    outcome?.kind === 'found'
      ? c.suspects.find((s) => s.id === c.statements.find((st) => st.id === outcome.contradiction.statementId)?.suspectId)
      : undefined;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'pieces', label: `Pièces (${pieces.length})` },
    { id: 'confronter', label: 'Confronter' },
    { id: 'mensonges', label: `Mensonges (${found.length}/${c.contradictions.length})` },
  ];

  return (
    <div className="app-page grouped carnet">
      <NavBar back={{ to: base, label: 'Accueil' }} largeTitle="Carnet" tint="brown" />
      <div className="segmented" role="tablist" aria-label="Sections du carnet">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className="segment" onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pieces' && (
        <section role="tabpanel" aria-label="Pièces" className="group-section">
          <ul className="grouped-list">
            {pieces.map((e) => (
              <li key={e.id}>
                <button type="button" className="list-row" onClick={() => setDetail(e)}>
                  <Thumb evidence={e} />
                  <span className="list-row-text">
                    <span className="list-row-kicker">{evidenceKindLabel(e)}</span>
                    <span className="list-row-title">{e.title}</span>
                    <span className="list-row-sub">{e.summary}</span>
                  </span>
                  <Icon name="chevron" size={16} />
                </button>
              </li>
            ))}
          </ul>
          {pieces.length < c.evidence.length && (
            <p className="section-foot">
              {c.evidence.length - pieces.length} pièce{c.evidence.length - pieces.length > 1 ? 's' : ''} encore à découvrir.
            </p>
          )}
        </section>
      )}

      {tab === 'confronter' && (
        <section role="tabpanel" aria-label="Confronter">
          {outcome ? (
            <div className={`result ${outcome.kind === 'found' ? 'result-success' : 'result-neutral'}`} role="status" aria-live="polite">
              {outcome.kind === 'found' || outcome.kind === 'already' ? (
                <>
                  <p className="result-title">
                    <Icon name="check" /> {outcome.kind === 'found' ? 'Mensonge révélé' : 'Déjà révélé'} : {outcome.contradiction.title}
                  </p>
                  <p>{outcome.contradiction.explanation}</p>
                  {outcomeSuspect && (
                    <Link className="pill" to={`${base}/contacts/${outcomeSuspect.id}`}>
                      Voir la fiche de {outcomeSuspect.name.split(' ')[0]}
                    </Link>
                  )}
                </>
              ) : outcome.kind === 'mismatch' ? (
                <>
                  <p className="result-title">
                    <Icon name="close" /> Pas de contradiction
                  </p>
                  <p>{outcome.text}</p>
                  <p className="small muted">Aucune pénalité : tu peux réessayer librement.</p>
                </>
              ) : (
                <p>Sélection invalide.</p>
              )}
              <button type="button" className="button-wide" onClick={reset}>
                Nouveau rapprochement
              </button>
            </div>
          ) : (
            <>
              <fieldset className="group-section pick">
                <legend className="section-label">1. Une déclaration</legend>
                <div className="grouped-list">
                  {statements.length === 0 ? (
                    <p className="list-empty">Aucune déclaration. Interroge tes amis dans Échanges.</p>
                  ) : (
                    statements.map((st) => {
                      const suspect = c.suspects.find((s) => s.id === st.suspectId);
                      const refuted = c.contradictions.some((ct) => ct.statementId === st.id && progress.contradictions.includes(ct.id));
                      return (
                        <label key={st.id} className="list-row pick-row">
                          <input type="radio" name="statement" checked={statementId === st.id} onChange={() => setStatementId(st.id)} />
                          {suspect && <ContactAvatar suspect={suspect} size={32} />}
                          <span className="list-row-text">
                            <span className="list-row-kicker">
                              {suspect?.name.split(' ')[0]}
                              {refuted && ' · contredite'}
                            </span>
                            <span>« {st.text} »</span>
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </fieldset>
              <fieldset className="group-section pick">
                <legend className="section-label">2. Une pièce</legend>
                <div className="grouped-list">
                  {pieces.map((e) => (
                    <label key={e.id} className="list-row pick-row">
                      <input type="radio" name="evidence" checked={evidenceId === e.id} onChange={() => setEvidenceId(e.id)} />
                      <Thumb evidence={e} />
                      <span className="list-row-text">
                        <span className="list-row-title">{e.title}</span>
                        <span className="list-row-sub">{e.summary}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="form-action">
                <button
                  type="button"
                  className="button-wide button-primary"
                  disabled={!statementId || !evidenceId}
                  onClick={() => statementId && evidenceId && setOutcome(confront(c.id, statementId, evidenceId))}
                >
                  Confronter
                </button>
                {(!statementId || !evidenceId) && <p className="small muted center">Choisis une déclaration et une pièce.</p>}
              </div>
            </>
          )}
        </section>
      )}

      {tab === 'mensonges' && (
        <section role="tabpanel" aria-label="Mensonges révélés" className="group-section">
          {found.length === 0 ? (
            <p className="section-foot">Aucun mensonge révélé. Dans « Confronter », rapproche une déclaration d’une pièce qui la contredit.</p>
          ) : (
            <ul className="grouped-list">
              {found.map((ct) => (
                <li key={ct.id} className="list-block">
                  <p className="list-row-title">
                    <Icon name="check" size={16} /> {ct.title}
                  </p>
                  <p>{ct.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Dialog open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? ''} variant="sheet">
        {detail && <EvidenceDetail c={c} evidence={detail} />}
      </Dialog>
    </div>
  );
}
