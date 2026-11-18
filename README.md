# Qui ment ?

Jeu d’enquête narratif en français, présenté comme un téléphone fictif. Le joueur lit des
conversations, interroge des suspects, collecte des preuves et démontre qui ment.

Trois enquêtes, choisies depuis l’écran verrouillé, avec des sauvegardes séparées :

1. **« Le cadeau disparu »** (5 à 10 minutes). Une enveloppe de 500 CHF destinée à
   l’anniversaire de Léa disparaît d’un appartement lausannois ; quatre amis sont suspects.
2. **« Le dernier signal »** (15 à 20 minutes, thriller). Tu es Alex. Ton frère Élias,
   technicien dans un observatoire de montagne, a disparu après un message de départ qui
   ne lui ressemble pas. Tu lis une **copie en lecture seule** de son téléphone
   (synchronisée jeudi à 22:14) et tu écris en ton nom à sa sœur, à ses collègues, puis
   aux secours. Il faut démontrer qui a envoyé le message, comprendre pourquoi cette
   personne ment, et guider les secours vers le bon endroit. La conversation avec les
   secours est entièrement fictive : aucun appel ni service réel n’est contacté.
3. **« Après la séance »** (15 à 20 minutes). Lucas Morel, projectionniste du Rialto,
   est retrouvé mort dans la cabine. Son dernier message, à 22:05, dit qu’il a pris le
   dernier bus. Avec ta collègue Inès, tu lis l’extraction de son téléphone et tu
   auditionnes trois personnes. Il faut établir que ce message était programmé, qui
   cache une partie de sa présence, et ce qui a quitté la cabine.

Application web mobile installable (PWA), en portrait, jouable à une main, hors ligne après
le premier chargement. Aucun backend, aucun compte.

## Pile technique

- React 19 + TypeScript + Vite
- React Router (navigation), Zustand (état du jeu)
- `localStorage` (sauvegarde versionnée et validée)
- `vite-plugin-pwa` (manifeste, icônes, service worker Workbox)
- Vitest (tests), ESLint (lint)

## Installation et lancement

Prérequis : Node.js 20.19 ou plus récent.

```bash
npm install
npm run dev          # serveur de développement : http://localhost:5173
```

Autres commandes :

```bash
npm test             # tests (Vitest)
npm run typecheck    # contrôle TypeScript
npm run lint         # ESLint
npm run build        # build de production dans dist/ (inclut le contrôle TypeScript)
npm run preview      # sert le build de production : http://localhost:4173
npm run check        # typecheck + lint + tests
```

## Tester sur un téléphone (navigateur mobile)

Le jeu se teste directement dans le navigateur du téléphone : aucune application à
installer.

**Sur le réseau local (le plus rapide)**

1. Ordinateur et téléphone sur le même Wi-Fi.
2. `npm run dev -- --host` (ou `npm run build && npm run preview -- --host`).
3. Vite affiche une adresse « Network », par exemple `http://192.168.1.20:5173`.
4. Ouvre cette adresse dans Safari (iOS) ou Chrome (Android).

En HTTP sur le réseau local, le navigateur n’active pas le service worker : le jeu
fonctionne, mais le mode hors ligne et l’installation complète nécessitent HTTPS.

**Avec HTTPS (installation et hors ligne)** — déploie une préversion sur Vercel (voir
ci-dessous), puis ouvre l’URL sur le téléphone :

- iOS (Safari) : bouton Partager → « Sur l’écran d’accueil ».
- Android (Chrome) : menu ⋮ → « Installer l’application » ou « Ajouter à l’écran d’accueil ».
- Pour vérifier le hors-ligne : ouvre le jeu une fois, passe en mode avion, relance-le.

**Dans un navigateur de bureau** : outils de développement → mode appareil (par exemple
iPhone SE ou Pixel 7), en orientation portrait.

## Déploiement sur Vercel

Le projet est prêt pour Vercel ; **il n’a pas été déployé** dans le cadre de ce travail.

- `vercel.json` : framework Vite, commande `npm run build`, sortie `dist/`, réécriture de
  toutes les routes de l’application vers `index.html` (un rechargement direct de
  `/enquete/le-cadeau-disparu/preuves` fonctionne), et en-têtes de cache adaptés au service
  worker.
- Option 1 : importer le dépôt GitHub dans Vercel (« Add New… → Project »). Les réglages
  sont lus depuis `vercel.json`.
- Option 2 : en ligne de commande, `npx vercel` (préversion) puis `npx vercel --prod`.

## Structure

```
src/
  engine/        moteur pur : types, conditions, effets, progression, score, validation
  cases/         données narratives (une enquête = un dossier de données typées)
  save/          sauvegarde : version, validation, migration, lecture/écriture
  state/         store Zustand : relie moteur et sauvegarde, sauvegarde après chaque action
  ui/            composants et écrans (aucune logique de jeu)
docs/
  format-enquetes.md               format pour ajouter une enquête
  conception/le-cadeau-disparu.md  document interne du niveau 1 : vérité, chronologie, solution
  conception/le-dernier-signal.md  document interne du niveau 2 : vérité, chronologie, savoirs, déblocages
  conception/apres-la-seance.md    document interne du niveau 3 : chronologie, origine des pièces, déductions
public/          icônes PWA (générées par scripts/generate-icons.cjs)
```

Séparation stricte : l’interface lit l’état et appelle le store ; le store appelle le moteur
puis la sauvegarde ; le moteur ne connaît que les données. Les enquêtes ne contiennent
aucun code exécutable (pas de `eval`, conditions et effets sous forme de données).

## Écrans

Le jeu se présente comme le téléphone de Sam, en thème clair.

1. **Écran verrouillé** (menu) : heure de l’enquête, carte de l’enquête et avancement,
   Commencer/Reprendre, Recommencer (avec confirmation), « Comment jouer », Réglages
   (messages instantanés).
2. **Écran d’accueil** : widgets Calendrier, Météo et Objectif ; applis Échanges, Photos,
   Notes, Contacts, Serrure, Box, Carnet, Enquête ; badges de non-lus ; barre d’accueil
   pour revenir à l’écran d’accueil depuis n’importe quelle appli.
3. **Échanges** : groupe et discussions privées ; messages révélés progressivement avec
   indicateur de saisie ; réponses proposées en bulles de suggestion ; photos dans les
   bulles ; « Afficher tout de suite » ; notifications en bannière.
4. **Notes** : les notes du joueur, avec une liste de choses à vérifier à cocher ; dans
   le niveau 2, aussi les notes d’Élias issues de la copie.
5. **Photos**, **Fichiers**, **Serrure**, **Box**, **Sauvegarde** : la galerie (classée
   par date, avec agrandissement), les documents, et les journaux propres à chaque
   enquête.
6. **Contacts** (fiches suspects) : présentation, déclarations découvertes (marquées
   « Contredite »), questions disponibles.
7. **Carnet** : pièces et leur provenance ; confrontation déclaration → pièce par simple
   sélection ; retour contextuel ; mensonges révélés.
8. **Enquête** : résumé, objectif, indices (3 niveaux), progression, score, accusation
   (suspect + jusqu’à 4 preuves + confirmation) et **résolution** (reconstitution,
   preuves décisives, fausses pistes, score détaillé, rejouer).

Sur un écran large, le téléphone est affiché dans un cadre ; sur mobile, il occupe tout
l’écran.

## Photos

Niveau 3 : les photos (`public/photos/rialto/*.webp`) ont été fournies par le
commanditaire du projet et intégrées localement (WebP 1200×900, portraits 256×256) :
`facade`, `lucas-cabine`, `disque-rouge`, `miroir-intact`, `miroir-casse`, `sac-nina`,
`portrait-adrien`, `portrait-salome`, `portrait-nina`. Pour en remplacer une, garder le
même nom de fichier. Le téléphone de Lucas n’a pas de photo : la pièce est décrite en
texte. Chaque indice essentiel existe aussi en texte (« Examiner »).

Niveau 2 : les photos (`public/photos/signal/*.webp`) ont été fournies par le
commanditaire du projet et intégrées localement (redimensionnées en WebP).

Niveau 1 : les photos (`public/photos/*.webp` : enveloppe, salon, chargeur, poubelle)
ont été générées avec Ideogram puis intégrées localement : le jeu n’en charge aucune à
distance et elles restent disponibles hors ligne. Les contacts utilisent des avatars à
initiales. Pour remplacer une photo, il suffit de garder le même nom de fichier ou de
changer le champ `image` de la pièce dans `src/cases/le-cadeau-disparu/evidence.ts`.

## Score

100 points au départ. Indice : −5, −10, −15 selon le niveau. Mauvais suspect : −25. Bon
suspect sans preuves suffisantes : −15. Niveau 2 : mauvaise réponse aux secours −10. Les confrontations ratées et la vitesse de lecture
ne comptent pas. Le calcul est expliqué au joueur dans le dossier et sur l’écran de
résolution.

## Accessibilité

- Zones tactiles d’au moins 44 × 44 px (vérifié automatiquement sur tous les écrans à
  320 px de large).
- Tailles en `rem` : respecte le réglage de taille du texte (et Dynamic Type sur iOS).
  Vérifié sans défilement horizontal à 320 px avec un texte à 200 %.
- Safe areas (`env(safe-area-inset-*)`), `100dvh`.
- `prefers-reduced-motion` : animations neutralisées.
- Information jamais portée par la couleur seule : avatars à initiales, libellés
  « Contredite », « Nouveau », coches et textes explicites.
- Navigation au clavier, focus visible, fenêtres modales natives (`<dialog>`), zones
  `aria-live` pour les messages et notifications.

## Ajouter une enquête

Voir [`docs/format-enquetes.md`](docs/format-enquetes.md). Aucun écran n’est à modifier.
