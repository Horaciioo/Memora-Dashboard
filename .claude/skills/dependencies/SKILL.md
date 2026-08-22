---
name: dependencies
description: État des paquets installés dans le template dashboard (dépendances, dev-dépendances, versions, rôle de chacun) et convention à suivre avant d'en ajouter, mettre à jour ou retirer un. À charger AVANT tout `yarn add`, `yarn remove` ou montée de version, ou pour savoir ce qui est déjà disponible dans un projet cloné.
---

# Paquets installés

## Avertissement, à lire avant de faire confiance à ce document

Cette liste est une **photographie**, pas une source de vérité. `package.json` et `yarn.lock` le sont. Un projet cloné avance ou recule par rapport à ce template : avant d'affirmer qu'un paquet est présent ou absent, ou qu'une version est correcte, vérifier `package.json` dans le projet courant. Si ce skill et `package.json` divergent, `package.json` gagne — corriger ce document plutôt que d'agir sur une version obsolète.

## Gestionnaire de paquets

- **Yarn** exclusivement (`packageManager` dans `package.json`), jamais `npm` ni `pnpm` dans ce dépôt.
- `nodeLinker: node-modules` (voir `.yarnrc.yml`) — pas de PnP, `node_modules` classique. Ne pas changer ce réglage sans raison documentée : les docs Next.js lues depuis `node_modules/next/dist/docs/` (voir `AGENTS.md`) dépendent de sa présence sur disque.

## Dépendances (`dependencies`)

| Paquet           | Version  | Rôle                                                                                                                                                                                                                                     |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next`           | `16.3.0` | Framework, App Router. Version récente et **non conventionnelle** — voir `AGENTS.md` avant d'utiliser une API : lire `node_modules/next/dist/docs/` plutôt que de se fier à la mémoire d'entraînement.                                   |
| `react`          | `19.2.8` | Librairie UI.                                                                                                                                                                                                                            |
| `react-dom`      | `19.2.8` | Rendu DOM de React.                                                                                                                                                                                                                      |
| `clsx`           | `^2.1.1` | Composition conditionnelle de classes Tailwind, évite les templates littéraux fragiles.                                                                                                                                                  |
| `zustand`        | `^5`     | État global léger, `src/core/store/` — consommé par les managers front-end (`ThemeManager`, `AppearanceManager`, `ColorVisionManager`), voir `architecture`.                                                                             |
| `lucide-react`   | `^1`     | Icônes. Utilisé pour l'instant uniquement en typage par `HintsManager` (`LucideIcon`) ; dès qu'un composant en rend une, la masquer par un registre dans `src/declarations/ui/` plutôt que l'importer directement (voir `architecture`). |
| `moment`         | `^2`     | Formatage de date avec fuseau, `src/utils/format/dates.tsx` (`formatDate`). Les deux autres helpers du fichier n'en dépendent pas.                                                                                                       |
| `@prisma/client` | `^7`     | Client de base de données, `src/core/lib/db.ts`, consommé par `DatabaseManager` et `StorageManager`. **Prisma 7 : plus d'`url` dans le bloc `datasource`**, la connexion vit dans `prisma.config.ts`.                                    |
| `@prisma/adapter-pg` | `^7` | Adaptateur de driver PostgreSQL. **Prisma 7 refuse de s'instancier sans adaptateur** : `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })` dans `src/core/lib/db.ts`. Ne pas retirer, le build échoue à la collecte des pages. |
| `ioredis`        | `^6`     | Client Redis, `Network/RedisManager`.                                                                                                                                                                                                    |
| `bullmq`         | `^6`     | Files de jobs, `Network/QueueManager`, s'appuie sur `ioredis`.                                                                                                                                                                           |
| `winston`        | `^3`     | Transports de logs, `Core/LoggerManager`.                                                                                                                                                                                                |
| `@logtail/node`  | `^0.5`   | Ingestion de logs distante, `Monitoring/TelemetryManager`.                                                                                                                                                                               |
| `@sentry/nextjs` | `^10`    | Rapport d'erreurs, `src/core/lib/sentry.ts` et `Monitoring/SentryManager`. Inerte sans `NEXT_PUBLIC_SENTRY_DSN`.                                                                                                                         |
| `server-only`    | `^0.0.1` | Garde-fou de frontière : un manager serveur qui remonte dans un bundle client fait échouer le build au lieu de partir en production.                                                                                                     |

## Dev-dépendances (`devDependencies`)

| Paquet                 | Version  | Rôle                                                               |
| ---------------------- | -------- | ------------------------------------------------------------------ |
| `typescript`           | `^5`     | Typage strict, voir `code-style`.                                  |
| `@types/node`          | `^20`    | Types Node pour le tooling.                                        |
| `@types/react`         | `^19`    | Types React.                                                       |
| `@types/react-dom`     | `^19`    | Types React DOM.                                                   |
| `tailwindcss`          | `^4`     | Styles, moteur v4 (config CSS-first, pas de `tailwind.config.js`). |
| `@tailwindcss/postcss` | `^4`     | Plugin PostCSS Tailwind v4, câblé dans `postcss.config.mjs`.       |
| `eslint`               | `^9`     | Lint, config plate (`eslint.config.*`), pas `.eslintrc`.           |
| `eslint-config-next`   | `16.3.0` | Règles Next.js pour ESLint, alignée sur la version de `next`.      |
| `prettier`             | `^3.9.6` | Formatage, `yarn format` / `yarn format:check`.                    |
| `prisma`               | `^7`     | CLI Prisma, `yarn db:generate` / `yarn db:validate`.               |

## Ce qui n'est **pas** préinstallé, volontairement

Aucune librairie de données asynchrones (React Query, SWR...), de client HTTP, de formulaires (React Hook Form, Zod...), de graphiques ni de tests n'est présente par défaut. C'est délibéré, voir `instructions` : côté interface, le template n'installe rien par anticipation. Un projet cloné les ajoute au moment où le besoin est réel.

**Le back-end fait exception, et c'est un choix explicite.** Les managers serveur de `src/managers/infrastructure/` (Config, Logger, Sharding, Database, Redis, Queue, Storage, Encryption, Telemetry, Uptime) sont construits, branchés et type-checkés, leurs paquets installés. Ils ne tournent pour autant **jamais tout seuls** : chaque sujet est `"enabled": false` par défaut dans `src/configurations/default/`, donc aucune connexion n'est ouverte tant qu'un projet cloné ne l'active pas. Le template livre l'outillage, pas l'exécution — voir « Le dossier managers » dans `architecture`.

Plus rien n'est exclu de `tsconfig.json` : si un manager casse, `yarn type-check` le dit.

## Avant d'ajouter un paquet

1. **Vérifier qu'aucun équivalent n'est déjà installé** — ne pas empiler deux librairies qui résolvent le même problème (deux clients HTTP, deux libs de formulaires, ...).
2. **Justifier le besoin réel**, pas un besoin anticipé (voir `instructions`, section Philosophie).
3. **Choisir la version stable la plus récente** sauf contrainte explicite de compatibilité avec `next`/`react` (vérifier le peer-dependency).
4. Installer avec `yarn add <paquet>` (ou `yarn add -D <paquet>` pour une dev-dépendance), jamais en éditant `package.json` à la main.
5. Committer séparément selon le skill `commits` : emoji ➕, une ligne, ex. `➕ Added <paquet> for <usage>`.
6. Mettre à jour ce document dans la même session si le paquet ajouté est structurant (pas pour une dépendance transitive ou un outil ponctuel).

## Montée de version

- Une montée de version mineure/patch : commit `⬆️`, une ligne (`⬆️ Upgraded next to 16.x`).
- Une montée majeure de `next` ou `react` : relire `node_modules/next/dist/docs/` après la montée, les breaking changes de ce dépôt suivent ceux de Next.js lui-même (voir `AGENTS.md`).
- Ne jamais downgrader sans raison documentée (incompatibilité constatée) — commit `⬇️` avec le motif dans le message si c'est le cas.

## Validation après tout changement de dépendances

```bash
yarn install && cp .env.example .env && yarn db:generate && yarn validate
```

`db:generate` d'abord : le client Prisma est produit dans `node_modules`, il n'existe donc pas sur un checkout propre, et `type-check` comme `build` en dépendent.
