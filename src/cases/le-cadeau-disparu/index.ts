import type { Case } from '../../engine/types';
import { conversations } from './conversations';
import { evidence } from './evidence';
import { suspects } from './suspects';

const found = (contradictionId: string) => ({ type: 'contradictionFound', contradictionId }) as const;
const knows = (statementId: string) => ({ type: 'knowsStatement', statementId }) as const;
const has = (evidenceId: string) => ({ type: 'hasEvidence', evidenceId }) as const;

export const leCadeauDisparu: Case = {
  id: 'le-cadeau-disparu',
  title: 'Le cadeau disparu',
  tagline: '500 CHF, quatre amis, une heure avant la surprise.',
  duration: '5 à 10 min',
  difficulty: 'Initiation',
  playerName: 'Sam',
  intro: [
    'Samedi 14 novembre, Lausanne. Tu organises chez toi l’anniversaire surprise de Léa, qui fête ses 30 ans.',
    'Ses quatre amis ont cotisé avec toi : 500 CHF en liquide dans une enveloppe, pour son voyage à Lisbonne.',
    'Tu as passé l’après-midi dehors. Inès, Hugo, Clara et Yanis ont décoré l’appartement grâce au code invité de ta serrure connectée.',
    'Tu rentres à 18:41. À 18:45, le tiroir de l’entrée est vide. Léa arrive à 20:00.',
    'Tout ce dont tu disposes est sur ton téléphone : tes conversations, les applis de ton appartement et ce que tes amis voudront bien t’envoyer.',
  ],
  clock: { start: '18:46', perChoiceMinutes: 2, max: '19:56', deadlineLabel: 'Léa arrive à 20:00' },
  suspects,
  conversations,
  evidence,

  statements: [
    {
      id: 'st_ines_depart',
      suspectId: 'ines',
      text: 'À 17h45, l’enveloppe était dans le tiroir. Je suis partie au Flon et revenue à 18h33.',
      context: 'Inès, en privé',
    },
    {
      id: 'st_hugo_depart',
      suspectId: 'hugo',
      text: 'Je suis parti à 17h05 et je ne suis pas revenu.',
      context: 'Hugo, en privé',
    },
    {
      id: 'st_clara_restee',
      suspectId: 'clara',
      text: 'Je suis restée dans l’appartement tout le temps, jusqu’au retour d’Inès.',
      context: 'Clara, en privé',
    },
    {
      id: 'st_yanis_salle',
      suspectId: 'yanis',
      text: 'Arrivé à la salle vers 17h30, reparti à 19h. Je n’ai pas remis les pieds chez toi.',
      context: 'Yanis, en privé',
    },
    {
      id: 'st_yanis_ignorait',
      suspectId: 'yanis',
      text: 'Je ne savais pas où l’enveloppe était rangée.',
      context: 'Yanis, en privé',
    },
    {
      id: 'st_clara_aveu',
      suspectId: 'clara',
      text: 'Je suis sortie à 17h58 racheter un vase, revenue vers 18h20. Le tiroir était entrouvert.',
      context: 'Clara, après avoir été confrontée',
    },
    {
      id: 'st_yanis_chargeur',
      suspectId: 'yanis',
      text: 'Je suis repassé deux minutes prendre mon chargeur sur le canapé, et je suis reparti.',
      context: 'Yanis, après avoir été confronté',
    },
  ],

  contradictions: [
    {
      id: 'c_clara_sortie',
      statementId: 'st_clara_restee',
      evidenceIds: ['ev_ticket_vase', 'ev_journal_routeur'],
      title: 'Clara est sortie',
      explanation:
        'Clara affirme n’avoir jamais quitté l’appartement. Pourtant, son téléphone quitte le Wi-Fi à 17:58 et ne revient qu’à 18:21, et un ticket du Bazar du Midi, à dix minutes à pied, est daté de 18:09. Pourquoi a-t-elle menti ? Une nouvelle question est disponible dans sa conversation.',
      effects: [{ type: 'unlockQuestion', choiceId: 'ch_clara_verite' }],
    },
    {
      id: 'c_yanis_salle',
      statementId: 'st_yanis_salle',
      evidenceIds: ['ev_journal_routeur'],
      title: 'Yanis est revenu',
      explanation:
        'Yanis jure ne pas avoir remis les pieds chez toi. Mais son téléphone se reconnecte à ton Wi-Fi de 18:04 à 18:07, au moment exact où quelqu’un tape le code invité, alors que l’appartement est vide. Une nouvelle question est disponible dans sa conversation.',
      effects: [{ type: 'unlockQuestion', choiceId: 'ch_yanis_wifi' }],
    },
    {
      id: 'c_yanis_tiroir',
      statementId: 'st_yanis_ignorait',
      evidenceIds: ['ev_msg_yanis_1633'],
      title: 'Yanis savait',
      explanation:
        'Yanis dit ignorer où était l’enveloppe. À 16:33, c’est pourtant lui qui répond dans le groupe : « Tiroir de l’entrée 👌 ».',
    },
    {
      id: 'c_yanis_chargeur',
      statementId: 'st_yanis_chargeur',
      evidenceIds: ['ev_chargeur'],
      title: 'Le chargeur n’a pas bougé',
      explanation:
        'Yanis dit être revenu prendre son chargeur sur le canapé. Mais son chargeur, marqué « Y.H. », est toujours branché derrière le canapé. Il n’est pas revenu pour ça.',
    },
  ],

  mismatchFeedback: [
    {
      statementId: 'st_hugo_depart',
      evidenceId: 'ev_photo_salon',
      text: 'Une veste oubliée ne prouve pas que son propriétaire était encore là. La photo montre un vêtement, pas une personne.',
    },
    {
      statementId: 'st_hugo_depart',
      evidenceId: 'ev_journal_serrure',
      text: 'La serrure ne dit pas qui a tapé le code. Rien ici ne place Hugo dans l’appartement.',
    },
    {
      statementId: 'st_hugo_depart',
      evidenceId: 'ev_historique_livraisons',
      text: 'L’historique de livraisons confirme sa version au lieu de la contredire.',
    },
    {
      statementId: 'st_yanis_salle',
      evidenceId: 'ev_journal_serrure',
      text: 'La serrure confirme qu’un code invité a été tapé à 18:04, mais quatre personnes le connaissent. Il te faut une trace qui désigne une personne.',
    },
    {
      statementId: 'st_yanis_salle',
      evidenceId: 'ev_capture_pret',
      text: 'Avoir besoin d’argent ne place personne dans l’appartement. C’est un mobile, pas une présence.',
    },
    {
      statementId: 'st_yanis_salle',
      evidenceId: 'ev_chargeur',
      text: 'Un chargeur oublié peut dater de l’après-midi, quand tout le monde était là. Il ne prouve pas un retour.',
    },
    {
      statementId: 'st_yanis_ignorait',
      evidenceId: 'ev_photo_enveloppe',
      text: 'La photo montre où était l’enveloppe, mais Yanis aurait pu ne pas la regarder. Cherche une trace de sa propre main.',
    },
    {
      statementId: 'st_clara_restee',
      evidenceId: 'ev_journal_serrure',
      text: 'La serrure n’enregistre que les entrées, pas les sorties. L’ouverture de 18:21 ne dit pas qui l’a faite.',
    },
    {
      statementId: 'st_clara_restee',
      evidenceId: 'ev_photo_salon',
      text: 'La photo prouve que Clara était là à 17:42. La question, c’est la suite.',
    },
    {
      statementId: 'st_ines_depart',
      evidenceId: 'ev_journal_serrure',
      text: 'L’ouverture de 18:33 colle avec le retour d’Inès. Rien ne contredit sa version.',
    },
    {
      statementId: 'st_ines_depart',
      evidenceId: 'ev_photo_enveloppe',
      text: 'La photo confirme qu’Inès a rangé l’enveloppe. Elle ne contredit pas sa vérification de 17:45.',
    },
    {
      statementId: 'st_ines_depart',
      evidenceId: 'ev_ticket_ballons',
      text: 'Le ticket confirme son récit : à 18:05, Inès était au Flon.',
    },
    {
      statementId: 'st_yanis_chargeur',
      evidenceId: 'ev_photo_salon',
      text: 'La photo de 17:42 précède le passage de Yanis. Qu’est-ce qui se trouve dans le salon après 18:07 ?',
    },
    {
      statementId: 'st_clara_aveu',
      evidenceId: 'ev_journal_routeur',
      text: 'Le routeur confirme ses nouveaux horaires : partie à 17:58, revenue à 18:21. Cette fois, Clara dit vrai.',
    },
    {
      statementId: 'st_clara_aveu',
      evidenceId: 'ev_ticket_vase',
      text: 'Le ticket confirme son récit : 18:09 au Bazar du Midi.',
    },
  ],
  defaultMismatchFeedback:
    'Ces deux éléments ne se contredisent pas. Cherche une pièce qui place la personne ailleurs, ou qui montre qu’elle savait ce qu’elle prétend ignorer.',

  objectives: [
    {
      id: 'obj_versions',
      title: 'Recueillir la version de chacun',
      description: 'Demande à tes quatre amis, en privé, ce qu’ils ont fait cet après-midi.',
      completeWhen: {
        type: 'all',
        conditions: [knows('st_ines_depart'), knows('st_hugo_depart'), knows('st_clara_restee'), knows('st_yanis_salle')],
      },
      hints: [
        'Chacun de tes amis a une conversation privée avec toi. Commence par leur demander ce qu’ils ont fait de leur après-midi.',
        'Dans chaque conversation privée, une question porte sur l’emploi du temps. Les réponses importantes deviennent des déclarations, visibles sur la fiche du suspect et dans le carnet.',
        'Pose la question sur l’emploi du temps à Inès, Hugo, Clara et Yanis (« Raconte-moi ton après-midi », « Tu es parti où ? », « Tu étais seule ? », « Tu as fait quoi ? »).',
      ],
    },
    {
      id: 'obj_traces',
      title: 'Trouver les traces des allées et venues',
      description: 'Ton appartement garde des traces. Découvre qui est entré pendant que l’enveloppe disparaissait.',
      completeWhen: { type: 'all', conditions: [has('ev_journal_serrure'), has('ev_journal_routeur')] },
      hints: [
        'Ta porte d’entrée a une serrure connectée. Elle a peut-être gardé une trace.',
        'Dans « Notes · Appartement », ouvre l’historique de la serrure. Puis demande à Inès comment savoir qui a tapé le code.',
        'Inès te conseille l’appli du routeur : ouvre-la depuis « Notes · Appartement ». Compare ses heures avec celles de la serrure.',
      ],
    },
    {
      id: 'obj_mensonges',
      title: 'Démasquer les mensonges',
      description: 'Dans le carnet, confronte les déclarations aux pièces qui les contredisent.',
      completeWhen: {
        type: 'all',
        conditions: [found('c_clara_sortie'), found('c_yanis_salle'), found('c_yanis_tiroir')],
      },
      hints: [
        'Quelqu’un prétend n’être jamais sorti. Quelqu’un prétend n’être jamais revenu. Quelqu’un prétend ignorer où était l’enveloppe.',
        'Inspecte la cuisine dans tes notes, demande à Yanis s’il savait où était l’enveloppe, et relis le début du groupe vers 16:30.',
        'Dans le carnet : Clara « restée tout le temps » + ticket du vase ; Yanis « salle de sport » + journal du routeur ; Yanis « ne savait pas » + sa réponse de 16:33.',
      ],
    },
    {
      id: 'obj_accuser',
      title: 'Accuser, preuves à l’appui',
      description: 'Désigne le coupable et présente les pièces qui démontrent sa culpabilité.',
      completeWhen: { type: 'solved' },
      hints: [
        'Qui a menti à la fois sur sa présence et sur ce qu’il savait ?',
        'Une accusation solide montre deux choses : que la personne était là pendant le vol, et qu’elle savait où chercher.',
        'Accuse Yanis en présentant le journal du routeur et sa réponse de 16:33.',
      ],
    },
  ],

  solution: {
    culpritId: 'yanis',
    maxEvidence: 4,
    requirements: [
      {
        anyOf: ['ev_journal_routeur'],
        missingFeedback:
          'Ton dossier ne montre pas que cette personne était dans l’appartement pendant la disparition. Il te faut une trace qui la désigne, elle, pas seulement un code tapé.',
      },
      {
        anyOf: ['ev_msg_yanis_1633'],
        missingFeedback: 'Tu ne montres pas que cette personne savait où chercher. Elle prétend tout ignorer de l’enveloppe.',
      },
    ],
    wrongSuspectFeedback: {
      ines: 'Rien dans ton dossier ne place Inès dans l’appartement pendant la disparition. Vérifie son emploi du temps : elle a peut-être de quoi le prouver.',
      hugo: 'Une veste oubliée et des fins de mois difficiles ne font pas un voleur. Rien ne place Hugo dans l’appartement après 17:05. Demande-lui ce qu’il faisait vraiment.',
      clara: 'Clara cache quelque chose, mais son mensonge ne prouve pas qu’elle a ouvert le tiroir. Découvre d’abord pourquoi elle a menti.',
    },
    resolution: {
      summary:
        'Yanis Haddad a pris l’enveloppe à 18:04, pendant les six minutes où l’appartement était vide. Il savait où elle était, il est revenu en cachette, puis il a menti trois fois.',
      timeline: [
        { time: '16:32', text: 'Inès range l’enveloppe dans le tiroir de l’entrée et envoie la photo au groupe.' },
        { time: '16:33', text: 'Yanis répond : « Tiroir de l’entrée 👌 ». Il sait où elle est.', key: true },
        { time: '17:05', text: 'Hugo part pour ses livraisons à vélo et oublie sa veste.' },
        { time: '17:21', text: 'Yanis annonce la salle de sport. Il s’installe en réalité au café en bas de l’immeuble.' },
        { time: '17:46', text: 'Inès vérifie l’enveloppe puis part chercher des ballons au Flon.' },
        { time: '17:55', text: 'Clara casse le vase bleu en accrochant une guirlande.' },
        { time: '17:58', text: 'Clara part racheter un vase. L’appartement est vide, et Yanis la voit sortir.' },
        { time: '18:04', text: 'Yanis entre avec le code invité. Son téléphone se reconnecte au Wi-Fi.', key: true },
        { time: '18:07', text: 'Yanis repart avec l’enveloppe et laisse le tiroir entrouvert.', key: true },
        { time: '18:09', text: 'Clara paie le vase au Bazar du Midi.' },
        { time: '18:21', text: 'Clara revient et remarque le tiroir entrouvert, sans oser regarder.' },
        { time: '18:33', text: 'Inès revient avec les ballons.' },
        { time: '18:41', text: 'Tu rentres. À 18:45, le tiroir est vide.' },
      ],
      decisive: [
        {
          evidenceId: 'ev_journal_routeur',
          text: 'Le téléphone de Yanis se reconnecte à ton Wi-Fi de 18:04 à 18:07. C’est la seule présence dans l’appartement pendant que tous les autres sont ailleurs.',
        },
        {
          evidenceId: 'ev_journal_serrure',
          text: 'Le code invité est tapé à 18:04. Seuls les quatre amis le connaissent, et la seule clé utilisée est la tienne, à 18:41.',
        },
        {
          evidenceId: 'ev_msg_yanis_1633',
          text: 'Yanis prétend ignorer la cachette, mais il l’a lui-même nommée à 16:33.',
        },
        {
          evidenceId: 'ev_chargeur',
          text: 'Son excuse du chargeur ne tient pas : le chargeur « Y.H. » est toujours branché derrière le canapé.',
        },
      ],
      falseLeads: [
        {
          title: 'La veste de Hugo sur la photo de 17:42',
          text: 'Une veste oubliée ne dit rien de son propriétaire. Hugo s’est déconnecté du Wi-Fi à 17:05, a signalé l’oubli à Clara à 17:31 et livrait à Renens et Prilly jusqu’à 18:52. Ses dettes expliquent son « truc perso », pas le vol.',
        },
        {
          title: 'Le mensonge de Clara',
          text: 'Clara a menti pour cacher le vase cassé. Elle était au Bazar du Midi à 18:09, à dix minutes à pied : impossible qu’elle ait tapé le code à 18:04. C’est elle qui a remarqué le tiroir entrouvert.',
        },
        {
          title: 'Inès, dernière à avoir touché l’enveloppe',
          text: 'Inès a vérifié l’enveloppe à 17:45 et l’a dit d’elle-même. À 18:05, elle payait des ballons au Flon, à un quart d’heure de chez toi.',
        },
      ],
      epilogue:
        'À 19:40, Yanis sonne à ta porte, l’enveloppe à la main. Il a perdu son emploi en septembre et n’a rien osé dire ; son loyer de novembre était impayé. À 20:00, Léa entre sous les ballons d’Inès sans se douter de rien. Hugo récupère sa veste, Clara rembourse un vase que tu n’as jamais vraiment aimé. Et demain, il faudra parler.',
    },
  },

  scoring: {
    start: 100,
    hintCost: [5, 10, 15],
    wrongSuspect: 25,
    insufficientEvidence: 15,
  },
};
