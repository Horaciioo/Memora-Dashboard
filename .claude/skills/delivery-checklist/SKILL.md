---
name: delivery-checklist
description: Checklist obligatoire avant toute livraison client d'un projet dérivé de ce template. À charger AVANT de promouvoir `release` vers `main` (voir skill `branches`) ou avant d'annoncer un projet "prêt". Couvre le responsive (3 tailles), PageSpeed, le SEO, les mentions légales/RGPD, les formulaires, GA4, HTTPS/SSL/back-up.
---

# Checklist avant livraison client

Cette checklist est le **portillon** entre `release` et `main` (voir le skill `branches` : « il peut rester un passage d'optimisation à faire » sur `release`). Aucune case ne se coche sans vérification réelle — ne jamais déclarer un point validé sans l'avoir exécuté ou sans avoir demandé à l'utilisateur de le confirmer si l'outil n'est pas accessible depuis cet environnement (ex. accès à un compte GA4, à un hébergeur).

## 1. Responsive mobile — 3 tailles minimum

Tester sur au moins ces trois gabarits, sans en sauter un :

| Appareil        | Résolution CSS |
| --------------- | -------------- |
| iPhone SE       | 375 × 667      |
| iPhone 15       | 393 × 852      |
| iPad (portrait) | 768 × 1024     |

- Outil rapide : Chrome DevTools → mode Device Toolbar, ces trois presets (ou dimensions custom si l'appareil exact n'est pas listé).
- Vérifier à chaque taille : pas de scroll horizontal, cibles tactiles ≥ 44×44px, texte lisible sans zoom, menus/drawers utilisables au doigt, tableaux qui ne débordent pas sans wrapper scrollable.
- Rejouer le parcours principal (pas juste la page d'accueil) à chaque taille : formulaire, navigation, tableau de données.

## 2. PageSpeed ≥ 80

- Mesurer avec [PageSpeed Insights](https://pagespeed.web.dev), sur l'URL de production (ou `release`), **mobile ET desktop**.
- Score cible : **80 minimum** sur les deux, pas seulement desktop.
- Si en dessous, voir le skill `optimization` pour les leviers concrets (lazy loading, images, JS, fonts) avant de relivrer.
- Noter le score obtenu quelque part de traçable (ticket, message de livraison) — un score non mesuré n'est pas un score validé.

## 3. SEO

- `<title>` et `<meta description>` uniques et pertinents par page (via `generateMetadata` / objet `metadata`, jamais codés en dur dans le JSX).
- Balises Open Graph (titre, description, image) pour un partage correct sur les réseaux.
- `robots.txt` et `sitemap.xml` présents et corrects (routes réelles, pas de pages de démo/login indexées).
- Une seule balise `<h1>` par page, hiérarchie de titres cohérente.
- Attributs `alt` sur toutes les images porteuses de sens (pas sur les icônes purement décoratives).
- URLs propres, sans paramètres techniques inutiles exposés.

## 4. Mentions légales & RGPD

- Pages présentes et à jour : mentions légales, CGU/CGV si applicable, politique de confidentialité.
- Identité de l'éditeur, hébergeur, directeur de publication renseignés (pas de placeholder du template).
- Bandeau de consentement cookies **avant** tout dépôt de cookie non essentiel (analytics inclus) — conforme aux recommandations CNIL : refus aussi simple qu'acceptation, pas de case pré-cochée.
- Formulaire de contact/inscription : mention du traitement des données, base légale, moyen d'exercer ses droits (accès, suppression).
- Aucune donnée personnelle envoyée à un tiers (analytics, tracking) avant consentement explicite.

## 5. Formulaires testés

- Chaque formulaire du site : soumission valide (le message/l'action attendue arrive bien), soumission invalide (les erreurs s'affichent, aucun envoi silencieux en échec).
- Cas limites : champs vides obligatoires, formats invalides (email, téléphone), copier-coller, saisie très longue.
- Retour utilisateur clair après soumission (succès, erreur), pas de formulaire qui se réinitialise sans feedback.
- Protection anti-spam en place si le formulaire est public (honeypot, rate-limit, captcha selon le contexte).
- Testé sur au moins un des trois gabarits mobiles de la section 1, pas seulement desktop.

## 6. Analytics — GA4

- Google Analytics 4 installé, ID de mesure en variable d'environnement, jamais codé en dur dans le composant.
- Chargé uniquement **après consentement** (voir section 4), via `next/script` avec une stratégie adaptée (`afterInteractive` une fois le consentement acquis, jamais `beforeInteractive` pour un script tiers de tracking).
- Vérifier la réception d'événements en temps réel dans GA4 (rapport "Temps réel") après déploiement, pas seulement que le script est présent dans le HTML.

## 7. HTTPS, SSL, back-up

- Certificat SSL actif et valide sur le domaine de production, pas seulement sur un sous-domaine de preview.
- Redirection automatique HTTP → HTTPS.
- Renouvellement du certificat automatisé (Let's Encrypt auto-renew, ou géré par l'hébergeur/CDN) — pas de renouvellement manuel oublié.
- Sauvegarde automatique configurée (base de données si applicable, assets, configuration) avec une fréquence connue et un test de restauration déjà effectué au moins une fois.

## Avant de cocher la dernière case

Relire le skill `branches` : la promotion `release` → `main` ne se fait que fonctionnalité par fonctionnalité vérifiée, jamais en bloc sur confiance. Une case de cette checklist non vérifiable depuis cet environnement (accès GA4, accès hébergeur, certificat SSL) se signale explicitement à l'utilisateur plutôt que d'être supposée bonne.
