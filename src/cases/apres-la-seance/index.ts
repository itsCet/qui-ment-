import type { Case } from '../../engine/types';
import { conversations } from './conversations';
import { evidence, IMG, initialEvidence } from './evidence';

const flag = (name: string) => ({ type: 'flag', flag: name }) as const;
const found = (contradictionId: string) => ({ type: 'contradictionFound', contradictionId }) as const;

export const apresLaSeance: Case = {
  id: 'apres-la-seance',
  title: 'Après la séance',
  tagline: 'À 22:05, Lucas annonçait qu’il rentrait. À 23:20, on l’a trouvé dans la cabine.',
  duration: '15 à 20 min',
  difficulty: 'Criminelle',
  playerName: 'Enquêteur',
  intro: [
    'Mardi 3 mars, 23:20. Au Rialto, un cinéma fermé pour travaux, le gardien trouve Lucas Morel, 32 ans, projectionniste, mort dans la cabine de projection.',
    'Une lourde bobine métallique est à proximité. Une housse de disque dur est vide. Le téléphone de Lucas est retrouvé sous un fauteuil de la salle.',
    'L’équipe informatique a déverrouillé le téléphone et fourni une extraction. Tu es l’enquêteur chargé de l’examiner, avec ta collègue Inès.',
  ],
  clock: { start: '07:52', perChoiceMinutes: 2, max: '11:30', deadlineLabel: 'Projection publique prévue samedi' },
  device: {
    ownerName: 'Enquêteur',
    date: { weekday: 'Mercredi', day: '4', month: 'mars' },
    weather: { city: 'Centre-ville', temperature: '7°', condition: 'Pluie fine' },
    event: { title: 'Projection privée du film', time: 'jeudi 20:00' },
    copy: { ownerName: 'Lucas', syncedAt: 'extraction du mar. 3 mars, 23:58' },
    apps: [],
  },

  suspects: [
    {
      id: 'adrien',
      name: 'Adrien Faure',
      initials: 'AF',
      age: 35,
      role: 'Mis en cause par le documentaire',
      bio: 'Ancien responsable d’atelier. Le documentaire l’accuse d’avoir ignoré une alarme avant un accident. Il conteste depuis des semaines, avec colère.',
      hue: 25,
      shape: 'circle',
      conversationId: 'conv_adrien',
      avatar: `${IMG}/portrait-adrien.webp`,
      items: ['ev_effets_adrien'],
    },
    {
      id: 'salome',
      name: 'Salomé Bertin',
      initials: 'SB',
      age: 31,
      role: 'Réalisatrice du documentaire',
      bio: 'Elle porte ce film depuis deux ans. La projection privée de jeudi devait lancer sa diffusion.',
      hue: 300,
      shape: 'circle',
      conversationId: 'conv_salome',
      avatar: `${IMG}/portrait-salome.webp`,
      items: ['ev_effets_salome'],
    },
    {
      id: 'nina',
      name: 'Nina Roche',
      initials: 'NR',
      age: 24,
      role: 'Assistante de montage',
      bio: 'Elle a travaillé sur tout le montage du film. Précise, disponible, elle connaît chaque fichier du projet.',
      hue: 200,
      shape: 'circle',
      conversationId: 'conv_nina',
      avatar: `${IMG}/portrait-nina.webp`,
      items: ['ev_sac_nina'],
    },
    {
      id: 'lucas',
      name: 'Lucas Morel',
      initials: 'LM',
      age: 32,
      role: 'Projectionniste du Rialto',
      bio: 'La victime.',
      hue: 45,
      shape: 'circle',
      conversationId: 'arch_groupe',
      npc: true,
    },
    {
      id: 'ines',
      name: 'Inès Garnier',
      initials: 'IG',
      age: 38,
      role: 'Ta collègue',
      bio: 'Enquêtrice, elle coordonne les constatations et l’équipe informatique.',
      hue: 160,
      shape: 'circle',
      conversationId: 'conv_ines',
      npc: true,
    },
  ],

  conversations,
  evidence,
  initialEvidence,

  statements: [
    { id: 'st_lucas_bus', suspectId: 'lucas', text: 'J’ai pris le dernier bus. On reprend demain.', context: 'Message de Lucas au groupe, 22:05' },
    { id: 'st_adrien_absent', suspectId: 'adrien', text: 'Je ne suis pas allé au Rialto hier soir.', context: 'Adrien, première audition' },
    {
      id: 'st_adrien_venu',
      suspectId: 'adrien',
      text: 'Je suis venu de 21 h 05 à 21 h 20. Lucas m’a fait écouter l’enregistrement complet.',
      context: 'Adrien, après relance',
    },
    {
      id: 'st_salome_aucun',
      suspectId: 'salome',
      text: 'Personne ne m’a signalé de problème sur ce passage, à part Adrien.',
      context: 'Salomé, première audition',
    },
    {
      id: 'st_salome_aveu',
      suspectId: 'salome',
      text: 'Karim m’avait prévenue, je n’ai pas réécouté. Nina avait préparé le montage initial.',
      context: 'Salomé, face à l’enregistrement complet',
    },
    {
      id: 'st_nina_avant',
      suspectId: 'nina',
      text: 'Je suis passée vers 20 h 30, avant l’arrivée d’Adrien. Je ne suis pas revenue ensuite.',
      context: 'Nina, première audition',
    },
    {
      id: 'st_nina_cles',
      suspectId: 'nina',
      text: 'En partant, j’ai posé mes clés sur la tablette, sous le miroir cassé.',
      context: 'Nina, première audition',
    },
    {
      id: 'st_nina_2205',
      suspectId: 'nina',
      text: 'À 22 h 05, Lucas écrivait encore au groupe. J’étais chez moi avant dix heures.',
      context: 'Nina, première audition',
    },
    {
      id: 'st_nina_v2',
      suspectId: 'nina',
      text: 'Je suis revenue vers 21 h 40, on s’est disputés, le miroir s’est cassé avec mon sac. Lucas allait bien quand je suis partie.',
      context: 'Nina, deuxième version',
    },
    { id: 'st_nina_affaires', suspectId: 'nina', text: 'Je n’ai emporté que mes affaires. Rien qui soit à Lucas.', context: 'Nina' },
    { id: 'st_nina_prete', suspectId: 'nina', text: 'Lucas m’a prêté ce disque, pour corriger le montage chez moi.', context: 'Nina' },
  ],

  contradictions: [
    {
      id: 'c_adrien',
      statementId: 'st_adrien_absent',
      evidenceIds: ['ev_msg_rdv_adrien', 'ev_miroir_intact', 'ev_msg_raison'],
      title: 'Adrien est venu',
      explanation:
        'Adrien nie être venu, mais il a répondu « J’y serai », puis écrit « Je suis dans le hall » à 21:04. Être venu ne fait pas de lui le coupable : il faut savoir pourquoi Lucas l’avait invité.',
    },
    {
      id: 'c_salome',
      statementId: 'st_salome_aucun',
      evidenceIds: ['ev_msg_karim', 'ev_historique_montage'],
      title: 'Salomé avait été prévenue',
      explanation:
        'Salomé dit que personne ne lui avait signalé de problème. Elle écrivait pourtant à Lucas, mardi : « quand Karim a soulevé ça ». Elle a ignoré un avertissement — ce qui explique son mensonge, sans la placer dans la cabine.',
    },
    {
      id: 'c_nina_2205',
      statementId: 'st_nina_2205',
      evidenceIds: ['ev_programmation'],
      title: 'Le message n’était pas écrit à 22:05',
      explanation:
        'Nina s’appuie sur le message de 22:05. Il avait été programmé à 21:25 : il ne dit rien de ce qu’il se passait dans la cabine à 22:05.',
    },
    {
      id: 'c_miroir',
      statementId: 'st_nina_cles',
      evidenceIds: ['ev_miroir_intact'],
      title: 'Le miroir était intact à 21:05',
      explanation:
        'Nina dit être passée vers 20 h 30, avant Adrien, sans revenir — et avoir posé ses clés « sous le miroir cassé ». À 21:05, ce miroir est intact. Pour l’avoir vu cassé, elle est revenue plus tard. Cela établit qu’elle cache une partie de sa présence, pas qu’elle a tué Lucas. Inès voudra en parler avec toi une fois le message de 22:05 vérifié.',
    },
    {
      id: 'c_sac',
      statementId: 'st_nina_affaires',
      evidenceIds: ['ev_sac_nina', 'ev_video_disque'],
      title: 'Un disque rouge « MASTER » dans son sac',
      explanation:
        'Nina dit n’avoir rien emporté de Lucas. Son sac contient un disque rouge étiqueté « MASTER », comme celui que Lucas filmait à 15:12. Une couleur et une étiquette ne suffisent pas : demande à Inès de vérifier le numéro de série.',
    },
    {
      id: 'c_prete',
      statementId: 'st_nina_prete',
      evidenceIds: ['ev_msg_disque'],
      title: 'Lucas ne le lui avait pas prêté',
      explanation:
        'À 21:34, Lucas lui écrit : « Le disque reste ici. Je ne te le confie pas avant d’avoir parlé à Salomé. » Nina a donc emporté le disque malgré son refus, et menti sur ce qu’elle a pris et sur la fin du rendez-vous. Ce disque contient le projet où elle a créé la coupe.',
    },
  ],

  mismatchFeedback: [
    {
      statementId: 'st_nina_avant',
      evidenceId: 'ev_miroir_intact',
      text: 'Seule, cette photo ne contredit pas l’heure de son passage. Relis ce que Nina dit du miroir.',
    },
    {
      statementId: 'st_nina_cles',
      evidenceId: 'ev_miroir_casse',
      text: 'Le miroir est bien cassé, comme elle le dit. La question est : depuis quand ? Cherche une photo du même miroir, plus tôt dans la soirée.',
    },
    {
      statementId: 'st_nina_2205',
      evidenceId: 'ev_msg_nina_rdv',
      text: 'Elle a bien répondu « pas ce soir ». Mais répondre « pas ce soir » n’empêche pas de venir quand même.',
    },
    {
      statementId: 'st_lucas_bus',
      evidenceId: 'ev_telephone',
      text: 'Le téléphone était dans la salle, c’est un fait. Mais ce qui compte, c’est comment ce message a été envoyé. Demande à l’informatique.',
    },
    {
      statementId: 'st_adrien_venu',
      evidenceId: 'ev_msg_menace',
      text: 'La menace date de février. Le 3 mars, Lucas lui donnait raison. Ça ne contredit pas son récit de la soirée.',
    },
    {
      statementId: 'st_nina_affaires',
      evidenceId: 'ev_msg_disque',
      text: 'Ce message dit que Lucas refusait de lui confier le disque. Il faut d’abord établir que le disque est chez elle.',
    },
    {
      statementId: 'st_nina_prete',
      evidenceId: 'ev_inventaire',
      text: 'L’inventaire prouve que c’est le disque de Lucas. Reste à savoir s’il le lui avait prêté : relis leurs derniers messages.',
    },
  ],
  defaultMismatchFeedback: 'Ces deux éléments ne se contredisent pas. Cherche ce qui est incompatible avec la déclaration, pas seulement ce qui s’y rapporte.',

  objectives: [
    {
      id: 'obj_depart',
      title: 'Comprendre pourquoi Lucas annonce un départ qu’il n’a pas fait.',
      description: 'Lis l’extraction, entends Adrien, Salomé et Nina, et cherche pourquoi Lucas voyait du monde hier soir.',
      completeWhen: flag('acte2'),
      hints: [
        'Lis les échanges de Lucas dans l’extraction, puis commence les auditions dans l’appli Enquête.',
        'Quelqu’un nie être venu au Rialto, alors que l’extraction montre le contraire. Relance-le.',
        'Audition d’Adrien : « Où étiez-vous ? », puis « Lucas vous attendait à 21 h ». Ensuite, demande à Inès pourquoi Lucas avait accepté de le voir.',
      ],
    },
    {
      id: 'obj_film',
      title: 'Comprendre ce que Lucas avait découvert sur le film.',
      description: 'Compare la séquence du film et l’enregistrement complet, puis parles-en à qui a fait le film.',
      completeWhen: flag('salome_aveu'),
      hints: [
        'Lis les deux extraits envoyés par Inès : la même phrase n’a pas le même sens.',
        'La réalisatrice dit que le film est fidèle. Montre-lui l’enregistrement complet.',
        'Audition de Salomé : « Le film est-il fidèle ? », puis « J’ai l’enregistrement complet ».',
      ],
    },
    {
      id: 'obj_message',
      title: 'Vérifier ce que prouve vraiment le message de 22:05.',
      description: 'Tout le monde considère que Lucas était vivant à 22:05. Fais vérifier ce message.',
      completeWhen: flag('d1_ok'),
      hints: [
        'Ce message sert d’appui à un récit. Assure-toi d’avoir entendu chacun sur sa soirée.',
        'Après avoir entendu Nina sur sa soirée, demande à Inès de faire vérifier le message par l’informatique.',
        'Un message programmé part tout seul : il ne dit pas si son auteur était vivant à l’heure d’envoi.',
      ],
    },
    {
      id: 'obj_recit',
      title: 'Revenir sur le récit qui s’appuyait sur ce message.',
      description: 'Relis les premières explications de chacun : l’une d’elles contient un détail que la personne n’aurait pas dû connaître.',
      completeWhen: flag('nina_v2'),
      hints: [
        'Relis mot à mot les déclarations de la première audition qui citait le message de 22:05.',
        'Un détail de la cabine est décrit par quelqu’un qui dit être parti tôt. Compare avec la photo envoyée par Lucas à 21:05.',
        'Carnet : « sous le miroir cassé » (Nina) + « Le couloir à 21:05 ». Réponds à Inès, puis retourne voir Nina.',
      ],
    },
    {
      id: 'obj_disque',
      title: 'Savoir ce qui a été emporté de la cabine.',
      description: 'Une housse de disque était vide. Qu’est-ce qu’elle contenait, et où est passé son contenu ?',
      completeWhen: found('c_prete'),
      hints: [
        'Une vidéo de travail montre ce que contenait la housse. Les fiches montrent ce que chacun avait sur soi.',
        'Confronte « je n’ai emporté que mes affaires » au contenu de son sac, puis fais vérifier le numéro de série.',
        'Carnet : « Rien qui soit à Lucas » + « Sac de Nina » ; Inès : vérifier le disque ; puis « Lucas me l’a prêté » + « Le disque reste ici ».',
      ],
    },
    {
      id: 'obj_confronter',
      title: 'Préparer et mener la confrontation.',
      description: 'Réponds aux questions d’Inès, puis confronte la personne concernée.',
      completeWhen: flag('fin'),
      hints: [
        'Inès te pose trois questions avant la confrontation : qui, quoi, et pourquoi le message ne disculpe pas.',
        'Repense à ce qui manquait dans la cabine, et à la façon dont le message de 22:05 a été envoyé.',
        'Nina ; le disque MASTER ; programmé à 21:25. Puis « Confronter Nina » dans son audition.',
      ],
    },
  ],

  solution: {
    prompt: 'Qui a frappé Lucas ?',
    noAccusation: true,
    verdictLabel: 'Responsable',
    culpritId: 'nina',
    resolvedWhen: flag('fin'),
    maxEvidence: 1,
    requirements: [],
    wrongSuspectFeedback: {},
    resolution: {
      summary:
        'Nina est revenue au Rialto après avoir dit « pas ce soir ». Pendant la dispute, elle a frappé Lucas avec la bobine pour lui prendre le disque qui contenait le projet de sa coupe trompeuse. Le message programmé de 22:05 lui a servi d’alibi.',
      timeline: [
        { time: '20:48', text: 'Salomé quitte le cinéma et reporte la discussion sur le montage.' },
        { time: '21:05', text: 'Adrien arrive. Lucas lui envoie la photo du couloir : le miroir est intact.', key: true },
        { time: '21:18', text: 'Lucas écrit à Adrien : « Tu avais raison. Cette séquence est trompeuse. »' },
        { time: '21:20', text: 'Adrien repart. Une caméra le filme à deux kilomètres à 21:34.' },
        { time: '21:25', text: 'Lucas programme pour 22:05 : « J’ai pris le dernier bus. On reprend demain. »', key: true },
        { time: '21:30', text: 'Lucas demande à voir Nina ; elle répond « Pas ce soir ». À 21:34, il refuse de lui confier le disque.' },
        { time: '≈ 21:40', text: 'Nina revient. Dispute ; son sac brise le miroir. Elle frappe Lucas, prend le disque et le téléphone, qui lui échappe sous un fauteuil.', key: true },
        { time: '22:05', text: 'Le message part tout seul. Nina y voit un alibi et répond « Bien rentré » à 22:09.', key: true },
        { time: '23:20', text: 'Le gardien découvre Lucas.' },
      ],
      decisive: [
        { evidenceId: 'ev_programmation', text: 'Le message de 22:05 était programmé à 21:25 : il ne prouvait pas que Lucas vivait encore.' },
        {
          evidenceId: 'ev_miroir_intact',
          text: 'Le miroir était intact à 21:05. Nina, qui disait être partie avant, l’avait vu cassé : elle était revenue.',
        },
        {
          evidenceId: 'ev_msg_disque',
          text: 'Lucas refusait par écrit de lui confier le disque, retrouvé dans son sac (numéro de série WX-4471).',
        },
        {
          evidenceId: 'ev_comparaison',
          text: 'Le mobile : la coupe transformait une citation contestée en aveu. Le projet d’origine le prouvait.',
        },
      ],
      falseLeads: [
        {
          title: 'Adrien, l’homme qui menaçait',
          text: 'Adrien a menacé Lucas en février, puis menti sur sa visite. Mais il venait chercher réparation : Lucas lui donnait raison, et une caméra le place loin du cinéma après 21:20.',
        },
        {
          title: 'Salomé et le film',
          text: 'Salomé a ignoré l’avertissement de Karim et défendu une séquence qui servait son film. C’est une faute réelle, qui explique ses mensonges — pas un meurtre. Elle avait quitté le cinéma à 20:48.',
        },
        {
          title: 'Le message de 22:05',
          text: 'Il semblait prouver que Lucas était parti, puis qu’il vivait après le départ de Nina. Il ne prouvait ni l’un ni l’autre : Lucas l’avait programmé pour couper à dix heures, comme il en avait l’habitude.',
        },
      ],
      epilogue:
        'Nina a frappé Lucas et pris le disque. Salomé a fermé les yeux sur un montage trompeur. Adrien a menacé Lucas, puis était venu chercher réparation. Et Lucas, qui avait d’abord laissé passer la séquence sans la vérifier, avait décidé de corriger son erreur. Dans son téléphone, un brouillon jamais envoyé à Adrien : « Je ne peux pas annuler ce que vous avez déjà subi. Mais demain, on montre la version complète. » La projection publique est suspendue.',
    },
  },

  scoring: { start: 100, hintCost: [3, 6, 9], wrongSuspect: 0, insufficientEvidence: 0, mistake: 5 },
};
