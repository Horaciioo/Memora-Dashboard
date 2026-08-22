---
name: optimization
description: Leviers d'optimisation performance obligatoires du template dashboard — lazy loading, minification CSS/JS, images, fonts, scripts tiers, Server Components, Core Web Vitals. À charger avant d'ajouter une image, un composant lourd, un script tiers, ou pour faire remonter un score PageSpeed sous 80 (voir skill `delivery-checklist`).
---

# Optimisation performance

Ce skill est le **comment** derrière l'exigence « PageSpeed ≥ 80 » du skill `delivery-checklist`. Vérifier les APIs citées ici contre `node_modules/next/dist/docs/` avant de les utiliser — voir `AGENTS.md`, cette version de Next.js peut différer de la mémoire d'entraînement.

## Lazy loading

- **Images** : toujours `next/image`, jamais `<img>` brut. Le lazy loading est automatique pour toute image hors du viewport initial ; ajouter `priority` uniquement sur l'image visible au premier écran (LCP), jamais par défaut sur toutes les images.
- **Composants lourds** : `next/dynamic` pour tout composant coûteux et non visible immédiatement (graphique, éditeur riche, modale complexe, contenu sous un onglet inactif). Voir `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`.
- **Routes** : App Router découpe déjà le JS par route automatiquement — ne pas dupliquer cet effort manuellement, seulement compléter pour les sous-arbres lourds à l'intérieur d'une même route.
- Ne jamais lazy-load un élément visible au chargement initial (au-dessus de la ligne de flottaison) : ça dégrade le LCP au lieu de l'améliorer.

## CSS

- Tailwind v4 génère déjà un CSS minifié et purgé (seules les classes réellement utilisées dans le code sont émises) en `yarn build` — ne pas ajouter d'étape de minification manuelle par-dessus, elle serait redondante.
- Éviter le CSS-in-JS runtime ou les styles inline dynamiques pour des valeurs qui pourraient être des classes Tailwind statiques : un style inline recalculé à chaque rendu coûte plus cher qu'une classe déjà compilée.
- Pas de CSS mort : un token ajouté dans `src/styles/globals.css` ou `src/declarations/ui/` et jamais consommé alourdit inutilement la feuille de style, à nettoyer en revue.

## JavaScript

- **Server Components par défaut.** N'ajouter `'use client'` qu'au niveau du composant qui en a réellement besoin (state, effect, event handler), jamais en tête d'un fichier parent par confort — chaque `'use client'` élargit le bundle envoyé au navigateur.
- Éviter d'importer une librairie entière pour une seule fonction (`import _ from 'lodash'` plutôt qu'un import ciblé). Préférer une fonction utilitaire locale à une dépendance lourde pour un besoin trivial.
- Mesurer avant d'optimiser à l'aveugle : `yarn build` affiche déjà la taille par route (`First Load JS`) — surveiller les régressions à chaque changement de dépendance, voir `dependencies`.

## Fonts

- `next/font` exclusivement, jamais un `<link>` Google Fonts classique : les fonts sont auto-hébergées au build, zéro requête réseau externe, zéro layout shift lié au chargement de police. Voir `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`.

## Scripts tiers

- `next/script`, jamais une balise `<script>` brute dans le JSX.
- Choisir la stratégie selon la criticité : `afterInteractive` pour l'analytics (voir `delivery-checklist`, section GA4, à charger uniquement après consentement), `lazyOnload` pour tout ce qui n'est pas critique au rendu (widgets, chat), `beforeInteractive` réservé aux scripts strictement nécessaires avant hydratation. Voir `node_modules/next/dist/docs/01-app/02-guides/scripts.md`.

## Images, au-delà du lazy loading

- Formats modernes servis automatiquement par `next/image` (AVIF/WebP) — ne pas contourner avec des balises `<img>` pour « garder le contrôle », ça retire l'optimisation.
- Dimensionner les images à la taille réellement affichée, pas une taille source démesurée compressée côté client.
- Réserver l'espace de l'image (`width`/`height` ou `fill` avec un conteneur dimensionné) pour éviter le layout shift (CLS).

## Core Web Vitals à surveiller

- **LCP** (Largest Contentful Paint) : élément principal visible rapidement — voir images/fonts ci-dessus.
- **CLS** (Cumulative Layout Shift) : dimensions réservées pour images, fonts, contenu injecté dynamiquement (bannières, pubs, contenus async) ; c'est le rôle du skeleton loader du template (voir `architecture`) d'occuper l'espace final avant que la donnée réelle arrive.
- **INP** (Interaction to Next Paint) : éviter le travail JS bloquant sur interaction (calculs lourds dans un handler de clic/saisie) ; déporter vers un effet différé ou un web worker si le calcul est vraiment coûteux.

## Réseau et cache

- Laisser Next.js gérer la compression (gzip/brotli) et le cache statique par défaut ; ne pas désactiver ces réglages sans raison documentée.
- Statique quand c'est possible : préférer le rendu statique/ISR à un rendu dynamique systématique pour les pages dont le contenu ne change pas à chaque requête.
- Pagination obligatoire sur toute liste/tableau consommant une source de données volumineuse — jamais un fetch qui charge un jeu de données complet pour n'en afficher qu'une page (voir `DataTable` dans `architecture`).

## Vérifier le résultat

```bash
yarn build
```

Lire la sortie (`First Load JS` par route) pour repérer une régression avant de livrer. Compléter avec un passage PageSpeed Insights réel — voir `delivery-checklist` — un `yarn build` propre n'est pas une preuve de score suffisant à lui seul.
