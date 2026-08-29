---
name: commits
description: Convention de commits git obligatoire du template dashboard, à respecter sur tout projet qui en dérive. À charger AVANT de créer un commit. Couvre le format du message (emoji + verbe anglais au passé + phrase courte, sans détail en dessous) et la règle de découpage des commits par fonctionnalité.
---

# Convention de commits

Ce skill décrit le **format** du message. Pour savoir **sur quelle branche** committer, pousser ou ouvrir une PR, voir le skill `branches` — à charger avant tout `git push`, `git merge` ou création de PR.

## Le format, non négociable

Un message de commit tient sur **une seule ligne** :

```
<emoji> <Verbe anglais au passé> <phrase très courte>
```

- **Emoji** en premier, choisi parmi la liste ci-dessous (référence [gitmoji.dev](https://gitmoji.dev)).
- **Verbe en anglais, au passé** (`Added`, `Fixed`, `Updated`, `Improved`, `Removed`, `Refactored`, `Renamed`, `Moved`, `Simplified`, `Cleaned`, `Configured`, `Documented`, `Tested`, `Secured`, `Replaced`, `Reverted`, `Upgraded`, `Downgraded`, `Pinned`, `Seeded`, `Wired`, `Started`, `Tagged`, ...).
- **Phrase très courte**, sujet direct, pas de terme compliqué.

### Bon exemple

```
🔧 Improved eslint configuration files
🔧 Updated yarn packages
```

### Mauvais exemple

```
🔧 Feat : Eslint configuration
- Improved the files
- Refactored the logic
- ...
```

## Ce qui est banni, sans exception

- **Phrase trop longue.** Une ligne, un sujet, rien de plus.
- **Détail sous forme de tirets** (`- Improved the files`, `- Refactored the logic`, ...). Le message ne fait jamais deux lignes.
- **Préfixe de type conventionnel** (`Feat :`, `Fix :`, `Chore :`, ...). L'emoji porte déjà cette information.
- **Terme compliqué ou jargon.** Un verbe simple et concret suffit.
- Le "Co-Authored-By: Claude Sonnet 5 noreply@anthropic.com", il ne faut jamais le mettre.

Si le message ne tient pas sur une phrase courte et directe, c'est que le commit est trop large : le découper plutôt que de résumer.

## Émojis de référence

Choisir l'emoji qui correspond à la nature du changement, pas au fichier touché.

| Emoji   | Usage                                                       |
| ------- | ----------------------------------------------------------- |
| ✨      | Nouvelle fonctionnalité                                     |
| 🐛      | Correction de bug                                           |
| 🩹      | Correctif mineur, non critique                              |
| 🚑️      | Correctif urgent/critique                                   |
| ♻️      | Refactorisation sans changement de comportement             |
| 💄      | Interface, style visuel, Tailwind                           |
| 🚸      | Expérience utilisateur, ergonomie                           |
| 📱      | Responsive, mobile                                          |
| 💫      | Animation, transition                                       |
| ♿️      | Accessibilité                                               |
| 🏗️      | Changement d'architecture                                   |
| 🗃️      | Base de données, migration Prisma                           |
| 🏷️      | Types TypeScript                                            |
| 🦺      | Validation (schémas, formulaires)                           |
| 🛂      | Auth, rôles, permissions                                    |
| 🔒️      | Sécurité                                                    |
| ✅      | Tests                                                       |
| 🔧      | Fichiers de configuration (ESLint, Tailwind, tsconfig, ...) |
| 🔨      | Scripts de développement                                    |
| ➕ / ➖ | Ajout / suppression d'une dépendance                        |
| ⬆️ / ⬇️ | Montée / descente de version d'une dépendance               |
| 🚨      | Correction d'avertissements lint/compilateur                |
| 🔥      | Suppression de code ou de fichiers                          |
| ⚰️      | Suppression de code mort                                    |
| 🚚      | Déplacement ou renommage de fichiers                        |
| 📝      | Documentation                                               |
| 💬      | Libellés et textes affichés                                 |
| 🌐      | Internationalisation                                        |
| 🍱      | Assets (images, icônes, polices)                            |
| 🌱      | Fichiers de seed                                            |
| 📦️      | Build, fichiers compilés                                    |
| 🚀      | Déploiement                                                 |
| 🙈      | `.gitignore`                                                |
| 🎉      | Démarrage d'un projet                                       |

## Découper les commits par fonctionnalité

Chaque commit ne porte **le contenu que d'une seule fonctionnalité**. Ne jamais mélanger dans un commit des changements qui appartiennent à des sujets différents.

Exemple : les pages légales (mentions légales, CGU, politique de confidentialité) forment une fonctionnalité, elles se committent ensemble, séparément du reste.

Exception : si les changements sont vraiment transverses et généraux (mise à jour de dépendances, config globale du dépôt), un seul commit suffit, sans découpage artificiel.

Cas particulier des fichiers de tokens partagés (`src/declarations/ui/variants.ts`, `src/declarations/ui/blocks.ts`, `globals.css`, ...) : quand une session de travail y a ajouté des blocs pour plusieurs fonctionnalités différentes et qu'ils sont trop entremêlés pour être scindés sans réécrire le fichier à la main, ne pas retoucher le fichier pour forcer un découpage ligne à ligne. Le committer tel quel, en un seul commit `♻️ Refactored <fichier ou sujet>`, séparément des commits de feature qui le consomment.

### Méthode

1. Regrouper les fichiers modifiés par fonctionnalité concernée.
2. Stager uniquement les fichiers de cette fonctionnalité (`git add <fichiers>`, jamais `git add -A` en aveugle).
3. Committer avec un message conforme au format ci-dessus.
4. Répéter pour chaque fonctionnalité restante.

## Commit de fin de travaux

Chaque fin de travaux (une tâche, une session, une réponse qui modifie du code) se termine par un commit, découpé par fonctionnalité selon les règles ci-dessus. Ne pas attendre un ordre explicite pour committer : le découpage et le format restent ceux décrits par ce skill, mais le geste de committer fait partie du travail lui-même, pas d'une étape à part que l'utilisateur déclenche.

Avant de committer, vérifier que `yarn type-check && yarn lint && yarn build` est vert — un commit qui casse la référence verte n'est pas un travail terminé.
