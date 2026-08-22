# Template Dashboard

Point de départ générique pour tout projet de dashboard (admin, client, interne — quel que soit le métier). Next.js App Router, React, TypeScript strict, Tailwind CSS.

Ce dépôt est cloné au début de chaque nouveau projet. Il est mis à jour fréquemment : les conventions évoluent, de nouveaux morceaux de code viennent s'y ajouter au fil des projets qui en dérivent.

## État d'avancement

Huit systèmes sont codés aujourd'hui : **couche configurations** (réglages `.json` bornés), **back-end serveur**, **skeleton loader**, **EmptyState**, **managers** (Auth/Theme/Notifications/Hints), **thème clair/sombre**, une **auth de démonstration** protégée par `src/proxy.ts` et des **layouts** (`AppShell`/`AuthShell`). Tout le reste (fabrique de routes API, moteur de formulaire, couche de données client) est documenté comme convention à appliquer dans `.claude/skills/architecture/SKILL.md`, pas comme code déjà présent.

Le back-end (`src/managers/infrastructure/`) est **construit, pas démarré** : configuration, logs, base Prisma, cache Redis, files BullMQ, stockage, chiffrement, télémétrie et sondes sont écrits et type-checkés, mais chaque sujet est `"enabled": false` par défaut dans `src/configurations/`. Rien ne se connecte tant qu'un projet cloné ne l'active pas.

L'auth de démonstration vérifie un identifiant codé en dur (`src/core/lib/auth/session.ts`) — elle montre le mécanisme, ce n'est pas une authentification prête pour la production.

## Démarrer

```bash
yarn install
yarn dev
```

Identifiants de démo (pré-remplis sur `/login`) : `demo@example.com` / `password`.

- `/` — page d'accueil, publique
- `/login` — connexion classique, redirige vers `/overview` une fois connecté
- `/overview` — démonstration du skeleton **au niveau route** (tuiles + carte), voir `src/app/(dashboard)/overview/loading.tsx`
- `/entities` — démonstration du skeleton **au niveau route** puis, une fois la page chargée, un bouton « Simulate reload » qui déclenche les deux patterns de skeleton **au niveau composant** (`DataTable` natif et `EntityList` manuel) et un toast via `NotificationsManager`. Un filtre de statut et un bouton « Clear all entities » démontrent aussi `EmptyState` : sous filtre sans résultat ou collection vidée, aucun bouton « Add » séparé n'existe — l'action de l'`EmptyState` est la seule façon d'en sortir. Un bandeau dismissible (`HintsManager`) pointe vers ce pattern.

`/overview` et `/entities` sont protégées par `src/proxy.ts` : sans cookie de session, toute visite y redirige vers `/login`. Le sélecteur clair/sombre/auto est dans la barre de navigation du dashboard.

## Scripts

```bash
yarn dev           # serveur de développement
yarn build          # build de production
yarn start          # sert le build
yarn type-check      # tsc --noEmit
yarn lint            # eslint
yarn format          # prettier --write
yarn format:check    # prettier --check
yarn validate        # type-check + lint + build
yarn db:generate     # client Prisma, obligatoire sur un checkout propre
yarn db:validate     # schéma Prisma
```

Avant de considérer un changement terminé : `cp .env.example .env && yarn db:generate && yarn validate` doit être vert. Le client Prisma vit dans `node_modules`, il n'existe pas sur un checkout propre, et Prisma 7 ne lit `DATABASE_URL` que depuis l'environnement ou un `.env`.

## Conventions

Les conventions du dépôt vivent dans `.claude/skills/`, à charger par Claude Code avant d'y travailler :

| Skill          | Contenu                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------- |
| `instructions` | Vue d'ensemble, philosophie, état d'avancement — à charger en premier                       |
| `architecture` | Carte des dossiers, abstractions à mettre en place au besoin, détail de chaque système codé |
| `code-style`   | Syntaxe, imports, nomenclature, typage, interdiction du hardcoding                          |
| `comments`     | Format des commentaires, ultra-concision, blocs JSDoc                                       |
| `commits`      | Format des messages de commit                                                               |
| `branches`     | Stratégie `dev` → `staging` → `release` → `main`                                            |

## Cloner ce template pour un nouveau projet

1. Renommer `name` dans `package.json`.
2. Remplacer les tokens placeholder de `src/styles/globals.css` (`--color-brand-100`, `--color-brand-600`, ...) par l'identité visuelle réelle du projet.
3. Construire les dossiers de `src/core/`, `src/declarations/`, `src/composites/` au fur et à mesure des besoins réels, en suivant `architecture`.
4. Copier `.env.example` en `.env`, renseigner `DATABASE_URL`, activer les seuls sujets nécessaires (`*_ENABLED=true`) et remplir les registres vides de `src/declarations/system/`.
5. Ne jamais laisser de vocabulaire métier remonter dans ce dépôt template — il appartient au projet cloné.
6. Remplacer l'auth de démonstration (`src/core/lib/auth/`) par un vrai système avant tout déploiement — voir la note dans `architecture`.

## La couche configurations

`src/configurations/system/pagination.json` porte un réglage chiffré brut. `src/declarations/configurations/readers.ts` le lit en le bornant et en repliant sur une valeur par défaut (avec avertissement en console) si la valeur est absente ou invalide. `src/declarations/configurations/settings.ts` l'expose typé (`PAGINATION_SETTINGS`), prêt à consommer. Une valeur numérique chiffrée suit toujours ce chemin, jamais tapée en dur dans un composant.

Nommée `src/declarations/` plutôt que `src/config/` précisément pour ne pas se confondre avec `src/configurations/`.

## Le skeleton loader

Une seule primitive (`Skeleton`), une seule liste de silhouettes déclarées en config (`SKELETON_SHAPES` dans `src/declarations/ui/variants.ts` : `line`, `row`, `tile`, `card`, `sheet`), une animation CSS pilotée par un token de durée (`--motion-duration-moderate`) et coupée sous `prefers-reduced-motion: reduce`.

Deux niveaux de consommation :

1. **Route** — `loading.tsx` à côté de chaque `page.tsx`, appelle `<PageSkeleton blocks={[...]} />`.
2. **Composant** — `isLoading` natif sur `<DataTable />`, ou pattern manuel `{isLoading && <SkeletonList shape="row" rows={n} />}` dans un composite qui n'utilise pas `DataTable`.

## EmptyState

Le pendant vide du skeleton loader. `EmptyState` (`src/components/elements/feedback/EmptyState.tsx`) a toujours une action sous sa description — jamais un cul-de-sac — et deux variantes : `start` (collection réellement vide, illustration `EmptyBoxIllustration`) et `filter` (filtre sans résultat, illustration `NoResultsIllustration`, copie de repli générique). Cadre en trait pointillé (`EMPTY_STATE_STYLES.frame`).

`DataTable` et `EntityList` prennent toutes deux une prop `emptyState`, rendue à la place du corps une fois vide. Voir `/entities` : il n'y a pas de bouton « Add entity » séparé, seule l'action de l'`EmptyState` permet d'en créer un.

## Managers, thème et auth de démonstration

- `src/core/managers/` — `AuthManager`, `ThemeManager`, `NotificationsManager`, `HintsManager` (indices contextuels dismissibles, persistés en `localStorage`), composés une seule fois dans `src/app/providers.tsx`.
- Thème clair/sombre/système via `data-theme` sur `<html>`, persisté en `localStorage`, appliqué avant hydratation par `src/components/tools/ThemeScript.tsx` (aucun flash).
- `src/proxy.ts` (convention Next.js 16, remplace `middleware.ts`) protège `/overview` et `/entities` au niveau requête ; `src/core/wrappers/requireUser.ts` protège un composant serveur individuel en dessous de ce niveau ; `src/app/login/` porte le formulaire et les actions serveur de connexion/déconnexion.
- `src/layouts/AppShell.tsx` et `src/layouts/AuthShell.tsx` portent respectivement le chrome du dashboard authentifié et la carte centrée des écrans non authentifiés.

Détail complet, y compris les limites de l'auth de démonstration, dans `.claude/skills/architecture/SKILL.md`.
