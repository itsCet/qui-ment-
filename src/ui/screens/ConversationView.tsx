import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { getAvailableChoices, getNextMessage, indexCase, type Case, type Evidence, type ThreadEntry } from '../../engine';
import { useGame } from '../../state/store';
import { Avatar } from '../components/Avatar';
import { Dialog } from '../components/Dialog';
import { EvidenceDetail } from '../components/EvidenceView';
import { evidenceIcon, evidenceKindLabel } from '../evidenceMeta';
import { Icon } from '../components/Icon';
import { useCaseRoute, useReducedMotion } from '../hooks';
import { ConversationAvatar } from './Conversations';

function Entry({
  c,
  entry,
  isGroup,
  showAuthor,
  onOpenEvidence,
}: {
  c: Case;
  entry: ThreadEntry;
  isGroup: boolean;
  showAuthor: boolean;
  onOpenEvidence: (e: Evidence) => void;
}) {
  const index = indexCase(c);
  if (entry.kind === 'choice') {
    const choice = index.choices.get(entry.id)?.choice;
    return (
      <li className="msg msg-player">
        <div className="bubble">
          <span className="visually-hidden">Toi : </span>
          {choice?.text ?? choice?.label}
          <time className="msg-time">{entry.time}</time>
        </div>
      </li>
    );
  }
  const message = index.messages.get(entry.id)?.message;
  if (!message) return null;
  const attachment = message.attachment ? c.evidence.find((e) => e.id === message.attachment) : undefined;

  if (message.from === 'system') {
    return (
      <li className="msg msg-system">
        <div className="note">
          <Icon name="note" size={16} />
          <p>
            {message.text}
            {attachment && <AttachmentCard evidence={attachment} onOpen={onOpenEvidence} />}
          </p>
        </div>
      </li>
    );
  }
  if (message.from === 'player') {
    return (
      <li className="msg msg-player">
        <div className="bubble">
          <span className="visually-hidden">Toi : </span>
          {message.text}
          <time className="msg-time">{entry.time}</time>
        </div>
      </li>
    );
  }
  const author = c.suspects.find((s) => s.id === message.from);
  return (
    <li className={`msg msg-other${showAuthor ? '' : ' msg-cont'}`}>
      <span className="msg-avatar">{showAuthor && author && <Avatar suspect={author} size={32} />}</span>
      <div className="bubble">
        {isGroup && showAuthor ? (
          <span className="msg-author" style={{ color: `hsl(${author?.hue ?? 0} 60% 72%)` }}>
            {author?.name.split(' ')[0]}
          </span>
        ) : (
          <span className="visually-hidden">{author?.name.split(' ')[0]} : </span>
        )}
        {message.text}
        {attachment && <AttachmentCard evidence={attachment} onOpen={onOpenEvidence} />}
        <time className="msg-time">{entry.time}</time>
      </div>
    </li>
  );
}

function AttachmentCard({ evidence, onOpen }: { evidence: Evidence; onOpen: (e: Evidence) => void }) {
  return (
    <button type="button" className="attachment" onClick={() => onOpen(evidence)}>
      <Icon name={evidenceIcon(evidence)} size={20} />
      <span>
        <span className="attachment-kind">
          {evidenceKindLabel(evidence)} · <Icon name="clip2" size={12} /> ajoutée au carnet
        </span>
        <span className="attachment-title">{evidence.title}</span>
      </span>
    </button>
  );
}

export function ConversationView() {
  const { c, progress } = useCaseRoute();
  const { conversationId = '' } = useParams();
  const choose = useGame((s) => s.choose);
  const markSeen = useGame((s) => s.markSeen);
  const revealConversation = useGame((s) => s.revealConversation);
  const reduced = useReducedMotion();
  const [openEvidence, setOpenEvidence] = useState<Evidence | null>(null);
  const threadRef = useRef<HTMLOListElement>(null);

  const threadLength = progress?.threads[conversationId]?.length ?? 0;
  const next = c && progress ? getNextMessage(c, progress, conversationId) : null;

  useEffect(() => {
    if (c && progress?.openConversations.includes(conversationId)) markSeen(c.id, conversationId);
  }, [c, progress, conversationId, markSeen]);

  useEffect(() => {
    const el = threadRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [threadLength, next?.id, reduced]);

  if (!c || !progress) return null;
  const conversation = c.conversations.find((cv) => cv.id === conversationId);
  if (!conversation || !progress.openConversations.includes(conversationId)) {
    return <Navigate to={`/enquete/${c.id}/conversations`} replace />;
  }

  const thread = progress.threads[conversationId] ?? [];
  const choices = getAvailableChoices(c, progress, conversationId);
  const typingAuthor = next && next.from !== 'player' && next.from !== 'system' ? c.suspects.find((s) => s.id === next.from) : null;
  const isGroup = conversation.kind === 'group';
  const index = indexCase(c);

  const authorOf = (entry: ThreadEntry | undefined) =>
    entry?.kind === 'message' ? index.messages.get(entry.id)?.message.from : entry ? 'player' : undefined;

  return (
    <div className="chat">
      <header className="chat-header">
        <Link to={`/enquete/${c.id}/conversations`} className="icon-button" aria-label="Retour aux conversations">
          <Icon name="back" />
        </Link>
        <ConversationAvatar c={c} conversation={conversation} size={38} />
        <div className="chat-title">
          <h1>{conversation.title}</h1>
          <p>{conversation.subtitle ?? (conversation.kind === 'private' ? 'Conversation privée' : '')}</p>
        </div>
        {conversation.kind === 'private' && (
          <Link
            to={`/enquete/${c.id}/suspects/${conversation.participants[0]}`}
            className="icon-button"
            aria-label="Voir la fiche du suspect"
          >
            <Icon name="people" />
          </Link>
        )}
      </header>

      <ol ref={threadRef} className="thread" aria-label="Messages" aria-live="polite" aria-relevant="additions">
        {thread.map((entry, i) => (
          <Entry
            key={`${entry.kind}:${entry.id}`}
            c={c}
            entry={entry}
            isGroup={isGroup}
            showAuthor={authorOf(thread[i - 1]) !== authorOf(entry)}
            onOpenEvidence={setOpenEvidence}
          />
        ))}
        {next && (
          <li className="typing" aria-label={typingAuthor ? `${typingAuthor.name.split(' ')[0]} écrit…` : 'En cours…'}>
            <span className="msg-avatar">{typingAuthor && <Avatar suspect={typingAuthor} size={32} />}</span>
            <span className="typing-bubble" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="typing-label">{typingAuthor ? `${typingAuthor.name.split(' ')[0]} écrit…` : '…'}</span>
          </li>
        )}
      </ol>

      <div className="composer">
        {next ? (
          <button type="button" className="button button-ghost button-block" onClick={() => revealConversation(c.id, conversationId)}>
            <Icon name="forward" size={18} /> Afficher tout de suite
          </button>
        ) : choices.length > 0 ? (
          <div className="choices" role="group" aria-label={conversation.kind === 'notes' ? 'Actions possibles' : 'Réponses possibles'}>
            {choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={`choice${choice.locked ? ' choice-new' : ''}`}
                onClick={() => choose(c.id, choice.id)}
              >
                {choice.locked && <span className="choice-tag">Nouveau</span>}
                {choice.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="composer-empty">
            <Icon name="lock" size={16} /> Rien de plus à demander ici pour l’instant. De nouvelles questions apparaîtront avec
            tes découvertes.
          </p>
        )}
      </div>

      <Dialog open={!!openEvidence} onClose={() => setOpenEvidence(null)} title={openEvidence?.title ?? ''} variant="sheet">
        {openEvidence && <EvidenceDetail c={c} evidence={openEvidence} />}
      </Dialog>
    </div>
  );
}
