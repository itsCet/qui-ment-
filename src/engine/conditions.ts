import type { CaseProgress, Condition } from './types';

/** Évalue une condition structurée. Aucune évaluation dynamique de code. */
export function isConditionMet(progress: CaseProgress, condition: Condition | undefined): boolean {
  if (!condition) return true;
  switch (condition.type) {
    case 'flag':
      return (progress.flags[condition.flag] ?? false) === (condition.value ?? true);
    case 'hasEvidence':
      return progress.evidence.includes(condition.evidenceId);
    case 'knowsStatement':
      return progress.statements.includes(condition.statementId);
    case 'contradictionFound':
      return progress.contradictions.includes(condition.contradictionId);
    case 'choiceMade':
      return progress.choicesMade.includes(condition.choiceId);
    case 'messageRevealed':
      return progress.revealedMessages.includes(condition.messageId);
    case 'conversationOpen':
      return progress.openConversations.includes(condition.conversationId);
    case 'solved':
      return progress.solved;
    case 'all':
      return condition.conditions.every((c) => isConditionMet(progress, c));
    case 'any':
      return condition.conditions.some((c) => isConditionMet(progress, c));
    case 'not':
      return !isConditionMet(progress, condition.condition);
    default: {
      const exhaustive: never = condition;
      throw new Error(`Condition inconnue : ${JSON.stringify(exhaustive)}`);
    }
  }
}
