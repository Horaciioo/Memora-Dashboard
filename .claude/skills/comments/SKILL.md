---
name: comments
description: Convention de commentaires obligatoire du dépôt — ultra-concision (2-4 mots), rédaction en anglais, structure stricte des blocs JSDoc, choix du tag, règle « JSDoc OU //, jamais les deux », interdiction des séparateurs décoratifs. À charger AVANT d'écrire ou de modifier le moindre commentaire, dans un fichier .ts/.tsx/.css comme dans un .yml.
---

# Convention de commentaires

Ce skill ne traite que les **commentaires**. Le reste du style — syntaxe, imports, nommage,
interdiction du hardcoding — est décrit par le skill `code-style`, à charger séparément.

Ces règles valent pour tout fichier commentable du dépôt, y compris les workflows `.github/` et les
fichiers de configuration : un commentaire de `.yml` suit exactement les mêmes contraintes de
longueur et de langue qu'un commentaire de `.ts`.

## Commentaires, les règles dures

Ces règles ont été demandées explicitement. Les enfreindre est une régression, pas un détail.

### ULTRA-CONCISION: La règle absolue

**Chaque commentaire (JSDoc ou ligne) doit être aussi court que humainement possible.**

- **Description JSDoc principale**: **2-4 mots MAXIMUM**
- **@param descriptions**: **2-3 mots, court et direct**
- **@return descriptions**: **2-3 mots, court et direct**
- **Commentaires de ligne (`//`)**: **2-4 mots MAXIMUM**
- **Interdiction absolue**: virgules, "with", "and", explications qui allongent

**La logique**: Un long commentaire signifie que tu sur-expliques. Le code dit déjà le QUOI. Si tu dois écrire un roman pour expliquer le POURQUOI, c'est que le code n'est pas assez clair. **Refactor plutôt que d'écrire trop.**

Exemples INCORRECTS → CORRECTS:

```ts
// INTERDIT (7 mots) → ✅ CORRECT (3 mots)
// Button icon size mapping  →  // Icon size map

// INTERDIT (14 mots) → ✅ CORRECT (utilise // si pas de @)
/** Handle user authentication and token refresh... →  // User authentication

// INTERDIT (9 mots) → ✅ CORRECT (4 mots)
@param path - Absolute URL or path of the same origin  →  @param path - Absolute URL or path
```

**Bloc JSDoc sur une seule ligne?** Si pas de `@param`, `@return`, ou `@type`, utilise un `//` à la place, jamais un bloc `/** */`.

### Les commentaires s'écrivent en anglais

Tout commentaire du dépôt est rédigé **en anglais**, commentaire de ligne comme bloc JSDoc, y compris
la description, les `@param` et les `@return`. Le seul français du dépôt vit dans les skills
`.claude/skills/` et dans les textes affichés, jamais dans un commentaire.

```ts
// ✅ CORRECT (3 mots)
// Resize viewport
const drawerHeight = ...

// ❌ INTERDIT (français)
// Le clavier mobile redimensionne le viewport
const drawerHeight = ...
```

### Bloc JSDoc: Structure stricte

Un bloc `/** */` est réservé aux fonctions, composants, hooks et helpers **exportés**. Il doit **toujours** contenir au moins un `@param`, `@return`, `@type`, ou `@typedef`. Jamais de bloc JSDoc sans tags. Le bloc n'est pas collé à la déclaration : une ligne vide les sépare.

```ts
// ✅ CORRECT - fonction avec params, description ultra-concise
/**
 * Value comparison
 * @param {number | null | undefined} current - Raw value
 * @return {TrendResult} - Comparison result
 */

export const compareMetric = (...) => ...

// ✅ CORRECT - constante typée (exception: @type sur une ligne)
/**
 * Tone colors
 * @type {Record<Tone, string>}
 */

export const TONE_TEXT = { ... }

// ❌ INTERDIT - bloc JSDoc sans tags
/**
 * The client
 */
export const client = ...

// ✅ À utiliser à la place (ligne simple, max 2-4 mots)
// HTTP client
export const client = ...
```

### Les variantes de JSDoc : `@param`, `@typedef`, `@property`, `@type`

Le choix du tag dépend de la réutilisation du type, pas du seul confort de lecture :

- **`@param` simple** — paramètre scalaire ou déjà nommé par un type TS (`RouteId`, `FormDeclaration`,
  ...). C'est le cas par défaut.
- **`@param` en notation pointée** — paramètre objet, typé inline ou déstructuré, utilisé à cet unique
  endroit. Une ligne `@param {Object} nom - Description globale` puis une ligne
  `@param {Type} nom.champ - Description` par propriété. C'est le remplacement direct des objets
  tassés sur une seule ligne, illisibles passé deux champs.

  ```ts
  /**
   * Route metadata
   * @param {Object} input - Route context
   * @param {RouteId} input.routeId - Route ID
   * @param {string} input.locale - Locale
   * @return {Metadata} - Metadata
   */
  ```

- **`@typedef` + `@property`** — réservé à une forme réutilisée par **plusieurs** fonctions exportées.
  Dans ce cas, ne pas créer un `@typedef` qui ne vit que dans un commentaire : déclarer un vrai
  `type` / `interface` TypeScript et référencer son nom. TypeScript porte déjà la vérité sur la forme,
  un `@typedef` la dupliquerait sans l'appliquer. N'introduire un `@typedef` pur que si le fichier n'a
  délibérément aucun typage TS pour cette valeur — cas rare dans ce dépôt en `strict`.
- **`@type`** — annotation d'une constante exportée dont le type est le seul propos du commentaire.
  Exception assumée à la règle « pas de bloc pour une ligne » : c'est une déclaration de type, pas une
  phrase.

  ```ts
  /** @type {Record<Tone, string>} */
  export const TONE_SOFT = { ... }
  ```

Ne pas convertir un objet en `@typedef` par réflexe : si la forme n'est utilisée qu'une fois, la
notation pointée suffit et évite de nommer une abstraction qui n'existe nulle part ailleurs.

### Quand ajouter des commentaires? Stratégie de valeur ajoutée

**Ne pas sur-commenter.** Chaque commentaire doit justifier son existence.

**Ajouter JSDoc sur**:

- **TOUS** les exports publics (fonctions, composants, hooks, constantes)
- **TOUS** les types/interfaces exportés
- **TOUS** les services et helpers
- Même si brefs: c'est une règle absolue
- **JAMAIS avec un `//` avant ou après** - JSDoc remplace le `//` au-dessus

**Ajouter un commentaire de ligne (`//`) SYSTÉMATIQUEMENT**:

- **AVANT chaque bloc logique** de code (2-3 lignes ou plus) à l'intérieur d'une fonction
- Chaque section du code a besoin d'un petit label (2-4 mots MAX)
- C'est un label, pas une explication détaillée du QUOI (le code dit déjà quoi)
- Les `//` ne doivent PAS être rares - ils doivent être **nombreux et partout**
- **JAMAIS avec une JSDoc** - un export avec JSDoc n'a pas de `//` avant lui

**Règle d'OR: JSDoc OU `//`, jamais les deux ensemble**:

- Export public → JSDoc (`/** @param ... @return ... */`)
- Bloc de code interne → `//` (2-4 mots, label du bloc)
- Jamais JSDoc + `//` sur le même export

**NE PAS ajouter de commentaire si**:

- C'est une seule ligne très claire (ex: `return value !== null`)
- Le nom de la fonction/variable dit déjà tout

```ts
// ❌ PAS DE COMMENTAIRE pour une fonction simple (le type suffit)
export const isDefined = <T>(value: Maybe<T>): value is T =>
  value !== null && value !== undefined

// ✅ CORRECT: JSDoc sur export (pas de // avant lui)
/**
 * Freeze page scroll
 * @return - Release function
 */

export const freezeScroll = (): (() => void) => {
  // Increment freeze counter
  freezeCount++

  // Return release handler
  return () => {
    freezeCount--
    // Reset overflow when fully unfrozen
    if (freezeCount === 0) document.body.style.overflow = ''
  }
}

// ❌ JAMAIS faire ceci (JSDoc + // ensemble)
/**
 * Freeze page scroll
 * @return - Release function
 */
// Freeze page scroll
export const freezeScroll = (): (() => void) => { ... }

// ❌ MAUVAIS: bloc JSDoc seul sans tags (pas @param, @return, @type)
/**
 * HTTP client singleton
 */
export const client = ...

// ✅ CORRECT: simple, 2-4 mots max
// HTTP client
export const client = ...
```

### Aucun séparateur décoratif, jamais

`// ======`, `// ------`, `/* ***** */` et toute variante sont **bannis totalement**. Aucune exception,
aucun fichier. Pour vérifier :

```bash
grep -rEn '^\s*(//|\s\*)\s*[=-]{4,}' src
```

Le résultat doit être vide.

### Une ligne vide sous un bloc JSDoc, jamais sous un commentaire de ligne

Un bloc `/** */` est toujours suivi d'une ligne vide avant la déclaration. Un commentaire `//` reste
collé à la ligne qu'il précède.

```ts
// Correct, JSDoc suivi d'une ligne vide
/**
 * Value comparison
 * @param {number | null | undefined} current - Current value
 * @return {TrendResult} - Comparison result
 */

export const compareMetric = (...) => ...

// Correct, commentaire de ligne collé à la déclaration
// Scroll threshold before header detaches
const SCROLLED_THRESHOLD = 8
```

Après une session d'édition, normaliser :

```bash
python3 - <<'PY'
import pathlib, re
for pattern in ('src/**/*.ts', 'src/**/*.tsx'):
    for p in pathlib.Path('.').glob(pattern):
        t = p.read_text()
        n = re.sub(r'(\*/)\n(?!\n)(?=\s*(export|const|let|type|interface|class|function|async))', r'\1\n\n', t)
        if n != t: p.write_text(n)
PY
```

### Contenu attendu

Court et techniquement utile. Un commentaire explique **pourquoi**, jamais **quoi** — le code dit déjà
quoi. Pas de storytelling, pas de docblock vide généré pour faire nombre.

## Renvoi

`code-style` porte la syntaxe, les imports, le nommage et l'interdiction du hardcoding.
`instructions` situe ce skill dans l'ordre de chargement du dépôt.
