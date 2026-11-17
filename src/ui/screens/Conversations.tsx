import { Link } from 'react-router';
import { unreadCount, type Case, type Conversation } from '../../engine';
import { lastEntryPreview } from '../conversationMeta';
import { Avatar, SystemAvatar } from '../components/Avatar';
import { useCaseRoute } from '../hooks';

export function ConversationAvatar({ c, conversation, size = 48 }: { c: Case; conversation: Conversation; size?: number }) {
  if (conversation.kind === 'private') {
    const suspect = c.suspects.find((s) => s.id === conversation.participants[0]);
    if (suspect) return <Avatar suspect={suspect} size={size} />;
  }
  return <SystemAvatar label={conversation.kind === 'notes' ? 'N' : 'G'} size={size} />;
}

export function Conversations() {
  const { c, progress } = useCaseRoute();
  if (!c || !progress) return null;

  const visible = c.conversations.filter((cv) => progress.openConversations.includes(cv.id));

  return (
    <div className="screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Ton téléphone</p>
          <h1>Conversations</h1>
        </div>
      </header>
      <ul className="conversation-list">
        {visible.map((cv) => {
          const unread = unreadCount(progress, cv.id);
          const preview = lastEntryPreview(c, progress, cv);
          return (
            <li key={cv.id}>
              <Link to={`/enquete/${c.id}/conversations/${cv.id}`} className={`conversation-row${unread ? ' unread' : ''}`}>
                <ConversationAvatar c={c} conversation={cv} />
                <span className="conversation-text">
                  <span className="conversation-top">
                    <span className="conversation-title">{cv.title}</span>
                    <span className="conversation-time">{preview.time}</span>
                  </span>
                  <span className="conversation-preview">{preview.text || cv.subtitle}</span>
                </span>
                {unread > 0 && (
                  <span className="badge badge-inline" aria-label={`${unread} message${unread > 1 ? 's' : ''} non lu${unread > 1 ? 's' : ''}`}>
                    {unread}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      {visible.length < c.conversations.length && (
        <p className="small muted center">D’autres conversations s’ouvriront au fil de l’enquête.</p>
      )}
    </div>
  );
}
