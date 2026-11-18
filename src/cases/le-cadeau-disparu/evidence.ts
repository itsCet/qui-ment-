import type { Evidence } from '../../engine/types';

export const evidence: Evidence[] = [
  {
    id: 'ev_photo_enveloppe',
    title: 'Photo de l’enveloppe',
    summary: '16:32 — l’enveloppe dans le tiroir de l’entrée',
    description:
      'Une enveloppe kraft marquée « Pour Léa », posée dans le tiroir de la commode de l’entrée. Inès précise : cinq billets de 100, recomptés deux fois.',
    source: 'Envoyée par Inès dans le groupe à 16:32.',
    time: '16:32',
    image: '/photos/enveloppe.webp',
    content: { type: 'photo', visual: 'enveloppe', caption: 'Tiroir de la commode de l’entrée, 16:32' },
  },
  {
    id: 'ev_msg_yanis_1633',
    title: 'Réponse de Yanis',
    summary: '16:33 — « Tiroir de l’entrée 👌 »',
    description:
      'Une minute après la photo d’Inès, Yanis accuse réception dans le groupe et nomme lui-même la cachette.',
    source: 'Message de Yanis dans le groupe de l’anniversaire.',
    time: '16:33',
    content: {
      type: 'quote',
      author: 'yanis',
      time: '16:33',
      text: 'Bien reçu chef. Tiroir de l’entrée 👌',
      context: 'En réponse à la photo de l’enveloppe envoyée par Inès.',
    },
  },
  {
    id: 'ev_photo_salon',
    title: 'Photo du salon',
    summary: '17:42 — le salon décoré, une veste kaki sur le canapé',
    description:
      'Guirlandes et banderole « 30 ans ». Sur l’accoudoir du canapé, la veste kaki de Hugo. Personne n’apparaît sur la photo.',
    source: 'Envoyée par Clara dans le groupe à 17:42.',
    time: '17:42',
    image: '/photos/salon.webp',
    content: { type: 'photo', visual: 'salon', caption: 'Salon, 17:42 — la veste kaki de Hugo sur l’accoudoir' },
  },
  {
    id: 'ev_journal_serrure',
    title: 'Journal de la serrure',
    summary: '7 ouvertures depuis l’extérieur, dont une à 18:04',
    description:
      'La serrure connectée enregistre chaque ouverture depuis l’extérieur et sa méthode. Elle n’enregistre pas les sorties et ne sait pas qui tape le code invité.',
    source: 'Application de ta serrure connectée.',
    content: {
      type: 'log',
      app: 'Serrure · Porte d’entrée',
      columns: ['Heure', 'Ouverture'],
      rows: [
        ['16:01', 'Code invité'],
        ['16:10', 'Code invité'],
        ['16:18', 'Code invité'],
        ['18:04', 'Code invité'],
        ['18:21', 'Code invité'],
        ['18:33', 'Code invité'],
        ['18:41', 'Clé physique'],
      ],
      note: 'Code invité partagé ce matin avec Inès, Hugo, Clara et Yanis. Les sorties ne sont pas enregistrées.',
    },
  },
  {
    id: 'ev_journal_routeur',
    title: 'Journal du routeur Wi-Fi',
    summary: 'Connexions des téléphones à ton Wi-Fi',
    description:
      'Le routeur garde l’historique des appareils connectés. Un téléphone qui connaît le mot de passe se reconnecte tout seul dès qu’il entre ; le signal ne dépasse pas le palier.',
    source: 'Application de ton routeur Wi-Fi.',
    content: {
      type: 'log',
      app: 'Routeur · Appareils',
      columns: ['Appareil', 'Connecté', 'Déconnecté'],
      rows: [
        ['INES-TEL', '16:01', '17:46'],
        ['hugo-phone', '16:10', '17:05'],
        ['YANIS-P', '16:10', '17:21'],
        ['Clara_mobile', '16:18', '17:58'],
        ['YANIS-P', '18:04', '18:07'],
        ['Clara_mobile', '18:21', 'en ligne'],
        ['INES-TEL', '18:33', 'en ligne'],
        ['SAM-TEL', '18:41', 'en ligne'],
      ],
      note: '« en ligne » : toujours connecté au moment de la consultation.',
    },
  },
  {
    id: 'ev_ticket_vase',
    title: 'Ticket du Bazar du Midi',
    summary: '18:09 — un vase en verre bleu',
    description:
      'Retrouvé dans la poubelle de la cuisine, avec des éclats de verre bleu emballés dans du papier journal. Le Bazar du Midi est à dix minutes à pied.',
    source: 'Trouvé dans ta poubelle de cuisine.',
    time: '18:09',
    image: '/photos/poubelle.webp',
    content: {
      type: 'receipt',
      shop: 'Bazar du Midi — Lausanne',
      lines: [
        ['Vase verre bleu 25 cm', '34.90'],
        ['Total CHF', '34.90'],
        ['Paiement', 'Carte'],
      ],
      footer: 'Sam. 14.11 · 18:09 · Caisse 2',
    },
  },
  {
    id: 'ev_chargeur',
    title: 'Chargeur blanc',
    summary: 'Toujours branché derrière le canapé',
    description:
      'Un chargeur de téléphone blanc, branché à la prise derrière le canapé. Sur le bloc, des initiales au feutre : « Y.H. ».',
    source: 'Trouvé derrière ton canapé à ton retour.',
    image: '/photos/chargeur.webp',
    content: { type: 'object', icon: 'plug', note: 'Toujours branché à 18:45. Initiales « Y.H. » au feutre.' },
  },
  {
    id: 'ev_ticket_ballons',
    title: 'Ticket des ballons',
    summary: '18:05 — magasin de fête au Flon',
    description:
      'Inès a payé six ballons hélium à 18:05 dans un magasin de fête du Flon, à un quart d’heure de chez toi.',
    source: 'Photo envoyée par Inès.',
    time: '18:05',
    content: {
      type: 'receipt',
      shop: 'La Fabrique à Fêtes — Flon',
      lines: [
        ['Ballons hélium × 6', '42.00'],
        ['Ruban doré', '4.50'],
        ['Total CHF', '46.50'],
      ],
      footer: 'Sam. 14.11 · 18:05 · Carte',
    },
  },
  {
    id: 'ev_historique_livraisons',
    title: 'Historique de livraisons',
    summary: '17:28–18:52 — courses à vélo à Renens et Prilly',
    description:
      'Capture de l’application de livraison de Hugo : cinq étapes à vélo, toutes à l’ouest de Lausanne, pendant toute la période.',
    source: 'Capture envoyée par Hugo.',
    content: {
      type: 'log',
      app: 'Livraisons · Compte H. Bernard',
      columns: ['Heure', 'Étape'],
      rows: [
        ['17:28', 'Retrait — Renens, gare'],
        ['17:44', 'Livré — Renens, Silo'],
        ['18:02', 'Retrait — Prilly, centre'],
        ['18:19', 'Livré — Prilly, Jolimont'],
        ['18:52', 'Livré — Renens, Florissant'],
      ],
      note: 'Chaque étape est validée par géolocalisation.',
    },
  },
  {
    id: 'ev_capture_pret',
    title: 'Message de Yanis à Hugo',
    summary: '9 novembre — Yanis demande 400 CHF',
    description: 'Capture d’une conversation entre Yanis et Hugo, cinq jours avant l’anniversaire.',
    source: 'Capture envoyée par Hugo.',
    content: {
      type: 'quote',
      author: 'yanis',
      time: '09.11 · 22:14',
      text: 'T’aurais pas 400 à me prêter ? Juste jusqu’à la fin du mois. C’est chaud.',
      context: 'Hugo a répondu : « frérot j’ai même pas 40 ».',
    },
  },
];
