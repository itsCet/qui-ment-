# Document interne — « Le cadeau disparu »

> ⚠️ Contient la solution complète. Document de conception, non affiché dans le jeu.

## 1. Prémisse et point de vue du joueur

Le joueur incarne **Sam**, qui organise chez lui l'anniversaire surprise de **Léa**
(30 ans), samedi 14 novembre, à Lausanne. Les quatre amis de Léa ont cotisé
100 CHF chacun ; Sam aussi. L'enveloppe de **500 CHF** (5 billets de 100) doit
financer le voyage de Léa à Lisbonne.

Sam passe l'après-midi dehors (gâteau, accueil des parents de Léa à la gare). Les
quatre amis préparent l'appartement grâce au **code invité** de la serrure connectée
de Sam. À 18:41, Sam rentre ; à 18:45, le tiroir de l'entrée est vide. Léa arrive à
20:00.

**Pourquoi le joueur a accès aux informations** : tout se passe sur le téléphone de
Sam.
- Le groupe et les discussions privées sont *ses* conversations.
- Le journal de la serrure et celui du routeur Wi-Fi sont *ses* applications, pour
  *son* appartement (les invités se sont connectés au Wi-Fi avec le mot de passe
  qu'il leur a donné).
- Le ticket de caisse et le chargeur sont trouvés *chez lui* (fil « Notes · Appartement »,
  ses notes personnelles).
- Les autres pièces lui sont **envoyées** par ses amis pour se disculper (ticket de
  ballons, historique de livraisons, capture d'écran d'un message).

## 2. La vérité

**Coupable : Yanis Haddad.**

Yanis a perdu son emploi il y a deux mois et ne l'a dit à personne. Son loyer de
novembre est impayé. La semaine précédente, il a demandé 400 CHF à Hugo, qui a
refusé (lui-même endetté).

À 16:33, Yanis accuse réception dans le groupe : « Tiroir de l'entrée 👌 ». À 17:21, il
annonce partir à la salle de sport. En réalité, il s'installe au café en bas de
l'immeuble. Il sait par le groupe (17:44) qu'Inès est partie et que Clara est seule.
À 17:58, il voit Clara sortir précipitamment de l'immeuble : l'appartement est vide.
À 18:04, il entre avec le code invité, prend l'enveloppe et ressort à 18:07, en
laissant le tiroir entrouvert. Son téléphone se reconnecte automatiquement au Wi-Fi
pendant ces trois minutes.

Questionné, il ment trois fois :
1. il dit être resté à la salle de 17:20 à 19:00 ;
2. il dit ne pas savoir où était rangée l'enveloppe ;
3. confronté au Wi-Fi, il invente être revenu prendre son chargeur, « pris » sur le
   canapé — or son chargeur est toujours branché derrière le canapé.

### Secrets des innocents (fausses pistes)

| Personnage | Ce qui le rend suspect | Ce qu'il cache vraiment | Ce qui le disculpe |
|---|---|---|---|
| **Hugo** | Fauché ; part tôt « pour un truc perso » ; sa veste apparaît sur la photo de 17:42 | Il a des dettes et fait des livraisons à vélo le samedi soir depuis septembre ; il en a honte | Routeur : déconnecté à 17:05. Historique de livraisons : à Renens/Prilly de 17:28 à 18:52. Il a signalé l'oubli de sa veste à Clara à 17:31. |
| **Clara** | Seule dans l'appartement ; ment en disant n'être jamais sortie ; nerveuse | Elle a cassé le vase bleu de Sam à 17:55 et est allée en racheter un identique | Ticket du Bazar du Midi à 18:09 (10 min à pied) : elle ne peut pas être l'entrée de 18:04. Routeur : partie 17:58, revenue 18:21. Elle n'a jamais caché un nouvel accès au tiroir : elle dit l'avoir trouvé entrouvert. |
| **Inès** | A rangé l'enveloppe, dernière à l'avoir vue | Elle n'a prévenu personne qu'elle partait chercher des ballons hélium (surprise pour Sam aussi) | Ticket du magasin de fête au Flon à 18:05 (15 min), routeur 17:46 → 18:33. |

## 3. Chronologie précise

| Heure | Événement | Trace disponible |
|---|---|---|
| 16:01 | Inès arrive (code invité) | Serrure, routeur INES-TEL |
| 16:10 | Hugo et Yanis arrivent ensemble (une ouverture) | Serrure, routeur |
| 16:18 | Clara arrive | Serrure, routeur |
| 16:32 | Inès range l'enveloppe, photo dans le groupe | Photo de l'enveloppe |
| 16:33 | Yanis : « Bien reçu chef. Tiroir de l'entrée 👌 » | Message de 16:33 |
| 17:05 | Hugo part pour ses livraisons, oublie sa veste | Routeur hugo-phone |
| 17:21 | Yanis part, « salle de sport » | Routeur YANIS-P |
| 17:28 | Hugo prend sa 1re commande à Renens | Historique de livraisons |
| 17:31 | Hugo écrit à Clara pour sa veste | Raconté par Hugo et Clara |
| 17:42 | Clara envoie la photo du salon (veste visible) | Photo du salon |
| 17:44 | Inès annonce partir chercher des ballons | Groupe |
| 17:45 | Inès vérifie : l'enveloppe est dans le tiroir | Témoignage d'Inès |
| 17:46 | Inès part | Routeur |
| 17:55 | Clara casse le vase bleu | Aveu de Clara, éclats dans la poubelle |
| 17:58 | Clara part acheter un vase ; **l'appartement est vide** | Routeur Clara_mobile |
| **18:04** | **Yanis entre (code invité)** | Serrure 18:04 + routeur YANIS-P 18:04 |
| **18:07** | **Yanis repart avec l'enveloppe** | Routeur YANIS-P |
| 18:05 | Inès paie les ballons au Flon | Ticket ballons |
| 18:09 | Clara paie le vase au Bazar du Midi | Ticket du vase |
| 18:21 | Clara revient, trouve le tiroir entrouvert | Serrure, routeur, aveu |
| 18:33 | Inès revient avec les ballons | Serrure, routeur |
| 18:41 | Sam rentre (clé) | Serrure, routeur SAM-TEL |
| 18:45 | Sam découvre le tiroir vide | Notes |

Fenêtre du vol : entre 17:45 (dernière vérification) et 18:45.

## 4. Pièces du dossier (10)

| Id | Pièce | Comment Sam l'obtient | Rôle |
|---|---|---|---|
| `ev_photo_enveloppe` | Photo de l'enveloppe dans le tiroir (16:32) | Historique du groupe | Contexte : l'enveloppe existait, tout le monde savait où |
| `ev_msg_yanis_1633` | Message de Yanis « Tiroir de l'entrée 👌 » (16:33) | Historique du groupe | **Décisive** — il savait |
| `ev_photo_salon` | Photo du salon, veste de Hugo visible (17:42) | Historique du groupe | Fausse piste (Hugo) |
| `ev_journal_serrure` | Journal de la serrure | Notes → appli serrure | Corrobore l'entrée de 18:04 |
| `ev_journal_routeur` | Journal des appareils Wi-Fi | Notes → appli routeur (après le conseil d'Inès) | **Décisive** — présence de Yanis 18:04–18:07 |
| `ev_ticket_vase` | Ticket Bazar du Midi 18:09 + éclats de verre | Notes → inspecter la cuisine | Contredit Clara, la disculpe pour 18:04 |
| `ev_chargeur` | Chargeur blanc branché derrière le canapé | Notes → inspecter le salon | Contredit l'excuse de Yanis |
| `ev_ticket_ballons` | Ticket magasin de fête, Flon, 18:05 | Envoyé par Inès | Alibi d'Inès |
| `ev_historique_livraisons` | Historique de livraisons de Hugo | Envoyé par Hugo | Alibi de Hugo |
| `ev_capture_pret` | Capture : Yanis demande 400 CHF à Hugo | Envoyée par Hugo | Mobile de Yanis (soutien) |

## 5. Déclarations et contradictions

Déclarations (ajoutées quand le personnage les prononce) :

- `st_ines_depart` (Inès) : « J'ai vérifié le tiroir à 17h45, l'enveloppe y était. Je suis partie chercher les ballons et revenue à 18h33. » — **vraie**
- `st_hugo_depart` (Hugo) : « Je suis parti à 17h05 et je ne suis pas revenu. » — **vraie**
- `st_clara_restee` (Clara) : « Je suis restée dans l'appartement tout le temps, jusqu'au retour d'Inès. » — **fausse**
- `st_yanis_salle` (Yanis) : « Parti à 17h20 à la salle, resté jusqu'à 19h. Je n'ai pas remis les pieds chez toi. » — **fausse**
- `st_yanis_ignorait` (Yanis) : « Je ne savais même pas où était rangée l'enveloppe. » — **fausse**
- `st_clara_aveu` (Clara, après C1) : sortie 17:58, retour ~18:20, tiroir entrouvert — **vraie**
- `st_yanis_chargeur` (Yanis, après C2) : « Je suis repassé deux minutes prendre mon chargeur sur le canapé. » — **fausse**

Contradictions :

| Id | Déclaration | Preuve(s) acceptée(s) | Effet |
|---|---|---|---|
| `c_clara_sortie` | `st_clara_restee` | `ev_ticket_vase` ou `ev_journal_routeur` | Débloque la question « Le ticket du vase » → aveu de Clara |
| `c_yanis_salle` | `st_yanis_salle` | `ev_journal_routeur` | Débloque la question sur le Wi-Fi → excuse du chargeur |
| `c_yanis_tiroir` | `st_yanis_ignorait` | `ev_msg_yanis_1633` | Démontre qu'il savait où chercher |
| `c_yanis_chargeur` | `st_yanis_chargeur` | `ev_chargeur` | (bonus) l'excuse ne tient pas |

Rapprochements erronés avec retour contextuel (exemples) :
- `st_hugo_depart` + `ev_photo_salon` → une veste oubliée ne prouve pas la présence.
- `st_yanis_salle` + `ev_journal_serrure` → la serrure dit *quand*, pas *qui*.
- `st_clara_restee` + `ev_journal_serrure` → la serrure n'enregistre pas les sorties.

## 6. Solution exigée

Accusation de **Yanis** avec, au maximum 4 pièces, au moins :
1. une pièce le plaçant dans l'appartement pendant le vol : `ev_journal_routeur` ;
2. une pièce montrant qu'il savait où chercher : `ev_msg_yanis_1633`.

Le nom seul, ou Yanis avec seulement le mobile (`ev_capture_pret`), est refusé avec
un retour expliquant ce qui manque.

## 7. Vérification de la logique

- **Unicité du coupable** : la seule entrée de 18:04 correspond à un appareil
  (YANIS-P, 18:04–18:07). Les trois autres sont situés ailleurs par une pièce datée :
  Inès (Flon 18:05, 15 min), Clara (Bazar du Midi 18:09, 10 min, partie à 17:58),
  Hugo (Renens/Prilly, livraisons 17:28–18:52, déconnecté à 17:05).
- **Opportunité de Clara** : elle était seule de 17:46 à 17:58 et de 18:21 à 18:33.
  Rien ne la relie au tiroir ; son mensonge s'explique entièrement par le vase
  (éclats + ticket). Elle signale elle-même le tiroir entrouvert, ce qui est cohérent
  avec un passage entre 17:58 et 18:21. L'accusation de Clara est refusée.
- **La veste** (photo 17:42) n'implique pas Hugo : le routeur le déconnecte à 17:05,
  et il a signalé l'oubli à 17:31.
- **Accessibilité** : chaque pièce décisive est obtenable par un chemin sans
  condition piégeante (vérifié automatiquement par les tests de parcours aléatoires
  et d'intégrité).
- **Pas d'impasse** : l'accusation reste accessible à tout moment ; après un échec,
  l'enquête continue ; toutes les questions débloquables le sont à partir de pièces
  accessibles.

## 8. Parcours de résolution type (≈ 7 minutes)

1. Lire le groupe (découverte, historique 16:32–17:44).
2. Notes : ouvrir la serrure → entrée mystère à 18:04.
3. Interroger les 4 amis sur leur après-midi (4 déclarations).
4. Inès : « Comment savoir qui est entré ? » → conseil du routeur.
5. Notes : routeur → YANIS-P 18:04–18:07, Clara déconnectée 17:58.
6. Notes : cuisine → ticket du vase ; salon → chargeur.
7. Yanis : « Savais-tu où était l'enveloppe ? » → `st_yanis_ignorait`.
8. Carnet : Clara + ticket (C1), Yanis salle + routeur (C2), Yanis ignorait + message
   16:33 (C3).
9. Yanis : question Wi-Fi → excuse du chargeur → C4 avec le chargeur.
10. Accuser Yanis avec routeur + message de 16:33 (+ serrure, + chargeur).

## 9. Indices (3 niveaux par objectif)

Objectifs, dans l'ordre : recueillir les versions → découvrir qui est entré →
révéler les mensonges → accuser. L'indice proposé porte sur le premier objectif non
atteint. Niveau 1 : orientation ; niveau 2 : où chercher ; niveau 3 : action
explicite.

## 10. Score

100 points au départ.
- Indice niveau 1 : −5 ; niveau 2 : −10 ; niveau 3 : −15 (par objectif).
- Accusation du mauvais suspect : −25.
- Bon suspect sans preuves suffisantes : −15.
- Les confrontations erronées dans le carnet ne coûtent rien (on encourage
  l'exploration). La vitesse de lecture n'intervient pas.
- Plancher à 0.

## 11. Parcours de vérification

Automatisé (`npm test`, fichier `src/cases/le-cadeau-disparu.test.ts`) :
- intégrité des identifiants et des références ;
- accessibilité de toutes les pièces, déclarations, contradictions et de tous les choix ;
- 60 parcours aléatoires : depuis n'importe quel état atteint, la solution reste
  démontrable (pas d'impasse) ;
- parcours complet de référence (score 100) ;
- mauvaise accusation, accusation insuffisante, puis reprise et résolution
  (score 100 − 25 − 15 − 5 = 55 avec un indice) ;
- retours contextuels des rapprochements erronés.

Manuel (navigateur mobile) :
1. Accueil → Commencer. Le groupe affiche l'historique puis les messages de 18:46 avec
   l'indicateur de saisie ; « Afficher tout de suite » accélère.
2. Les 5 conversations s'ouvrent avec des badges de non-lus.
3. Notes → serrure ; Inès → « Comment savoir qui a tapé le code ? » ; Notes → routeur.
4. Recharger la page en pleine conversation : rien n'est répété, la partie reprend au
   même endroit.
5. Carnet : Hugo « parti à 17h05 » + photo du salon → retour sur la veste, sans pénalité.
6. Carnet : les trois contradictions de l'objectif ; les questions « Nouveau » apparaissent
   chez Clara et Yanis.
7. Accuser Hugo → échec expliqué, −25 ; poursuivre.
8. Accuser Yanis avec routeur + message de 16:33 → résolution, derniers messages du groupe.
9. Recharger `/enquete/le-cadeau-disparu/resolution` directement → la page s'affiche.
10. Mode avion après un premier chargement en HTTPS → le jeu s'ouvre toujours.
