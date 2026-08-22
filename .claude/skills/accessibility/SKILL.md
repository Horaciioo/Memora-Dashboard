---
name: accessibility
description: Checklist d'accessibilité clavier, lecteur d'écran et contraste pour les composants du template et tout composant dérivé — DataTable, formulaires, EmptyState, thème, navigation. À charger avant de livrer un composant interactif, ou pour traiter le point RGAA/WCAG d'un projet client (voir `delivery-checklist`).
---

# Accessibilité

## Le lint couvre une partie du travail, pas tout

`eslint-config-next` embarque `eslint-plugin-jsx-a11y` (voir `node_modules/eslint-config-next/dist/index.js`) — `alt-text`, `aria-props`, `aria-proptypes` et consorts tournent déjà à chaque `yarn lint`. Ces règles sont en **`warn`**, pas en `error` : un avertissement ne bloque pas le build, il se lit et se corrige activement, il ne suffit pas que `yarn lint` passe pour dire qu'un composant est accessible.

## Clavier, avant tout le reste

- Tout élément interactif (`DataTable` triable, `EmptyState` action, `ThemeToggle`, item de nav) atteignable au `Tab`, activable au clavier sans dépendre d'un `onClick` posé sur un `<div>`.
- Focus visible en permanence — ne jamais poser `outline: none` sans un remplacement au moins aussi visible via les tokens de `src/styles/globals.css`.
- Ordre de tabulation qui suit l'ordre visuel de lecture, jamais réordonné artificiellement par un `tabIndex` positif.
- Une modale/drawer piège le focus dedans tant qu'elle est ouverte et le restitue à l'élément déclencheur à la fermeture.

## Formulaires (moteur de formulaire, voir `architecture`)

- Chaque `FieldDefinition` rendue produit un `<label>` réellement associé au champ (`htmlFor`/`id`), jamais un placeholder en guise de label.
- Un champ en erreur porte `aria-invalid` et un message d'erreur lié via `aria-describedby` — le message d'erreur ne doit pas être visible seulement à la couleur (voir Contraste et couleur plus bas).
- Un champ conditionnellement caché (`isFieldVisible`) est retiré du DOM, pas seulement masqué visuellement — un champ `display: none` mais toujours dans l'arbre d'accessibilité perturbe la navigation au lecteur d'écran.

## DataTable, EmptyState, Skeleton (voir `architecture`)

- `DataTable` : en-têtes de colonnes en vrais `<th scope="col">`, pas des `<td>` stylés. Un tri déclenché au clavier annonce le nouvel état (`aria-sort`).
- `Skeleton`/`SkeletonList` : contenu purement décoratif, `aria-hidden="true"` — un lecteur d'écran ne doit jamais lire une silhouette vide comme si c'était une donnée. Sous `prefers-reduced-motion: reduce`, l'animation est déjà coupée côté CSS (voir `architecture`), rien à faire de plus ici.
- `EmptyState` : l'action obligatoire (voir `architecture`) reste un vrai `<button>`/`<a>` focusable, jamais un texte stylé pour ressembler à un bouton.

## Contraste et couleur

- Ne jamais faire porter une information (erreur, statut, obligatoire) par la couleur seule — l'accompagner d'un texte, d'une icône ou d'un `aria-label`.
- Chaque paire texte/fond des tokens de `src/styles/globals.css` (clair **et** sombre, voir `architecture`) doit passer WCAG AA. Vérifier avec le script déjà présent dans ce dépôt plutôt que d'en écrire un autre :

```bash
python3 .claude/skills/frontend-design/scripts/contrast_check.py "<couleur texte>" on "<couleur fond>"
```

- Un token de couleur ajouté dans `src/declarations/ui/theme.ts` (tonalité succès/erreur/neutre, voir `architecture`) se vérifie de la même manière avant d'être utilisé sur du texte.

## Structure et sémantique

- Une seule hiérarchie de titres cohérente par page (voir `delivery-checklist`, section SEO — la même règle sert les deux sujets).
- Landmarks sémantiques (`<nav>`, `<main>`, `<header>`) dans les layouts (`AppShell`, `AuthShell`, voir `architecture`), pas une forêt de `<div>` indifférenciés.
- Images porteuses de sens avec `alt` descriptif ; les deux SVG d'`EmptyStateIllustration` (voir `architecture`) sont décoratifs et doivent rester `aria-hidden`, le texte de l'`EmptyState` porte déjà le sens.

## Avant de livrer

Naviguer le parcours principal du projet **au clavier seul, souris débranchée mentalement**, puis relire les avertissements `jsx-a11y` du dernier `yarn lint`. Les deux sont non négociables avant de cocher le point correspondant dans `delivery-checklist`.
