import type { Condition, Conversation, Effect, Message } from '../../engine/types';

const after = (choiceId: string): Condition => ({ type: 'choiceMade', choiceId });
const has = (evidenceId: string): Condition => ({ type: 'hasEvidence', evidenceId });
const found = (contradictionId: string): Condition => ({ type: 'contradictionFound', contradictionId });
const flag = (name: string): Condition => ({ type: 'flag', flag: name });
const statement = (statementId: string): Effect => ({ type: 'addStatement', statementId });
const addEvidence = (evidenceId: string): Effect => ({ type: 'addEvidence', evidenceId });
const setFlag = (name: string): Effect => ({ type: 'setFlag', flag: name });

function replies(choiceId: string, list: Omit<Message, 'condition'>[]): Message[] {
  return list.map((m) => ({ ...m, condition: after(choiceId) }));
}
function when(condition: Condition, list: Omit<Message, 'condition'>[]): Message[] {
  return list.map((m) => ({ ...m, condition }));
}
/** Messages d'archive : déjà présents dans la copie, affichés sans délai. */
function archived(list: Omit<Message, 'history'>[]): Message[] {
  return list.map((m) => ({ ...m, history: true }));
}

const ARCHIVE = { ownerId: 'elias', label: 'Copie du téléphone d’Élias' };
const FAKE = 'Je descends à pied. J’ai besoin de couper quelques jours. Ne cherchez pas à me joindre.';

export const conversations: Conversation[] = [
  /* ================================================================ */
  /* Copie du téléphone d'Élias (lecture seule)                         */
  /* ================================================================ */
  {
    id: 'arch_groupe',
    title: 'Équipe Larmont',
    subtitle: 'Marianne, Noé, Élias',
    kind: 'group',
    participants: ['marianne', 'noe'],
    archive: ARCHIVE,
    initiallyOpen: true,
    choices: [],
    messages: archived([
      { id: 'ag01', date: 'lun. 16 nov.', from: 'marianne', time: '08:12', text: 'Rappel : la galerie B reste condamnée. Aucun accès sans mon accord écrit.' },
      { id: 'ag02', date: 'lun. 16 nov.', from: 'elias', time: '08:30', text: 'Le bon 418 du 6 novembre dit l’inverse. On en parle ?' },
      { id: 'ag03', date: 'lun. 16 nov.', from: 'marianne', time: '08:41', text: 'Dans mon bureau, à 10 h.' },
      {
        id: 'ag04', date: 'jeu. 19 nov.',
        from: 'marianne',
        time: '17:55',
        text: 'Ce soir : Noé à la coupole, Élias à la maintenance, je reste à la direction pour le budget. Alerte tempête demain en fin de matinée, la route sera fermée.',
      },
      { id: 'ag05', date: 'jeu. 19 nov.', from: 'noe', time: '18:02', text: 'ça marche 🔭 ciel dégagé jusqu’à minuit normalement' },
      { id: 'ag06', date: 'jeu. 19 nov.', from: 'elias', time: '20:31', text: FAKE },
      { id: 'ag07', date: 'jeu. 19 nov.', from: 'noe', time: '20:44', text: '??? élias t’es où, il fait nuit' },
      { id: 'ag08', date: 'jeu. 19 nov.', from: 'marianne', time: '20:58', text: 'Laissons-lui de l’espace. Il en parlait depuis quelque temps.' },
      { id: 'ag09', date: 'jeu. 19 nov.', from: 'noe', time: '21:03', text: 'ok…' },
    ]),
  },
  {
    id: 'arch_camille',
    title: 'Camille',
    subtitle: 'Élias et Camille',
    kind: 'private',
    participants: ['camille'],
    archive: ARCHIVE,
    initiallyOpen: true,
    choices: [],
    messages: archived([
      { id: 'ac01', date: 'mar. 17 nov.', from: 'camille', time: '21:10', text: 'Tu viens dimanche chez maman ou c’est encore l’observatoire avant tout ?' },
      { id: 'ac02', date: 'mar. 17 nov.', from: 'elias', time: '21:25', text: 'Je ne peux pas ce week-end. Il y a un problème ici que je dois régler.' },
      { id: 'ac03', date: 'mar. 17 nov.', from: 'camille', time: '21:26', text: 'Il y a toujours un problème ici. Toujours.', effects: [addEvidence('ev_dispute')] },
      { id: 'ac04', date: 'mar. 17 nov.', from: 'camille', time: '21:27', text: 'Tu as dit que tu démissionnais. Fais-le, au lieu d’en parler.' },
      { id: 'ac05', date: 'mar. 17 nov.', from: 'elias', time: '21:40', text: 'Je vais le faire. Mais pas en laissant les choses comme ça.' },
      { id: 'ac06', date: 'mar. 17 nov.', from: 'camille', time: '21:41', text: 'Comme tu veux.' },
      { id: 'ac07', date: 'jeu. 19 nov.', from: 'elias', time: '18:20', text: 'Cam, je t’appelle demain matin. Il faut que je te raconte un truc. Pas au téléphone ce soir.' },
      { id: 'ac08', date: 'jeu. 19 nov.', from: 'camille', time: '18:21', text: 'ok. Je décroche, promis.' },
      { id: 'ac09', date: 'jeu. 19 nov.', from: 'elias', time: '20:31', text: FAKE },
      { id: 'ac10', date: 'jeu. 19 nov.', from: 'camille', time: '20:35', text: 'Élias ? Appelle-moi.' },
      { id: 'ac11', date: 'jeu. 19 nov.', from: 'camille', time: '21:50', text: 'Réponds, s’il te plaît.' },
    ]),
  },
  {
    id: 'arch_noe',
    title: 'Noé',
    subtitle: 'Élias et Noé',
    kind: 'private',
    participants: ['noe'],
    archive: ARCHIVE,
    initiallyOpen: true,
    choices: [],
    messages: archived([
      { id: 'an01', date: 'jeu. 19 nov.', from: 'noe', time: '12:40', text: 'tu manges en haut ou tu descends ?' },
      { id: 'an02', date: 'jeu. 19 nov.', from: 'elias', time: '12:41', text: 'En haut. Il reste de la soupe.' },
      {
        id: 'an03', date: 'jeu. 19 nov.',
        from: 'elias',
        time: '19:04',
        text: 'Tu peux me prêter ton badge une demi-heure ? Le mien ne passe plus la porte B depuis lundi.',
        effects: [addEvidence('ev_msg_badge')],
      },
      { id: 'an04', date: 'jeu. 19 nov.', from: 'noe', time: '19:06', text: 'euh… c’est interdit tu sais' },
      { id: 'an05', date: 'jeu. 19 nov.', from: 'noe', time: '19:06', text: 'ok. casier 7, je laisse ouvert. tu me le rends avant 21h stp, si Marianne voit ça je suis mort' },
      { id: 'an06', date: 'jeu. 19 nov.', from: 'elias', time: '19:07', text: 'Merci. Je t’expliquerai.' },
      { id: 'an07', date: 'jeu. 19 nov.', from: 'noe', time: '21:12', text: 'tu me rends mon badge quand ?' },
      { id: 'an08', date: 'jeu. 19 nov.', from: 'noe', time: '21:40', text: 'élias ?' },
    ]),
  },
  {
    id: 'arch_marianne',
    title: 'Marianne Keller',
    subtitle: 'Élias et Marianne',
    kind: 'private',
    participants: ['marianne'],
    archive: ARCHIVE,
    initiallyOpen: true,
    choices: [],
    messages: archived([
      {
        id: 'am01', date: 'lun. 16 nov.',
        from: 'elias',
        time: '10:52',
        text: 'Je maintiens ce que j’ai dit ce matin. Les rapports ne correspondent pas à ce qui se passe dans la galerie B.',
      },
      {
        id: 'am02', date: 'lun. 16 nov.',
        from: 'marianne',
        time: '11:05',
        text: 'Vous mesurez mal les conséquences. Si l’observatoire ferme, c’est trente ans de mesures qui s’arrêtent, et quatre emplois. Le vôtre compris.',
      },
      {
        id: 'am03', date: 'lun. 16 nov.',
        from: 'marianne',
        time: '11:06',
        text: 'Votre accès à la galerie B est suspendu le temps que nous clarifiions la situation.',
        effects: [addEvidence('ev_msg_acces')],
      },
      { id: 'am04', date: 'lun. 16 nov.', from: 'elias', time: '11:20', text: 'Ce n’est pas la question. La porte B peut enfermer quelqu’un.' },
      { id: 'am05', date: 'jeu. 19 nov.', from: 'elias', time: '19:50', text: 'Je vais documenter la galerie B. Vous aurez les photos avant tout le monde.' },
    ]),
  },

  /* ================================================================ */
  /* Notes d'Alex                                                      */
  /* ================================================================ */
  {
    id: 'conv_notes',
    title: 'Notes · Vérifications',
    kind: 'notes',
    participants: [],
    initiallyOpen: true,
    messages: [
      {
        id: 'n01',
        from: 'system',
        text: 'Copie du téléphone d’Élias ouverte. Dernière synchronisation : jeudi 19 novembre à 22:14. Rien de ce qui s’est passé après n’y figure.',
      },
      {
        id: 'n02',
        from: 'system',
        text: 'Je lis ses messages, ses photos, ses notes et ses fichiers. Quand j’écris à quelqu’un, c’est moi, Alex, qui écris.',
      },
      ...replies('ch_notes_sauvegarde', [
        {
          id: 'n_sauv_1',
          from: 'system',
          attachment: 'ev_sauvegarde',
          text: 'Le rapport du service de sauvegarde détaille la soirée de jeudi : état de charge, réseau, envois.',
        },
        {
          id: 'n_sauv_2',
          from: 'system',
          text: 'Borne BT-01 de 18:47 à 22:14, toujours en charge. Et le message de 20:31 part de là. À comparer avec ce que disent les autres.',
        },
      ]),
      ...replies('ch_notes_descente', [
        {
          id: 'n_desc_1',
          from: 'system',
          text: 'Du col au village : trois heures et demie de sentier, dont une heure sur une arête exposée. De nuit, en novembre, avec une tempête annoncée.',
        },
        { id: 'n_desc_2', from: 'system', text: 'Élias connaît ce sentier par cœur. Il sait mieux que personne que c’est une mauvaise idée.' },
      ]),
    ],
    choices: [
      {
        id: 'ch_notes_descente',
        label: 'Évaluer la descente à pied',
        text: 'Évaluer la descente à pied depuis l’observatoire.',
      },
      {
        id: 'ch_notes_sauvegarde',
        label: 'Ouvrir le rapport de sauvegarde',
        text: 'Ouvrir le rapport du service de sauvegarde.',
        condition: flag('camille_insiste'),
      },
    ],
  },

  /* ================================================================ */
  /* Camille — chaleureuse, directe, inquiète                          */
  /* ================================================================ */
  {
    id: 'conv_camille',
    title: 'Camille Varin',
    kind: 'private',
    participants: ['camille'],
    initiallyOpen: true,
    messages: [
      { id: 'ca01', from: 'camille', time: '06:48', text: 'Alex, c’est moi. Tu as reçu l’accès à la copie de son téléphone ?' },
      {
        id: 'ca02',
        from: 'camille',
        time: '06:48',
        text: 'Élias t’avait mis comme contact de secours pour sa sauvegarde. Le service te l’a ouverte ce matin, moi je n’ai rien pu faire.',
      },
      { id: 'ca03', from: 'camille', time: '06:49', text: 'Hier soir à 20:31, il a envoyé ça au groupe de l’observatoire et à moi :' },
      { id: 'ca04', from: 'camille', time: '06:49', text: `« ${FAKE} »`, effects: [statement('st_elias_message')] },
      {
        id: 'ca05',
        from: 'camille',
        time: '06:50',
        text: 'Ses collègues pensent qu’il est parti de lui-même. Moi je n’y crois pas. Ce message ne lui ressemble pas.',
      },
      {
        id: 'ca06',
        from: 'camille',
        time: '06:51',
        text: 'Je t’ai transmis les numéros de Noé et de Marianne, sa cheffe. Ils savent que tu es son frère et que c’est toi qui vas leur écrire.',
        effects: [
          { type: 'openConversation', conversationId: 'conv_noe' },
          { type: 'openConversation', conversationId: 'conv_marianne' },
        ],
      },
      { id: 'ca07', from: 'camille', time: '06:51', text: 'La tempête arrive vers 11 h. Après, plus personne ne pourra monter là-haut.' },
      ...replies('ch_ca_pourquoi', [
        {
          id: 'ca_p1',
          from: 'camille',
          text: 'Il ne dit jamais « ne cherchez pas ». Quand il est fâché, il ne répond plus, c’est tout. Il ne fait pas d’annonce.',
        },
        {
          id: 'ca_p2',
          from: 'camille',
          text: 'Et il m’appelle Cam. Là, il a écrit la même phrase au groupe et à moi, mot pour mot. Comme un communiqué.',
        },
        {
          id: 'ca_p3',
          from: 'camille',
          text: 'Il m’avait promis de m’appeler ce matin. Il avait quelque chose à me raconter. Continue à chercher, s’il te plaît.',
          effects: [setFlag('camille_insiste')],
        },
      ]),
      ...replies('ch_ca_demission', [
        { id: 'ca_d1', from: 'camille', text: 'Oui. Il me l’a dit mardi. Il en avait assez de Marianne, des rapports, de tout.' },
        { id: 'ca_d2', from: 'camille', text: 'Donc oui, partir, c’est possible. Mais pas comme ça. Pas en pleine nuit, pas avant de m’avoir appelée.' },
      ]),
      ...replies('ch_ca_semaine', [
        { id: 'ca_s1', from: 'camille', text: 'Normalement. Rien de particulier.', effects: [statement('st_camille_rien')] },
        { id: 'ca_s2', from: 'camille', text: 'Pourquoi tu demandes ?' },
      ]),
      ...replies('ch_ca_dispute', [
        { id: 'ca_v1', from: 'camille', text: '…' },
        {
          id: 'ca_v2',
          from: 'camille',
          text: 'Oui. On s’est disputés. Je lui ai reproché de toujours faire passer l’observatoire avant nous.',
        },
        {
          id: 'ca_v3',
          from: 'camille',
          text: 'Il m’a répondu qu’il ne partirait pas « en laissant les choses comme ça ». Je n’ai pas cherché à comprendre.',
          effects: [statement('st_camille_dispute')],
        },
        { id: 'ca_v4', from: 'camille', text: 'La dernière chose que je lui ai écrite, c’est « Comme tu veux ». Voilà pourquoi je ne lâche pas.' },
      ]),
      ...replies('ch_ca_polaire', [
        { id: 'ca_f1', from: 'camille', text: 'Sa polaire bleue ? Il la porte même en été, là-haut.' },
        { id: 'ca_f2', from: 'camille', text: 'Il ne serait jamais descendu de nuit sans elle. Jamais.' },
      ]),
      ...when(flag('secours_ok'), [
        { id: 'ca_fin1', from: 'camille', text: 'Alex.' },
        { id: 'ca_fin2', from: 'camille', text: 'Il m’a écrit, depuis le téléphone d’un secouriste :' },
        { id: 'ca_fin3', from: 'camille', text: '« Je suis avec les secours. Je te rappelle dès que je peux. »' },
        { id: 'ca_fin4', from: 'camille', text: 'Je n’arrête pas de relire ces deux lignes.' },
      ]),
      ...replies('ch_ca_fin', [
        { id: 'ca_fin5', from: 'camille', text: 'Merci. Vraiment.' },
        { id: 'ca_fin6', from: 'camille', text: 'Je pars pour l’hôpital de Sion. On s’y retrouve ?' },
      ]),
    ],
    choices: [
      { id: 'ch_ca_pourquoi', label: 'Pourquoi ce message ne lui ressemble pas ?', text: 'Pourquoi tu dis que ce message ne lui ressemble pas ?' },
      { id: 'ch_ca_demission', label: 'Il voulait démissionner ?', text: 'Il t’avait parlé de démissionner ?' },
      {
        id: 'ch_ca_semaine',
        label: 'Vous vous étiez parlé cette semaine ?',
        text: 'Vous vous étiez parlé cette semaine, tous les deux ?',
        condition: after('ch_ca_pourquoi'),
      },
      {
        id: 'ch_ca_dispute',
        label: 'J’ai lu vos messages de mardi',
        text: 'Camille, la copie contient vos messages de mardi soir.',
        locked: true,
      },
      {
        id: 'ch_ca_polaire',
        label: 'Sa polaire est restée au bureau',
        text: 'Noé m’a envoyé une photo du bureau à 22:31. Sa polaire est restée sur la chaise.',
        condition: has('ev_photo_bureau'),
      },
      { id: 'ch_ca_fin', label: 'Il va bien. Ils le ramènent.', text: 'Il va bien. Ils le ramènent en bas.', condition: flag('secours_ok') },
    ],
  },

  /* ================================================================ */
  /* Noé — jeune, nerveux, minuscules                                  */
  /* ================================================================ */
  {
    id: 'conv_noe',
    title: 'Noé Brunner',
    kind: 'private',
    participants: ['noe'],
    messages: [
      { id: 'no01', from: 'player', text: 'Salut Noé, c’est Alex, le frère d’Élias. Camille m’a donné ton numéro.' },
      { id: 'no02', from: 'noe', text: 'salut… oui elle m’a prévenu. je suis désolé pour ton frère' },
      {
        id: 'no03',
        from: 'noe',
        text: 'franchement je sais pas quoi te dire. son message était bizarre mais Marianne dit qu’il voulait partir depuis longtemps',
      },
      ...replies('ch_noe_soiree', [
        { id: 'no_s1', from: 'noe', text: 'à la coupole, toute la soirée. nuit d’observation' },
        {
          id: 'no_s2',
          from: 'noe',
          text: 'je suis pas passé au bureau technique, j’ai rien vu de spécial',
          effects: [statement('st_noe_soiree')],
        },
      ]),
      ...replies('ch_noe_elias', [
        { id: 'no_e1', from: 'noe', text: 'tendu. il s’est pris la tête avec Marianne lundi, à propos de la galerie B' },
        { id: 'no_e2', from: 'noe', text: 'il disait que les rapports c’était du vent. moi j’évite ces sujets, je suis en CDD' },
      ]),
      ...replies('ch_noe_vu', [
        { id: 'no_v1', from: 'noe', text: '…' },
        { id: 'no_v2', from: 'noe', text: 'ok. j’y suis passé vers 20h45, pour le café. son tel était sur le bureau, branché' },
        {
          id: 'no_v3',
          from: 'noe',
          text: 'au bureau il se déverrouille tout seul, il avait mis la pièce en « lieu de confiance ». il le laissait toujours traîner là',
          effects: [statement('st_noe_vu')],
        },
        { id: 'no_v4', from: 'noe', text: 'j’ai rien dit parce que… j’ai paniqué. ça faisait de moi le dernier à avoir vu ses affaires' },
        {
          id: 'no_v5',
          from: 'noe',
          attachment: 'ev_photo_bureau',
          text: 'je suis repassé à 22h30. le tel était plus là. mais sa polaire si. j’ai pris une photo pour le chambrer, je l’ai jamais envoyée',
        },
      ]),
      ...replies('ch_noe_badge', [
        { id: 'no_b1', from: 'noe', text: 'dans mon casier, comme d’hab', effects: [statement('st_noe_badge')] },
        { id: 'no_b2', from: 'noe', text: 'pourquoi ?' },
      ]),
      ...replies('ch_noe_aveu', [
        { id: 'no_a1', from: 'noe', text: '…' },
        { id: 'no_a2', from: 'noe', text: 'oui. je lui ai prêté. c’est interdit, je sais' },
        {
          id: 'no_a3',
          from: 'noe',
          text: 'il voulait passer la porte B. il m’a dit une demi-heure. il me l’a jamais rendu',
          effects: [statement('st_noe_aveu')],
        },
        { id: 'no_a4', from: 'noe', text: 'j’ai un compte technicien, je peux exporter le journal des accès. et mon journal de coupole, pour que tu voies où j’étais' },
        { id: 'no_a5', from: 'noe', attachment: 'ev_journal_acces', text: 'voilà le journal des accès, export de 06:58' },
        { id: 'no_a6', from: 'noe', attachment: 'ev_journal_coupole', text: 'et la coupole' },
        { id: 'no_a7', from: 'noe', text: 'je comprends pas la moitié de ce journal. dis-moi ce que tu vois' },
      ]),
      ...replies('ch_noe_dir', [
        { id: 'no_d1', from: 'noe', text: 'DIR-01 c’est le poste de la direction. l’ordi du bureau de Marianne' },
        { id: 'no_d2', from: 'noe', text: 'n’importe qui peut s’y asseoir hein. mais hier soir on était trois, et ton frère était à la porte B' },
        { id: 'no_d3', from: 'noe', text: 'le badge DIR c’est celui de Marianne. elle le prête jamais, elle l’a autour du cou' },
      ]),
      ...replies('ch_noe_interphone', [
        { id: 'no_i1', from: 'noe', text: 'c’est un interphone de secours. il appelle que le poste de direction' },
        { id: 'no_i2', from: 'noe', text: 'pour qu’il sonne depuis la galerie B, il faut que quelqu’un soit dedans et appuie sur le bouton' },
        { id: 'no_i3', from: 'noe', text: 'attends. 05:12 ?? ça fait même pas deux heures' },
      ]),
      ...when({ type: 'solved' }, [
        { id: 'no_fin1', from: 'noe', text: 'Marianne vient de partir en voiture vers la vallée. elle avait l’air… je sais pas' },
        { id: 'no_fin2', from: 'noe', text: 'si les secours ont besoin de quelqu’un sur place, je suis là. je les attends à l’accès qu’ils veulent' },
      ]),
    ],
    choices: [
      { id: 'ch_noe_soiree', label: 'Tu étais où hier soir ?', text: 'Tu étais où, hier soir ?' },
      { id: 'ch_noe_elias', label: 'Comment il était, ces derniers jours ?', text: 'Comment il était, ces derniers jours ?' },
      {
        id: 'ch_noe_vu',
        label: 'Son téléphone est resté au bureau',
        text: 'La sauvegarde montre que son téléphone est resté en charge au bureau technique jusqu’à 22:14. Tu es sûr de ne pas y être passé ?',
        condition: found('c_tel'),
      },
      {
        id: 'ch_noe_badge',
        label: 'Ton badge était où hier soir ?',
        text: 'Ton badge technique, il était où hier soir ?',
        condition: after('ch_noe_vu'),
      },
      {
        id: 'ch_noe_aveu',
        label: 'Élias t’a demandé ton badge à 19:04',
        text: 'J’ai lu son message de 19:04 dans la copie. Il t’a demandé ton badge, et tu as dit oui.',
        locked: true,
      },
      {
        id: 'ch_noe_dir',
        label: 'C’est quoi, DIR-01 ?',
        text: 'Dans le journal, « poste DIR-01 » et « badge DIR-01 », c’est quoi ?',
        condition: has('ev_journal_acces'),
      },
      {
        id: 'ch_noe_interphone',
        label: 'Qui peut appeler par l’interphone de la galerie B ?',
        text: 'Le journal montre des appels de l’interphone de la galerie B. Qui peut faire ça ?',
        condition: has('ev_journal_acces'),
      },
    ],
  },

  /* ================================================================ */
  /* Marianne — calme, précise, vouvoiement                            */
  /* ================================================================ */
  {
    id: 'conv_marianne',
    title: 'Marianne Keller',
    kind: 'private',
    participants: ['marianne'],
    messages: [
      { id: 'ma01', from: 'player', text: 'Bonjour Marianne, je suis Alex, le frère d’Élias. Camille m’a transmis votre numéro.' },
      { id: 'ma02', from: 'marianne', text: 'Bonjour Alex. Je suis navrée que vous viviez cela.' },
      {
        id: 'ma03',
        from: 'marianne',
        text: 'Élias traversait une période difficile. Je comprends votre inquiétude, mais son message me semble assez clair.',
      },
      ...replies('ch_m_depart', [
        {
          id: 'ma_d1',
          from: 'marianne',
          text: 'Lundi, oui. Nous avons eu un désaccord professionnel, assez vif. Il m’a dit qu’il ne se voyait plus ici.',
        },
        {
          id: 'ma_d2',
          from: 'marianne',
          text: 'Son message d’hier ne m’a pas surprise. J’aurais préféré qu’il parte autrement, pour lui.',
          effects: [statement('st_m_depart')],
        },
      ]),
      ...replies('ch_m_telephone', [
        { id: 'ma_t1', from: 'marianne', text: 'Je suis passée au bureau technique vers 20 h pour lui parler. Il n’y était plus.' },
        {
          id: 'ma_t2',
          from: 'marianne',
          text: 'Son téléphone non plus, d’ailleurs. Il l’avait emporté, j’imagine.',
          effects: [statement('st_m_telephone')],
        },
      ]),
      ...replies('ch_m_galerie', [
        {
          id: 'ma_g1',
          from: 'marianne',
          text: 'Rien. La galerie B est condamnée depuis 2019. Personne n’y entre, c’est écrit dans chacun de nos rapports.',
          effects: [statement('st_m_galerie')],
        },
        { id: 'ma_g2', from: 'marianne', text: 'Élias s’était mis en tête le contraire. Je crains que ce soit lié à sa fatigue.' },
      ]),
      ...replies('ch_m_soiree', [
        {
          id: 'ma_s1',
          from: 'marianne',
          text: 'À mon bureau de direction, sur le budget, de 20 h à minuit. Je n’en ai pas bougé.',
          effects: [statement('st_m_soiree')],
        },
        { id: 'ma_s2', from: 'marianne', text: 'Je sais que cela ressemble à une soirée sans intérêt. C’en était une.' },
      ]),
      ...replies('ch_m_porte', [
        { id: 'ma_p1', from: 'marianne', text: 'Ce système se déclenche parfois seul quand l’alimentation faiblit. Il y a eu une coupure hier soir.' },
        {
          id: 'ma_p2',
          from: 'marianne',
          text: 'Personne n’a touché aux commandes de porte. Je l’aurais su.',
          effects: [statement('st_m_porte')],
        },
      ]),
      ...replies('ch_m_bon', [
        { id: 'ma_b1', from: 'marianne', text: 'Une intervention ponctuelle, pour la coupole. Rien qui change l’état général de la galerie.' },
        { id: 'ma_b2', from: 'marianne', text: 'Vous n’êtes pas technicien, Alex. Ces documents demandent du contexte.' },
      ]),
      ...replies('ch_m_pression', [
        { id: 'ma_x1', from: 'marianne', text: 'Je vous conseille de bien réfléchir à ce que vous affirmez.' },
        { id: 'ma_x2', from: 'marianne', text: 'Si vous voulez m’accuser de quelque chose, faites-le avec des faits.' },
      ]),
      ...when({ type: 'solved' }, [
        { id: 'ma_c1', from: 'marianne', text: '…' },
        { id: 'ma_c2', from: 'marianne', text: 'Oui. C’est moi qui ai écrit ce message, depuis son téléphone.' },
        {
          id: 'ma_c3',
          from: 'marianne',
          text: 'Je l’ai vu entrer dans la galerie B sur la caméra du couloir, avec l’appareil photo de service. J’ai verrouillé la porte depuis mon poste. Je voulais lui parler avant qu’il ressorte avec ses photos.',
        },
        {
          id: 'ma_c4',
          from: 'marianne',
          text: 'Puis il y a eu la coupure, à 20:52. La commande ne répondait plus. La poignée intérieure ne marche pas, vous le savez déjà.',
        },
        {
          id: 'ma_c5',
          from: 'marianne',
          text: 'À 21:20, il m’a appelée par l’interphone de secours. J’ai décroché. Je lui ai dit que je m’en occupais.',
        },
        {
          id: 'ma_c6',
          from: 'marianne',
          text: 'J’ai essayé de réarmer l’alimentation, deux fois. J’aurais dû appeler les secours à ce moment-là. Je ne l’ai pas fait.',
        },
        {
          id: 'ma_c7',
          from: 'marianne',
          text: 'Il est dans la galerie. Les secours devront passer par l’accès sud, c’est l’entrée principale du niveau technique.',
        },
        {
          id: 'ma_c8',
          from: 'marianne',
          text: 'Je descends me présenter à la gendarmerie.',
          effects: [{ type: 'openConversation', conversationId: 'conv_secours' }, setFlag('aveu')],
        },
      ]),
    ],
    choices: [
      {
        id: 'ch_m_depart',
        label: 'Il vous avait parlé de partir ?',
        text: 'Il vous avait parlé de partir ?',
        condition: { type: 'not', condition: { type: 'solved' } },
      },
      {
        id: 'ch_m_telephone',
        label: 'Son téléphone était où, hier soir ?',
        text: 'Savez-vous où était son téléphone, hier soir ?',
        condition: { type: 'all', conditions: [flag('camille_insiste'), { type: 'not', condition: { type: 'solved' } }] },
      },
      {
        id: 'ch_m_galerie',
        label: 'Que se passe-t-il dans la galerie B ?',
        text: 'Que se passe-t-il, dans la galerie B ?',
        condition: { type: 'all', conditions: [after('ch_noe_vu'), { type: 'not', condition: { type: 'solved' } }] },
      },
      {
        id: 'ch_m_soiree',
        label: 'Où étiez-vous hier soir ?',
        text: 'Où étiez-vous, hier soir ?',
        condition: { type: 'all', conditions: [after('ch_m_galerie'), { type: 'not', condition: { type: 'solved' } }] },
      },
      {
        id: 'ch_m_porte',
        label: 'La porte B a été verrouillée à 20:12',
        text: 'Le journal des accès montre la porte B verrouillée à 20:12.',
        condition: { type: 'all', conditions: [has('ev_journal_acces'), { type: 'not', condition: { type: 'solved' } }] },
      },
      {
        id: 'ch_m_bon',
        label: 'Le bon 418 porte votre signature',
        text: 'Le bon d’intervention 418 du 6 novembre, dans la galerie B, porte votre signature.',
        locked: true,
        condition: { type: 'not', condition: { type: 'solved' } },
      },
      {
        id: 'ch_m_pression',
        label: 'Vos déclarations ne tiennent pas',
        text: 'Vos déclarations ne tiennent pas, Marianne. Le journal dit autre chose.',
        condition: {
          type: 'all',
          conditions: [found('c_soiree'), found('c_porte'), { type: 'not', condition: { type: 'solved' } }],
        },
      },
    ],
  },

  /* ================================================================ */
  /* Secours (conversation fictive)                                    */
  /* ================================================================ */
  {
    id: 'conv_secours',
    title: 'Secours en montagne',
    subtitle: 'Centrale de coordination',
    kind: 'private',
    participants: ['secours'],
    messages: [
      { id: 'se01', from: 'player', text: 'Bonjour, ici Alex Varin. Mon frère Élias est enfermé à l’observatoire du Larmont depuis hier soir.' },
      {
        id: 'se02',
        from: 'secours',
        text: 'Bien reçu, Alex. Une équipe part de la vallée maintenant, avant la tempête. Il nous faut trois informations précises pour ne pas perdre de temps sur place.',
      },
      { id: 'se03', from: 'secours', text: 'D’abord : où se trouve-t-il exactement ?' },
      ...replies('ch_se_lieu_a', [
        {
          id: 'se_la',
          from: 'secours',
          text: 'Le journal des accès ne montre aucune activité dans la galerie A. Toutes les traces concernent la porte B et l’interphone de la galerie B. Pouvez-vous vérifier ?',
        },
      ]),
      ...replies('ch_se_lieu_sentier', [
        {
          id: 'se_ls',
          from: 'secours',
          text: 'Son téléphone n’a jamais quitté le bureau, et l’interphone de la galerie B a appelé à 05:12. Le sentier ne correspond à aucune trace. Pouvez-vous vérifier ?',
        },
      ]),
      ...replies('ch_se_lieu_b', [
        { id: 'se_lb1', from: 'secours', text: 'Galerie B, section inférieure, derrière la porte B. Noté.' },
        { id: 'se_lb2', from: 'secours', text: 'Ensuite : par quel accès devons-nous entrer ?', effects: [setFlag('se_lieu')] },
      ]),
      ...replies('ch_se_acces_sud', [
        {
          id: 'se_as',
          from: 'secours',
          text: 'D’après le plan, l’accès sud dessert la galerie A. Sans courant, les portes coupe-feu du couloir central restent fermées : on ne rejoindrait pas la galerie B par là.',
        },
      ]),
      ...replies('ch_se_acces_principal', [
        {
          id: 'se_ap',
          from: 'secours',
          text: 'L’entrée principale mène au couloir central, coupé par les portes coupe-feu tant que l’alimentation est hors service.',
        },
      ]),
      ...replies('ch_se_acces_nord', [
        { id: 'se_an1', from: 'secours', text: 'Accès de secours nord, directement dans la galerie B. Noté.' },
        { id: 'se_an2', from: 'secours', text: 'Dernière question : comment ouvrir la porte B ?', effects: [setFlag('se_acces')] },
      ]),
      ...replies('ch_se_porte_distance', [
        {
          id: 'se_pd',
          from: 'secours',
          text: 'Le journal indique « commande distante indisponible » depuis 20:53, et le disjoncteur n’a pas pu être réarmé. On ne peut pas compter dessus.',
        },
      ]),
      ...replies('ch_se_porte_poignee', [
        {
          id: 'se_pp',
          from: 'secours',
          text: 'La poignée intérieure est signalée défectueuse depuis le 27 octobre, et elle ne commande pas le verrou électrique. Nous serons de l’autre côté de la porte, de toute façon.',
        },
      ]),
      ...replies('ch_se_porte_manuel', [
        {
          id: 'se_pm1',
          from: 'secours',
          text: 'Trappe du boîtier côté nord, clé carrée de 8. Nous en avons une. Équipe engagée par l’accès de secours nord.',
          effects: [setFlag('se_porte'), { type: 'setClock', time: '09:24' }],
        },
        { id: 'se_pm_t', from: 'system', text: 'Les secours montent depuis la vallée.' },
        { id: 'se_pm2', from: 'secours', effects: [{ type: 'setClock', time: '09:31' }], text: 'L’équipe est dans la galerie B, devant la porte B. Ouverture manuelle en cours.' },
        {
          id: 'se_pm3',
          from: 'secours',
          text: 'Porte ouverte. Élias est conscient. Hypothermie légère, déshydraté, il parle normalement.',
        },
        {
          id: 'se_pm4',
          from: 'secours',
          text: 'Il avait gardé l’appareil photo de service. Il demande qu’on prévienne sa sœur. Un secouriste lui prête son téléphone.',
          effects: [setFlag('secours_ok'), { type: 'setClock', time: '09:40' }, { type: 'openConversation', conversationId: 'conv_elias' }],
        },
      ]),
    ],
    choices: [
      { id: 'ch_se_lieu_a', label: 'Dans la galerie A', condition: { type: 'not', condition: flag('se_lieu') }, mistake: 'Secours : galerie A' },
      {
        id: 'ch_se_lieu_sentier',
        label: 'Sur le sentier de descente',
        condition: { type: 'not', condition: flag('se_lieu') },
        mistake: 'Secours : sentier',
      },
      {
        id: 'ch_se_lieu_b',
        label: 'Galerie B, derrière la porte B',
        text: 'Dans la galerie B, dans la section inférieure, derrière la porte B.',
        condition: { type: 'not', condition: flag('se_lieu') },
      },
      {
        id: 'ch_se_acces_sud',
        label: 'Par l’accès sud',
        condition: { type: 'all', conditions: [flag('se_lieu'), { type: 'not', condition: flag('se_acces') }] },
        mistake: 'Secours : accès sud',
      },
      {
        id: 'ch_se_acces_principal',
        label: 'Par l’entrée principale',
        condition: { type: 'all', conditions: [flag('se_lieu'), { type: 'not', condition: flag('se_acces') }] },
        mistake: 'Secours : entrée principale',
      },
      {
        id: 'ch_se_acces_nord',
        label: 'Par l’accès de secours nord',
        condition: { type: 'all', conditions: [flag('se_lieu'), { type: 'not', condition: flag('se_acces') }] },
      },
      {
        id: 'ch_se_porte_distance',
        label: 'Commande à distance depuis la direction',
        condition: { type: 'all', conditions: [flag('se_acces'), { type: 'not', condition: flag('se_porte') }] },
        mistake: 'Secours : commande à distance',
      },
      {
        id: 'ch_se_porte_poignee',
        label: 'Forcer la poignée intérieure',
        condition: { type: 'all', conditions: [flag('se_acces'), { type: 'not', condition: flag('se_porte') }] },
        mistake: 'Secours : poignée',
      },
      {
        id: 'ch_se_porte_manuel',
        label: 'Déverrouillage manuel, clé carrée de 8',
        text: 'Déverrouillage manuel : trappe du boîtier côté nord, avec une clé carrée de 8.',
        condition: { type: 'all', conditions: [flag('se_acces'), { type: 'not', condition: flag('se_porte') }] },
      },
    ],
  },

  /* ================================================================ */
  /* Élias — la dernière conversation, sobre                           */
  /* ================================================================ */
  {
    id: 'conv_elias',
    title: 'Élias Varin',
    subtitle: 'Depuis le téléphone d’un secouriste',
    kind: 'private',
    participants: ['elias'],
    messages: [
      { id: 'el01', from: 'elias', text: 'Alex. C’est moi.' },
      { id: 'el02', from: 'elias', text: 'On m’a dit que c’est toi qui leur as dit par où passer.' },
      ...replies('ch_el_ca_va', [
        { id: 'el_c1', from: 'elias', text: 'Froid. Fatigué. Ça va aller.' },
        { id: 'el_c2', from: 'elias', text: 'J’ai gardé l’appareil photo. Tout ce qu’il faut est dessus.' },
      ]),
      ...replies('ch_el_camille', [
        { id: 'el_k1', from: 'elias', text: 'Je sais. Moi aussi.' },
        { id: 'el_k2', from: 'elias', text: 'On en parlera tous les trois. Pas par message.' },
      ]),
      ...replies('ch_el_fin', [
        { id: 'el_f1', from: 'elias', text: 'D’accord.' },
        { id: 'el_f2', from: 'elias', text: 'Merci, Alex.', effects: [setFlag('retrouvailles')] },
      ]),
    ],
    choices: [
      { id: 'ch_el_ca_va', label: 'Comment tu te sens ?', text: 'Comment tu te sens ?' },
      { id: 'ch_el_camille', label: 'Camille s’en veut', text: 'Camille s’en veut, pour mardi.', condition: after('ch_el_ca_va') },
      { id: 'ch_el_fin', label: 'Repose-toi. On arrive.', text: 'Repose-toi. On arrive.', condition: after('ch_el_camille') },
    ],
  },
];
