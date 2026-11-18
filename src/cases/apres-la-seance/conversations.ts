import type { Condition, Conversation, Effect, Message } from '../../engine/types';

const after = (choiceId: string): Condition => ({ type: 'choiceMade', choiceId });
const flag = (name: string): Condition => ({ type: 'flag', flag: name });
const found = (contradictionId: string): Condition => ({ type: 'contradictionFound', contradictionId });
const not = (condition: Condition): Condition => ({ type: 'not', condition });
const all = (...conditions: Condition[]): Condition => ({ type: 'all', conditions });
const setFlag = (name: string): Effect => ({ type: 'setFlag', flag: name });
const statement = (statementId: string): Effect => ({ type: 'addStatement', statementId });
const addEvidence = (evidenceId: string): Effect => ({ type: 'addEvidence', evidenceId });

function replies(choiceId: string, list: Omit<Message, 'condition'>[]): Message[] {
  return list.map((m) => ({ ...m, condition: after(choiceId) }));
}
function when(condition: Condition, list: Omit<Message, 'condition'>[]): Message[] {
  return list.map((m) => ({ ...m, condition }));
}
function archived(list: Omit<Message, 'history'>[]): Message[] {
  return list.map((m) => ({ ...m, history: true }));
}

const ARCHIVE = { ownerId: 'lucas', label: 'Extraction du téléphone de Lucas' };
const BUS = 'J’ai pris le dernier bus. On reprend demain.';

/** La question sur le miroir vient après la vérification du message de 22:05. */
const miroirReady: Condition = { type: 'all', conditions: [{ type: 'contradictionFound', contradictionId: 'c_miroir' }, { type: 'flag', flag: 'd1_ok' }] };

/** Une question à plusieurs réponses : une bonne, des erreurs expliquées. */
function question(gate: Condition, doneFlag: string) {
  return all(gate, not(flag(doneFlag)));
}

export const conversations: Conversation[] = [
  /* ================================================================ */
  /* Extraction (lecture seule)                                         */
  /* ================================================================ */
  {
    id: 'arch_groupe',
    title: 'Équipe du film',
    subtitle: 'Salomé, Nina, Lucas',
    kind: 'group',
    participants: ['salome', 'nina'],
    archive: ARCHIVE,
    initiallyOpen: true,
    choices: [],
    messages: archived([
      { id: 'ag01', date: 'sam. 28 févr.', time: '21:38', from: 'salome', text: 'Lucas, tu es encore au Rialto ? Tu peux sortir la v3 ce soir ?' },
      {
        id: 'ag02',
        date: 'sam. 28 févr.',
        time: '21:41',
        from: 'lucas',
        text: 'Quand je dis que je suis encore au cinéma, personne ne me laisse rentrer. Ce soir, à dix heures, je coupe.',
      },
      {
        id: 'ag03',
        date: 'lun. 2 mars',
        time: '19:12',
        from: 'salome',
        text: 'Projection privée jeudi 20 h. Le passage d’Adrien reste tel quel, c’est le cœur du film.',
      },
      { id: 'ag04', date: 'lun. 2 mars', time: '19:15', from: 'nina', text: 'Export final sur le disque MASTER 👍' },
      {
        id: 'ag05',
        date: 'mar. 3 mars',
        time: '20:48',
        from: 'salome',
        text: 'Je file. Lucas, ta « question de montage », on en parle demain. Jeudi approche, pas le moment de tout rouvrir.',
      },
      { id: 'ag06', date: 'mar. 3 mars', time: '22:05', from: 'lucas', text: BUS },
      { id: 'ag07', date: 'mar. 3 mars', time: '22:09', from: 'nina', text: 'Bien rentré ! À demain.' },
      { id: 'ag08', date: 'mar. 3 mars', time: '22:31', from: 'salome', text: '👍' },
    ]),
  },
  {
    id: 'arch_adrien',
    title: 'Adrien Faure',
    subtitle: 'Lucas et Adrien',
    kind: 'private',
    participants: ['adrien'],
    archive: ARCHIVE,
    initiallyOpen: true,
    choices: [],
    messages: archived([
      {
        id: 'aa01',
        date: 'mer. 18 févr.',
        time: '23:12',
        from: 'adrien',
        text: 'Votre film me fait dire le contraire de ce que j’ai dit. Si vous projetez ça, je viens vous arrêter moi-même.',
        effects: [addEvidence('ev_msg_menace')],
      },
      { id: 'aa02', date: 'mer. 18 févr.', time: '23:40', from: 'lucas', text: 'Le montage a été validé. Adressez-vous à la production.' },
      {
        id: 'aa03',
        date: 'mar. 3 mars',
        time: '16:02',
        from: 'lucas',
        text: 'J’ai retrouvé l’enregistrement complet de votre entretien. Je crois que vous aviez raison. Vous pouvez passer au Rialto ce soir vers 21 h ? Petite porte, rue des Tanneurs.',
      },
      {
        id: 'aa04',
        date: 'mar. 3 mars',
        time: '16:30',
        from: 'adrien',
        text: 'J’y serai. Si c’est encore un piège, je le saurai.',
        effects: [addEvidence('ev_msg_rdv_adrien')],
      },
      { id: 'aa05', date: 'mar. 3 mars', time: '21:04', from: 'adrien', text: 'Je suis dans le hall. C’est où ?' },
      { id: 'aa06', date: 'mar. 3 mars', time: '21:05', from: 'lucas', attachment: 'ev_miroir_intact', text: 'La cabine, au fond du couloir.' },
      {
        id: 'aa07',
        date: 'mar. 3 mars',
        time: '21:18',
        from: 'lucas',
        text: 'Tu avais raison. Cette séquence est trompeuse. Je suspends la projection et on montre la version complète.',
        effects: [addEvidence('ev_msg_raison')],
      },
      { id: 'aa08', date: 'mar. 3 mars', time: '21:19', from: 'adrien', text: 'Merci. Vraiment.' },
    ]),
  },
  {
    id: 'arch_salome',
    title: 'Salomé Bertin',
    subtitle: 'Lucas et Salomé',
    kind: 'private',
    participants: ['salome'],
    archive: ARCHIVE,
    initiallyOpen: true,
    choices: [],
    messages: archived([
      { id: 'as01', date: 'mar. 3 mars', time: '14:10', from: 'lucas', text: 'Il faut qu’on parle du passage d’Adrien avant jeudi. Ce n’est pas ce qu’il a dit.' },
      {
        id: 'as02',
        date: 'mar. 3 mars',
        time: '14:32',
        from: 'salome',
        text: 'On en a déjà parlé la semaine dernière quand Karim a soulevé ça. C’est validé.',
        effects: [addEvidence('ev_msg_karim')],
      },
      { id: 'as03', date: 'mar. 3 mars', time: '14:33', from: 'lucas', text: 'Karim avait raison. Je te montre ce soir.' },
      { id: 'as04', date: 'mar. 3 mars', time: '14:35', from: 'salome', text: 'Ce soir je passe vite. Demain.' },
    ]),
  },
  {
    id: 'arch_nina',
    title: 'Nina Roche',
    subtitle: 'Lucas et Nina',
    kind: 'private',
    participants: ['nina'],
    archive: ARCHIVE,
    initiallyOpen: true,
    choices: [],
    messages: archived([
      { id: 'an01', date: 'lun. 2 mars', time: '18:05', from: 'nina', text: 'Tu veux que je t’envoie l’export final ? Il est sur le MASTER.' },
      { id: 'an02', date: 'lun. 2 mars', time: '18:07', from: 'lucas', text: 'Non, je l’ai. Je garde le MASTER au Rialto jusqu’à jeudi.' },
      {
        id: 'an03',
        date: 'mar. 3 mars',
        time: '21:30',
        from: 'lucas',
        text: 'J’ai retrouvé le projet d’origine. On doit parler de la coupe avant que j’appelle Salomé.',
      },
      {
        id: 'an04',
        date: 'mar. 3 mars',
        time: '21:32',
        from: 'nina',
        text: 'Pas ce soir. On voit ça demain.',
        effects: [addEvidence('ev_msg_nina_rdv')],
      },
      { id: 'an05', date: 'mar. 3 mars', time: '21:33', from: 'nina', text: 'Tu peux me laisser le disque ? Je regarde les fichiers chez moi cette nuit.' },
      {
        id: 'an06',
        date: 'mar. 3 mars',
        time: '21:34',
        from: 'lucas',
        text: 'Le disque reste ici. On regarde les fichiers ensemble. Je ne te le confie pas avant d’avoir parlé à Salomé.',
        effects: [addEvidence('ev_msg_disque')],
      },
    ]),
  },

  /* ================================================================ */
  /* Note de travail : objectif et résumés d'étape                     */
  /* ================================================================ */
  {
    id: 'conv_notes',
    title: 'Notes · Note de travail',
    kind: 'notes',
    participants: [],
    choices: [],
    messages: [
      {
        id: 'n01',
        from: 'system',
        text: 'Lucas annonce à 22:05 qu’il a pris le dernier bus. Son manteau et ses clés sont restés dans la cabine. Pourquoi annoncer un départ qu’il n’a pas fait ?',
      },
      {
        id: 'n02',
        from: 'system',
        text: 'Hypothèse de départ : Lucas était vivant à 22:05, puisqu’il écrivait au groupe.',
      },
      ...when(flag('acte2'), [
        {
          id: 'n_a2',
          from: 'system',
          text: 'Point d’étape — Adrien est venu de 21:05 à 21:20. Lucas venait de lui donner raison sur le montage ; une caméra le filme à 2 km du cinéma à 21:34. Reste à comprendre ce que Lucas avait découvert.',
        },
      ]),
      ...when(flag('salome_aveu'), [
        {
          id: 'n_a3',
          from: 'system',
          text: 'Point d’étape — Le film déformait les propos d’Adrien. Salomé a ignoré l’avertissement de Karim. Le montage initial est de Nina : cela dit qui a monté, pas pourquoi, et encore moins qui a frappé.',
        },
      ]),
      ...when(flag('d1_ok'), [
        {
          id: 'n_a4',
          from: 'system',
          text: 'Mise à jour — L’hypothèse de départ ne tient plus : le message de 22:05 était programmé à 21:25. Il ne prouve pas que Lucas était vivant à 22:05. L’alibi apparent de Nina (« à 22 h 05, il écrivait encore ») tombe.',
        },
      ]),
      ...when(flag('d2_ok'), [
        {
          id: 'n_a5',
          from: 'system',
          text: 'Point d’étape — Nina connaissait le miroir cassé, intact à 21:05. Elle est revenue après, et l’a caché. Cela ne prouve pas qu’elle a frappé Lucas.',
        },
      ]),
      ...when(found('c_prete'), [
        {
          id: 'n_a6',
          from: 'system',
          text: 'Point d’étape — Le disque MASTER de Lucas est dans le sac de Nina. Lucas avait écrit qu’il ne le lui confierait pas. Elle a menti sur ce qu’elle a emporté et sur la fin du rendez-vous.',
        },
      ]),
      ...when(flag('aveu'), [
        { id: 'n_a7', from: 'system', text: 'Nina a avoué. Son récit sera vérifié avec les constatations matérielles.' },
      ]),
    ],
  },

  /* ================================================================ */
  /* Inès — la collègue                                                */
  /* ================================================================ */
  {
    id: 'conv_ines',
    title: 'Inès Garnier',
    subtitle: 'Ta collègue',
    kind: 'private',
    section: 'enquete',
    participants: ['ines'],
    initiallyOpen: true,
    messages: [
      {
        id: 'i01',
        from: 'ines',
        time: '07:48',
        text: 'On a retrouvé son téléphone dans la salle. Son dernier message annonce qu’il quitte le cinéma. Mais son manteau et ses clés sont restés dans la cabine.',
      },
      { id: 'i02', from: 'ines', time: '07:48', attachment: 'ev_telephone', text: 'Sous un fauteuil du rang F. Jaune, bande noire : c’est bien le sien.' },
      { id: 'i03', from: 'ines', time: '07:49', text: `Son dernier message, au groupe du film, à 22:05 : « ${BUS} »`, effects: [statement('st_lucas_bus')] },
      {
        id: 'i04',
        from: 'ines',
        time: '07:49',
        text: 'Le gardien l’a trouvé à 23:20 dans la cabine de projection. Une lourde bobine métallique près de lui, et une housse de disque dur vide sur la table.',
      },
      {
        id: 'i05',
        from: 'ines',
        time: '07:50',
        text: 'L’informatique a déverrouillé le téléphone : l’extraction est dans Échanges et Photos, en lecture seule. Les auditions sont ici, avec les fiches et ce que chacun a présenté en arrivant.',
        effects: [
          { type: 'openConversation', conversationId: 'conv_adrien' },
          { type: 'openConversation', conversationId: 'conv_salome' },
          { type: 'openConversation', conversationId: 'conv_nina' },
          { type: 'openConversation', conversationId: 'conv_notes' },
        ],
      },
      { id: 'i06', from: 'ines', time: '07:51', text: 'Une question pour commencer : pourquoi annoncer qu’il part, s’il ne part pas ?' },

      ...replies('ch_i_lucas', [
        {
          id: 'i_l1',
          from: 'ines',
          text: 'Projectionniste du Rialto, fermé pour travaux. Il préparait pour jeudi la projection privée d’un documentaire de Salomé Bertin, monté avec Nina Roche.',
        },
        {
          id: 'i_l2',
          from: 'ines',
          text: 'Le film accuse Adrien Faure d’avoir ignoré une alarme avant un accident d’atelier. Adrien dit depuis des semaines qu’on déforme ses propos.',
        },
      ]),

      /* Acte 2 */
      ...replies('ch_i_piste', [
        { id: 'i_p1', from: 'ines', text: 'Bonne question. En février, il l’envoyait promener. Mardi, il lui écrit « vous aviez raison ».' },
        {
          id: 'i_p2',
          from: 'ines',
          attachment: 'ev_comparaison',
          text: 'L’informatique a isolé deux extraits dans ses fichiers : la séquence du film, et l’enregistrement complet de l’entretien. Lis-les.',
        },
        {
          id: 'i_p3',
          from: 'ines',
          text: 'Et j’ai fait vérifier le trajet d’Adrien : la caméra d’une pharmacie le filme à 21:34, à deux kilomètres du Rialto, en direction de chez lui.',
          effects: [setFlag('acte2')],
        },
      ]),

      /* Acte 3 — première déduction */
      ...replies('ch_i_message', [
        { id: 'i_m1', from: 'ines', text: 'L’informatique vient de répondre.' },
        { id: 'i_m2', from: 'ines', attachment: 'ev_programmation', text: 'Voilà leur fiche sur le message de 22:05.' },
        { id: 'i_m3', from: 'ines', text: 'Alors, à ton avis : que prouve réellement ce message ?' },
      ]),
      ...replies('ch_d1_vivant', [
        {
          id: 'i_d1x',
          from: 'ines',
          text: 'Non : il a été écrit à 21:25 et il est parti tout seul. Personne n’avait besoin d’être là à 22:05. Réessaie.',
        },
      ]),
      ...replies('ch_d1_tiers', [
        {
          id: 'i_d1y',
          from: 'ines',
          text: 'Rien ne l’indique : l’envoi était automatique, sans intervention manuelle. Réessaie.',
        },
      ]),
      ...replies('ch_d1_programme', [
        { id: 'i_d1a', from: 'ines', text: 'Exactement. Ce message ne dit rien de l’heure à laquelle Lucas est mort.' },
        {
          id: 'i_d1b',
          from: 'ines',
          text: 'Et ça fait tomber l’alibi apparent de Nina : elle disait qu’à 22 h 05, il écrivait encore.',
        },
        {
          id: 'i_d1c',
          from: 'ines',
          attachment: 'ev_miroir_casse',
          text: 'Les photos de constatation de la cabine sont arrivées. Près de la porte, le miroir est brisé, des fragments au sol.',
          effects: [setFlag('d1_ok')],
        },
      ]),

      /* Acte 4 — deuxième déduction */
      ...when(miroirReady, [
        {
          id: 'i_q2',
          from: 'ines',
          text: 'Tu as rapproché ce que Nina dit du miroir et la photo de 21:05. Son souvenir du miroir cassé est incompatible avec quel récit ?',
        },
      ]),
      ...replies('ch_d2_meurtre', [
        {
          id: 'i_d2x',
          from: 'ines',
          text: 'Trop vite. Le miroir dit qu’elle était là après 21:05, pas qui a frappé. Réessaie.',
        },
      ]),
      ...replies('ch_d2_adrien', [
        {
          id: 'i_d2y',
          from: 'ines',
          text: 'Adrien ne parle pas du miroir. C’est ce que Nina dit de son propre passage qui coince. Réessaie.',
        },
      ]),
      ...replies('ch_d2_avant', [
        {
          id: 'i_d2a',
          from: 'ines',
          text: 'Oui. À 21:05, le miroir est intact. Pour l’avoir vu cassé, elle est revenue après — et elle le cache.',
        },
        {
          id: 'i_d2b',
          from: 'ines',
          text: 'Attention : ça ne prouve pas qu’elle a frappé Lucas. Ça prouve qu’elle était là plus tard qu’elle ne le dit. Retourne la voir.',
          effects: [setFlag('d2_ok')],
        },
      ]),

      /* Acte 5 */
      ...replies('ch_i_serie', [
        { id: 'i_s1', from: 'ines', text: 'La couleur et l’étiquette ne suffisent pas. J’ai fait relever le numéro de série.' },
        {
          id: 'i_s2',
          from: 'ines',
          attachment: 'ev_inventaire',
          text: 'Disque du sac de Nina : WX-4471. Inventaire de Lucas, disque MASTER : WX-4471. C’est le sien.',
          effects: [setFlag('serie_ok')],
        },
      ]),

      /* Préparation de la confrontation */
      ...when(found('c_prete'), [
        { id: 'i_f0', from: 'ines', text: 'On a de quoi mener une confrontation. Avant, mettons les choses au clair : qui doit être confronté ?' },
      ]),
      ...replies('ch_f_salome', [
        {
          id: 'i_fx1',
          from: 'ines',
          text: 'Salomé a fermé les yeux sur le montage, mais elle est partie à 20:48 et rien ne la place dans la cabine ensuite.',
        },
      ]),
      ...replies('ch_f_adrien', [
        {
          id: 'i_fx2',
          from: 'ines',
          text: 'Adrien a menacé Lucas, mais Lucas venait de lui donner raison, et la caméra le place loin du cinéma à 21:34.',
        },
      ]),
      ...replies('ch_f_nina', [{ id: 'i_f1', from: 'ines', text: 'D’accord. Qu’est-ce qu’elle cherchait à récupérer ?' }]),
      ...replies('ch_f_telephone', [
        {
          id: 'i_fx3',
          from: 'ines',
          text: 'Elle l’a pris, puis perdu dans la salle. Ce qu’elle a gardé, et ce que Lucas lui refusait par écrit, c’est autre chose.',
        },
      ]),
      ...replies('ch_f_cles', [{ id: 'i_fx4', from: 'ines', text: 'Ses clés, elle les a laissées sur la tablette. Elle le dit elle-même.' }]),
      ...replies('ch_f_disque', [
        { id: 'i_f2', from: 'ines', text: 'Oui : le projet d’origine, avec la coupe qu’elle avait faite. Dernière chose : pourquoi le message de 22:05 ne la disculpe-t-il pas ?' },
      ]),
      ...replies('ch_f_repondu', [
        { id: 'i_fx5', from: 'ines', text: 'Répondre à un message ne prouve rien, ni pour elle ni contre elle.' },
      ]),
      ...replies('ch_f_chezelle', [
        { id: 'i_fx6', from: 'ines', text: 'C’est justement ce qu’elle voulait faire croire. Il faut une raison tirée des faits.' },
      ]),
      ...replies('ch_f_programme', [
        {
          id: 'i_f3',
          from: 'ines',
          text: 'On y est. Présence pendant la dispute, disque emporté malgré un refus écrit, mensonges, message utilisé comme alibi. Pas une preuve absolue du meurtre, mais de quoi l’entendre à nouveau. À toi.',
          effects: [setFlag('pret')],
        },
      ]),

      /* Fin */
      ...when(flag('aveu'), [
        { id: 'i_z1', from: 'ines', text: 'L’équipe va vérifier son récit avec les constatations matérielles.' },
        {
          id: 'i_z2',
          from: 'ines',
          attachment: 'ev_brouillon',
          text: 'Dans son téléphone, il y avait aussi un brouillon pour Adrien. Jamais envoyé.',
        },
        {
          id: 'i_z3',
          from: 'ines',
          text: 'La projection publique est suspendue. Salomé a prévenu la salle ce matin.',
          effects: [setFlag('fin')],
        },
      ]),
    ],
    choices: [
      { id: 'ch_i_lucas', label: 'Qui était Lucas ?', text: 'Qu’est-ce qu’on sait de Lucas ?', condition: not(flag('acte2')) },
      {
        id: 'ch_i_piste',
        label: 'Pourquoi Lucas avait-il accepté de voir Adrien ?',
        text: 'Adrien l’avait menacé. Pourquoi Lucas avait-il finalement accepté de le voir ?',
        condition: flag('adrien_venu'),
      },
      {
        id: 'ch_i_message',
        label: 'Fais vérifier le message de 22:05',
        text: 'Tu peux faire vérifier le message de 22:05 par l’informatique ?',
        condition: all(flag('salome_aveu'), after('ch_n_soiree')),
      },
      {
        id: 'ch_d1_vivant',
        label: 'Que Lucas était vivant à 22:05',
        condition: question(after('ch_i_message'), 'd1_ok'),
        mistake: 'Message : « vivant à 22:05 »',
      },
      {
        id: 'ch_d1_programme',
        label: 'Qu’un message programmé a été envoyé, rien de plus',
        text: 'Qu’un message programmé a été envoyé. Il ne prouve pas que Lucas était vivant à cette heure-là.',
        condition: question(after('ch_i_message'), 'd1_ok'),
      },
      {
        id: 'ch_d1_tiers',
        label: 'Que quelqu’un a utilisé son téléphone',
        condition: question(after('ch_i_message'), 'd1_ok'),
        mistake: 'Message : « quelqu’un l’a utilisé »',
      },
      {
        id: 'ch_d2_avant',
        label: 'Un passage avant Adrien, sans retour',
        text: 'Avec son récit d’un passage vers 20 h 30, avant Adrien, sans retour ensuite.',
        condition: question(miroirReady, 'd2_ok'),
      },
      {
        id: 'ch_d2_meurtre',
        label: 'Avec son innocence : elle a tué Lucas',
        condition: question(miroirReady, 'd2_ok'),
        mistake: 'Miroir : conclusion trop rapide',
      },
      {
        id: 'ch_d2_adrien',
        label: 'Avec le récit d’Adrien',
        condition: question(miroirReady, 'd2_ok'),
        mistake: 'Miroir : récit d’Adrien',
      },
      {
        id: 'ch_i_serie',
        label: 'Vérifie le disque du sac de Nina',
        text: 'Le disque rouge du sac de Nina : tu peux vérifier son numéro de série ?',
        condition: found('c_sac'),
      },
      { id: 'ch_f_nina', label: 'Nina', text: 'Nina.', condition: question(found('c_prete'), 'q_qui') , effects: [setFlag('q_qui')] },
      { id: 'ch_f_salome', label: 'Salomé', text: 'Salomé.', condition: question(found('c_prete'), 'q_qui'), mistake: 'Confrontation : Salomé' },
      { id: 'ch_f_adrien', label: 'Adrien', text: 'Adrien.', condition: question(found('c_prete'), 'q_qui'), mistake: 'Confrontation : Adrien' },
      {
        id: 'ch_f_disque',
        label: 'Le disque MASTER',
        text: 'Le disque MASTER, avec le projet où elle a créé la coupe trompeuse.',
        condition: question(flag('q_qui'), 'q_quoi'),
        effects: [setFlag('q_quoi')],
      },
      {
        id: 'ch_f_telephone',
        label: 'Le téléphone de Lucas',
        condition: question(flag('q_qui'), 'q_quoi'),
        mistake: 'Confrontation : le téléphone',
      },
      { id: 'ch_f_cles', label: 'Ses clés du Rialto', condition: question(flag('q_qui'), 'q_quoi'), mistake: 'Confrontation : les clés' },
      {
        id: 'ch_f_programme',
        label: 'Il était programmé depuis 21:25',
        text: 'Il était programmé à 21:25. Il ne prouve pas que Lucas était vivant à 22:05.',
        condition: question(flag('q_quoi'), 'pret'),
      },
      {
        id: 'ch_f_repondu',
        label: 'Parce qu’elle y a répondu',
        condition: question(flag('q_quoi'), 'pret'),
        mistake: 'Confrontation : la réponse de 22:09',
      },
      {
        id: 'ch_f_chezelle',
        label: 'Parce qu’elle était chez elle',
        condition: question(flag('q_quoi'), 'pret'),
        mistake: 'Confrontation : « chez elle »',
      },
    ],
  },

  /* ================================================================ */
  /* Audition de Nina                                                  */
  /* ================================================================ */
  {
    id: 'conv_nina',
    title: 'Nina Roche',
    subtitle: 'Audition · assistante de montage',
    kind: 'private',
    section: 'enquete',
    participants: ['nina'],
    messages: [
      { id: 'nn01', from: 'player', text: 'Madame Roche, merci d’être venue.' },
      { id: 'nn02', from: 'nina', text: 'Bien sûr. Je veux aider. Lucas était quelqu’un de bien.' },
      ...replies('ch_n_soiree', [
        {
          id: 'nn_s1',
          from: 'nina',
          text: 'Je suis passée au Rialto vers 20 h 30 récupérer mes affaires. Lucas attendait Adrien Faure à 21 h, il ne voulait personne dans les pattes.',
        },
        {
          id: 'nn_s2',
          from: 'nina',
          text: 'Je suis partie avant l’arrivée d’Adrien, et je ne suis pas revenue.',
          effects: [statement('st_nina_avant')],
        },
        {
          id: 'nn_s3',
          from: 'nina',
          text: 'En partant, j’ai posé mes clés sur la tablette, sous le miroir cassé. Lucas voulait récupérer tous les doubles avant la projection.',
          effects: [statement('st_nina_cles')],
        },
        {
          id: 'nn_s4',
          from: 'nina',
          text: 'J’étais chez moi avant dix heures. Et à 22 h 05, Lucas écrivait encore au groupe — je lui ai même répondu.',
          effects: [statement('st_nina_2205')],
        },
      ]),
      ...replies('ch_n_rdv', [
        { id: 'nn_r1', from: 'nina', text: 'Oui. J’ai répondu « pas ce soir ». J’étais épuisée, et il voulait encore reparler de la coupe.' },
        { id: 'nn_r2', from: 'nina', text: 'Vous avez nos messages, de toute façon.' },
      ]),
      ...replies('ch_n_film', [
        { id: 'nn_f1', from: 'nina', text: 'Salomé voulait une séquence forte sur Adrien. Elle y tenait beaucoup. Les décisions finales, c’était elle.' },
        { id: 'nn_f2', from: 'nina', text: 'Et Adrien envoyait des messages assez violents à Lucas. Vous les avez vus ?' },
      ]),
      ...replies('ch_n_programme', [
        { id: 'nn_p1', from: 'nina', text: 'Programmé ?' },
        { id: 'nn_p2', from: 'nina', text: 'Je ne pouvais pas savoir qu’il l’avait programmé.' },
      ]),
      ...replies('ch_n_miroir', [
        { id: 'nn_m1', from: 'nina', text: '…' },
        { id: 'nn_m2', from: 'nina', text: 'D’accord. Je suis revenue, vers 21 h 40. On s’est disputés à propos de la coupe.' },
        { id: 'nn_m3', from: 'nina', text: 'Le miroir s’est cassé avec mon sac.' },
        {
          id: 'nn_m4',
          from: 'nina',
          text: 'Mais Lucas allait bien quand je suis partie.',
          effects: [statement('st_nina_v2'), setFlag('nina_v2')],
        },
      ]),
      ...replies('ch_n_emporte', [
        {
          id: 'nn_e1',
          from: 'nina',
          text: 'Mes affaires. Mon sac, mes câbles, mon carnet. Rien qui soit à Lucas.',
          effects: [statement('st_nina_affaires')],
        },
      ]),
      ...replies('ch_n_disque', [
        {
          id: 'nn_d1',
          from: 'nina',
          text: 'Lucas me l’a prêté. Pour que je corrige le montage chez moi.',
          effects: [statement('st_nina_prete')],
        },
      ]),
      ...replies('ch_n_confrontation', [
        { id: 'nn_c1', from: 'nina', text: '…' },
        { id: 'nn_c2', from: 'nina', text: 'Je voulais qu’il me laisse une nuit pour réparer le montage.' },
        {
          id: 'nn_c3',
          from: 'nina',
          text: 'Il a dit qu’on ne réparait pas ça en changeant un fichier. Qu’il fallait dire ce qu’on avait fait.',
        },
        { id: 'nn_c4', from: 'nina', text: 'J’ai pris la bobine. Je voulais qu’il lâche le disque.' },
        { id: 'nn_c5', from: 'nina', text: 'J’ai pris son téléphone aussi. Il m’a échappé dans la salle, je ne voyais rien.' },
        {
          id: 'nn_c6',
          from: 'nina',
          text: 'Quand son message est arrivé dans le groupe, j’ai cru que j’avais encore une chance.',
          effects: [setFlag('aveu')],
        },
      ]),
    ],
    choices: [
      { id: 'ch_n_soiree', label: 'Racontez-moi votre soirée', text: 'Racontez-moi votre soirée d’hier.' },
      {
        id: 'ch_n_rdv',
        label: 'Lucas vous a écrit à 21:30',
        text: 'Lucas vous a écrit à 21:30 pour vous voir.',
        condition: all(after('ch_n_soiree'), not(flag('d2_ok'))),
      },
      {
        id: 'ch_n_film',
        label: 'Comment se passait le travail sur le film ?',
        condition: all(after('ch_n_soiree'), not(flag('d1_ok'))),
      },
      {
        id: 'ch_n_programme',
        label: 'Le message de 22:05 était programmé',
        text: 'Le message de 22:05 avait été programmé à 21:25. Il ne prouve pas que Lucas vivait encore.',
        condition: all(flag('d1_ok'), not(flag('d2_ok'))),
      },
      {
        id: 'ch_n_miroir',
        label: 'Le miroir était intact à 21:05',
        text: 'À 21:05, le miroir près de la cabine était intact. Comment saviez-vous qu’il était cassé ?',
        condition: flag('d2_ok'),
      },
      { id: 'ch_n_emporte', label: 'Qu’avez-vous emporté en partant ?', condition: flag('nina_v2') },
      {
        id: 'ch_n_disque',
        label: 'Le disque de votre sac est à Lucas',
        text: 'Le disque rouge de votre sac porte le numéro de série du MASTER de Lucas.',
        condition: flag('serie_ok'),
      },
      {
        id: 'ch_n_confrontation',
        label: 'Confronter Nina',
        text: 'Vous étiez là pendant la dispute. Vous avez pris le disque malgré son refus écrit. Vous avez menti sur vos affaires, et le message de 22:05 vous a servi d’alibi. Ce disque contient le projet où vous avez créé la coupe.',
        condition: flag('pret'),
      },
    ],
  },

  /* ================================================================ */
  /* Audition d'Adrien                                                 */
  /* ================================================================ */
  {
    id: 'conv_adrien',
    title: 'Adrien Faure',
    subtitle: 'Audition · mis en cause par le film',
    kind: 'private',
    section: 'enquete',
    participants: ['adrien'],
    messages: [
      { id: 'ad01', from: 'player', text: 'Monsieur Faure, merci d’être venu.' },
      { id: 'ad02', from: 'adrien', text: 'J’avais le choix ? Je sais ce que vous pensez. Mes messages à Lucas étaient stupides.' },
      ...replies('ch_a_soiree', [
        { id: 'ad_s1', from: 'adrien', text: 'Chez moi. Je ne suis pas allé au Rialto.', effects: [statement('st_adrien_absent')] },
      ]),
      ...replies('ch_a_relance', [
        { id: 'ad_r1', from: 'adrien', text: '…' },
        { id: 'ad_r2', from: 'adrien', text: 'D’accord. J’y suis allé. Je savais que mes anciens messages me rendaient suspect.' },
        {
          id: 'ad_r3',
          from: 'adrien',
          text: 'Il m’a fait écouter l’enregistrement complet. Puis il a écrit sur son écran : « Tu avais raison. » J’ai pris l’écran en photo. Je n’y croyais plus.',
        },
        {
          id: 'ad_r4',
          from: 'adrien',
          text: 'Je suis parti vers 21 h 20. Il était vivant. Et pour la première fois, de mon côté.',
          effects: [statement('st_adrien_venu'), setFlag('adrien_venu')],
        },
      ]),
      ...replies('ch_a_menace', [
        { id: 'ad_m1', from: 'adrien', text: 'Empêcher la projection. Pas le toucher. Je sais comment ça sonne.' },
        {
          id: 'ad_m2',
          from: 'adrien',
          text: 'Ce film me fait passer pour le type qui a laissé un collègue se blesser. J’ai dit le contraire, et personne ne voulait l’entendre.',
        },
      ]),
    ],
    choices: [
      { id: 'ch_a_soiree', label: 'Où étiez-vous hier soir ?', text: 'Où étiez-vous hier soir ?' },
      {
        id: 'ch_a_relance',
        label: 'Lucas vous attendait à 21 h',
        text: 'Lucas vous attendait au Rialto à 21 h. Vous lui avez répondu « J’y serai ».',
        condition: after('ch_a_soiree'),
      },
      {
        id: 'ch_a_menace',
        label: 'Vous aviez menacé de l’arrêter vous-même',
        text: 'Vous aviez écrit à Lucas : « je viens vous arrêter moi-même ».',
        condition: after('ch_a_soiree'),
      },
    ],
  },

  /* ================================================================ */
  /* Audition de Salomé                                                */
  /* ================================================================ */
  {
    id: 'conv_salome',
    title: 'Salomé Bertin',
    subtitle: 'Audition · réalisatrice',
    kind: 'private',
    section: 'enquete',
    participants: ['salome'],
    messages: [
      { id: 'sa01', from: 'player', text: 'Madame Bertin, merci d’être venue.' },
      { id: 'sa02', from: 'salome', text: 'Je n’arrive pas à y croire. Lucas était tendu depuis des semaines, à cause des messages d’Adrien.' },
      ...replies('ch_s_soiree', [
        {
          id: 'sa_s1',
          from: 'salome',
          text: 'Au Rialto jusqu’à 20 h 50. Lucas voulait parler d’un détail de montage, je lui ai dit demain. Je n’arrête pas d’y penser.',
        },
      ]),
      ...replies('ch_s_film', [
        {
          id: 'sa_f1',
          from: 'salome',
          text: 'Oui. Personne ne m’a signalé de problème sur ce passage, à part Adrien lui-même.',
          effects: [statement('st_salome_aucun')],
        },
      ]),
      ...replies('ch_s_extrait', [
        { id: 'sa_e1', from: 'salome', text: '…' },
        {
          id: 'sa_e2',
          from: 'salome',
          text: 'Je pensais qu’Adrien essayait encore de nous faire peur. Et oui… cette séquence portait tout le film.',
        },
        {
          id: 'sa_e3',
          from: 'salome',
          text: 'Karim, l’ingénieur du son, m’avait prévenue la semaine dernière. Je n’ai pas voulu réécouter les sources.',
        },
        {
          id: 'sa_e4',
          from: 'salome',
          attachment: 'ev_historique_montage',
          text: 'Ce n’est pas moi qui ai coupé ce passage. Nina avait préparé le montage initial ; je lui avais demandé une séquence forte. Voilà l’historique du projet.',
          effects: [statement('st_salome_aveu'), setFlag('salome_aveu')],
        },
      ]),
    ],
    choices: [
      { id: 'ch_s_soiree', label: 'Où étiez-vous hier soir ?', text: 'Où étiez-vous hier soir ?' },
      {
        id: 'ch_s_film',
        label: 'Le film est-il fidèle à Adrien ?',
        text: 'Le film rapporte-t-il fidèlement ce qu’a dit Adrien ?',
        condition: after('ch_s_soiree'),
      },
      {
        id: 'ch_s_extrait',
        label: 'J’ai l’enregistrement complet',
        text: 'J’ai lu l’enregistrement complet. Adrien cite la question pour la contester.',
        condition: all(flag('acte2'), after('ch_s_soiree')),
      },
    ],
  },
];
