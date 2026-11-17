import { indexCase, type Case, type CaseProgress, type Conversation } from '../engine';

/** Aperçu du dernier élément d'une conversation (liste des conversations). */
export function lastEntryPreview(c: Case, progress: CaseProgress, conversation: Conversation): { text: string; time: string } {
  const thread = progress.threads[conversation.id] ?? [];
  const last = thread.at(-1);
  if (!last) return { text: '', time: '' };
  const index = indexCase(c);
  if (last.kind === 'choice') {
    const choice = index.choices.get(last.id)?.choice;
    return { text: `Toi : ${choice?.text ?? choice?.label ?? ''}`, time: last.time };
  }
  const message = index.messages.get(last.id)?.message;
  if (!message) return { text: '', time: last.time };
  const author =
    message.from === 'player'
      ? 'Toi : '
      : message.from === 'system' || conversation.kind !== 'group'
        ? ''
        : `${c.suspects.find((s) => s.id === message.from)?.name.split(' ')[0]} : `;
  return { text: `${author}${message.text}`, time: last.time };
}
