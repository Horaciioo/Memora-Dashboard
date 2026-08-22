---
name: testing
description: Convention de tests à appliquer dès qu'une librairie de test rejoint le projet (aucune n'est installée par défaut, voir skill `dependencies`). Outillage recommandé, ce qui doit être testé en priorité (formulaires, DataTable, EmptyState, routes API), emplacement des fichiers. À charger avant d'installer une lib de test ou d'écrire le premier test.
---

# Tests

## Aucun outil de test n'est préinstallé, volontairement

Voir `instructions` et `dependencies` : ce template n'installe rien par anticipation. Ce skill décrit la convention à suivre **le jour où un projet cloné en a réellement besoin**, pas un outillage déjà en place. Vérifier `package.json` avant d'affirmer qu'une lib de test existe.

## Outillage recommandé, au moment de l'installer

- **Unitaire / composant : Vitest + React Testing Library.** Setup documenté dans `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` — suivre ce guide plutôt que la mémoire d'entraînement, voir `AGENTS.md`.
- **End-to-end : Playwright** (`.../02-guides/testing/playwright.md`). Jest et Cypress sont documentés aussi (`.../testing/jest.md`, `.../testing/cypress.md`) mais ne pas empiler deux outils qui couvrent le même rôle (un seul outil unitaire, un seul e2e) — voir la règle de non-duplication du skill `dependencies`.
- **Point d'attention Next.js, non négociable :** Vitest ne supporte pas les Server Components `async`. Un composant serveur asynchrone (la majorité des pages de ce template, voir `architecture`) se teste en **e2e**, jamais en essayant de le forcer en test unitaire.

## Ce qui se teste en priorité

Dans l'ordre, du plus structurant au plus périphérique :

1. **Moteur de formulaire** (`src/core/lib/forms/`, voir `architecture`) — `parseFormValues` et `buildFormSchema` sont des fonctions pures, le point de plus haute valeur pour un test unitaire : champs requis manquants, valeurs hors bornes, champs conditionnellement visibles.
2. **Fabrique de routes API** (`src/core/lib/http/route.ts`) — tester la chaîne session → permission → validation une fois au niveau de la fabrique, pas route par route : une route individuelle ne teste que son `handler`, jamais l'enveloppe déjà couverte par la fabrique.
3. **`DataTable` et `EntityList`** — les trois états (chargement via `isLoading`, rempli, vide via `emptyState`) ne s'affichent jamais deux à la fois, voir `architecture`. C'est exactement ce qu'un test de rendu doit verrouiller.
4. **`EmptyState`** — la variante `'start'` rend le `title`/`description` fournis par l'appelant, la variante `'filter'` retombe sur la copie générique si l'appelant ne fournit rien.
5. **Registres** (`createRegistry`) — un enum qui gagne une valeur sans registre à jour casse la compilation TypeScript avant même d'atteindre un test ; un test n'est utile ici que pour la dérivation (`toOptions`, `registryEnum`), pas pour l'exhaustivité déjà garantie par le typage.
6. **Auth de démonstration** — ne jamais écrire de test qui fige `isValidDemoCredentials` comme un comportement définitif : un test sur ce fichier documente que c'est un mécanisme de démonstration (voir `architecture`, section « Auth de démonstration »), pas une garantie de sécurité.

## Ce qui ne se teste pas

- Les tokens de `src/declarations/` eux-mêmes (un objet de configuration statique n'a pas de logique à vérifier).
- Le rendu pixel-perfect d'un composant purement présentationnel sans état — un test de rendu qui ne fait que confirmer que le JSX correspond au JSX est un test qui casse à chaque refactor sans jamais attraper un vrai bug.

## Emplacement des fichiers

- **Unitaire/composant : colocation.** `Component.test.tsx` à côté de `Component.tsx`, `parseFormValues.test.ts` à côté de `parseFormValues.ts` — jamais un dossier `__tests__/` parallèle qui duplique l'arborescence de `src/`, cohérent avec le rangement par domaine décrit dans `architecture`.
- **E2E : `e2e/` à la racine**, un fichier par parcours utilisateur (`login.spec.ts`, `create-entity.spec.ts`, ...), jamais un fichier par page technique.

## Intégration à la validation

Une fois une lib de test installée, ajouter un script `test` à `package.json` et l'intégrer à `yarn validate` aux côtés de `type-check`/`lint`/`build` (voir `code-style`, section Validation) — un projet avec des tests qui ne tournent pas dans la validation obligatoire n'a pas de tests fiables, juste des fichiers qui existent.
