---
name: instructions
description: Vue d'ensemble du template dashboard — objectif, stack, philosophie et état d'avancement. À charger en premier sur ce dépôt, avant les skills architecture, code-style, comments, commits et branches, pour savoir ce qui est déjà codé et ce qui reste convention.
---

# Template dashboard

## Ce dépôt est un projet, plus un template

Ce dépôt est **Memora**, le dashboard de Marsha, cloné depuis le template dashboard. Les conventions ci-dessous restent en vigueur, mais la règle « aucun terme métier » ne s'applique plus : le domaine réel (modérateurs, projets, tâches, réunions, absences, livecon, academy) vit ici.

Deux décisions de projet à connaître avant d'écrire quoi que ce soit :

- **Les textes affichés sont en français, au tutoiement**, et vivent tous dans `src/declarations/` — jamais une phrase littérale dans un composant. Les commentaires du code restent en anglais, voir `comments`.
- **Les données de référence ne vivent pas dans le code.** YouTubeurs, divisions, fonctions, plateformes, états, priorités, réseaux, formations et niveaux de livecon se créent depuis `/configuration`. Le code ne porte que le catalogue de permissions, les rôles et les énumérés système de `src/utils/constants/`.

Voir `README.md` pour la carte des espaces et le démarrage.

## Objectif

Ce dépôt n'est pas une application. C'est un **point de départ** cloné au début de chaque nouveau projet de dashboard (admin, client, interne, peu importe le métier). Il porte des conventions de structure, de nomenclature et de style, et huit systèmes déjà fonctionnels : couche configurations, back-end serveur, skeleton loader, EmptyState, managers, thème clair/sombre, auth de démonstration + `proxy.ts`, layouts.

Aucun terme métier ne doit apparaître ici. Si un mot ne survivrait pas au clonage vers un autre projet (nom de client, jargon d'un domaine précis), il n'a rien à faire dans ce dépôt — il appartient au projet cloné, pas au template. Le seul nom de domaine toléré est `Entity`, le substitut générique documenté dans `architecture` — jamais un nom métier réel.

## État d'avancement

**Couche configurations, back-end serveur, skeleton loader, EmptyState, managers (Auth/Theme/Notifications/Hints), thème clair/sombre, auth de démonstration et layouts (AppShell/AuthShell) sont codés.** Tout le reste — fabrique de routes API, moteur de formulaire, couche de données client, système de rôles réel — est décrit comme convention à appliquer dans le skill `architecture`, pas comme code existant.

**Le back-end est construit, pas démarré.** `src/managers/infrastructure/` porte configuration, logs, base (Prisma), cache (Redis), files (BullMQ), stockage, chiffrement, télémétrie et sondes : tout est écrit, type-checké, ses paquets installés. Mais **chaque sujet est `"enabled": false` par défaut** dans `src/configurations/default/` : rien ne se connecte tant qu'un projet cloné ne l'active pas. Un clonage initialise le back-end, il ne le construit pas. Avant d'affirmer qu'un pattern est « déjà en place », vérifier dans le projet courant : ce template est mis à jour fréquemment et un projet cloné peut être en avance ou en retard sur cette description.

Un sous-système documenté dans `architecture` en devient une section détaillée à mesure qu'il grossit (voir « Le système de skeleton loader, en détail » ou « Le système EmptyState, en détail »). **Il ne migre vers un skill séparé que le jour où cette section déborde `architecture` au point de le rendre difficile à parcourir d'un coup d'œil** — pas avant. Un skill séparé qui ne fait que dupliquer une section courte de deux paragraphes est une scission prématurée, au même titre qu'un dossier scindé pour un seul fichier.

L'auth de démonstration (`src/app/login/`, `src/core/lib/auth/`, `src/proxy.ts`) vérifie un identifiant **codé en dur** — elle démontre le mécanisme (cookie, redirection, formulaire), ce n'est pas une authentification prête pour la production. Voir `architecture` avant de la remplacer.

Voir `architecture` pour le détail de chaque système et leur démonstration dans `src/app/(dashboard)/overview` et `src/app/(dashboard)/entities`.

## Stack

- Next.js, App Router (pas Pages Router)
- React, TypeScript strict
- Tailwind CSS
- Yarn comme gestionnaire de paquets, `nodeLinker: node-modules` (voir `.yarnrc.yml`)

Le reste de la stack (gestion de données asynchrones, état global, client HTTP, observabilité) n'est **pas préinstallé**. Il s'ajoute au moment où un projet cloné en a réellement besoin, jamais par anticipation dans le template — un template n'est pas une excuse pour installer des dépendances inutilisées.

## Philosophie

- **Pas de hardcoding.** Une valeur métier se déclare une fois dans `src/declarations/`, se consomme partout ailleurs. Détail dans `architecture`.
- **Pas de DRY abusif.** Trois lignes similaires valent mieux qu'une abstraction prématurée pour un besoin qui n'existe pas encore.
- **Pas de fonctionnalité anticipée.** Ce dépôt documente des conventions à appliquer _quand le besoin apparaît_, il ne construit pas à l'avance ce qu'un projet n'a pas encore demandé.
- **Générique, toujours.** Un nom de composant, de dossier ou de variable doit rester vrai pour n'importe quel domaine. `Entity`, `Record`, `Item` plutôt qu'un nom métier — le projet cloné renomme si besoin.

## Comment cloner ce template pour un nouveau projet

1. Cloner, renommer `name` dans `package.json`.
2. Remplacer les tokens placeholder de `src/styles/globals.css` (`--color-brand-100`, `--color-brand-600`, ...) par l'identité visuelle réelle du projet — jamais les garder par défaut.
3. Adapter la description de chaque skill si le projet a des règles propres (langage des textes affichés, stack de données choisie, ...), sans réintroduire de jargon dans ce dépôt template lui-même si des changes y sont reportés en amont.
4. Construire les dossiers de `src/core/`, `src/declarations/`, `src/composites/` au fur et à mesure des besoins réels, en suivant la carte du skill `architecture`.
5. Remplacer l'auth de démonstration (`src/core/lib/auth/session.ts`, identifiants codés en dur) par un vrai système avant tout déploiement.
6. Copier `.env.example` en `.env` (obligatoire, `yarn db:generate` échoue sans lui), renseigner `DATABASE_URL` et activer les seuls sujets dont le projet a besoin (`*_ENABLED=true`). Remplir les registres volontairement vides de `src/declarations/system/` : `CACHED_TABLES`, `JOB_REGISTRY`, `STORAGE_BUCKETS`.
7. Créer les quatre branches du skill `branches` (`dev`, `staging`, `release`, `main`) — les dossiers de `src/configurations/environments/` portent exactement ces noms.

## Skills à charger, dans l'ordre

1. `instructions` (ce document) — contexte général
2. `architecture` — avant d'ajouter une feature, une route, un formulaire, un tableau
3. `code-style` — avant d'écrire ou modifier un fichier `.ts`/`.tsx`/`.css`
4. `comments` — avant d'écrire le moindre commentaire, `.ts`/`.tsx` comme `.yml`
5. `commits` — avant de committer
6. `branches` — avant tout `git push`, `git merge` ou PR

## Validation, non négociable avant de rendre du travail

```bash
cp .env.example .env && yarn db:generate && yarn validate
```

`yarn validate` enchaîne `type-check`, `lint` et `build`. `db:generate` d'abord : le client Prisma vit dans `node_modules`, n'existe pas sur un checkout propre, et Prisma 7 exige `DATABASE_URL` — depuis l'environnement ou depuis un `.env`, jamais depuis le schéma. `yarn format` applique Prettier, `yarn format:check` le vérifie.
