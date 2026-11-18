import { Link } from 'react-router';
import { unreadCount } from '../../engine';
import { lastEntryPreview } from '../conversationMeta';
import { useCaseRoute } from '../hooks';
import { ConversationAvatar } from '../phone/ContactAvatar';
import { NavBar } from '../phone/NavBar';

export function MessagesApp() {
  const { c, progress } = useCaseRoute();
  if (!c || !progress) return null;
  const base = `/enquete/${c.id}`;
  const visible = c.conversations.filter((cv) => cv.kind !== 'notes' && progress.openConversations.includes(cv.id));

  return (
    <div className="app-page">
      <NavBar back={{ to: base, label: 'Accueil' }} largeTitle="Échanges" />
      <ul className="msg-list">
        {visible.map((cv) => {
          const unread = unreadCount(progress, cv.id);
          const preview = lastEntryPreview(c, progress, cv);
          return (
            <li key={cv.id}>
              <Link to={`${base}/echanges/${cv.id}`} className="msg-row">
                <span className="unread-slot">
                  {unread > 0 && (
                    <span className="unread-dot">
                      <span className="visually-hidden">
                        {unread} non lu{unread > 1 ? 's' : ''}
                      </span>
                    </span>
                  )}
                </span>
                <ConversationAvatar c={c} conversation={cv} size={48} />
                <span className="msg-row-text">
                  <span className="msg-row-top">
                    <span className={`msg-row-title${unread ? ' is-unread' : ''}`}>{cv.title}</span>
                    <span className="msg-row-time">{preview.time}</span>
                  </span>
                  <span className="msg-row-preview">{preview.text || cv.subtitle}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 && <p className="empty">Aucune conversation.</p>}
    </div>
  );
}
