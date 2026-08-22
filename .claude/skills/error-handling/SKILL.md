---
name: error-handling
description: Convention de gestion d'erreur — erreurs attendues vs exceptions non capturées, error.tsx/global-error.tsx (API `retry`, pas `reset`, propre à cette version de Next.js), catchError, et raccordement au NotificationsManager déjà codé. À charger avant d'ajouter une gestion d'erreur, un error.tsx, ou de surfacer un échec de mutation.
---

# Gestion d'erreur

## Deux catégories, deux traitements

Voir `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md` (à relire avant d'implémenter, voir `AGENTS.md` — cette version de Next.js diverge de la doc classique, détail plus bas).

1. **Erreur attendue** (validation de formulaire, requête qui échoue proprement) — se modélise en **valeur de retour**, jamais en `throw`. Le moteur de formulaire (`architecture`) et `useActionState` couvrent déjà ce cas pour les Server Actions (voir `LoginForm`/`login` dans `src/app/login/`).
2. **Exception non capturée** (bug, panne réseau imprévue) — se traite en `throw`, capturée par une error boundary (`error.tsx`).

Ne jamais faire remonter une erreur de validation attendue jusqu'à une error boundary : c'est un contrôle de flux détourné, pas une gestion d'erreur.

## `error.tsx` : API propre à cette version de Next.js, pas celle de la doc générique

**Cette version reçoit `{ error, retry }`, pas `{ error, reset }`** comme les versions plus anciennes de Next.js documentées ailleurs sur le web — voir `AGENTS.md` avant de coder ceci de mémoire.

```tsx
// app/(dashboard)/error.tsx
'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    // log via src/core/lib/logger une fois créé, voir architecture
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Une erreur est survenue.</h2>
      <button onClick={() => retry()}>Réessayer</button>
    </div>
  )
}
```

- Un `error.tsx` par segment de route qui a besoin d'un fallback dédié plutôt qu'un seul global — les erreurs remontent au premier parent qui en a un.
- `app/global-error.tsx` (racine) est le filet de dernier recours : il **redéfinit `<html>` et `<body>`**, puisqu'il remplace le layout racine quand il s'active. Ne pas le traiter comme un `error.tsx` de plus, sa forme est différente.
- Pour un fallback à l'intérieur d'un composant plutôt qu'au niveau d'un segment de route entier (une carte de graphique qui casse sans faire tomber toute la page), utiliser `catchError` de `next/error` plutôt que réinventer un `componentDidCatch` — voir la doc citée plus haut pour l'exemple.

## Ce qu'une error boundary ne capture pas

Les erreurs dans un event handler ou un code async après le premier rendu ne remontent **pas** à une error boundary. Les capturer explicitement (`try`/`catch` + état local) et les surfacer via le `NotificationsManager` (voir plus bas), jamais les laisser échouer silencieusement.

## Surfacer une erreur côté client : toujours `NotificationsManager`, jamais `alert()`

`architecture` documente déjà `NotificationsProvider`/`useNotifications` (toasts) monté à la racine dans `src/app/providers.tsx`. Toute erreur qui doit être vue par l'utilisateur — échec de mutation (voir `data-fetching`), échec réseau capturé manuellement — passe par ce manager, jamais par `alert()`, `console.error` seul, ou un état d'erreur qui ne rend rien de visible.

## Forme des erreurs venant de l'API

La fabrique de routes API (`createProtectedRoute`/`createPublicRoute`, voir `architecture`) enveloppe déjà toute réponse en `{ success, data }` ou `{ success, error }`. Un hook de données ou un composant qui consomme cette enveloppe ne relance jamais sa propre logique de parsing d'erreur : il lit `error`, l'affiche ou le journalise, un point c'est tout.

## `src/core/lib/errors` et `src/core/lib/logger`

`architecture` (table « Où va quoi ») réserve déjà ces deux emplacements dans `src/core/lib/`, pas encore créés tant qu'aucun projet cloné n'en a besoin :

- **`errors`** — une taxonomie d'erreurs typées (ex. `NotFoundError`, `ValidationError`, `PermissionError`) plutôt que des chaînes de caractères comparées à la main ; la fabrique de routes API les traduit en code HTTP/`error` à ce seul endroit.
- **`logger`** — un point d'entrée unique pour journaliser (console en dev, service externe en prod le cas échéant) ; un `console.error` dispersé dans vingt fichiers différents n'est pas remplaçable plus tard sans grep-and-replace.

Ne pas créer ces fichiers par anticipation — voir `instructions` — mais dès qu'un `console.error` de gestion d'erreur se répète à plus de deux endroits, c'est le signal que `logger` doit exister.

## Not found

`notFound()` (`next/navigation`) + un `not-found.tsx` par segment pour une ressource qui n'existe pas (entité supprimée, route inconnue) — jamais un rendu conditionnel maison qui réinvente ce mécanisme natif.
