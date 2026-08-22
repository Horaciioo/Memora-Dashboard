---
name: data-fetching
description: Convention de récupération de données côté serveur et client — quand fetcher dans un Server Component vs un hook client, câblage avec la couche client d'`architecture` (API_ROUTES, clés de cache), et raccordement des états loading/vide au skeleton loader et à EmptyState déjà codés. À charger avant d'ajouter un fetch, une mutation, ou un hook de données dans `src/core/hooks/`.
---

# Récupération de données

Ce skill complète le point 4 (« Couche client ») du skill `architecture` : il décrit **où** fetcher et **comment brancher le résultat** sur les systèmes déjà codés (skeleton loader, EmptyState). Pour la gestion des échecs eux-mêmes (erreurs, logging, toasts), voir `error-handling`.

## Server Component d'abord, toujours

Par défaut, une donnée se fetch dans un Server Component (`fetch` natif ou appel direct à `src/core/services/`, jamais un aller-retour HTTP vers sa propre API depuis le serveur). Un hook client (`src/core/hooks/`) ne se justifie que si la donnée a besoin de l'un de ces trois besoins réels :

1. **Revalidation après une interaction** sans recharger la page (filtre, pagination côté client, formulaire qui met à jour une liste affichée ailleurs).
2. **Polling ou souscription** à une donnée qui change hors interaction utilisateur.
3. **Dépendance à un état déjà client** (session via `useAuth`, préférence via `useTheme`) que le rendu serveur initial ne connaît pas encore.

En dehors de ces trois cas, un hook client qui refetch au montage une donnée déjà disponible côté serveur est une duplication de travail réseau, pas une convention à suivre.

## Câblage avec la couche client d'`architecture`

- Toute URL d'API vient de `API_ROUTES` (`src/core/lib/api/`), jamais un chemin en dur dans un hook ou un composant.
- Une clé de cache (React Query, SWR ou équivalent, une fois choisi — voir `dependencies` avant de l'installer) a **une seule source**, jamais reconstruite à la volée à deux endroits différents pour la même ressource. La déclarer à côté d'`API_ROUTES`.
- Un hook de données dans `src/core/hooks/` a une responsabilité unique (une ressource, ou une mutation) — pas un hook générique `useApi(url)` qui redécouvre à chaque appel ce que la fabrique de routes API garantit déjà côté serveur.

## Brancher le résultat sur skeleton loader et EmptyState

Un hook ou un fetch de données rend toujours un état explicite, jamais une donnée `undefined` interprétée en silence :

- **En cours de chargement** → la voie skeleton, déjà codée (voir `architecture`) : `<PageSkeleton>` pour une route entière via `loading.tsx`, prop `isLoading` de `DataTable` ou pattern manuel `{isLoading && <SkeletonList />}` pour un composant piloté par un état plutôt que par la navigation.
- **Chargé mais vide** → `EmptyState`, variante `'start'` si la collection est réellement vide, `'filter'` si un filtre courant ne retient rien (voir `architecture`). Ne jamais confondre ce cas avec l'état d'erreur : un tableau vide n'est pas un échec de requête.
- **Chargé et rempli** → le rendu normal.
- **Échoué** → ne se traite pas ici, voir `error-handling`.

Ces quatre états sont mutuellement exclusifs et jamais affichés deux à la fois — c'est déjà la règle posée par `architecture` pour `DataTable`/`EntityList`, elle s'applique à toute nouvelle surface qui consomme des données.

## Pagination et volumétrie

Toute liste qui peut dépasser une page d'écran passe par la pagination déclarée dans `PAGINATION_SETTINGS` (`src/declarations/configurations/settings.ts`, voir `architecture`) — jamais un fetch qui rapatrie un jeu de données complet côté client pour le trancher en JS. Voir aussi `optimization`, section Réseau et cache.

## Mutations

- Une mutation (création, mise à jour, suppression) passe par le moteur de formulaire (`parseFormValues`, voir `architecture`) avant d'atteindre le réseau — jamais de payload construit à la main dans un composant.
- Après une mutation réussie, revalider uniquement la ou les clés de cache concernées, jamais un `refetch` global de toutes les données de la page par facilité.
- L'échec d'une mutation se surface via le `NotificationsManager` (voir `architecture` et `error-handling`), jamais une `alert()` ou un état d'erreur local silencieux.
