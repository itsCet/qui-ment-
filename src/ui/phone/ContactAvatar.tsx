import type { Case, Conversation, Suspect } from '../../engine/types';

/** Avatar de contact sans photo : dégradé neutre et initiales, comme un vrai répertoire. */
export function ContactAvatar({ suspect, size = 40 }: { suspect: Suspect; size?: number }) {
  if (suspect.avatar) {
    return (
      <img
        className="contact-avatar contact-photo"
        src={suspect.avatar}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="contact-avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(180deg, hsl(${suspect.hue} 14% 72%), hsl(${suspect.hue} 12% 54%))`,
      }}
      aria-hidden="true"
    >
      {suspect.initials}
    </span>
  );
}

/** Avatar d'une conversation : contact, groupe (avatars superposés) ou notes. */
export function ConversationAvatar({ c, conversation, size = 44 }: { c: Case; conversation: Conversation; size?: number }) {
  if (conversation.kind === 'private') {
    const suspect = c.suspects.find((s) => s.id === conversation.participants[0]);
    if (suspect) return <ContactAvatar suspect={suspect} size={size} />;
  }
  const members = conversation.participants
    .map((id) => c.suspects.find((s) => s.id === id))
    .filter((s): s is Suspect => !!s)
    .slice(0, 2);
  const small = Math.round(size * 0.66);
  return (
    <span className="group-avatar" style={{ width: size, height: size }} aria-hidden="true">
      {members.map((s, i) => (
        <span key={s.id} className={`group-avatar-item item-${i}`}>
          <ContactAvatar suspect={s} size={small} />
        </span>
      ))}
    </span>
  );
}
