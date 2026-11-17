import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { getNextMessage, getVisibleQuestions } from '../../engine';
import { useGame } from '../../state/store';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { useCaseRoute } from '../hooks';

export function SuspectList() {
  const { c, progress } = useCaseRoute();
  if (!c || !progress) return null;
  return (
    <div className="screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">{c.suspects.length} personnes</p>
          <h1>Suspects</h1>
        </div>
      </header>
      <ul className="suspect-list">
        {c.suspects.map((s) => {
          const statements = progress.statements.filter((id) => c.statements.find((st) => st.id === id)?.suspectId === s.id);
          const questions = getVisibleQuestions(c, progress, s.conversationId).length;
          return (
            <li key={s.id}>
              <Link to={`/enquete/${c.id}/suspects/${s.id}`} className="suspect-row">
                <Avatar suspect={s} size={56} />
                <span className="suspect-text">
                  <span className="suspect-name">{s.name}</span>
                  <span className="suspect-role">
                    {s.age} ans · {s.role}
                  </span>
                  <span className="suspect-meta">
                    {statements.length} déclaration{statements.length > 1 ? 's' : ''}
                    {questions > 0 && ` · ${questions} question${questions > 1 ? 's' : ''} à poser`}
                  </span>
                </span>
                <Icon name="chevron" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SuspectSheet() {
  const { c, progress } = useCaseRoute();
  const { suspectId = '' } = useParams();
  const choose = useGame((s) => s.choose);
  const navigate = useNavigate();
  if (!c || !progress) return null;
  const suspect = c.suspects.find((s) => s.id === suspectId);
  if (!suspect) return <Navigate to={`/enquete/${c.id}/suspects`} replace />;

  const conversationOpen = progress.openConversations.includes(suspect.conversationId);
  const statements = c.statements.filter((st) => st.suspectId === suspect.id && progress.statements.includes(st.id));
  const questions = getVisibleQuestions(c, progress, suspect.conversationId);
  const answering = !!getNextMessage(c, progress, suspect.conversationId);
  const conversationPath = `/enquete/${c.id}/conversations/${suspect.conversationId}`;

  return (
    <div className="screen">
      <header className="screen-header">
        <Link to={`/enquete/${c.id}/suspects`} className="icon-button" aria-label="Retour aux suspects">
          <Icon name="back" />
        </Link>
        <div>
          <p className="eyebrow">Fiche suspect</p>
          <h1>{suspect.name}</h1>
        </div>
      </header>

      <section className="profile">
        <Avatar suspect={suspect} size={96} />
        <div>
          <p className="profile-role">
            {suspect.age} ans · {suspect.role}
          </p>
          <p>{suspect.bio}</p>
        </div>
      </section>

      <section className="panel" aria-labelledby="statements">
        <h2 id="statements">Déclarations</h2>
        {statements.length === 0 ? (
          <p className="muted">Aucune déclaration pour l’instant. Pose-lui des questions.</p>
        ) : (
          <ul className="statement-list">
            {statements.map((st) => {
              const refuted = c.contradictions.find(
                (ct) => ct.statementId === st.id && progress.contradictions.includes(ct.id),
              );
              return (
                <li key={st.id} className={refuted ? 'statement refuted' : 'statement'}>
                  <p>« {st.text} »</p>
                  {st.context && <p className="small muted">{st.context}</p>}
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
      </section>

      <section className="panel" aria-labelledby="questions">
        <h2 id="questions">Questions disponibles</h2>
        {!conversationOpen ? (
          <p className="muted">Tu ne peux pas encore l’interroger.</p>
        ) : questions.length === 0 ? (
          <p className="muted">Rien de plus à lui demander pour l’instant. Tes découvertes ouvriront peut-être de nouvelles questions.</p>
        ) : (
          <>
            {answering && (
              <p className="small muted" role="status">
                {suspect.name.split(' ')[0]} est en train de répondre…
              </p>
            )}
            <ul className="question-list">
              {questions.map((q) => (
                <li key={q.id}>
                  <button
                    type="button"
                    className="choice"
                    disabled={answering}
                    onClick={() => {
                      choose(c.id, q.id);
                      navigate(conversationPath);
                    }}
                  >
                    {q.locked && <span className="choice-tag">Nouveau</span>}
                    {q.label}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {conversationOpen && (
          <Link to={conversationPath} className="button button-ghost button-block">
            <Icon name="chat" size={18} /> Ouvrir la conversation
          </Link>
        )}
      </section>
    </div>
  );
}
