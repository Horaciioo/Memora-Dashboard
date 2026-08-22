# Memora

Le dashboard de **Marsha** : équipes, projets, tâches, réunions, absences et modération au même endroit. Next.js App Router, React, TypeScript strict, Tailwind CSS, Prisma + PostgreSQL.

Ce dépôt dérive du template dashboard. Ses conventions vivent dans `.claude/skills/` et restent en vigueur.

## Démarrer

```bash
yarn install
cp .env.example .env        # renseigne DATABASE_URL et ADMIN_DISCORD_ID
yarn db:generate
yarn db:migrate
yarn dev
```

`ADMIN_DISCORD_ID` est le seul identifiant codé hors base. Il vit dans le `.env`, jamais dans un fichier de configuration. Le profil qui l'accompagne (`src/configurations/system/identifiant.admin.json`) porte le nom affiché, le rôle et la durée de session, jamais l'identifiant. Ce compte se crée tout seul à la première connexion, obtient toutes les permissions et ne peut être ni modifié ni supprimé.

## Se connecter

`/connexion` demande un identifiant Discord. Clic droit sur un profil Discord puis « Copier l'identifiant ». Tout autre compte doit d'abord exister dans `/moderateurs`.

## Les espaces

| Route                    | Contenu                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `/tableau-de-bord`       | Espace personnel — en cours de développement                                              |
| `/moderateurs`           | Fiches : affectation, infos, notes privées, PIM, réseaux, absences, formations, logs      |
| `/equipes`               | Équipes et affectation des modérateurs par glisser-déposer                                |
| `/projets`               | Tableau kanban, puis par projet : aperçu, communication en markdown, tâches, réunions     |
| `/taches`                | Tableau kanban des tâches                                                                 |
| `/reunions`              | Planning des réunions et leurs participants                                               |
| `/absences`              | Demandes d'absence et leur traitement                                                     |
| `/livecon`               | Niveau de vigilance en cours, consignes et historique                                     |
| `/academy`               | Juniors en formation, période par période                                                 |
| `/moderation/sanctions`  | Panel de sanctions — en cours de développement                                            |
| `/configuration`         | Tout ce que l'application affiche se crée ici                                             |
| `/configuration/acces`   | Permissions par rôle et par fonction                                                      |

`⌘K` ouvre la recherche globale depuis n'importe quelle page. Le clic droit ouvre un menu sur chaque ligne, carte et note.

## Rien n'est écrit en dur

YouTubeurs, divisions, fonctions, plateformes, états, priorités, réseaux, formations et niveaux de livecon se créent depuis `/configuration`. Le code ne porte que le catalogue de permissions, les rôles et les énumérés système (`src/utils/constants/`).

## Les permissions

Trois niveaux — Admin, Responsable, Modérateur — et un catalogue de 35 permissions déclaré dans `src/utils/constants/permissions.ts`. Ce que chaque niveau ouvre se règle dans `/configuration/acces`, avec un modèle conseillé applicable en un clic. Une fonction peut ajouter ses propres permissions, et une fiche modérateur peut en accorder ou en retirer au cas par cas.

## Scripts

```bash
yarn dev             # serveur de développement
yarn build           # build de production
yarn start           # sert le build
yarn type-check      # tsc --noEmit
yarn lint            # eslint
yarn format          # prettier --write
yarn validate        # type-check + lint + build
yarn db:generate     # client Prisma, obligatoire sur un checkout propre
yarn db:migrate      # applique les migrations
yarn db:validate     # schéma Prisma
```

Avant de considérer un changement terminé : `yarn db:generate && yarn validate` doit être vert.

## Conventions

| Skill            | Contenu                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| `instructions`   | Vue d'ensemble et philosophie — à charger en premier                           |
| `architecture`   | Carte des dossiers, abstractions, détail de chaque système                     |
| `code-style`     | Syntaxe, imports, nomenclature, typage, interdiction du hardcoding             |
| `comments`       | Format des commentaires, ultra-concision, blocs JSDoc                          |
| `commits`        | Format des messages de commit                                                  |
| `branches`       | Stratégie `dev` → `staging` → `release` → `main`                               |
| `data-fetching`  | Où fetcher, comment brancher loading et états vides                            |
| `error-handling` | Erreurs attendues, error boundaries, remontée par toast                        |
| `accessibility`  | Clavier, lecteur d'écran, contraste                                            |
| `optimization`   | Lazy loading, images, fonts, Core Web Vitals                                   |

Les textes affichés sont en **français**, au tutoiement, et vivent tous dans `src/declarations/`. Les commentaires du code restent en anglais.
