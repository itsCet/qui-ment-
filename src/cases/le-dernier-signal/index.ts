import type { Case } from '../../engine/types';
import { conversations } from './conversations';
import { evidence, initialEvidence } from './evidence';
import { suspects } from './suspects';

const found = (contradictionId: string) => ({ type: 'contradictionFound', contradictionId }) as const;
const knows = (statementId: string) => ({ type: 'knowsStatement', statementId }) as const;
const has = (evidenceId: string) => ({ type: 'hasEvidence', evidenceId }) as const;
const flag = (name: string) => ({ type: 'flag', flag: name }) as const;

export const leDernierSignal: Case = {
  id: 'le-dernier-signal',
  title: 'Le dernier signal',
  tagline: 'Ton frère a disparu dans la montagne. Son téléphone, lui, n’a pas bougé.',
  duration: '15 à 20 min',
  difficulty: 'Thriller',
  playerName: 'Alex',
  intro: [
    'Vendredi 20 novembre, 6 h 50. Tu es Alex. Ton frère Élias, technicien à l’observatoire du Larmont, à 2 870 mètres, a envoyé hier soir à 20:31 un message à son équipe et à votre sœur Camille.',
    '« Je descends à pied. J’ai besoin de couper quelques jours. Ne cherchez pas à me joindre. » Depuis, son téléphone est éteint.',
    'Ses collègues pensent qu’il est parti de lui-même. Camille n’y croit pas. Élias t’avait désigné comme contact de secours de sa sauvegarde : tu as accès à une copie de son téléphone, synchronisée pour la dernière fois jeudi à 22:14.',
    'Dans cette copie, tu lis ses messages, ses photos, ses notes et ses fichiers. Quand tu écris à Camille, à Noé ou à Marianne, c’est toi, Alex, qui écris. Une tempête est annoncée vers 11 h.',
  ],
  clock: { start: '06:52', perChoiceMinutes: 2, max: '10:50', deadlineLabel: 'Tempête annoncée vers 11:00' },
  device: {
    ownerName: 'Alex',
    date: { weekday: 'Vendredi', day: '20', month: 'novembre' },
    weather: { city: 'Col du Larmont', temperature: '−6°', condition: 'Tempête dès 11 h' },
    event: { title: 'Élias devait appeler Camille', time: '08:00' },
    copy: { ownerName: 'Élias', syncedAt: 'jeu. 19 nov. à 22:14' },
    apps: [
      {
        id: 'sauvegarde',
        label: 'Sauvegarde',
        icon: 'cloud',
        evidenceId: 'ev_sauvegarde',
        openChoiceId: 'ch_notes_sauvegarde',
        lockedText:
          'Le rapport détaillé de la sauvegarde d’Élias : charge, réseau, envois. Avant de fouiller, demande à Camille pourquoi elle doute du message.',
      },
    ],
  },
  suspects,
  conversations,
  evidence,
  initialEvidence,

  statements: [
    {
      id: 'st_elias_message',
      suspectId: 'elias',
      text: 'Je descends à pied. J’ai besoin de couper quelques jours. Ne cherchez pas à me joindre.',
      context: 'Message envoyé depuis le téléphone d’Élias jeudi à 20:31',
    },
    { id: 'st_camille_rien', suspectId: 'camille', text: 'On s’était parlé normalement cette semaine. Rien de particulier.', context: 'Camille' },
    {
      id: 'st_camille_dispute',
      suspectId: 'camille',
      text: 'On s’est disputés mardi. Je lui ai reproché de faire passer l’observatoire avant nous.',
      context: 'Camille, après confrontation',
    },
    { id: 'st_noe_soiree', suspectId: 'noe', text: 'J’ai passé la soirée à la coupole. Je ne suis pas passé au bureau technique.', context: 'Noé' },
    {
      id: 'st_noe_vu',
      suspectId: 'noe',
      text: 'Vers 20 h 45, son téléphone était en charge sur le bureau. À 22 h 30, il n’y était plus, mais sa polaire si.',
      context: 'Noé, après confrontation',
    },
    { id: 'st_noe_badge', suspectId: 'noe', text: 'Mon badge était dans mon casier, comme d’habitude.', context: 'Noé' },
    {
      id: 'st_noe_aveu',
      suspectId: 'noe',
      text: 'J’ai prêté mon badge TECH-07 à Élias vers 19 h, pour la porte B. Il ne me l’a jamais rendu.',
      context: 'Noé, après confrontation',
    },
    { id: 'st_m_depart', suspectId: 'marianne', text: 'Il m’a dit lundi qu’il ne se voyait plus ici. Son message ne m’a pas surprise.', context: 'Marianne' },
    {
      id: 'st_m_telephone',
      suspectId: 'marianne',
      text: 'Quand je suis passée au bureau technique vers 20 h, son téléphone n’y était plus. Il l’avait emporté.',
      context: 'Marianne',
    },
    {
      id: 'st_m_galerie',
      suspectId: 'marianne',
      text: 'La galerie B est condamnée depuis 2019. Personne n’y entre, c’est écrit dans chacun de nos rapports.',
      context: 'Marianne',
    },
    {
      id: 'st_m_soiree',
      suspectId: 'marianne',
      text: 'J’étais à mon bureau de direction de 20 h à minuit. Je n’en ai pas bougé.',
      context: 'Marianne',
    },
    {
      id: 'st_m_porte',
      suspectId: 'marianne',
      text: 'Le verrouillage s’est déclenché seul avec la coupure. Personne n’a touché aux commandes de porte.',
      context: 'Marianne',
    },
  ],

  contradictions: [
    {
      id: 'c_tel',
      statementId: 'st_m_telephone',
      evidenceIds: ['ev_sauvegarde'],
      title: 'Le téléphone n’a pas quitté le bureau',
      explanation:
        'Marianne dit que le téléphone n’était plus au bureau technique vers 20 h. La sauvegarde montre l’inverse : branché sur la borne BT-01 du bureau, sans interruption, de 18:47 à 22:16. Quelqu’un d’autre a peut-être vu ce téléphone. Une nouvelle question est disponible pour Noé.',
    },
    {
      id: 'c_message',
      statementId: 'st_elias_message',
      evidenceIds: ['ev_sauvegarde', 'ev_photo_bureau'],
      title: 'Le message ne part pas d’un sentier',
      explanation:
        'Le message de 20:31 part d’un téléphone branché au bureau technique, qui ne bougera plus jusqu’à 22:16. Et la polaire d’Élias est restée sur la chaise. Celui qui « descend à pied » n’a emporté ni son téléphone ni sa polaire.',
    },
    {
      id: 'c_camille',
      statementId: 'st_camille_rien',
      evidenceIds: ['ev_dispute'],
      title: 'Camille et Élias se sont disputés',
      explanation:
        'Camille dit que rien de particulier ne s’est passé cette semaine. La copie montre une dispute mardi soir. Une nouvelle question est disponible dans sa conversation.',
      effects: [{ type: 'unlockQuestion', choiceId: 'ch_ca_dispute' }],
    },
    {
      id: 'c_badge',
      statementId: 'st_noe_badge',
      evidenceIds: ['ev_msg_badge'],
      title: 'Noé a prêté son badge',
      explanation:
        'Noé dit que son badge est resté dans son casier. À 19:06, il a pourtant accepté de le prêter à Élias pour passer la porte B. Une nouvelle question est disponible dans sa conversation.',
      effects: [{ type: 'unlockQuestion', choiceId: 'ch_noe_aveu' }],
    },
    {
      id: 'c_galerie',
      statementId: 'st_m_galerie',
      evidenceIds: ['ev_bon_intervention'],
      title: 'La galerie B est utilisée',
      explanation:
        'Marianne affirme que personne n’entre dans la galerie B. Le bon d’intervention n° 418 du 6 novembre, signé par elle, envoie Élias derrière la porte B. Son rapport du 13 novembre déclare pourtant « aucune intervention ». Une nouvelle question est disponible pour Marianne.',
      effects: [{ type: 'unlockQuestion', choiceId: 'ch_m_bon' }],
    },
    {
      id: 'c_soiree',
      statementId: 'st_m_soiree',
      evidenceIds: ['ev_journal_acces'],
      title: 'Marianne a quitté son bureau',
      explanation:
        'Marianne dit ne pas avoir quitté son bureau de direction. Le journal enregistre son badge DIR-01 à l’entrée du bureau technique à 20:29 — deux minutes avant le message — puis à 22:15, juste avant que le téléphone s’éteigne. Un badge seul n’identifie pas son porteur, mais Marianne ne prête jamais le sien.',
    },
    {
      id: 'c_porte',
      statementId: 'st_m_porte',
      evidenceIds: ['ev_journal_acces'],
      title: 'Le verrouillage n’est pas automatique',
      explanation:
        'Marianne attribue le verrouillage à la coupure. Mais la porte B est verrouillée à 20:12 par une commande distante du poste DIR-01, quarante minutes avant la coupure de 20:52. Or Marianne dit elle-même avoir passé la soirée à ce poste.',
    },
  ],

  mismatchFeedback: [
    {
      statementId: 'st_m_telephone',
      evidenceId: 'ev_photo_bureau',
      text: 'La photo de Noé date de 22:31 : à ce moment-là, le téléphone n’était effectivement plus sur le bureau. Elle ne dit rien de 20 h.',
    },
    {
      statementId: 'st_elias_message',
      evidenceId: 'ev_note_lettre',
      text: 'La lettre montre qu’il voulait partir. Elle ne prouve ni qu’il est parti hier soir, ni qu’il a écrit ce message.',
    },
    {
      statementId: 'st_elias_message',
      evidenceId: 'ev_note_liste',
      text: 'Rien n’est coché sur sa liste de départ : c’est troublant, mais ce n’est pas une preuve. Cherche une trace de l’endroit d’où le message est parti.',
    },
    {
      statementId: 'st_elias_message',
      evidenceId: 'ev_note_brouillon',
      text: 'Ce brouillon dit qu’il ne voulait pas partir en silence. C’est un indice sur son caractère, pas une trace de la soirée.',
    },
    {
      statementId: 'st_m_galerie',
      evidenceId: 'ev_rapport_officiel',
      text: 'Le rapport officiel dit exactement la même chose qu’elle. Cherche un document qui montre une intervention réelle.',
    },
    {
      statementId: 'st_m_galerie',
      evidenceId: 'ev_signalement',
      text: 'Le signalement montre que la porte B est dangereuse, pas que quelqu’un y travaille encore. Cherche une intervention récente.',
    },
    {
      statementId: 'st_m_soiree',
      evidenceId: 'ev_sauvegarde',
      text: 'La sauvegarde dit où était le téléphone d’Élias, pas où était Marianne. Il te faut une trace de ses propres déplacements.',
    },
    {
      statementId: 'st_m_soiree',
      evidenceId: 'ev_journal_coupole',
      text: 'Le journal de la coupole place Noé, pas Marianne.',
    },
    {
      statementId: 'st_m_porte',
      evidenceId: 'ev_fiche_porte',
      text: 'La fiche explique comment la serrure se comporte, pas qui l’a verrouillée. Le journal, lui, donne l’origine de chaque commande.',
    },
    {
      statementId: 'st_noe_badge',
      evidenceId: 'ev_journal_acces',
      text: 'Le journal montre bien le badge TECH-07 à la porte B. Mais Noé te l’a envoyé après avoir avoué : cherche plutôt ce qui, dans la copie, montre qu’il l’a prêté.',
    },
    {
      statementId: 'st_noe_soiree',
      evidenceId: 'ev_sauvegarde',
      text: 'La sauvegarde parle du téléphone d’Élias, pas des allées et venues de Noé. Demande-lui directement s’il a vu ce téléphone.',
    },
    {
      statementId: 'st_m_depart',
      evidenceId: 'ev_note_lettre',
      text: 'La lettre confirme qu’Élias songeait à partir : sur ce point, Marianne dit vrai.',
    },
  ],
  defaultMismatchFeedback:
    'Ces deux éléments ne se contredisent pas. Cherche une trace datée qui montre l’inverse de ce qui est affirmé.',

  objectives: [
    {
      id: 'obj_depart',
      title: 'Comprendre le message de départ',
      description: 'Camille doute du message de 20:31. Écoute-la, et demande à Marianne ce qu’elle sait du départ d’Élias.',
      completeWhen: { type: 'all', conditions: [flag('camille_insiste'), knows('st_m_depart')] },
      hints: [
        'Commence par Camille : elle a une raison précise de douter. Puis interroge Marianne sur le départ.',
        'Dans Échanges, demande à Camille pourquoi le message ne ressemble pas à Élias, puis à Marianne s’il lui avait parlé de partir.',
        'Pose « Pourquoi ce message ne lui ressemble pas ? » à Camille et « Il vous avait parlé de partir ? » à Marianne.',
      ],
    },
    {
      id: 'obj_telephone',
      title: 'Retrouver son téléphone hier soir',
      description: 'Le message est parti de son téléphone. Où était ce téléphone, et qui l’a vu ?',
      completeWhen: { type: 'all', conditions: [found('c_tel'), knows('st_noe_vu')] },
      hints: [
        'Demande à Marianne où était le téléphone. Puis cherche une trace technique de ce téléphone dans la copie.',
        'L’appli Sauvegarde (ou tes Notes) donne l’état du téléphone heure par heure. Confronte-la, dans le Carnet, à ce que dit Marianne.',
        'Carnet : Marianne « son téléphone n’y était plus » + Rapport de sauvegarde. Puis pose à Noé la nouvelle question sur le bureau.',
      ],
    },
    {
      id: 'obj_galerie',
      title: 'Comprendre ce qui se passe dans la galerie B',
      description: 'Les fichiers d’Élias parlent d’une galerie « condamnée ». Qui y est entré hier soir, et qui l’a fermée ?',
      completeWhen: { type: 'all', conditions: [found('c_badge'), found('c_galerie'), has('ev_journal_acces')] },
      hints: [
        'Lis les Fichiers et les notes d’Élias sur la porte B. Puis interroge Noé sur son badge et Marianne sur la galerie.',
        'Un message de la copie, jeudi à 19:04, contredit ce que dit Noé de son badge. Un document de la copie contredit ce que dit Marianne de la galerie B.',
        'Carnet : Noé « badge dans mon casier » + Message d’Élias à Noé (19:04) ; Marianne « galerie condamnée » + Bon d’intervention n° 418. Puis pose à Noé la nouvelle question.',
      ],
    },
    {
      id: 'obj_auteur',
      title: 'Démontrer qui a envoyé le message',
      description: 'Rassemble les traces qui désignent l’auteur du message de 20:31, puis accuse dans l’appli Enquête.',
      completeWhen: { type: 'solved' },
      hints: [
        'Trois personnes étaient sur place. Pour chacune, demande-toi où elle était à 20:12 et à 20:31.',
        'Le journal de la coupole place Noé à sa console. Le journal des accès donne le poste qui a verrouillé la porte B, et le badge entré au bureau technique à 20:29. Marianne dit elle-même avoir passé la soirée à son poste.',
        'Accuse Marianne avec le Rapport de sauvegarde, le Journal des accès et le Journal de la coupole.',
      ],
    },
    {
      id: 'obj_secours',
      title: 'Guider les secours',
      description: 'Transmets aux secours où se trouve Élias, par quel accès entrer et comment ouvrir la porte.',
      completeWhen: flag('secours_ok'),
      hints: [
        'Recoupe le journal des accès, le plan d’évacuation et la fiche technique de la serrure.',
        'Les traces de la nuit concernent la porte B et l’interphone de la galerie B. Le plan de secours dit par où on atteint chaque galerie sans courant. La fiche dit ce que fait la serrure en cas de coupure.',
        'Galerie B derrière la porte B ; accès de secours nord ; déverrouillage manuel par la trappe du boîtier, clé carrée de 8.',
      ],
    },
    {
      id: 'obj_elias',
      title: 'Écrire à Élias',
      description: 'Élias est avec les secours. Il t’a écrit.',
      completeWhen: flag('retrouvailles'),
      hints: [
        'Ouvre Échanges : une nouvelle conversation est arrivée.',
        'La conversation « Élias Varin » est en haut de la liste.',
        'Réponds à Élias jusqu’au bout de la conversation.',
      ],
    },
  ],

  solution: {
    prompt: 'Qui a envoyé le faux message ?',
    culpritId: 'marianne',
    maxEvidence: 5,
    resolvedWhen: flag('retrouvailles'),
    afterAccusation: {
      text: 'Confrontée à tes preuves, Marianne vient de t’écrire.',
      conversationId: 'conv_marianne',
      label: 'Lire le message de Marianne',
    },
    requirements: [
      {
        anyOf: ['ev_sauvegarde'],
        missingFeedback:
          'Tu ne montres pas d’où le message est parti. Il te faut une trace du téléphone lui-même à 20:31.',
      },
      {
        anyOf: ['ev_journal_acces'],
        missingFeedback:
          'Tu ne montres pas qui a agi sur la porte B et qui est entré au bureau technique avant 20:31. Il te faut l’origine des commandes et des badges.',
      },
      {
        anyOf: ['ev_journal_coupole'],
        missingFeedback:
          'Tu n’écartes pas Noé : un poste ou un badge n’identifie pas à lui seul une personne. Montre où Noé se trouvait à ces heures-là.',
      },
    ],
    wrongSuspectFeedback: {
      elias:
        'Le message part à 20:31 d’un téléphone branché au bureau technique, qui ne bouge plus jusqu’à 22:16. Celui qui l’a écrit n’était pas en train de descendre à pied.',
      noe: 'Le badge TECH-07 est celui de Noé, mais un badge identifie un badge, pas son porteur. Cherche où Noé se trouvait réellement à 20:12 et à 20:31.',
      camille: 'Camille était à Lausanne et n’a jamais eu le téléphone d’Élias entre les mains. Sa culpabilité vient d’ailleurs.',
    },
    resolution: {
      summary:
        'Marianne Keller a enfermé Élias dans la galerie B pour l’empêcher de repartir avec ses photos, puis a envoyé le faux message depuis son téléphone. Après la coupure, elle a su qu’il était vivant et a choisi de se taire.',
      timeline: [
        { time: 'lun. 11:06', text: 'Marianne suspend l’accès d’Élias à la galerie B, après qu’il a contesté ses rapports.' },
        { time: '19:04', text: 'Élias emprunte le badge de Noé et laisse son téléphone en charge au bureau technique.' },
        { time: '19:58', text: 'Il entre dans la galerie B avec l’appareil photo de service.', key: true },
        { time: '20:12', text: 'Marianne, qui l’a vu sur la caméra, verrouille la porte B depuis son poste.', key: true },
        { time: '20:31', text: 'Elle envoie le faux message depuis le téléphone d’Élias, au bureau technique.', key: true },
        { time: '20:52', text: 'Coupure d’alimentation : la commande à distance ne répond plus. Première occasion d’appeler les secours.' },
        { time: '21:20', text: 'Élias l’appelle par l’interphone de secours. Elle décroche, promet de s’en occuper, et ne prévient personne.', key: true },
        { time: '22:16', text: 'Elle éteint le téléphone d’Élias. Réarmements du disjoncteur à 22:40 et 23:55 : échecs, toujours aucun appel.' },
        { time: 'ven. 05:12', text: 'Dernier appel de l’interphone. Personne ne répond.', key: true },
        { time: '09:31', text: 'Les secours, entrés par l’accès nord, ouvrent la porte B à la main. Élias est vivant.' },
      ],
      decisive: [
        {
          evidenceId: 'ev_sauvegarde',
          text: 'Le téléphone reste en charge au bureau technique de 18:47 à 22:16 : le message de 20:31 n’a pas été écrit par quelqu’un qui descendait à pied.',
        },
        {
          evidenceId: 'ev_journal_acces',
          text: 'La porte B est verrouillée à 20:12 depuis DIR-01, quarante minutes avant la coupure ; le badge DIR entre au bureau technique à 20:29. L’interphone prouve qu’Élias était vivant à 21:20 et encore à 05:12.',
        },
        {
          evidenceId: 'ev_journal_coupole',
          text: 'Noé saisit des commandes à la console de la coupole à 20:10, 20:14, 20:27 et 20:33 : il ne pouvait être ni au poste de direction ni au bureau technique.',
        },
        {
          evidenceId: 'ev_bon_intervention',
          text: 'Le bon n° 418 contredit le rapport officiel : la galerie B « condamnée » était utilisée, avec l’accord de Marianne. C’est ce qu’Élias allait documenter.',
        },
        {
          evidenceId: 'ev_fiche_porte',
          text: 'Sans courant, la serrure reste verrouillée et ne s’ouvre qu’à la main, par la trappe côté nord : c’est ce qui a permis aux secours d’entrer.',
        },
      ],
      falseLeads: [
        {
          title: 'Un départ volontaire',
          text: 'Élias voulait démissionner, et sa lettre en brouillon le prouve. Mais sa liste de départ n’avait rien de coché, et il avait écrit qu’il ne partirait pas en silence. Le faux message s’appuyait sur un projet réel pour être crédible.',
        },
        {
          title: 'Le badge de Noé',
          text: 'C’est bien le badge de Noé qui ouvre la porte B à 19:58. Il l’avait prêté à Élias, contre le règlement, et a menti par peur. Son journal de coupole le place à sa console toute la soirée.',
        },
        {
          title: 'Le silence de Camille',
          text: 'Camille a caché leur dispute de mardi parce qu’elle s’en voulait. Sa culpabilité expliquait son insistance, pas un rôle dans la disparition.',
        },
        {
          title: '« Passez par l’accès sud »',
          text: 'Même en avouant, Marianne a indiqué l’accès sud, qui mène à la galerie A. Sans courant, les portes coupe-feu séparent les deux galeries : seul l’accès nord menait à Élias.',
        },
      ],
      epilogue:
        'Élias passe la journée à l’hôpital de Sion, où Camille le rejoint. Les photos de l’appareil de service montrent la galerie B, le bon n° 418 affiché sur une armoire et la poignée défectueuse. Marianne se présente à la gendarmerie en fin de matinée. Elle a eu au moins quatre occasions d’appeler les secours — à 20:52, à 21:20, après chaque réarmement manqué — et a choisi chaque fois de protéger sa position. Noé a rendu son badge. Il a gardé son travail.',
    },
  },

  scoring: {
    start: 100,
    hintCost: [5, 10, 15],
    wrongSuspect: 25,
    insufficientEvidence: 15,
    mistake: 10,
  },
};
