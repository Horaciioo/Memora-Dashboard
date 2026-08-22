---
name: code-style
description: Règles de style obligatoires du dépôt — quotes, points-virgules, typage strict, imports, nommage et interdiction du hardcoding dans les composants. À charger AVANT d'écrire ou de modifier le moindre fichier .ts/.tsx/.css. Le format des commentaires vit dans le skill `comments`, à charger séparément.
---

# Style de code

## Commentaires

Le format des commentaires — ultra-concision, anglais, structure des blocs JSDoc, choix du tag,
règle « JSDoc OU `//`, jamais les deux », interdiction des séparateurs décoratifs — vit dans le skill
`comments`, à charger avant d'écrire le moindre commentaire. Ne pas en dupliquer les règles ici.

## Syntaxe

- TypeScript obligatoire, `any` interdit (règle ESLint en `error`)
- Guillemets simples pour les chaînes TS, doubles pour les attributs JSX
- Pas de point-virgule en fin de ligne
- Fonctions fléchées pour les composants et les helpers
- Props et interfaces typées explicitement, jamais implicitement
- `import type` dès qu'un import ne sert qu'au typage
- Pas d'`enum` TypeScript (règle ESLint en `error`) : un statut/rôle/type interne, sans contrat
  externe, est un objet bidirectionnel `as const` dans `src/utils/constants/` ; un registre
  dont la valeur EST un contrat externe (verbe HTTP, attribut DOM, clé de traduction...) reste un
  registre `as const` à sens unique dans `declarations/`. Détail dans le skill `architecture`.

## Imports

Alias `@/` vers `src`, jamais de `../../..`. Ordre : dépendances externes, puis imports internes `@/`,
puis relatifs. Une ligne vide entre chaque groupe.

## Nommage

Noms métier explicites, aucune abréviation, une intention n'a qu'une orthographe. Les fichiers portent
le nom de ce qu'ils exportent.

## Interdiction du hardcoding, vérifiable

Un composant ne contient ni phrase, ni couleur, ni chemin d'URL, ni nombre magique.

```bash
# Aucune phrase française dans un composant
grep -rn "[éèàùêôç]" src/components

# Aucune couleur écrite en dur
grep -rnE "#[0-9a-fA-F]{3,6}" src/components src/declarations

# Aucun import direct des librairies masquées par un registre
grep -rn "from 'lucide-react'" src/components src/composites
```

Les trois doivent être vides.

## Validation, non négociable avant de rendre du travail

```bash
yarn type-check && yarn lint && yarn build
```

Les trois doivent être verts. `yarn format` applique Prettier, `yarn format:check` le vérifie.
`yarn validate` enchaîne les trois.
