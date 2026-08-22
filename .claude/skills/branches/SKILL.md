---
name: branches
description: Stratégie de branches git obligatoire du template dashboard, à respecter sur tout projet qui en dérive. À charger AVANT tout git push, git merge ou création de PR. Décrit les quatre branches (dev, staging, release, main), leur rôle et l'ordre de promotion de l'une vers l'autre.
---

# Stratégie de branches

## Les quatre branches

1. **`dev`** — tout ce qui sert au développement, la branche la plus instable. **On ne travaille QUE dessus.** Tout commit, sans exception, part d'ici.
2. **`staging`** — sert à tester toutes les fonctionnalités. C'est elle que la plateforme de déploiement (Vercel ou équivalent) suit pour l'environnement de recette.
3. **`release`** — les fonctionnalités approuvées par les testeurs : utilisable, fonctionnel, scalable. Il peut y rester un passage d'optimisation à faire.
4. **`main`** — livrable client, résultat final. **Branche à ne plus jamais toucher.**

## Où on travaille

Toujours `dev`. Avant de commencer une tâche, vérifier la branche courante (`git branch --show-current`) ; si ce n'est pas `dev`, basculer dessus avant d'écrire la moindre ligne.

## L'ordre de promotion

Une fonctionnalité avance dans un seul sens, jamais dans l'autre :

```
dev → staging → release → main
```

Chaque flèche est une décision distincte (fin de développement, validation des testeurs, mise en production), jamais un geste automatique.

## `main` ne se touche jamais à la légère

Sur toute demande de push, de merge ou d'ouverture de PR vers `main` :

1. Vérifier **ostensiblement**, fonctionnalité par fonctionnalité, que chacune est bien passée par `dev` → `staging` → `release` avant d'arriver là.
2. Le dire **explicitement** à l'utilisateur : quelles fonctionnalités sont couvertes, laquelle ne l'est pas si c'est le cas.
3. Ne jamais pousser vers `main` une fonctionnalité qui a sauté une étape, même sur demande explicite sans cette vérification — signaler le manque avant d'agir.

## Ce que le dépôt applique déjà

- **`.github/workflows/quality-gate.yml`** tourne sur chaque `push` vers les quatre branches et sur chaque PR vers `staging`, `release` et `main` : JSON de configuration, schéma Prisma, format, lint, types, build. Une branche de promotion ne reçoit jamais un code qui n'est pas passé par là.
- **`.github/pull_request_template.md`** demande de cocher, fonctionnalité par fonctionnalité, l'étape franchie — c'est le support de la vérification ostensible exigée ci-dessus.
- **`src/configurations/environments/`** porte un dossier par branche, aux noms exacts `dev`, `staging`, `release`, `main`. Créer une cinquième branche de promotion sans son dossier de configuration casse la correspondance : les deux se créent ensemble ou pas du tout.

## Renvoi

Ce skill ne décrit que la **destination** d'un commit (quelle branche). Le **format** du message de commit (emoji, verbe, découpage par fonctionnalité) est décrit par le skill `commits`, à charger séparément.
