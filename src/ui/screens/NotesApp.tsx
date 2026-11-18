import { useEffect, useState } from 'react';
import { getAvailableChoices, getNextMessage, indexCase, type Evidence } from '../../engine';
import { useGame } from '../../state/store';
import { Dialog } from '../components/Dialog';
import { EvidenceDetail } from '../components/EvidenceView';
import { Icon } from '../components/Icon';
import { evidenceIcon } from '../evidenceMeta';
import { useCaseRoute } from '../hooks';
import { NavBar } from '../phone/NavBar';

/** La conversation « notes » de l'enquête, présentée comme une note avec cases à cocher. */
export function NotesApp() {
  const { c, progress } = useCaseRoute();
  const choose = useGame((s) => s.choose);
  const markSeen = useGame((s) => s.markSeen);
  const [openEvidence, setOpenEvidence] = useState<Evidence | null>(null);
  const notes = c?.conversations.find((cv) => cv.kind === 'notes');

  useEffect(() => {
    if (c && notes && progress?.openConversations.includes(notes.id)) markSeen(c.id, notes.id);
  }, [c, notes, progress, markSeen]);

  if (!c || !progress) return null;
  const base = `/enquete/${c.id}`;
  const open = notes && progress.openConversations.includes(notes.id);
  const index = indexCase(c);
  const thread = notes ? (progress.threads[notes.id] ?? []) : [];
  const writing = notes ? !!getNextMessage(c, progress, notes.id) : false;
  const todo = notes ? getAvailableChoices(c, progress, notes.id) : [];
  const firstTime = thread[0]?.time;

  return (
    <div className="app-page notes-page">
      <NavBar back={{ to: base, label: 'Accueil' }} tint="yellow" />
      {!open || !notes ? (
        <p className="empty">Aucune note.</p>
      ) : (
        <article className="note">
          <p className="note-date">
            {c.device.date.day} {c.device.date.month}
            {firstTime ? ` à ${firstTime}` : ''}
          </p>
          <h1 className="note-title">{notes.title.replace(/^Notes · /, '')}</h1>
          <div className="note-body">
            {thread.map((entry) => {
              if (entry.kind === 'choice') {
                const choice = index.choices.get(entry.id)?.choice;
                return (
                  <p key={`c-${entry.id}`} className="note-check done">
                    <span className="note-box" aria-hidden="true">
                      <Icon name="check" size={16} />
                    </span>
                    <span>
                      <span className="visually-hidden">Fait : </span>
                      {choice?.label}
                    </span>
                  </p>
                );
              }
              const message = index.messages.get(entry.id)?.message;
              if (!message) return null;
              const attachment = message.attachment ? c.evidence.find((e) => e.id === message.attachment) : undefined;
              return (
                <div key={`m-${entry.id}`} className="note-para">
                  <p>{message.text}</p>
                  {attachment &&
                    (attachment.image ? (
                      <button type="button" className="note-photo" onClick={() => setOpenEvidence(attachment)} aria-label={`Photo : ${attachment.title}`}>
                        <img src={attachment.image} alt="" loading="lazy" />
                      </button>
                    ) : (
                      <button type="button" className="note-attachment" onClick={() => setOpenEvidence(attachment)}>
                        <Icon name={evidenceIcon(attachment)} size={18} />
                        {attachment.title}
                      </button>
                    ))}
                </div>
              );
            })}
            {writing && <p className="note-writing">…</p>}
          </div>

          {!writing && todo.length > 0 && (
            <div className="note-todo" role="group" aria-label="Choses à vérifier">
              <p className="note-todo-label">À vérifier</p>
              {todo.map((choice) => (
                <button key={choice.id} type="button" className="note-check" onClick={() => choose(c.id, choice.id)}>
                  <span className="note-box" aria-hidden="true" />
                  <span>{choice.label}</span>
                </button>
              ))}
            </div>
          )}
        </article>
      )}

      <Dialog open={!!openEvidence} onClose={() => setOpenEvidence(null)} title={openEvidence?.title ?? ''} variant="sheet">
        {openEvidence && <EvidenceDetail c={c} evidence={openEvidence} />}
      </Dialog>
    </div>
  );
}
