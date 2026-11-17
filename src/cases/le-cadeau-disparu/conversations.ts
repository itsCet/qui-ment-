import type { Condition, Conversation, Effect, Message } from '../../engine/types';

/* Petits constructeurs : ils ne produisent que des données. */
const after = (choiceId: string): Condition => ({ type: 'choiceMade', choiceId });
const has = (evidenceId: string): Condition => ({ type: 'hasEvidence', evidenceId });
const statement = (statementId: string): Effect => ({ type: 'addStatement', statementId });

/** Suite de réponses à un choix : chaque message dépend du choix. */
function replies(choiceId: string, list: Omit<Message, 'condition'>[]): Message[] {
  return list.map((m) => ({ ...m, condition: after(choiceId) }));
}

const solvedOnly: Condition = { type: 'solved' };

export const conversations: Conversation[] = [
  /* ---------------------------------------------------------------- */
  /* Groupe                                                           */
  /* ---------------------------------------------------------------- */
  {
    id: 'conv_groupe',
    title: 'Anniv Léa — sans Léa',
    subtitle: 'Inès, Hugo, Clara, Yanis et toi',
    kind: 'group',
    participants: ['ines', 'hugo', 'clara', 'yanis'],
    initiallyOpen: true,
    messages: [
      { id: 'g00', from: 'system', text: 'Messages de cet après-midi', history: true, time: '16:30' },
      {
        id: 'g01',
        from: 'ines',
        time: '16:32',
        history: true,
        attachment: 'ev_photo_enveloppe',
        text: 'Enveloppe rangée dans le tiroir de la commode de l’entrée. Cinq billets de 100, recomptés deux fois. Personne n’y touche avant ce soir.',
      },
      {
        id: 'g02',
        from: 'yanis',
        time: '16:33',
        history: true,
        text: 'Bien reçu chef. Tiroir de l’entrée 👌',
        effects: [{ type: 'addEvidence', evidenceId: 'ev_msg_yanis_1633' }],
      },
      { id: 'g03', from: 'hugo', time: '16:35', history: true, text: 'moi j’touche à rien, je gonfle des ballons 🎈 (j’essaie en tout cas)' },
      { id: 'g04', from: 'hugo', time: '17:04', history: true, text: 'bon je dois filer les gars, un truc à faire. à ce soir 🫡' },
      { id: 'g05', from: 'yanis', time: '17:20', history: true, text: 'Je bouge aussi. Salle. À ce soir.' },
      {
        id: 'g06',
        from: 'clara',
        time: '17:42',
        history: true,
        attachment: 'ev_photo_salon',
        text: 'Le salon avance… vous en pensez quoi ?',
      },
      {
        id: 'g07',
        from: 'ines',
        time: '17:44',
        history: true,
        text: 'Superbe, Clara. Je file chercher une dernière chose, retour vers 18h30. Tu gardes le fort ?',
      },
      { id: 'g08', from: 'clara', time: '17:44', history: true, text: 'oui oui, t’inquiète' },
      { id: 'g09', from: 'system', text: 'Tu rentres à 18:41. À 18:45, tu ouvres le tiroir de l’entrée.', history: true, time: '18:45' },
      { id: 'g10', from: 'player', text: 'Les gars. L’enveloppe n’est plus dans le tiroir.' },
      { id: 'g11', from: 'ines', text: 'Pardon ?? Elle y était quand je suis partie, j’ai vérifié avant de sortir.' },
      { id: 'g12', from: 'hugo', text: 'attends c’est une blague ?? 😳' },
      { id: 'g13', from: 'clara', text: '…' },
      { id: 'g14', from: 'clara', text: 'j’ai rien vu, je te jure' },
      { id: 'g15', from: 'yanis', text: 'Cherche mieux. Elle a dû glisser derrière.' },
      { id: 'g16', from: 'player', text: 'J’ai vidé le tiroir et regardé derrière la commode. Rien. Il manque 500 balles.' },
      {
        id: 'g17',
        from: 'ines',
        text: 'Bon. Léa arrive à 20h. Personne ne lui dit rien. Sam, écris à chacun en privé, on reconstitue l’après-midi calmement.',
      },
      { id: 'g18', from: 'hugo', text: 'ok mais qu’on soit clairs, j’ai rien pris moi' },
      {
        id: 'g19',
        from: 'yanis',
        text: 'Personne a rien pris, visiblement.',
        effects: [
          { type: 'openConversation', conversationId: 'conv_notes' },
          { type: 'openConversation', conversationId: 'conv_ines' },
          { type: 'openConversation', conversationId: 'conv_hugo' },
          { type: 'openConversation', conversationId: 'conv_clara' },
          { type: 'openConversation', conversationId: 'conv_yanis' },
          { type: 'setFlag', flag: 'alerte_donnee' },
        ],
      },
      ...replies('ch_groupe_code', [
        { id: 'g_code_1', from: 'ines', text: 'Nous quatre. Tu nous l’as envoyé ce matin.' },
        { id: 'g_code_2', from: 'yanis', text: 'Et ta voisine ? Celle qui arrose tes plantes.' },
        { id: 'g_code_3', from: 'clara', text: 'Madame Rochat ? Je crois qu’elle a une clé, pas le code…' },
        { id: 'g_code_4', from: 'hugo', text: 'sam en mode inspecteur 🕵️ j’adore et j’ai peur' },
        {
          id: 'g_code_5',
          from: 'system',
          text: 'La serrure distingue clé et code. La seule clé utilisée aujourd’hui est la tienne, à 18:41. Le code de 18:04 a été tapé par l’un des quatre.',
        },
      ]),
      { id: 'g_fin_1', from: 'yanis', condition: solvedOnly, text: 'Je vous dois des excuses. À tous.' },
      {
        id: 'g_fin_2',
        from: 'yanis',
        condition: solvedOnly,
        text: 'J’ai perdu mon boulot en septembre. J’ai pas su le dire. L’enveloppe est dans mon sac, les cinq billets. Je la rapporte avant 20h.',
      },
      { id: 'g_fin_3', from: 'hugo', condition: solvedOnly, text: '…on aurait pu t’aider, frérot. t’avais qu’à demander' },
      { id: 'g_fin_4', from: 'ines', condition: solvedOnly, text: 'On en parlera demain. Ce soir, c’est Léa.' },
      { id: 'g_fin_5', from: 'clara', condition: solvedOnly, text: 'Et… Sam ? Le vase bleu, c’était moi. Pardon.' },
    ],
    choices: [
      {
        id: 'ch_groupe_code',
        label: 'Qui connaît le code invité ?',
        text: 'Question pour tout le monde : qui connaît le code invité de ma porte ?',
        condition: has('ev_journal_serrure'),
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Notes de Sam                                                      */
  /* ---------------------------------------------------------------- */
  {
    id: 'conv_notes',
    title: 'Notes · Appartement',
    subtitle: 'Tes notes et les applis de ton appartement',
    kind: 'notes',
    participants: [],
    messages: [
      {
        id: 'n01',
        from: 'system',
        text: '18:45 — Tiroir de l’entrée vide. Aucune trace d’effraction : la porte était verrouillée quand je suis rentré.',
      },
      {
        id: 'n02',
        from: 'system',
        text: 'Ce que je peux vérifier d’ici : l’appli de la serrure, l’appartement lui-même. Et mes amis, en privé.',
      },
      ...replies('ch_notes_serrure', [
        {
          id: 'n_serrure_1',
          from: 'system',
          attachment: 'ev_journal_serrure',
          text: 'La serrure n’enregistre que les ouvertures depuis l’extérieur, par code invité ou par clé. Pas les sorties.',
        },
        {
          id: 'n_serrure_2',
          from: 'system',
          text: 'Deux ouvertures m’intriguent : 18:04 et 18:21. Inès était partie, Clara était censée rester à l’intérieur. Qui a tapé le code ?',
        },
      ]),
      ...replies('ch_notes_entree', [
        {
          id: 'n_entree_1',
          from: 'system',
          text: 'Le tiroir de la commode coince depuis toujours : il faut le soulever pour l’ouvrir. Personne ne l’ouvre par hasard.',
        },
        {
          id: 'n_entree_2',
          from: 'system',
          text: 'Celui qui a pris l’enveloppe savait exactement où chercher.',
        },
      ]),
      ...replies('ch_notes_cuisine', [
        { id: 'n_cuisine_1', from: 'system', text: 'Dans la poubelle : des éclats de verre bleu, emballés dans du papier journal.' },
        {
          id: 'n_cuisine_2',
          from: 'system',
          attachment: 'ev_ticket_vase',
          text: 'Sur l’étagère, mon vase bleu… Non. Celui-ci est neuf, il a encore son étiquette. Le ticket est resté dans la poubelle.',
        },
      ]),
      ...replies('ch_notes_salon', [
        {
          id: 'n_salon_1',
          from: 'system',
          text: 'Guirlandes, ballons hélium au plafond. Sur l’accoudoir du canapé, la veste kaki de Hugo.',
        },
        {
          id: 'n_salon_2',
          from: 'system',
          attachment: 'ev_chargeur',
          text: 'Derrière le canapé, un chargeur blanc branché à la prise. Pas le mien : il y a des initiales au feutre.',
        },
      ]),
      ...replies('ch_notes_routeur', [
        {
          id: 'n_routeur_1',
          from: 'system',
          attachment: 'ev_journal_routeur',
          text: 'L’appli du routeur garde l’historique des appareils. Tout le monde s’est connecté à mon Wi-Fi en arrivant.',
        },
        { id: 'n_routeur_2', from: 'system', text: 'À comparer avec le journal de la serrure, heure par heure.' },
      ]),
    ],
    choices: [
      { id: 'ch_notes_serrure', label: 'Ouvrir l’historique de la serrure', text: 'J’ouvre l’appli de la serrure connectée.' },
      { id: 'ch_notes_entree', label: 'Examiner la commode de l’entrée', text: 'J’examine la commode de l’entrée.' },
      { id: 'ch_notes_cuisine', label: 'Inspecter la cuisine', text: 'Je fais le tour de la cuisine.' },
      { id: 'ch_notes_salon', label: 'Inspecter le salon', text: 'Je fais le tour du salon.' },
      {
        id: 'ch_notes_routeur',
        label: 'Ouvrir l’appli du routeur Wi-Fi',
        text: 'J’ouvre l’appli du routeur, comme Inès me l’a conseillé.',
        condition: { type: 'flag', flag: 'tip_routeur' },
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Inès — précise, phrases complètes, organisée                      */
  /* ---------------------------------------------------------------- */
  {
    id: 'conv_ines',
    title: 'Inès Morel',
    kind: 'private',
    participants: ['ines'],
    messages: [
      { id: 'i01', from: 'ines', text: 'Sam, je suis désolée. C’est moi qui l’avais rangée, je me sens responsable.' },
      { id: 'i02', from: 'ines', text: 'Pose-moi toutes les questions que tu veux. Je réponds à tout.' },
      ...replies('ch_ines_aprem', [
        { id: 'i_aprem_1', from: 'ines', text: 'Bien sûr. Dans l’ordre :' },
        {
          id: 'i_aprem_2',
          from: 'ines',
          text: '16h00, j’arrive et je lance la déco. 16h30, je range l’enveloppe devant tout le monde et j’envoie la photo au groupe.',
        },
        {
          id: 'i_aprem_3',
          from: 'ines',
          text: '17h45, avant de partir, j’ouvre le tiroir : l’enveloppe est là. Je pars, et je reviens à 18h33. Clara était seule au salon.',
          effects: [statement('st_ines_depart')],
        },
        {
          id: 'i_aprem_4',
          from: 'ines',
          text: 'Je t’avoue que j’étais partie chercher des ballons hélium au Flon. C’était censé être une surprise pour toi aussi.',
        },
      ]),
      ...replies('ch_ines_preuve', [
        { id: 'i_preuve_1', from: 'ines', text: 'Tu as raison de demander. Tiens.', attachment: 'ev_ticket_ballons' },
        { id: 'i_preuve_2', from: 'ines', text: 'Le magasin est à un quart d’heure d’ici, au mieux. À 18h05, j’étais à la caisse.' },
      ]),
      ...replies('ch_ines_qui', [
        { id: 'i_qui_1', from: 'ines', text: 'La serrure ne sait pas qui tape le code, seulement quand.' },
        {
          id: 'i_qui_2',
          from: 'ines',
          text: 'Mais ton routeur, lui, garde l’historique des téléphones connectés. On s’y est tous connectés en arrivant, tu nous avais donné le mot de passe.',
        },
        {
          id: 'i_qui_3',
          from: 'ines',
          text: 'Regarde dans son appli. Un téléphone se reconnecte tout seul dès qu’il passe la porte.',
          effects: [{ type: 'setFlag', flag: 'tip_routeur' }],
        },
      ]),
      ...replies('ch_ines_ambiance', [
        { id: 'i_amb_1', from: 'ines', text: 'Bizarre… Hugo est parti en coup de vent à 17h05, sans dire où.' },
        {
          id: 'i_amb_2',
          from: 'ines',
          text: 'Yanis l’a suivi un quart d’heure plus tard. Et Clara était tendue, mais Clara est toujours tendue.',
        },
        { id: 'i_amb_3', from: 'ines', text: 'Je n’accuse personne, Sam. Je te dis ce que j’ai vu.' },
      ]),
    ],
    choices: [
      { id: 'ch_ines_aprem', label: 'Raconte-moi ton après-midi', text: 'Raconte-moi ton après-midi, dans l’ordre.' },
      {
        id: 'ch_ines_preuve',
        label: 'Tu peux prouver que tu étais au Flon ?',
        text: 'Désolé de demander… tu peux me prouver que tu étais au Flon ?',
        condition: after('ch_ines_aprem'),
      },
      {
        id: 'ch_ines_qui',
        label: 'Comment savoir qui a tapé le code ?',
        text: 'La serrure dit qu’un code invité a été tapé à 18:04. Comment savoir qui c’était ?',
        condition: has('ev_journal_serrure'),
      },
      {
        id: 'ch_ines_ambiance',
        label: 'Quelqu’un s’est comporté bizarrement ?',
        text: 'Tu as remarqué quelque chose de bizarre cet après-midi ?',
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Hugo — minuscules, blagues, émojis                                */
  /* ---------------------------------------------------------------- */
  {
    id: 'conv_hugo',
    title: 'Hugo Bernard',
    kind: 'private',
    participants: ['hugo'],
    messages: [
      { id: 'h01', from: 'hugo', text: 'sam je te jure c’est pas moi' },
      { id: 'h02', from: 'hugo', text: 'je sais ce que tu penses. hugo le fauché, hugo qui part tôt… 😅' },
      ...replies('ch_hugo_aprem', [
        { id: 'h_aprem_1', from: 'hugo', text: 'j’avais un truc à faire' },
        {
          id: 'h_aprem_2',
          from: 'hugo',
          text: 'un truc perso. je suis parti à 17h05 et je suis pas revenu, point.',
          effects: [statement('st_hugo_depart')],
        },
      ]),
      ...replies('ch_hugo_veste', [
        { id: 'h_veste_1', from: 'hugo', text: 'nan 😩 je l’ai oubliée sur le canapé' },
        { id: 'h_veste_2', from: 'hugo', text: 'j’ai écrit à clara à 17h31 pour qu’elle la mette de côté. demande-lui' },
        { id: 'h_veste_3', from: 'hugo', text: 'elle est toujours chez toi d’ailleurs, je la récupère ce soir' },
      ]),
      ...replies('ch_hugo_perso', [
        { id: 'h_perso_1', from: 'hugo', text: '…' },
        { id: 'h_perso_2', from: 'hugo', text: 'ok. je fais des livraisons à vélo le samedi soir. depuis septembre.' },
        { id: 'h_perso_3', from: 'hugo', text: 'j’ai des dettes, j’avais pas envie que vous le sachiez. voilà.' },
        {
          id: 'h_perso_4',
          from: 'hugo',
          attachment: 'ev_historique_livraisons',
          text: 'regarde les heures. j’étais à renens et à prilly pendant tout ce temps',
        },
        { id: 'h_perso_5', from: 'hugo', text: 'dis rien aux autres stp 🙏' },
      ]),
      ...replies('ch_hugo_argent', [
        { id: 'h_arg_1', from: 'hugo', text: 'à part moi ? 😬' },
        { id: 'h_arg_2', from: 'hugo', text: '…bon. je voulais pas en parler mais vu la situation' },
        {
          id: 'h_arg_3',
          from: 'hugo',
          attachment: 'ev_capture_pret',
          text: 'yanis m’a demandé 400 balles la semaine dernière. j’ai dit non, j’ai rien',
        },
        { id: 'h_arg_4', from: 'hugo', text: 'ça veut rien dire hein. je dis juste que je suis pas le seul à être à sec' },
      ]),
    ],
    choices: [
      { id: 'ch_hugo_aprem', label: 'Tu es parti où, à 17h05 ?', text: 'Tu es parti où, à 17h05 ?' },
      {
        id: 'ch_hugo_veste',
        label: 'Ta veste est sur la photo de 17h42',
        text: 'Ta veste est sur la photo de Clara, à 17h42. Tu étais encore là ?',
        condition: has('ev_photo_salon'),
      },
      {
        id: 'ch_hugo_perso',
        label: 'C’était quoi, ce « truc perso » ?',
        text: 'Hugo. C’était quoi, ce « truc perso » ?',
        condition: after('ch_hugo_aprem'),
      },
      {
        id: 'ch_hugo_argent',
        label: 'Quelqu’un d’autre avait besoin d’argent ?',
        text: 'Tu sais si quelqu’un d’autre avait besoin d’argent en ce moment ?',
        condition: after('ch_hugo_perso'),
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Clara — hésitante, phrases courtes, s’excuse                      */
  /* ---------------------------------------------------------------- */
  {
    id: 'conv_clara',
    title: 'Clara Nguyen',
    kind: 'private',
    participants: ['clara'],
    messages: [
      { id: 'c01', from: 'clara', text: 'Sam…' },
      { id: 'c02', from: 'clara', text: 'Je suis tellement désolée. Je n’ai rien pris, promis.' },
      ...replies('ch_clara_aprem', [
        { id: 'c_aprem_1', from: 'clara', text: 'Oui… enfin oui.' },
        {
          id: 'c_aprem_2',
          from: 'clara',
          text: 'Je suis restée là tout le temps, jusqu’à ce qu’Inès revienne.',
          effects: [statement('st_clara_restee')],
        },
        { id: 'c_aprem_3', from: 'clara', text: 'J’ai fini les guirlandes. C’est tout.' },
      ]),
      ...replies('ch_clara_veste', [
        { id: 'c_veste_1', from: 'clara', text: 'Non, non. Il était parti depuis longtemps.' },
        {
          id: 'c_veste_2',
          from: 'clara',
          text: 'Il m’a écrit à 17h31 pour que je garde sa veste. Je l’ai juste posée sur l’accoudoir.',
        },
      ]),
      ...replies('ch_clara_bruit', [
        { id: 'c_bruit_1', from: 'clara', text: 'Non…' },
        { id: 'c_bruit_2', from: 'clara', text: 'Personne. Je… j’avais de la musique.' },
      ]),
      ...replies('ch_clara_verite', [
        { id: 'c_ver_1', from: 'clara', text: '…' },
        { id: 'c_ver_2', from: 'clara', text: 'J’ai cassé ton vase bleu. Vers 17h55, en accrochant la guirlande.' },
        { id: 'c_ver_3', from: 'clara', text: 'J’ai paniqué. Je suis sortie à 17h58 en racheter un pareil au Bazar du Midi.' },
        {
          id: 'c_ver_4',
          from: 'clara',
          text: 'Je suis revenue vers 18h20. J’ai mis le neuf à la place et jeté les morceaux.',
          effects: [statement('st_clara_aveu')],
        },
        {
          id: 'c_ver_5',
          from: 'clara',
          text: 'Et… quand je suis rentrée, le tiroir de l’entrée était entrouvert. J’ai cru qu’Inès était repassée. Je n’ai pas osé regarder dedans.',
        },
        { id: 'c_ver_6', from: 'clara', text: 'Pardon. Je te rembourse le vase, évidemment.' },
      ]),
    ],
    choices: [
      {
        id: 'ch_clara_aprem',
        label: 'Tu étais seule après le départ d’Inès ?',
        text: 'Inès est partie vers 17h45. Tu étais seule à l’appart ensuite ?',
      },
      {
        id: 'ch_clara_veste',
        label: 'Hugo était encore là sur ta photo ?',
        text: 'Sur ta photo de 17h42, il y a la veste de Hugo. Il était encore là ?',
        condition: has('ev_photo_salon'),
      },
      {
        id: 'ch_clara_bruit',
        label: 'Tu as entendu quelqu’un entrer ?',
        text: 'Tu n’as entendu personne entrer, entre 17h45 et 18h30 ?',
        condition: after('ch_clara_aprem'),
      },
      {
        id: 'ch_clara_verite',
        label: 'Clara, dis-moi la vérité',
        text: 'Clara, tu n’es pas restée ici tout l’après-midi. Dis-moi la vérité.',
        locked: true,
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Yanis — laconique, sec, sûr de lui                                */
  /* ---------------------------------------------------------------- */
  {
    id: 'conv_yanis',
    title: 'Yanis Haddad',
    kind: 'private',
    participants: ['yanis'],
    messages: [
      { id: 'y01', from: 'yanis', text: 'Avant que tu demandes : non.' },
      { id: 'y02', from: 'yanis', text: 'Mais vas-y. Demande.' },
      ...replies('ch_yanis_aprem', [
        { id: 'y_aprem_1', from: 'yanis', text: 'Salle.' },
        {
          id: 'y_aprem_2',
          from: 'yanis',
          text: 'Arrivé vers 17h30, reparti à 19h. J’ai pas remis les pieds chez toi.',
          effects: [statement('st_yanis_salle')],
        },
      ]),
      ...replies('ch_yanis_enveloppe', [
        { id: 'y_env_1', from: 'yanis', text: 'Aucune idée.' },
        {
          id: 'y_env_2',
          from: 'yanis',
          text: 'J’ai pas suivi votre histoire de tiroir. Je gonflais des ballons avec Hugo.',
          effects: [statement('st_yanis_ignorait')],
        },
      ]),
      ...replies('ch_yanis_pret', [
        { id: 'y_pret_1', from: 'yanis', text: 'Hugo ferait mieux de s’occuper de ses dettes.' },
        {
          id: 'y_pret_2',
          from: 'yanis',
          text: 'Oui, j’avais un loyer en retard. C’est réglé. Et ça fait pas de moi un voleur.',
        },
      ]),
      ...replies('ch_yanis_wifi', [
        { id: 'y_wifi_1', from: 'yanis', text: '…' },
        { id: 'y_wifi_2', from: 'yanis', text: 'Ok. Je suis repassé deux minutes.' },
        {
          id: 'y_wifi_3',
          from: 'yanis',
          text: 'J’avais oublié mon chargeur sur le canapé. Je l’ai pris et je suis reparti. C’est tout.',
          effects: [statement('st_yanis_chargeur')],
        },
        { id: 'y_wifi_4', from: 'yanis', text: 'Je l’ai pas dit parce que je savais comment ça allait sonner.' },
      ]),
      ...replies('ch_yanis_mensonges', [
        { id: 'y_mens_1', from: 'yanis', text: 'Tu crois ce que tu veux.' },
        { id: 'y_mens_2', from: 'yanis', text: 'Si t’es si sûr de toi, dis-le devant tout le monde.' },
      ]),
    ],
    choices: [
      { id: 'ch_yanis_aprem', label: 'Tu as fait quoi après être parti ?', text: 'Tu as fait quoi, après être parti à 17h20 ?' },
      {
        id: 'ch_yanis_enveloppe',
        label: 'Tu savais où était l’enveloppe ?',
        text: 'Tu savais où Inès avait rangé l’enveloppe ?',
      },
      {
        id: 'ch_yanis_pret',
        label: 'Tu as demandé 400 francs à Hugo',
        text: 'Hugo m’a montré ton message. Tu lui as demandé 400 francs la semaine dernière.',
        condition: has('ev_capture_pret'),
      },
      {
        id: 'ch_yanis_wifi',
        label: 'Ton téléphone était sur mon Wi-Fi à 18h04',
        text: 'Ton téléphone s’est reconnecté à mon Wi-Fi de 18h04 à 18h07. Tu étais à la salle, vraiment ?',
        locked: true,
      },
      {
        id: 'ch_yanis_mensonges',
        label: 'Tu m’as menti, Yanis',
        text: 'Tu savais où était l’enveloppe, tu es revenu quand l’appart était vide, et tu m’as menti deux fois.',
        condition: {
          type: 'all',
          conditions: [
            { type: 'contradictionFound', contradictionId: 'c_yanis_salle' },
            { type: 'contradictionFound', contradictionId: 'c_yanis_tiroir' },
            { type: 'not', condition: { type: 'solved' } },
          ],
        },
      },
    ],
  },
];
