import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { useState } from 'react';
import { getNextMessage, getVisibleQuestions, type Evidence } from '../../engine';
import { Dialog } from '../components/Dialog';
import { EvidenceDetail } from '../components/EvidenceView';
import { evidenceIcon } from '../evidenceMeta';
import { useGame } from '../../state/store';
import { Icon } from '../components/Icon';
import { useCaseRoute } from '../hooks';
import { ContactAvatar } from '../phone/ContactAvatar';
import { NavBar } from '../phone/NavBar';

export function ContactsApp() {
  const { c, progress } = useCaseRoute();
  if (!c || !progress) return null;
  const base = `/enquete/${c.id}`;
  const sorted = c.suspects.filter((s) => !s.npc).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  return (
    <div className="app-page">
      <NavBar back={{ to: base, label: 'Accueil' }} largeTitle="Contacts" />
      <ul className="grouped-list">
        {sorted.map((s) => {
          const count = progress.statements.filter((id) => c.statements.find((st) => st.id === id)?.suspectId === s.id).length;
          const questions = getVisibleQuestions(c, progress, s.conversationId).length;
          return (
            <li key={s.id}>
              <Link to={`${base}/contacts/${s.id}`} className="list-row">
                <ContactAvatar suspect={s} size={40} />
                <span className="list-row-text">
                  <span className="list-row-title">{s.name}</span>
                  <span className="list-row-sub">
                    {count} déclaration{count > 1 ? 's' : ''}
                    {questions > 0 && ` · ${questions} question${questions > 1 ? 's' : ''} à poser`}
                  </span>
                </span>
                <Icon name="chevron" size={16} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ContactSheet() {
  const { c, progress } = useCaseRoute();
  const [detail, setDetail] = useState<Evidence | null>(null);
  const { suspectId = '' } = useParams();
  const choose = useGame((s) => s.choose);
  const navigate = useNavigate();
  if (!c || !progress) return null;
  const base = `/enquete/${c.id}`;
  const suspect = c.suspects.find((s) => s.id === suspectId);
  if (!suspect) return <Navigate to={`${base}/contacts`} replace />;

  const chatPath = `${base}/echanges/${suspect.conversationId}`;
  const open = progress.openConversations.includes(suspect.conversationId);
  const statements = c.statements.filter((st) => st.suspectId === suspect.id && progress.statements.includes(st.id));
  const questions = getVisibleQuestions(c, progress, suspect.conversationId);
  const answering = !!getNextMessage(c, progress, suspect.conversationId);
  const items = (suspect.items ?? [])
    .filter((id) => progress.evidence.includes(id))
    .map((id) => c.evidence.find((e) => e.id === id))
    .filter((e): e is Evidence => !!e);

  return (
    <div className="app-page grouped">
      <NavBar back={{ to: `${base}/contacts`, label: 'Contacts' }} />
      <section className="contact-hero">
        <ContactAvatar suspect={suspect} size={96} />
        <h1>{suspect.name}</h1>
        <p>
          {suspect.age} ans · {suspect.role}
        </p>
        {open && (
          <Link to={chatPath} className="contact-action">
            <Icon name="chat" size={22} />
            <span>message</span>
          </Link>
        )}
      </section>

      <section className="group-section">
        <h2 className="section-label">Notes</h2>
        <div className="group-card">
          <p>{suspect.bio}</p>
        </div>
      </section>

      <section className="group-section">
        <h2 className="section-label">Déclarations</h2>
        <div className="group-card">
          {statements.length === 0 ? (
            <p className="muted">Aucune déclaration pour l’instant. Pose-lui des questions.</p>
          ) : (
            <ul className="statements">
              {statements.map((st) => {
                const refuted = c.contradictions.find((ct) => ct.statementId === st.id && progress.contradictions.includes(ct.id));
                return (
                  <li key={st.id} className={refuted ? 'refuted' : ''}>
                    <p>« {st.text} »</p>
                    {refuted && (
                      <p className="refuted-tag">
                        <Icon name="close" size={14} /> Contredite : {refuted.title}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {items.length > 0 && (
        <section className="group-section">
          <h2 className="section-label">Effets présentés</h2>
          <ul className="grouped-list">
            {items.map((e) => (
              <li key={e.id}>
                <button type="button" className="list-row" onClick={() => setDetail(e)}>
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
                  <Icon name="chevron" size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="group-section">
        <h2 className="section-label">Questions à poser</h2>
        <div className="group-card">
          {!open ? (
            <p className="muted">Tu ne peux pas encore lui écrire.</p>
          ) : questions.length === 0 ? (
            <p className="muted">Rien de plus à lui demander pour l’instant.</p>
          ) : (
            <>
              {answering && (
                <p className="muted small" role="status">
                  {suspect.name.split(' ')[0]} est en train d’écrire…
                </p>
              )}
              <div className="chips chips-left">
                {questions.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    className="chip"
                    disabled={answering}
                    onClick={() => {
                      choose(c.id, q.id);
                      navigate(chatPath);
                    }}
                  >
                    {q.locked && <span className="chip-new">Nouveau</span>}
                    {q.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <Dialog open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? ''} variant="sheet">
        {detail && <EvidenceDetail c={c} evidence={detail} />}
      </Dialog>
    </div>
  );
}
