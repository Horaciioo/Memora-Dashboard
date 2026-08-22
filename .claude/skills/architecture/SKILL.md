---
name: architecture
description: Carte de l'architecture du template dashboard et des conventions à appliquer sur tout projet qui en dérive (couche configurations JSON, registres d'enum, fabrique de routes API, moteur de formulaire, couche de config déclarative, skeleton loader, EmptyState, managers, thème clair/sombre, auth de démonstration + proxy.ts, layouts). À charger avant d'ajouter une feature, une route API, un formulaire, un tableau ou une liste, un état vide, une entité, un réglage chiffré, un manager, un layout, ou de toucher à l'auth/au thème.
---

# Architecture, template dashboard

Template générique pour tout dashboard admin/client, quel que soit le métier. Next.js App Router, React, TypeScript strict, Tailwind CSS. Conçu pour être cloné projet par projet : ce dépôt ne doit jamais contenir de vocabulaire métier, seulement des conventions et un premier système fonctionnel.

## Ce qui est réellement codé ici

Huit systèmes sont implémentés, le reste de ce document est convention.

**La couche configurations :** `src/configurations/` porte des `.json` chiffrés purs — `system/` pour les réglages client, puis `default/` + `environments/<branche>/` + `template/` pour la configuration serveur. `src/declarations/configurations/readers.ts` les lit en les bornant et en repliant sur une valeur par défaut, `settings.ts` expose la famille client, `infrastructure.ts` et `sources.ts` alimentent `ConfigManager` pour la famille serveur. Détail dans « La couche configurations » plus bas.

**Le back-end serveur :** `src/managers/infrastructure/` — configuration, logs, base, cache, files, stockage, chiffrement, télémétrie, sondes. Construit et type-checké, désactivé par défaut. Détail dans « Le dossier managers » plus bas.

**Skeleton loader :**

- `src/components/elements/feedback/Skeleton.tsx` — primitive `<Skeleton />` et `<SkeletonList />`
- `src/components/structures/PageSkeleton.tsx` — skeleton de route, un titre + des blocs
- `src/components/structures/DataTable.tsx` — tableau générique avec support natif de `isLoading`
- `src/composites/entities/` — démonstration du pattern manuel (`{isLoading && <SkeletonList />}`) avec une entité factice
- `src/declarations/ui/variants.ts` — `SKELETON_SHAPES`, `SKELETON_BASE`, `TABLE_STYLES`
- `src/app/(dashboard)/overview` et `src/app/(dashboard)/entities` — deux pages de démonstration, chacune avec son `loading.tsx`

**EmptyState :** le pendant vide du skeleton loader — même statut de système codé, même niveau de détail. Voir « Le système EmptyState » plus bas.

**Managers (état transverse) :** `src/managers/` — deux sous-dossiers, `front-end/` (managers de synchronisation client, pilotés par un store `src/core/store/`) et `infrastructure/` (providers de contexte et services serveur, rangés par domaine : `Security/`, `Network/`, `Core/`, `Database/`, `Monitoring/`). Composés une seule fois dans `src/app/providers.tsx`. Détail dans « Le dossier managers » plus bas.

**Thème clair/sombre :** tokens sous la classe `.dark` dans `src/styles/globals.css`, script anti-flash `src/components/tools/ThemeScript.tsx`, store `src/core/store/theme.ts`, sélecteur `src/components/elements/actions/ThemeToggle.tsx`. Détail dans « Thème clair/sombre » plus bas.

**Auth de démonstration + `proxy.ts` :** `src/proxy.ts` protège les routes du dashboard au niveau requête, `src/core/wrappers/requireUser.ts` (`requireUser`, `optionalUser`) protège un composant serveur individuel en dessous de ce niveau, `src/app/login/` porte la page et les actions serveur, `src/core/lib/auth/` porte la session. **C'est un mécanisme de démonstration, pas un système d'authentification réel** — voir « Auth de démonstration » plus bas avant de le laisser tel quel en production.

**Layouts :** `src/layouts/AppShell.tsx` (chrome du dashboard authentifié : nav, `ThemeToggle`, `LogoutButton`) et `src/layouts/AuthShell.tsx` (carte centrée partagée par les écrans non authentifiés). Composés respectivement par `src/app/(dashboard)/layout.tsx` et `src/app/login/page.tsx` — jamais de JSX de shell dupliqué à même une page.

Avant de référencer un registre, une fabrique de route ou un moteur de formulaire dans une réponse, vérifier qu'il existe réellement dans le projet courant — un projet cloné du template n'a, au départ, que les systèmes ci-dessus.

## La règle fondatrice

Le hardcoding est banni. Une valeur métier (libellé, couleur, borne, colonne de tableau, question de formulaire, permission, URL d'API, clé de cache) se déclare **une seule fois** dans `src/declarations/` ou dans une fabrique de `src/core/lib/`, et se consomme partout ailleurs.

Le DRY abusif est banni aussi : on ne factorise pas au point de rendre le code illisible. Les abstractions ci-dessous sont celles à privilégier une fois qu'un besoin réel les justifie. En ajouter une nouvelle demande une justification technique, pas une préférence.

## Les abstractions à mettre en place quand le projet en a besoin

Ces patterns ne sont pas encore implémentés dans le template. Ils décrivent la convention à suivre la première fois qu'un projet dérivé a besoin d'un registre, d'une route API, d'un formulaire ou d'une couche de données. Remplacer `Entity` par le nom réel du domaine du projet (utilisateur, commande, produit, ticket, ...).

### 1. Registre d'enum, `src/core/lib/registry.ts`

`createRegistry` lui-même est codé, avec trois consommateurs : `COLOR_VISION_REGISTRY` (`src/declarations/access/preferences.ts`), `JOB_REGISTRY` et `STORAGE_BUCKETS` (`src/declarations/system/`). Ce qui reste convention est son application à un enum **métier**. Toute valeur de registre porte un `label` — c'est la contrainte du type. `createRegistry<TKey, TValue>(map)` prend un `Record` exhaustif indexé sur un enum (Prisma, base de données, ou simple union TypeScript) et rend `{ map, keys, list, get, label, has }`. Le `Record` force TypeScript à échouer si l'enum évolue sans que les métadonnées suivent — c'est le garde-fou anti-dérive.

Un registre par enum métier (`ROLE_REGISTRY`, ...), jamais un `switch` sur des chaînes ni un objet de libellés déclaré à côté de son usage.

**Ne pas confondre avec `createEnumeration()`** (`src/core/lib/enumeration.ts`, voir « Le dossier constants ») : `createRegistry` indexe une clé **chaîne** vers des métadonnées libres, `createEnumeration` gère un énuméré **à id numérique persisté** et ses deux sens de lecture. Un énuméré système va dans `src/utils/constants/` via `createEnumeration` ; un registre de métadonnées d'affichage va dans `src/declarations/` via `createRegistry`. N'en ajouter un troisième sous aucun prétexte.

`registryEnum(REGISTRY)` en dérive un schéma de validation. `toOptions(REGISTRY)` en dérive les options de select.

### 2. Fabrique de routes API, `src/core/lib/http/route.ts`

Aucune route n'écrit sa propre gestion d'auth, de validation ou d'erreur.

```ts
export const POST = createProtectedRoute({
  permission: 'entity:create',
  status: 201,
  body: createEntitySchema,
  handler: async ({ body, session }) => createEntity(body, session.id),
})
```

La fabrique enchaîne : session → vérification de permission → validation du body, de la query et des params → enveloppe `{ success, data }` ou `{ success, error }`.

`createPublicRoute` pour les routes ouvertes (login, health), une variante d'upload pour le multipart.

Pour les routes protégées, la spécification est **OpenAPI** par défaut (pas « OpenAPI ou équivalent » générique — c'est le choix systématique sur ce type de route). Elle ne se **jamais écrit à côté du code** : elle se dérive du descripteur optionnel que la fabrique attache déjà à chaque route (résumé, tags, réponses métier), jamais un fichier `.yaml`/`.json` maintenu à la main. Voir le point 6 (`src/generated/`) pour où range le fichier dérivé.

### 3. Moteur de formulaire, `src/core/lib/forms/`

Une `FieldDefinition` décrit un champ une fois et sert à la validation serveur, à la validation client et au rendu UI.

- `buildFormSchema(fields)` → schéma de validation
- `parseFormValues(fields, values, { enforceRequired, fillMissing })` → valide, borne et normalise. **Tout** point d'entrée qui accepte des valeurs libres doit passer par là.
- `isFieldVisible`, `visibleFields`, `collectMissingRequired` → conditions d'affichage, un champ caché n'est jamais obligatoire

**Une `FieldDefinition` ne porte jamais de `min`, `max`, `step` ou `maxLength` en dur.** Ces nombres sont des réglages métier au sens de la règle fondatrice : ils vivent dans `src/declarations/`, jamais tapés à même le champ.

### 4. Couche client, `src/core/lib/api/` et `src/core/hooks/`

- Une seule table d'URL (`API_ROUTES`). Aucun chemin en dur ailleurs.
- Un client HTTP qui déballe l'enveloppe de réponse et lève une erreur typée.
- Les clés de cache (React Query ou équivalent) ont une seule source, jamais recréées à la volée dans un composant.
- Un hook par domaine dans `src/core/hooks/`, responsabilité unique.

### 5. Files de requêtes (à n'ajouter que si le volume d'appels le justifie)

`Network/QueueManager` (BullMQ) porte déjà la concurrence, les tentatives et le backoff, tous lus du sujet `queues` de `src/configurations/`. Un job se **déclare** dans `JOB_REGISTRY` (`src/declarations/system/jobs.ts`) puis s'enregistre via `queues.register(handler)` — jamais une limite câblée dans un hook, jamais un nom de queue tapé en dur.

### 6. Artefacts dérivés, `src/generated/`

Tout fichier qu'un script produit plutôt qu'un humain n'écrit (spécification OpenAPI dérivée de la fabrique de routes, client généré, ...) va dans `src/generated/<sujet>/`, jamais mélangé au code écrit à la main. Rien ne s'y range tant qu'aucun générateur n'existe dans le projet — ce dossier n'a de raison d'être créé que le jour où le point 2 (fabrique de routes API) produit réellement une spécification.

## Où va quoi

Tout est rangé par domaine, jamais à plat. Un fichier nouveau se range dans le dossier de son domaine ; si un dossier dépasse la dizaine de fichiers à plat, il se sous-découpe.

| Dossier                            | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/configurations/`              | Réglages chiffrés bruts, jamais de texte affiché dedans. `system/` (client, non stratifié) et `default/` + `environments/<branche>/` + `template/` (serveur, stratifié par branche) — voir « La couche configurations »                                                                                                                                                                                                                                                                                                                                                                               |
| `src/declarations/configurations/` | `readers.ts`, `settings.ts` (famille client, `PAGINATION_SETTINGS`), `sources.ts` (`CONFIG_SOURCES`, imports statiques des `.json`) et `infrastructure.ts` (`SUBJECT_READERS`, un lecteur borné par sujet) — voir « La couche configurations »                                                                                                                                                                                                                                                                                                                                                        |
| `src/declarations/system/`         | Registres système du back-end : `environments.ts` (`APP_ENVIRONMENT`, `ENVIRONMENT_MANIFESTS`), `caches.ts` (`CACHED_TABLES`), `jobs.ts` (`JOB_REGISTRY`), `storage.ts` (`STORAGE_BUCKETS`). Les trois derniers sont des registres **volontairement quasi vides** : un projet cloné y déclare ses tables, ses jobs et ses destinations de fichiers                                                                                                                                                                                                                                                    |
| `src/declarations/`                | Déclarations : `app.ts`, `navigation.ts`, puis `ui/` (variants, blocks, theme, copy), et un dossier par domaine métier créé au besoin. Nommé `declarations` plutôt que `config` précisément pour ne pas se confondre avec `src/configurations/` — les deux se lisent et s'écrivent trop près l'un de l'autre sinon                                                                                                                                                                                                                                                                                    |
| `src/core/lib/`                    | Fabriques et infrastructure, codé : `registry.ts` (`createRegistry`), `api/client.ts` (`ApiClientError`), `db.ts` (client Prisma, `server-only`), `logger.ts` (façade `bindLogger`/`unbindLogger`, console tant que `LoggerManager` n'a pas pris la main), `sentry.ts` (inerte sans DSN) ; `env`, `errors`, `http/`, `forms/`, `query/` — créés au fur et à mesure, pas d'avance                                                                                                                                                                                                                      |
| `src/core/schemas/`                | Schémas de validation d'entrée, dérivés des registres                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `src/core/services/`               | Logique métier côté serveur, un dossier par domaine, codé : `auth/PermissionsService.ts` (dérive les permissions d'une session, consommé par `Security/AuthManager`) — un service est une fonction pure, jamais un hook, précisément parce qu'il ne porte aucun état React                                                                                                                                                                                                                                                                                                                            |
| `src/core/hooks/`                  | Hooks React `'use client'`, un dossier par domaine, codé : `auth/useAuth` (mutation de déconnexion), `auth/useSessionUser` (session hydratée serveur, jamais refetchée)                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `src/managers/`                    | Managers transverses, codé : `front-end/` (`ThemeManager`, `AppearanceManager`, `ColorVisionManager`, `HintsManager` — composants de synchronisation ou providers de contexte légers, pilotés par `src/core/store/`) et `infrastructure/` (`Security/AuthManager`, `Network/NotificationsManager` codés et branchés ; le reste — `Database`, `Redis`, `Sentry`, `Queue`, `Storage`, `Encryption`, `Config`, `Logger`, `Sharding`, `Telemetry`, `Uptime` — présent pour la cohérence de nommage inter-projets mais dormant, dépendances non installées, exclu de `tsconfig.json`, voir `dependencies`) |
| `src/core/store/`                  | État global léger, codé : `theme.ts`, `appearance.ts`, `colorVision.ts` — un store Zustand par préférence, persisté en `localStorage` (middleware `persist`), lu par le manager `front-end/` correspondant                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/core/wrappers/`               | Garde-fous des composants serveur, codé : `requireUser`, `optionalUser` (`requireUser.ts`) — complète `src/proxy.ts`, qui protège au niveau route, pas au niveau d'un composant serveur individuel                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/types/`                       | Types partagés, DTO, codé : `entity.ts`, `auth.ts`, `infrastructure.ts` (formes de configuration, environnements, sondes), `storage.ts`, `jobs.ts`. Reste un seul niveau tant que le dossier se parcourt d'un coup d'œil ; se scinde en `entities/` (DTO par domaine, barrel `index.ts`) et `structures/` (types transverses : formulaires, API, auth, ...) une fois qu'un deuxième fichier apparaît vraiment — ne pas créer les deux dossiers pour un seul fichier                                                                                                                                   |
| `src/utils/`                       | Helpers transverses (`classnames`, `format/`, ...) et `constants/` (codé) — voir « Le dossier constants » plus bas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/app/api/`                     | Route handlers, un fichier par endpoint, tous via la fabrique de route                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `src/components/elements/`         | Primitives, rangées par nature : `actions/` (`Button`, `SegmentedControl`, puis ses consommateurs `ThemeToggle`, `AppearanceToggle`, `ColorVisionSelect`), `forms/` (`Select`), `feedback/` (`Skeleton`, `EmptyState`), `surfaces/`, `navigation/`, `display/`. **Deux contrôles qui partagent la même forme visuelle partagent la même primitive** — `ThemeToggle` et `AppearanceToggle` ne sont que des `SegmentedControl` câblés sur deux stores différents, ils ne réécrivent pas le balisage                                                                                                     |
| `src/components/structures/`       | Assemblages génériques réutilisables entre domaines, codé : `DataTable`, `SectionHeader`. Candidats à ajouter au même endroit quand le besoin apparaît, jamais par avance : `FilterBar`, `StatCard`, `TrendValue`, `ConfirmDialog`, un `FormRenderer` piloté par le moteur de formulaire (point 3)                                                                                                                                                                                                                                                                                                    |
| `src/components/tools/`            | Synchronisations de document sans rendu métier, codé : `ThemeScript` (script anti-flash), `ColorVisionFilters` (filtres SVG cachés, montés une fois dans `src/app/layout.tsx`). Un composant qui rend réellement quelque chose à l'écran (toast, confirmation) sans porter de logique métier va dans `src/components/general/`, pas ici — ce dossier n'existe pas encore, le créer au premier composant de ce genre                                                                                                                                                                                   |
| `src/composites/`                  | Un dossier par domaine d'écran, blocs métier qui ne se réutilisent pas ailleurs, codé : `auth/` (`LoginForm`, `LogoutButton`, `UserBadge`), `entities/` (`EntitiesPanel`, `EntityList`)                                                                                                                                                                                                                                                                                                                                                                                                               |
| `src/layouts/`                     | Shells applicatifs, codé : `AppShell` (chrome du dashboard authentifié), `AuthShell` (carte centrée des écrans non authentifiés)                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/generated/`                   | Artefacts dérivés (spécification OpenAPI, client généré, ...), jamais écrits à la main — voir point 6 des abstractions plus haut. N'existe pas encore, rien ne le justifie tant qu'aucun générateur n'est branché                                                                                                                                                                                                                                                                                                                                                                                     |
| `src/proxy.ts`                     | Protection des routes au niveau requête (Next.js 16, voir « Auth de démonstration »)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## Palette

`src/styles/globals.css` porte des tokens **placeholder** (`--color-brand-100`, `--color-brand-600`, ...) explicitement commentés « swap per project ». Le premier travail sur un projet cloné est de remplacer ces valeurs par l'identité visuelle réelle, jamais de les garder par défaut ni de réintroduire un hexadécimal en dur dans un composant. Dans un composant, on référence toujours le token (`bg-[var(--color-surface)]`), jamais une couleur littérale.

## Couche UI

Points de déclaration, aucun composant n'invente ses classes ni ses libellés d'interface :

| Fichier                           | Rôle                                                                                                                                                                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/globals.css`          | Tokens (couleur, rayon, motion) et leurs valeurs sombres sous `prefers-color-scheme: dark`. L'échelle de motion (`--motion-duration-moderate`) porte la durée des animations fonctionnelles, jamais une valeur tapée dans un composant.        |
| `src/declarations/ui/variants.ts` | Primitives, codé : `SKELETON_SHAPES`, `SKELETON_BASE`, `TABLE_STYLES`, `BUTTON_STYLES`, `EMPTY_STATE_STYLES`, et tout ce qui s'ajoute au même endroit (cartes, champs) au fur et à mesure                                                      |
| `src/declarations/ui/blocks.ts`   | À créer quand des surfaces composées apparaissent (rail de navigation, barre supérieure, tuile de compteur, ...)                                                                                                                               |
| `src/declarations/ui/theme.ts`    | À créer pour les tonalités (succès/erreur/neutre) dès qu'une deuxième couleur sémantique apparaît                                                                                                                                              |
| `src/declarations/navigation.ts`  | À créer pour les routes et le fil d'Ariane dès que la navigation dépasse les deux liens actuels de `(dashboard)/layout.tsx` — c'est aussi le préalable d'un `BreadcrumbManager` (voir « Le dossier managers »), ne pas créer l'un sans l'autre |

**`variants.ts` (ou tout fichier `ui/*.ts`) se sous-découpe en dossier, un fichier par nature (même logique que `ui/blocks/`), une fois qu'il porte trop de groupes pour rester lisible d'un coup d'œil** — pas de seuil chiffré arbitraire, le signal est le même que pour un dossier : on ne le voit plus d'un coup d'œil. Ne pas anticiper ce découpage tant que le fichier reste court.

### Règles UI à respecter

- **Mobile-first.** Le style mobile s'écrit en premier, puis s'élargit avec `sm:` et `lg:`.
- **Un filtre de liste est un menu**, pas une rangée de puces, dès qu'un projet en a besoin.
- **Toujours un titre de section structuré**, jamais un titre de page nu sans wrapper réutilisable.
- **Pas de synchronisation d'état par `useEffect`** pour un brouillon alimenté par une source externe ; passer par un hook dédié (`useSyncedState` ou équivalent) plutôt que de dupliquer l'état en local.
- **Choisir un registre de langage pour les textes affichés et s'y tenir** (tutoiement, vouvoiement, anglais, ...) — c'est une décision de projet, pas un défaut du template.

## La couche configurations, en détail

Deux familles vivent sous `src/configurations/`, elles ne se mélangent jamais.

### Famille 1, les réglages client, non stratifiés

`src/configurations/system/<sujet>.json` — un nombre, une chaîne, une paire `{ min, max }`. Importés statiquement par `src/declarations/configurations/settings.ts`, qui les borne via `readers.ts` et exporte un objet `SCREAMING_SNAKE_CASE` (`PAGINATION_SETTINGS`). Aucun libellé, aucune logique, jamais importé ailleurs que par son lecteur.

Un réglage qui dépend d'un autre résout d'abord le second et passe sa valeur comme borne du premier — voir `maxPerPage` avant `defaultPerPage`.

### Famille 2, la configuration serveur, stratifiée par branche

Trois couches, fusionnées dans cet ordre par `ConfigManager` :

```
src/configurations/
  default/<sujet>.default.json             base commune, valeurs réelles non secrètes
  environments/<branche>/<sujet>.<branche>.json   overrides seuls
  template/<sujet>.template.json           placeholders ${VAR}, résolus depuis process.env
```

**Le nom du fichier porte sa couche** : `<sujet>.<couche>.json`. Un fichier non stratifié n'en porte donc pas, ce qui laisse `system/pagination.json` tel quel.

**Les environnements portent le nom des branches** — `dev`, `staging`, `release`, `main` — en correspondance 1:1 avec le circuit du skill `branches`. Aucune traduction mentale entre une branche et son fichier de configuration. `APP_ENVIRONMENT` (`src/declarations/system/environments.ts`) résout la branche courante depuis `APP_ENV`, avec repli sur `dev` en développement et `main` sinon ; `ENVIRONMENT_MANIFESTS` y attache le libellé, les sujets obligatoires et le `strict` qui fait échouer le démarrage sur `release` et `main`.

**Trois règles dures :**

1. **Zéro doublon.** Un fichier d'`environments/` ne porte que ce qui diffère de `default/`. Un sujet sans override dans une branche n'a **pas** de fichier là-bas.
2. **Zéro secret.** `default/` met `null` là où un secret irait, `template/` met `${VAR}`. Aucune valeur sensible littérale, dans aucune couche, jamais. `.env.example` documente chaque variable.
3. **Zéro littéral dans `template/`.** La couche template est fusionnée en dernier : une valeur littérale y écraserait silencieusement l'override d'environnement. Elle ne contient que des `${VAR}`.

### Le chemin d'une valeur

`.json` → `readNode`/`SUBJECT_READERS` (`src/declarations/configurations/infrastructure.ts`) → `ConfigManager.get(sujet)` → manager. Chaque lecteur vérifie le type, borne si pertinent, et retombe sur une valeur de repli en journalisant un `console.warn` plutôt que de planter l'application. Un client qui tape une virgule ou inverse un `min`/`max` n'impacte ni le build ni le runtime — c'est aussi pourquoi le Quality Gate passe `jq empty` sur ces fichiers : la CI doit échouer là où l'app se contente d'un avertissement.

`ConfigManager` gèle chaque sujet résolu (`Object.freeze`) et le met en cache : un manager ne peut pas écrire dans sa propre configuration.

**Les huit sujets ont chacun un consommateur réel** : `database`, `redis`, `queues`, `storage`, `encryption`, `telemetry`, `logger`, `uptime`. N'en ajouter un neuvième que le jour où un manager le lit.

**Une valeur numérique chiffrée ne se tape jamais en dur** dans un composant, un schéma ou une `FieldDefinition`. Elle suit ce chemin même si elle n'est utilisée qu'à un seul endroit — la valeur du chemin est la protection contre la faute de frappe silencieuse, pas la réutilisation.

## Le système de skeleton loader, en détail

Codé, volontairement conçu pour être copié tel quel sur n'importe quel projet.

**Une seule primitive, une seule liste de silhouettes déclarées en config.** `SKELETON_SHAPES` (`src/declarations/ui/variants.ts`) fixe la hauteur réservée par type de contenu : `line` (une ligne de texte), `row` (une ligne de tableau), `tile` (une tuile de compteur), `card` (une carte de grille), `sheet` (un panneau). Le nom du shape est toujours celui du composant réel qu'il remplace, jamais une taille arbitraire. Ajouter un nouveau gabarit de contenu, c'est ajouter une clé ici, jamais une classe `h-XX` tapée dans un composite.

**L'animation est purement CSS.** `.skeleton-shimmer` (`src/styles/globals.css`) pose un pseudo-élément `::after` en dégradé animé, dont la durée vient de `--motion-duration-moderate`. Sous `prefers-reduced-motion: reduce`, l'animation est coupée mais le bloc reste visible en aplat mat — jamais de disparition ni de gel d'une boîte vide.

**Deux niveaux de consommation, jamais mélangés :**

1. **Route.** Chaque dossier de page sous `src/app/(dashboard)/` a un `loading.tsx` frère (mécanisme natif de l'App Router). Il appelle uniquement `<PageSkeleton blocks={[...]} />` avec la silhouette réelle de la destination. Voir `overview/loading.tsx` (tile + card) et `entities/loading.tsx` (row).
2. **Composant, piloté par un état de chargement plutôt que par la navigation.** `DataTable` porte ça nativement via sa prop `isLoading`. Le pattern manuel (`{isLoading && <SkeletonList shape="row" rows={n} />}`) s'applique dans les composites qui n'utilisent pas `DataTable`, voir `EntityList.tsx` — seule la portion qui dépend de la donnée clignote, jamais le chrome autour (filtres, en-tête).

Le seul travail par projet, s'il arrive, est d'ajouter un sixième shape si un nouveau type de bloc visuel apparaît — jamais de retoucher `Skeleton.tsx`, `SkeletonList` ou `PageSkeleton` eux-mêmes.

## Le système EmptyState, en détail

Le pendant vide du skeleton loader : là où le skeleton comble l'attente, `EmptyState` comble l'absence — de données du tout, ou de résultats sous le filtre courant. Même statut (codé, à copier tel quel), même niveau de contrainte.

**Une action est toujours obligatoire, jamais optionnelle.** `EmptyStateProps.action` (`src/components/elements/feedback/EmptyState.tsx`) est un `ReactNode` requis, toujours rendu sous la description. Un EmptyState n'est jamais un cul-de-sac : il porte systématiquement le geste qui en sort (créer, effacer un filtre, réessayer). C'est délibérément plus strict que le skeleton loader, qui lui n'a pas d'action.

**Deux variantes, jamais une troisième sans besoin réel.** `variant: 'start' | 'filter'` (défaut `'start'`) :

- `'start'` — la collection est réellement vide, l'action invite à créer le premier élément. `title`/`description` sont à la charge de l'appelant, il n'existe pas de copie générique honnête pour « rien ici » à travers un domaine métier arbitraire.
- `'filter'` — la collection a des éléments mais le filtre courant n'en retient aucun, l'action invite à l'élargir ou l'effacer. `title`/`description` retombent sur une copie générique (« No matches » / « Try widening or clearing the current filter. ») si l'appelant ne les fournit pas.

**Illustration, pas icône plate.** `src/components/elements/feedback/EmptyStateIllustration.tsx` porte deux SVG inline dessinés à la main, dans les tokens de couleur du projet (`var(--color-brand-600)`, `var(--color-border)`) — `EmptyBoxIllustration` (boîte ouverte, générique, pour `'start'`) et `NoResultsIllustration` (loupe, pour `'filter'`). Pas de dépendance à une librairie d'icônes pour deux SVG : la prop `icon` d'`EmptyState` permet à un projet cloné de passer sa propre illustration par usage. **Ce que ce template ne fait pas** : un registre d'illustrations par domaine métier (`domain: 'invoice' | 'ticket' | ...`) — c'est exactement le genre d'extension spécifique à ajouter une fois le domaine réel connu, jamais à anticiper ici.

**Le cadre est en trait pointillé.** `EMPTY_STATE_STYLES.frame` (`src/declarations/ui/variants.ts`) — `border-dashed`, jamais un cadre plein, pour rester visuellement distinct d'une carte de contenu réel.

**Deux niveaux de consommation, symétriques au skeleton loader :** `DataTable` et `EntityList` prennent toutes deux une prop `emptyState?: EmptyStateProps`, rendue à la place du corps une fois `rows`/`entities` vide et `isLoading` faux — jamais les deux affichages en même temps.

**Le pattern « EmptyState remplace le bouton d'ajout ».** Voir `EntitiesPanel.tsx` : il n'existe **aucun** bouton "Add entity" permanent dans la barre d'outils. Tant que la collection est vide, la seule façon d'y entrer est l'action de l'`EmptyState` en variante `'start'`. C'est un choix délibéré, pas un oubli — un bouton d'ajout et un message vide qui dit la même chose sont une duplication d'intention. Un filtre qui ne retourne rien bascule le même emplacement en variante `'filter'`, avec une action « Clear filter » plutôt que « Add ».

## Le dossier constants

`src/utils/constants/` est la source unique de vérité des énumérés **système** : un fichier par famille logique, jamais un fourre-tout, jamais un énuméré recopié ailleurs.

| Fichier          | Contenu                                                     |
| ---------------- | ----------------------------------------------------------- |
| `actions.ts`     | `ACTION_TYPES` — actions possibles sur une ressource        |
| `statuses.ts`    | `ENTITY_STATUSES` (cycle de vie), `SEVERITY_LEVELS`         |
| `events.ts`      | `EVENT_TYPES` (faits journalisables), `EVENT_ORIGINS`       |
| `rules.ts`       | `RULE_TYPES`, `REPORT_TYPES`                                |
| `modules.ts`     | `SYSTEM_MODULES` — composants activables indépendamment     |
| `errors.ts`      | `ErrorCodes`, `ERROR_MESSAGES`, `resolveErrorMessage()`     |
| `permissions.ts` | `Permissions`, `PermissionsList`, `hasPermission()`         |
| `cookies.ts`     | `CookieKeys`, `CookiePrefix`                                |
| `media.ts`       | `MEDIA_PATTERNS` — gabarits d'URL distante, base par projet |

**Un énuméré numérique se déclare via `createEnumeration()`** (`src/core/lib/enumeration.ts`), jamais par un double objet écrit à la main dans les deux sens : une seule déclaration `{ Nom: { id, label } }` produit `ids`, `names`, `list`, `options`, `byId`, `byName`, `label`, `has`. Les index sont construits une fois (`Map`), les lectures restent en temps constant, et le paramètre de type `const` conserve les ids **littéraux** — `EntityStatus` vaut `0 | 1 | 2 | 3 | 4`, pas `number`, donc un statut inexistant échoue à la compilation.

**Un id numérique ne se réutilise ni ne se renumérote jamais** : il est persisté en base. Une valeur retirée du produit se marque `deprecated: true` — elle reste résolvable par `byId` (les enregistrements existants s'affichent toujours) mais disparaît de `options`, donc des sélecteurs.

**Un énuméré dont la valeur est un contrat externe** (code d'erreur d'API, clé de cookie, permission) reste un objet `as const` à sens unique — `ErrorCodes`, `Permissions`, `CookieKeys` — jamais converti en ids numériques : la chaîne _est_ la valeur échangée.

Le type dérivé se réexporte à côté de l'énuméré (`EntityStatusName`, `EntityStatusId`), et un type de domaine s'y **aliase** plutôt que de le redéclarer : `Permission` (`src/types/auth.ts`) est un alias de `PermissionName`, `EntityStatus` (`src/types/entity.ts`) un alias de `EntityStatusId`.

`ENTITY_STATUSES` est le seul branché de bout en bout aujourd'hui (`mockEntities`, colonne de `DataTable`, `EntityList`, filtre de `EntitiesPanel` — la liste d'options et les libellés en descendent tous). Les autres sont déclarés en avance **par choix explicite** pour que tout projet cloné parte du même vocabulaire ; c'est la seule exception assumée à la règle « pas de fonctionnalité anticipée » de `instructions`.

## Le dossier managers

`src/managers/` porte tout état transverse, réparti en deux familles qui ne se mélangent jamais à plat :

- **`front-end/`** — des composants de synchronisation `'use client'` sans rendu (ou presque) qui lisent un store `src/core/store/` et projettent sa valeur sur le DOM (`document.documentElement.dataset.*`, `classList`), ou de légers providers de contexte pour un état trop éphémère pour un store persisté. Codé : `ThemeManager`, `AppearanceManager`, `ColorVisionManager` (les trois retournent `null`, montés comme enfants inertes), `HintsManager` (provider, expose `useHints()` → `showHint(message, origin, icon?)`, bulles flottantes éphémères positionnées au point de clic). `BreadcrumbManager` existe dans le dossier mais n'est **pas** exporté du barrel `front-end/index.ts` — son préalable `src/declarations/navigation.ts` est lui-même gated derrière « la navigation dépasse deux liens » (voir la table Couche UI), le construire avant serait l'anticipation que ce template interdit.
- **`infrastructure/`** — des providers de contexte (état client réel, permissions, session) et le back-end serveur, rangés par domaine (`Security/`, `Network/`, `Core/`, `Database/`, `Monitoring/`).
  - **Montés dans l'arbre React** : `Security/AuthManager.tsx` (session + permissions, `AuthProvider`/`useAuthContext`) et `Network/NotificationsManager.tsx` (file de toasts headless, `NotificationProvider`/`useNotifications` — ne rend rien, voir `NotificationsToaster` ci-dessous).
  - **Construits, type-checkés, mais jamais démarrés tout seuls** : `Core/{ConfigManager,LoggerManager,Sharding}`, `Database/{DatabaseManager,TableCache}`, `Network/{RedisManager,QueueManager,StorageManager}`, `Security/EncryptionManager`, `Monitoring/{TelemetryManager,UptimeManager}`. Leurs paquets sont installés, plus rien n'est exclu de `tsconfig.json`, et **chaque sujet est `"enabled": false` par défaut** : aucune connexion n'est ouverte tant qu'un projet cloné ne l'active pas dans `src/configurations/`. C'est la seule exception assumée à « pas de fonctionnalité anticipée » côté serveur — le template livre l'outillage, pas l'exécution.

`Sharding` est le conteneur racine : il instancie les managers, charge la configuration puis le logger, et n'interrompt le démarrage que si un sujet listé dans `manifest.required` échoue. Un manager serveur ne s'instancie jamais à la main, il se lit sur `Sharding`.

**Frontière serveur, tenue par le compilateur.** Chaque manager serveur ouvre sur `import 'server-only'` : le jour où un composant client en importe un — directement ou par le barrel `src/managers/infrastructure/index.ts` — le build échoue au lieu de laisser partir `ioredis` dans le bundle navigateur. Ne pas retirer cette ligne pour « faire marcher » un import ; c'est l'import qui est au mauvais endroit.

Chaque manager branché expose un `Provider` (parfois nommé différemment du fichier, ex. `Security/AuthManager.tsx` exporte `AuthProvider`) et un hook `use<Nom>` — jamais un contexte consommé directement via `useContext` en dehors du fichier qui le déclare. `Security/AuthManager.tsx` dérive ses permissions via `resolvePermissions()` (`src/core/services/auth/PermissionsService.ts`, un **service**, pas un hook, précisément parce que c'est une fonction pure sur la session) plutôt qu'un hook `usePermissions`.

Composés une seule fois, à la racine, dans `src/app/providers.tsx` :

```tsx
<NotificationProvider>
  <AuthProvider initialSession={initialSession}>
    <ThemeManager />
    <AppearanceManager />
    <ColorVisionManager />
    <HintsProvider>
      {children}
      <NotificationsToaster />
    </HintsProvider>
  </AuthProvider>
</NotificationProvider>
```

`initialSession` (type `SessionUser`, `src/types/auth.ts`) est résolu côté serveur dans `src/app/layout.tsx` (`getSession()` puis `toSessionUser()`) et descendu au client — jamais refetché au montage, la session ne change qu'à la connexion ou à la déconnexion, deux actions qui redirigent déjà toute la page. `NotificationsToaster` (`src/components/structures/NotificationsToaster.tsx`) est le seul consommateur qui rend visuellement la file de `NotificationProvider`, puisque ce manager-là est headless par design.

## Thème clair/sombre

Trois pièces, jamais mélangées :

1. **Les tokens.** `src/styles/globals.css` déclare les couleurs sous `:root` (clair, la valeur par défaut) et sous `:root.dark` (préférence sombre résolue). Pas de repli `@media (prefers-color-scheme: dark)` séparé : la classe `.dark` est l'unique source de vérité, posée aussi bien pour un choix explicite « dark » que pour « system » quand `matchMedia` résout en sombre — le script anti-flash et le manager font eux-mêmes cette résolution avant de toucher au DOM, un second mécanisme CSS ferait doublon et pourrait diverger.
2. **Le script anti-flash.** `src/components/tools/ThemeScript.tsx` s'exécute dans le `<head>` avant l'hydratation React, lit le store persisté (`localStorage['theme']`, format `zustand/middleware` `persist`), résout `system` via `matchMedia` et pose la classe `.dark` sur `<html>` immédiatement — sans lui, la page clignotterait en clair avant de basculer en sombre. `<html suppressHydrationWarning>` dans `src/app/layout.tsx` accompagne ce script : la classe posée côté client avant hydratation ne doit pas déclencher un avertissement.
3. **Le store et le manager.** `src/core/store/theme.ts` (`useThemeStore`, Zustand + `persist`) porte la préférence (`'SYSTEM' | 'LIGHT' | 'DARK'`) et l'expose à tout composant client. `src/managers/front-end/ThemeManager.tsx` lit le store et projette `resolveTheme(theme)` sur `classList.toggle('dark', ...)` dans un `useEffect`, en se réabonnant à `matchMedia` tant que la préférence est `SYSTEM`. `<ThemeToggle />` (`src/components/elements/actions/ThemeToggle.tsx`) lit et écrit `useThemeStore` directement — pas de contexte React intermédiaire pour cette préférence-là.

## Auth de démonstration

**Ceci démontre le mécanisme (redirection, cookie de session, formulaire), ce n'est pas un système d'authentification prêt pour la production.** Avant de déployer un projet cloné : remplacer `isValidDemoCredentials` par un vrai magasin d'utilisateurs, hacher les mots de passe, et retirer les valeurs pré-remplies du formulaire.

- `src/core/lib/auth/session.ts` — constante `SESSION_COOKIE`, type `AuthSession`, `isValidDemoCredentials` (identifiants en dur : `demo@example.com` / `password`). Pas d'import de `next/headers` ici — ce fichier doit rester utilisable depuis `src/proxy.ts`, qui tourne dans un runtime différent des composants serveur.
- `src/core/lib/auth/getSession.ts` — lit le cookie via `next/headers`, serveur uniquement.
- `src/app/login/actions.ts` — `login` (Server Action, vérifie les identifiants, pose le cookie `httpOnly`, redirige) et `logout` (supprime le cookie, redirige).
- `src/app/login/page.tsx` + `src/composites/auth/LoginForm.tsx` — formulaire classique, `useActionState` pour l'état d'erreur et de chargement.
- `src/composites/auth/LogoutButton.tsx` — un simple `<form action={logout}>`, aucun JavaScript client requis.
- `src/proxy.ts` — redirige vers `/login` toute requête sans cookie de session en dehors de `/` et `/login`, et redirige `/login` vers `/overview` si le cookie est déjà présent. Ne touche jamais `/api` ni les assets Next (`matcher` explicite).

**Note Next.js 16 :** le fichier `middleware.ts` / la fonction `middleware()` sont dépréciés au profit de `proxy.ts` / `proxy()` (runtime Node.js uniquement, plus de runtime `edge`). Ce template suit déjà la nouvelle convention — ne pas revenir à `middleware.ts` sur une base Next.js 16+.
