import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import {
  getAvailableChoices,
  getNextMessage,
  indexCase,
  parseClock,
  unreadCount,
  type Evidence,
  type ThreadEntry,
} from '../../engine';
import { useGame } from '../../state/store';
import { Dialog } from '../components/Dialog';
import { EvidenceDetail } from '../components/EvidenceView';
import { Icon } from '../components/Icon';
import { evidenceIcon, evidenceKindLabel } from '../evidenceMeta';
import { useCaseRoute, useReducedMotion } from '../hooks';
import { ContactAvatar, ConversationAvatar } from '../phone/ContactAvatar';

function Attachment({ evidence, onOpen }: { evidence: Evidence; onOpen: (e: Evidence) => void }) {
  if (evidence.image) {
    return (
      <button type="button" className="bubble-photo" onClick={() => onOpen(evidence)} aria-label={`Photo : ${evidence.title}`}>
        <img src={evidence.image} alt="" loading="lazy" />
      </button>
    );
  }
  return (
    <button type="button" className="bubble-file" onClick={() => onOpen(evidence)}>
      <span className="bubble-file-icon">
        <Icon name={evidenceIcon(evidence)} size={20} />
      </span>
      <span>
        <span className="bubble-file-title">{evidence.title}</span>
        <span className="bubble-file-kind">{evidenceKindLabel(evidence)} · Ajoutée au carnet</span>
      </span>
    </button>
  );
}

export function ChatView() {
  const { c, progress } = useCaseRoute();
  const { conversationId = '' } = useParams();
  const choose = useGame((s) => s.choose);
  const markSeen = useGame((s) => s.markSeen);
  const revealConversation = useGame((s) => s.revealConversation);
  const reduced = useReducedMotion();
  const [openEvidence, setOpenEvidence] = useState<Evidence | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

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
  const base = `/enquete/${c.id}`;
  const conversation = c.conversations.find((cv) => cv.id === conversationId);
  if (!conversation || conversation.kind === 'notes' || !progress.openConversations.includes(conversationId)) {
    return <Navigate to={`${base}/echanges`} replace />;
  }

  const index = indexCase(c);
  const thread = progress.threads[conversationId] ?? [];
  const choices = getAvailableChoices(c, progress, conversationId);
  const isGroup = conversation.kind === 'group';
  const typingAuthor =
    next && next.from !== 'player' && next.from !== 'system' ? c.suspects.find((s) => s.id === next.from) : undefined;
  const otherUnread = c.conversations
    .filter((cv) => cv.kind !== 'notes' && cv.id !== conversationId)
    .reduce((sum, cv) => sum + unreadCount(progress, cv.id), 0);
  const subtitle = isGroup
    ? conversation.participants.map((id) => c.suspects.find((s) => s.id === id)?.name.split(' ')[0]).join(', ') + ', toi'
    : (c.suspects.find((s) => s.id === conversation.participants[0])?.role ?? '');
  const contactLink = !isGroup ? `${base}/contacts/${conversation.participants[0]}` : null;

  const senderOf = (entry: ThreadEntry | undefined): string | undefined =>
    !entry ? undefined : entry.kind === 'choice' ? 'player' : index.messages.get(entry.id)?.message.from;

  const renderEntry = (entry: ThreadEntry, i: number) => {
    const prev = thread[i - 1];
    const nextEntry = thread[i + 1];
    const showTime = !prev || Math.abs(parseClock(entry.time) - parseClock(prev.time)) >= 15;
    const from = senderOf(entry);
    const firstOfRun = senderOf(prev) !== from || showTime;
    const lastOfRun = senderOf(nextEntry) !== from;
    const timeLabel = showTime ? (
      <li key={`t-${i}`} className="chat-time">
        {c.device.date.weekday} {c.device.date.day} · {entry.time}
      </li>
    ) : null;

    if (entry.kind === 'choice') {
      const choice = index.choices.get(entry.id)?.choice;
      return [
        timeLabel,
        <li key={`c-${entry.id}`} className={`row row-me${lastOfRun ? ' run-end' : ''}`}>
          <p className="bubble bubble-me">
            <span className="visually-hidden">Toi, {entry.time} : </span>
            {choice?.text ?? choice?.label}
          </p>
        </li>,
      ];
    }
    const message = index.messages.get(entry.id)?.message;
    if (!message) return [timeLabel];
    const attachment = message.attachment ? c.evidence.find((e) => e.id === message.attachment) : undefined;

    if (message.from === 'system') {
      return [
        timeLabel,
        <li key={`m-${entry.id}`} className="chat-system">
          {message.text}
        </li>,
      ];
    }
    if (message.from === 'player') {
      return [
        timeLabel,
        <li key={`m-${entry.id}`} className={`row row-me${lastOfRun ? ' run-end' : ''}`}>
          <p className="bubble bubble-me">
            <span className="visually-hidden">Toi, {entry.time} : </span>
            {message.text}
          </p>
        </li>,
      ];
    }
    const author = c.suspects.find((s) => s.id === message.from);
    return [
      timeLabel,
      <li key={`m-${entry.id}`} className={`row row-them${lastOfRun ? ' run-end' : ''}`}>
        <span className="row-avatar">{lastOfRun && author && <ContactAvatar suspect={author} size={30} />}</span>
        <div className="row-content">
          {isGroup && firstOfRun && <span className="sender">{author?.name.split(' ')[0]}</span>}
          {!isGroup && <span className="visually-hidden">{author?.name.split(' ')[0]}, {entry.time} : </span>}
          <p className="bubble bubble-them">{message.text}</p>
          {attachment && <Attachment evidence={attachment} onOpen={setOpenEvidence} />}
        </div>
      </li>,
    ];
  };

  return (
    <div className="chat">
      <header className="chat-head">
        <Link to={`${base}/echanges`} className="navbar-back chat-back" aria-label="Retour à Échanges">
          <Icon name="back" size={24} />
          {otherUnread > 0 && <span className="back-count">{otherUnread}</span>}
        </Link>
        {contactLink ? (
          <Link to={contactLink} className="chat-ident" aria-label={`Fiche de ${conversation.title}`}>
            <ConversationAvatar c={c} conversation={conversation} size={44} />
            <span className="chat-name">
              {conversation.title} <Icon name="chevron" size={12} />
            </span>
            <span className="chat-sub">{subtitle}</span>
          </Link>
        ) : (
          <div className="chat-ident">
            <ConversationAvatar c={c} conversation={conversation} size={44} />
            <h1 className="chat-name">{conversation.title}</h1>
            <span className="chat-sub">{subtitle}</span>
          </div>
        )}
        <span className="chat-head-spacer" />
      </header>

      <div className="chat-scroll" ref={threadRef}>
        <ol className="chat-thread" aria-label="Messages" aria-live="polite" aria-relevant="additions">
          {thread.flatMap(renderEntry)}
          {next && (
            <li className="row row-them run-end" aria-label={typingAuthor ? `${typingAuthor.name.split(' ')[0]} écrit…` : 'En cours…'}>
              <span className="row-avatar">{typingAuthor && <ContactAvatar suspect={typingAuthor} size={30} />}</span>
              <span className="typing" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </li>
          )}
        </ol>
      </div>

      <div className="chat-tray">
        {next ? (
          <div className="chips">
            <button type="button" className="chip chip-ghost" onClick={() => revealConversation(c.id, conversationId)}>
              <Icon name="forward" size={16} /> Afficher tout de suite
            </button>
          </div>
        ) : choices.length > 0 ? (
          <div className="chips" role="group" aria-label="Réponses possibles">
            {choices.map((choice) => (
              <button key={choice.id} type="button" className="chip" onClick={() => choose(c.id, choice.id)}>
                {choice.locked && <span className="chip-new">Nouveau</span>}
                {choice.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="tray-empty">Rien à ajouter pour l’instant. De nouvelles questions viendront avec tes découvertes.</p>
        )}
      </div>

      <Dialog open={!!openEvidence} onClose={() => setOpenEvidence(null)} title={openEvidence?.title ?? ''} variant="sheet">
        {openEvidence && <EvidenceDetail c={c} evidence={openEvidence} />}
      </Dialog>
    </div>
  );
}
