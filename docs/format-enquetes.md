# Format des enquêtes

Une enquête est un objet `Case` (voir `src/engine/types.ts`) composé uniquement de données.
Les écrans sont génériques : ajouter une enquête ne demande aucune modification de
l’interface.

## Étapes

1. Rédiger d’abord un document de conception dans `docs/conception/` : vérité, chronologie,
   pièces, déclarations, contradictions, solution, parcours type (voir
   `le-cadeau-disparu.md`).
2. Créer `src/cases/<id-de-l-enquete>/` avec les données (on peut répartir en
   `suspects.ts`, `evidence.ts`, `conversations.ts`, `index.ts`).
3. Ajouter l’enquête au tableau `cases` de `src/cases/index.ts`.
4. Lancer `npm test` : le test d’intégrité vérifie automatiquement chaque enquête
   enregistrée (identifiants uniques, références existantes, questions verrouillées
   débloquables, retours d’accusation pour chaque innocent). Ajouter un test de parcours
   complet sur le modèle de `src/cases/le-cadeau-disparu.test.ts`.

## Identifiants

Tous les identifiants sont des chaînes **stables** : ils sont enregistrés dans la
sauvegarde. Renommer un identifiant publié casse les parties en cours. Conventions :
`conv_…`, `ch_…` (choix), `ev_…` (preuves), `st_…` (déclarations), `c_…` (contradictions),
`obj_…` (objectifs). Les messages sont libres mais uniques dans l’enquête.

## Types principaux

| Type | Rôle |
|---|---|
| `Case` | L’enquête : textes d’introduction, horloge narrative, et toutes les listes ci-dessous. |
| `Suspect` | Personnage : nom, initiales, forme et teinte d’avatar, biographie, conversation privée. |
| `Conversation` | `group`, `private` ou `notes`. Liste ordonnée de `messages` et de `choices`. `initiallyOpen` ou ouverture par effet. |
| `Message` | `from` (id de suspect, `player` ou `system`), `text`, `time` facultatif, `history` (affiché sans délai), `attachment` (id de preuve, ajoutée au carnet), `condition`, `effects`. |
| `Choice` | Réponse ou question du joueur : `label` (bouton), `text` (message envoyé), `condition`, `locked` (n’apparaît qu’après `unlockQuestion`), `effects`. |
| `Evidence` | Pièce : titre, résumé, description, **provenance** (pourquoi le joueur l’a), contenu (`photo`, `log`, `receipt`, `quote`, `object`). |
| `Statement` | Déclaration attribuée à un suspect, ajoutée par l’effet `addStatement`. |
| `Contradiction` | Une déclaration + une ou plusieurs preuves qui la contredisent (une seule suffit), explication, effets. |
| `MismatchFeedback` | Retour contextuel pour un rapprochement erroné précis. Sinon `defaultMismatchFeedback`. |
| `Objective` | Objectif courant (`completeWhen`) et ses **trois** indices progressifs. |
| `Solution` | Coupable, exigences de preuves (`requirements`, chacune `anyOf`), nombre maximal de preuves, retour pour chaque mauvais suspect, résolution (chronologie, preuves décisives, fausses pistes, épilogue). |

## Conditions (`Condition`)

```ts
{ type: 'flag', flag: 'tip_routeur' }              // value: true par défaut
{ type: 'hasEvidence', evidenceId: 'ev_…' }
{ type: 'knowsStatement', statementId: 'st_…' }
{ type: 'contradictionFound', contradictionId: 'c_…' }
{ type: 'choiceMade', choiceId: 'ch_…' }
{ type: 'messageRevealed', messageId: '…' }
{ type: 'conversationOpen', conversationId: 'conv_…' }
{ type: 'solved' }
{ type: 'all', conditions: [...] } | { type: 'any', conditions: [...] } | { type: 'not', condition: … }
```

## Effets (`Effect`)

```ts
{ type: 'revealMessage', messageId: '…' }          // révèle un message (même si sa condition est fausse)
{ type: 'unlockQuestion', choiceId: 'ch_…' }       // rend visible un choix `locked`
{ type: 'addEvidence', evidenceId: 'ev_…' }
{ type: 'addStatement', statementId: 'st_…' }
{ type: 'setFlag', flag: '…', value?: boolean }
{ type: 'openConversation', conversationId: 'conv_…' }
```

Les effets sont portés par les messages (appliqués à leur révélation), les choix et les
contradictions. Le moteur garantit que les effets d’une source (`message:…`, `choice:…`,
`contradiction:…`) ne sont appliqués **qu’une fois**, même après rechargement, et qu’une
preuve, une déclaration ou un message n’apparaît jamais en double.

## Déroulement d’une conversation

- Le prochain message affiché est le **premier message non révélé dont la condition est
  vraie**, dans l’ordre du tableau. L’ordre d’affichage est celui de la révélation.
- Les choix ne sont proposés que lorsqu’aucun message n’est en attente dans la
  conversation.
- Pour une réponse à un choix : donner aux messages de réponse la condition
  `{ type: 'choiceMade', choiceId }` (l’aide `replies()` dans `conversations.ts` le fait).
- Le texte d’un choix est affiché comme un message du joueur ; l’horloge narrative avance de
  `clock.perChoiceMinutes`.

## Bonnes pratiques narratives

- Chaque pièce doit avoir une provenance crédible (`source`).
- Toute question `locked` doit être débloquée par un effet accessible.
- Prévoir des `mismatchFeedback` pour les fausses pistes attendues : ce sont eux qui
  apprennent au joueur à raisonner.
- L’accusation doit exiger des preuves qui démontrent la culpabilité, pas seulement un
  mobile.
- Ne rien révéler de la solution dans les biographies.
