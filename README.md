# Qui ment ?

Jeu d’enquête narratif en français, présenté comme un téléphone fictif. Le joueur lit des
conversations, interroge des suspects, collecte des preuves et démontre qui ment.

Première enquête : **« Le cadeau disparu »** (5 à 10 minutes). Une enveloppe de 500 CHF
destinée à l’anniversaire de Léa disparaît d’un appartement lausannois ; quatre amis sont
suspects.

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
  conception/le-cadeau-disparu.md  document interne : vérité, chronologie, solution
public/          icônes PWA (générées par scripts/generate-icons.cjs)
```

Séparation stricte : l’interface lit l’état et appelle le store ; le store appelle le moteur
puis la sauvegarde ; le moteur ne connaît que les données. Les enquêtes ne contiennent
aucun code exécutable (pas de `eval`, conditions et effets sous forme de données).

## Écrans

1. **Accueil** : identité du jeu, carte de l’enquête et avancement, Commencer/Reprendre,
   Recommencer (avec confirmation), réglage « messages instantanés ».
2. **Dossier** : résumé de l’affaire, objectif actuel, indices (3 niveaux), accès rapides,
   progression, explication du score.
3. **Conversations** : groupe, discussions privées et notes ; messages révélés
   progressivement avec indicateur de saisie ; choix de réponses ; historique ; bouton
   « Afficher tout de suite » ; badges de non-lus.
4. **Fiche suspect** : avatar local, présentation, déclarations découvertes (marquées
   « Contredite » le cas échéant), questions disponibles.
5. **Carnet** : pièces et leur provenance ; confrontation déclaration → pièce par simple
   sélection (pas de glisser-déposer) ; retour contextuel en cas d’erreur ; mensonges
   révélés.
6. **Accusation** : choix du suspect, jusqu’à 4 preuves, confirmation ; échec expliqué,
   enquête poursuivie.
7. **Résolution** : reconstitution chronologique, preuves décisives, fausses pistes, score
   détaillé, rejouer.

## Score

100 points au départ. Indice : −5, −10, −15 selon le niveau. Mauvais suspect : −25. Bon
suspect sans preuves suffisantes : −15. Les confrontations ratées et la vitesse de lecture
ne comptent pas. Le calcul est expliqué au joueur dans le dossier et sur l’écran de
résolution.

## Accessibilité

- Zones tactiles d’au moins 44 × 44 px (vérifié automatiquement sur tous les écrans à
  320 px de large).
- Tailles en `rem` : respecte le réglage de taille du texte (et Dynamic Type sur iOS).
  Vérifié sans défilement horizontal à 320 px avec un texte à 200 %.
- Safe areas (`env(safe-area-inset-*)`), `100dvh`.
- `prefers-reduced-motion` : animations neutralisées.
- Information jamais portée par la couleur seule : avatars avec formes et initiales,
  libellés « Contredite », « Nouveau », coches et textes explicites.
- Navigation au clavier, focus visible, fenêtres modales natives (`<dialog>`), zones
  `aria-live` pour les messages et notifications.

## Ajouter une enquête

Voir [`docs/format-enquetes.md`](docs/format-enquetes.md). Aucun écran n’est à modifier.
