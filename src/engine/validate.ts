import type { Case, Condition, Effect } from './types';

/**
 * Vérifie l'intégrité d'une enquête : identifiants uniques et références existantes.
 * Retourne la liste des problèmes (vide si tout est correct).
 */
export function validateCase(c: Case): string[] {
  const problems: string[] = [];

  const suspects = new Set(c.suspects.map((s) => s.id));
  const conversations = new Set(c.conversations.map((cv) => cv.id));
  const messages = new Set<string>();
  const choices = new Set<string>();
  const evidence = new Set(c.evidence.map((e) => e.id));
  const statements = new Set(c.statements.map((s) => s.id));
  const contradictions = new Set(c.contradictions.map((ct) => ct.id));

  const checkUnique = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`${label} en double : ${id}`);
      seen.add(id);
    }
  };

  checkUnique('Suspect', c.suspects.map((s) => s.id));
  checkUnique('Conversation', c.conversations.map((cv) => cv.id));
  checkUnique('Preuve', c.evidence.map((e) => e.id));
  checkUnique('Déclaration', c.statements.map((s) => s.id));
  checkUnique('Contradiction', c.contradictions.map((ct) => ct.id));
  checkUnique('Objectif', c.objectives.map((o) => o.id));

  const allMessageIds: string[] = [];
  const allChoiceIds: string[] = [];
  for (const cv of c.conversations) {
    for (const m of cv.messages) {
      allMessageIds.push(m.id);
      messages.add(m.id);
    }
    for (const ch of cv.choices) {
      allChoiceIds.push(ch.id);
      choices.add(ch.id);
    }
  }
  checkUnique('Message', allMessageIds);
  checkUnique('Choix', allChoiceIds);

  const checkCondition = (where: string, cond: Condition | undefined) => {
    if (!cond) return;
    switch (cond.type) {
      case 'hasEvidence':
        if (!evidence.has(cond.evidenceId)) problems.push(`${where} : preuve inconnue ${cond.evidenceId}`);
        break;
      case 'knowsStatement':
        if (!statements.has(cond.statementId)) problems.push(`${where} : déclaration inconnue ${cond.statementId}`);
        break;
      case 'contradictionFound':
        if (!contradictions.has(cond.contradictionId))
          problems.push(`${where} : contradiction inconnue ${cond.contradictionId}`);
        break;
      case 'choiceMade':
        if (!choices.has(cond.choiceId)) problems.push(`${where} : choix inconnu ${cond.choiceId}`);
        break;
      case 'messageRevealed':
        if (!messages.has(cond.messageId)) problems.push(`${where} : message inconnu ${cond.messageId}`);
        break;
      case 'conversationOpen':
        if (!conversations.has(cond.conversationId))
          problems.push(`${where} : conversation inconnue ${cond.conversationId}`);
        break;
      case 'all':
      case 'any':
        cond.conditions.forEach((sub) => checkCondition(where, sub));
        break;
      case 'not':
        checkCondition(where, cond.condition);
        break;
      default:
        break;
    }
  };

  const lockedChoices = new Set<string>();
  const unlockedSomewhere = new Set<string>();

  const checkEffects = (where: string, effects: Effect[] | undefined) => {
    for (const e of effects ?? []) {
      switch (e.type) {
        case 'revealMessage':
          if (!messages.has(e.messageId)) problems.push(`${where} : message inconnu ${e.messageId}`);
          break;
        case 'unlockQuestion':
          if (!choices.has(e.choiceId)) problems.push(`${where} : choix inconnu ${e.choiceId}`);
          unlockedSomewhere.add(e.choiceId);
          break;
        case 'addEvidence':
          if (!evidence.has(e.evidenceId)) problems.push(`${where} : preuve inconnue ${e.evidenceId}`);
          break;
        case 'addStatement':
          if (!statements.has(e.statementId)) problems.push(`${where} : déclaration inconnue ${e.statementId}`);
          break;
        case 'openConversation':
          if (!conversations.has(e.conversationId))
            problems.push(`${where} : conversation inconnue ${e.conversationId}`);
          break;
        case 'setFlag':
          break;
      }
    }
  };

  for (const s of c.suspects) {
    if (!conversations.has(s.conversationId)) problems.push(`Suspect ${s.id} : conversation inconnue ${s.conversationId}`);
  }

  for (const cv of c.conversations) {
    for (const p of cv.participants) {
      if (!suspects.has(p)) problems.push(`Conversation ${cv.id} : participant inconnu ${p}`);
    }
    for (const m of cv.messages) {
      const where = `Message ${m.id}`;
      if (m.from !== 'player' && m.from !== 'system' && !suspects.has(m.from))
        problems.push(`${where} : expéditeur inconnu ${m.from}`);
      if (m.attachment && !evidence.has(m.attachment)) problems.push(`${where} : pièce jointe inconnue ${m.attachment}`);
      checkCondition(where, m.condition);
      checkEffects(where, m.effects);
    }
    for (const ch of cv.choices) {
      const where = `Choix ${ch.id}`;
      if (ch.locked) lockedChoices.add(ch.id);
      checkCondition(where, ch.condition);
      checkEffects(where, ch.effects);
    }
  }

  for (const st of c.statements) {
    if (!suspects.has(st.suspectId)) problems.push(`Déclaration ${st.id} : suspect inconnu ${st.suspectId}`);
  }
  for (const ct of c.contradictions) {
    const where = `Contradiction ${ct.id}`;
    if (!statements.has(ct.statementId)) problems.push(`${where} : déclaration inconnue ${ct.statementId}`);
    if (ct.evidenceIds.length === 0) problems.push(`${where} : aucune preuve`);
    for (const id of ct.evidenceIds) if (!evidence.has(id)) problems.push(`${where} : preuve inconnue ${id}`);
    checkEffects(where, ct.effects);
  }
  for (const f of c.mismatchFeedback) {
    if (!statements.has(f.statementId)) problems.push(`Retour : déclaration inconnue ${f.statementId}`);
    if (!evidence.has(f.evidenceId)) problems.push(`Retour : preuve inconnue ${f.evidenceId}`);
    if (c.contradictions.some((ct) => ct.statementId === f.statementId && ct.evidenceIds.includes(f.evidenceId)))
      problems.push(`Retour ${f.statementId}+${f.evidenceId} : masque une vraie contradiction`);
  }
  for (const o of c.objectives) checkCondition(`Objectif ${o.id}`, o.completeWhen);

  for (const id of lockedChoices) {
    if (!unlockedSomewhere.has(id)) problems.push(`Choix verrouillé jamais débloqué : ${id}`);
  }

  const sol = c.solution;
  if (!suspects.has(sol.culpritId)) problems.push(`Solution : coupable inconnu ${sol.culpritId}`);
  if (sol.requirements.length > sol.maxEvidence) problems.push('Solution : plus d’exigences que de preuves autorisées');
  for (const req of sol.requirements) {
    if (req.anyOf.length === 0) problems.push('Solution : exigence vide');
    for (const id of req.anyOf) if (!evidence.has(id)) problems.push(`Solution : preuve inconnue ${id}`);
  }
  for (const id of Object.keys(sol.wrongSuspectFeedback)) {
    if (!suspects.has(id)) problems.push(`Solution : retour pour suspect inconnu ${id}`);
  }
  for (const s of c.suspects) {
    if (s.id !== sol.culpritId && !sol.wrongSuspectFeedback[s.id])
      problems.push(`Solution : pas de retour pour l’accusation de ${s.id}`);
  }
  for (const d of sol.resolution.decisive) {
    if (!evidence.has(d.evidenceId)) problems.push(`Résolution : preuve inconnue ${d.evidenceId}`);
  }

  return problems;
}
