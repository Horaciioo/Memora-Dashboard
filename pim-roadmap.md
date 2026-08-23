# Refonte totale de la Marsha Academy (PIM · FSI · Sessions · Formations)

## Context

`pim-explain.md` décrit un métier que le code ne porte pas encore. L'exploration du dépôt montre un écart plus large qu'attendu, et surtout **trois doublons structurels** qui doivent disparaître avant d'ajouter quoi que ce soit :

| Doublon                    | Détail                                                                                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deux « PIM » sans rapport  | `AcademyProgram` (PIMT/PIMY/PIMD/PIMP, le parcours) **et** `model Pim` (un entretien daté + Markdown posé sur la fiche Modérateur, [prisma/schema.prisma:570-584](prisma/schema.prisma#L570-L584)) |
| Deux axes de spécialité    | `AcademySession.program` (enum figé) **et** `Account.primaryFunctionId` → `JobFunction` (référentiel éditable). Rien ne les relie, `Training.functionId` est déclaré mais ne filtre jamais         |
| Deux systèmes d'évaluation | `AcademyReview.axes` (6 axes en dur, `Json` libre, [AcademyService.ts:42-49](src/core/services/academy/AcademyService.ts#L42-L49)) **et** les Compétences du document (par fonction × dispositif)  |

Ce qui manque totalement : **FSI**, **Compétences**, **Dispositifs ATRIA/PULSE**, **Objectifs**, **Notes de FSI**, **Timeline à états**, **Missions**, **page Formations côté Junior**, **Glossaire**, **scoping par fonction**, **formulaire d'admission**.

Ce qui est déclaré mais mort et doit être branché : `CalendarEvent.sessionId`, `ACADEMY_SETTINGS.{maxLives, minObjectives, weeksMin, weeksMax}`, `EVENT_TYPES.TrainingValidated`, `EVENT_TYPES.AcademyAdvanced`, `ACADEMY_COPY.{validate, stop, reopen}`, `HORIZONTAL_TIMELINE_STYLES.dotIdle`, `Training.functionId`, `CACHE_KEYS`.

**Résultat visé** : un domaine Academy où le métier (dispositifs, compétences, trame de PIM, formations) se configure depuis `/configuration` sans déploiement, où la FSI est l'écran unique de suivi d'un Junior, et où un Formateur ne voit que ce qui relève de sa fonction.

---

## Décisions actées

| Sujet                     | Décision                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Dispositifs & Compétences | **Référentiels configurables** — 4 nouvelles collections dans `/configuration`, l'enum `AcademyTrack` est migré vers une table |
| Timeline                  | **Modèle configurable** (`etapes-pim`) instancié à la création de session ; ancres `DAY` (J±n) ou `LIVE` (n-ième live)         |
| Scoping                   | **La Session porte une `functionId`** — l'enum `AcademyProgram` disparaît, la fonction devient l'axe unique                    |
| Données PIM existantes    | **Migrées en `AccountNote`** puis `model Pim` supprimé                                                                         |
| Rôle Junior               | **Statut `ACADEMY` + FSI active** — pas de nouveau rôle ; `visibleWhen` sur `NavigationItem` + `requireStatus()` serveur       |
| Livraison                 | **Roadmap complète en 7 phases**, livrables l'une après l'autre                                                                |

### Hypothèses retenues (à corriger si besoin)

- **Référent** : `AcademyJunior.trainerId` (déjà là). Tous les formateurs de la session peuvent agir sur la FSI ; le référent est celui affiché en tête et porteur des bilans.
- **Compétences** : n'importe quel formateur de la session portant `academy:skill:write` peut bouger le % ; `JuniorSkill.validatorId` retient qui l'a fait en dernier.
- **Bilan** : rédigé par le Formateur (`DRAFT` → `SUBMITTED`), évalué par le Responsable (`VALIDATED` / `REJECTED`). C'est **cette décision seule** qui autorise le passage d'étape.
- **Vocal** : ce n'est pas informatif — `heldAt`, `durationMinutes` et `summary` sont requis sur un bilan soumis.
- **Notes de FSI** : type `POSITIVE` / `NEGATIVE` + `stage` (1ʳᵉ ou 2ᵉ étape). Les quatre usages du document (remarque, observation, avertissement, compliment) sont couverts par ces deux types.
- **Bonus** : maximum 4 lives supplémentaires, borné par un nouveau réglage `academy.bonusMaxLives`, ouvert par décision Responsable.
- **Progression des formations** : « personnelle » au sens _individuel_ (par opposition au contenu, commun), donc portée par le **compte** — pas reclée sur la PIM. Voir Phase 5.1 pour le raisonnement complet.
- **Aucune migration destructive** dans toute la roadmap. Les deux seules suppressions de table (`pims`, enums remplacés) sont précédées d'une recopie des données.
- **Responsables & Admins** : hors scoping, ils voient toutes les sessions.

---

## Conventions à charger avant de coder

Chaque phase suit `AGENTS.md` et les skills du dépôt. À charger **avant** la première ligne de code de chaque phase :

- `architecture` — registres, fabrique de routes, moteur de formulaire, référentiels
- `code-style` + `comments` — quotes, typage strict, commentaires anglais 2-4 mots, JSDoc **ou** `//` jamais les deux
- `data-fetching` — Server Component vs hook client, `API_ROUTES`, skeleton + EmptyState
- `error-handling` — erreurs attendues vs exceptions, `catchError`, `NotificationsManager`
- `commits` (emoji + verbe anglais au passé, un commit par fonctionnalité) et `branches` (`dev` → `staging` → `release` → `main`)

**Les trois règles imposées** se traduisent ainsi :

- **Zéro hardcoding** — toute valeur métier passe par `src/declarations/`, `src/configurations/system/academy.json` ou une table de référentiel. Aucun `min`/`max`/`maxLength` tapé dans une `FieldDefinition`.
- **Que de l'optimisation** — aucune nouvelle table quand un modèle existant peut porter le besoin (voir `AcademyEvent` → `AcademyStep` plutôt qu'une table `SessionStep` parallèle) ; les états de timeline sont **dérivés**, jamais stockés en double.
- **Pas de doublon** — les trois doublons du tableau de Context sont supprimés en Phase 0/1/2, pas contournés.

---

## Phase 0 — Socle & nettoyage

Aucune fonctionnalité nouvelle. On enlève les doublons et on pose les briques UI qui manquent.

### 0.1 Suppression du `model Pim`

Migration Prisma en deux temps : d'abord un `INSERT INTO account_notes SELECT ...` qui recopie chaque `pims` (corps = `sheet`, `authorId`, `createdAt` préservés, `pinned = false`), ensuite `DROP TABLE pims`.

Surface complète à démonter (inventoriée, ne rien oublier) :

| Couche      | Fichier                                                                                                                                                                    | Cible                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Schéma      | [prisma/schema.prisma](prisma/schema.prisma#L570-L584)                                                                                                                     | `model Pim` + back-relations `Account.pims` / `Account.pimsWritten`      |
| Permissions | [src/utils/constants/permissions.ts](src/utils/constants/permissions.ts)                                                                                                   | `MemberPimRead`, `MemberPimWrite` + leurs `PermissionMeta`               |
| Routes      | [src/app/api/moderateurs/[id]/pims/route.ts](src/app/api/moderateurs/[id]/pims/route.ts), [src/app/api/pims/[id]/route.ts](src/app/api/pims/[id]/route.ts)                 | fichiers entiers                                                         |
| Registre    | [src/core/lib/api/routes.ts](src/core/lib/api/routes.ts)                                                                                                                   | `memberPims`, `pim`                                                      |
| Service     | [src/core/services/members/MemberFileService.ts](src/core/services/members/MemberFileService.ts)                                                                           | `PIM_FIELDS`, `addPim`, `updatePim`, `removePim`                         |
| Service     | [src/core/services/members/MemberService.ts](src/core/services/members/MemberService.ts#L398)                                                                              | `include.pims` + mapping                                                 |
| Types       | [src/types/members.ts](src/types/members.ts#L99-L113)                                                                                                                      | `MemberPim`, `MemberDetail.pims`                                         |
| Hook        | [src/core/hooks/data/useMemberFile.ts](src/core/hooks/data/useMemberFile.ts#L111-L135)                                                                                     | état `pims`, `addPim`, `removePim`                                       |
| Copy        | [src/declarations/members/copy.ts](src/declarations/members/copy.ts#L35-L41)                                                                                               | `pimsTitle` → `pimSheet`                                                 |
| Page        | [src/app/(dashboard)/moderateurs/[id]/page.tsx](<src/app/(dashboard)/moderateurs/[id]/page.tsx#L7>)                                                                        | `PIM_FIELDS`, `canReadPims`, `canWritePims`                              |
| Composite   | [src/composites/members/MemberFileTabs.tsx:384-437](src/composites/members/MemberFileTabs.tsx#L384-L437) + [:679-688](src/composites/members/MemberFileTabs.tsx#L679-L688) | `<Section>` PIM dans l'onglet `identity` + son `FormDialog`              |
| Journal     | [src/utils/constants/events.ts](src/utils/constants/events.ts)                                                                                                             | `PimHeld` (id 8) → `deprecated: true`, **jamais supprimé ni renuméroté** |

### 0.2 Renommage `AcademyEvent` → `AcademyStep`

Le mot `Event` entre en collision avec `CalendarEvent` ; le modèle devient l'instance de timeline en Phase 4, autant le nommer maintenant. Migration `ALTER TABLE academy_events RENAME TO academy_steps`, plus `AcademyEventKind` → `AcademyStepKind`, `AcademyEventView` → `AcademyStepView`, `ACADEMY_EVENT_KIND_REGISTRY` → `ACADEMY_STEP_KIND_REGISTRY`, `API_ROUTES.sessionMoments` / `moment` → `sessionSteps` / `step`.

### 0.3 Briques UI manquantes

- **`Progress`** — le seul atome absent du dépôt. `src/components/elements/feedback/Progress.tsx` : `{ value: number, max?: number, tone?: Tone, label?: string, compact?: boolean }`, `role="progressbar"` + `aria-valuenow/min/max`. Styles dans un nouveau `PROGRESS_STYLES` de [src/declarations/ui/variants/feedback.ts](src/declarations/ui/variants/feedback.ts) (`track`, `fill`, `label`) ; la largeur est le seul style inline autorisé, la couleur vient de `TONES[tone].dot`.
- **État « en retard »** — ajouter `dotLate` et `connectorLate` (`--color-danger`) à `HORIZONTAL_TIMELINE_STYLES` ([variants/data.ts:283-298](src/declarations/ui/variants/data.ts#L283-L298)). `dotIdle` est déjà déclaré et inutilisé, il sert pour « à venir ». `isOverdue()` existe déjà dans [src/utils/format/dates.tsx](src/utils/format/dates.tsx) et `DATE_COPY.overdue` est déjà écrit.
- **`StepTimeline`** — extraire le prototype non générique de [src/composites/absences/AbsenceTimeline.tsx](src/composites/absences/AbsenceTimeline.tsx) en `src/components/structures/StepTimeline.tsx` : `{ steps: { id, label, hint?, state: 'idle'|'current'|'done'|'late', icon?, onClick? }[] }`. `AbsenceTimeline` devient un appelant.
- **`FileTabs`** — factoriser le triplet répété 5 fois (`useState` + tableau `tabs` avec spread conditionnel + chaîne `{tab === 'x' && canX && ...}`) dans `src/components/structures/FileTabs.tsx` : `{ label, tabs: (TabItem & { visible?: boolean; render: () => ReactNode })[], initial? }`. **Modèle à copier : [src/composites/work/WorkBoard.tsx](src/composites/work/WorkBoard.tsx)**, qui fait exactement ça pour les boards. Refactorer `MemberFileTabs`, `ProjectFileTabs`, `SessionPanel`, `PreferencesPanel`, `AccessMatrixPanel` dessus — la double garde (`tab === 'notes' && canReadNotes`) disparaît.

### 0.4 Gating par statut

- `NavigationItem` gagne `visibleWhen?: { statuses?: MemberStatusName[]; roles?: MemberRoleName[] }` dans [src/declarations/navigation.ts](src/declarations/navigation.ts). Vocabulaire volontairement aligné sur `FieldCondition` ([src/types/forms.ts](src/types/forms.ts)).
- Une ligne dans le `filter` de [src/composites/shell/SidebarNav.tsx](src/composites/shell/SidebarNav.tsx) — `useAuthContext()` expose déjà `session.status` et `session.role`.
- `requireStatus(statuses)` voisin de `requirePermission` dans [src/core/wrappers/requireUser.ts](src/core/wrappers/requireUser.ts), sinon la page reste atteignable en URL directe.

### 0.5 Journal & réglages morts

- Émettre les `recordEvent` absents de tout le domaine Academy (aucun aujourd'hui) : `AcademyAdvanced`, `TrainingValidated` — tous deux **déjà déclarés** dans `EVENT_TYPES`. Toujours dans le handler de route, jamais dans le service, après la mutation réussie.
- Consommer `ACADEMY_SETTINGS.maxLives` comme `max` du champ `liveCount` de `juniorFields()` et `weeksMin`/`weeksMax` pour la date de fin proposée à la création de session.

### 0.6 Page Glossaire

`src/declarations/academy/glossary.ts` — un `createRegistry` `{ term, definition }` reprenant le lexique du document (Session, PIM, FSI, Junior, Formateur référent, Responsable, ATRIA, PULSE, Dispositif, Compétence, Bilan, Objectif, Période bonus). Page `/academy/lexique`, entrée `ROUTES.glossary`, rendue en `DetailGrid`. C'est de la copie documentaire → déclaration, pas une table.

### 0.7 Fuite RSC à corriger au passage

`readMember` renvoie aujourd'hui les notes et PIM en clair dans le payload RSC, `canReadNotes` ne masque que le rendu ([MemberService.ts:484](src/core/services/members/MemberService.ts#L484), [moderateurs/[id]/page.tsx:68](<src/app/(dashboard)/moderateurs/[id]/page.tsx#L68>)). Appliquer le filtrage **côté serveur**, sur le modèle correct de [academy/[id]/[juniorId]/page.tsx:60](<src/app/(dashboard)/academy/[id]/[juniorId]/page.tsx#L60>).

### 0.8 Migrations de permissions — prérequis de la Phase 3

**Le problème.** `ensureRoleGrantsSeeded()` ([GrantsService.ts:17-27](src/core/services/auth/GrantsService.ts#L17-L27)) ne seed que si `role_permissions` est **vide**. Toute permission ajoutée plus tard à `ROLE_PRESETS` n'atterrit donc jamais sur une base existante. Le seul recours actuel est le bouton « preset » de `/configuration/acces`, qui passe par `replaceRoleGrants` → `deleteMany` puis `createMany` : il **écrase toutes les personnalisations** faites depuis. Autrement dit, aujourd'hui, ajouter une permission oblige à choisir entre « personne ne l'a » et « on perd les réglages ». La Phase 3 en ajoute 7 : il faut régler ça avant.

**La solution — des ajouts de droits versionnés, purement additifs.**

```prisma
model GrantMigration {
  key       String   @id          // stable, jamais réutilisée
  appliedAt DateTime @default(now())
  @@map("grant_migrations")
}
```

`src/declarations/access/grants.ts` — une déclaration, pas du code :

```ts
export interface GrantAddition {
  key: string
  grants: Partial<Record<MemberRoleName, PermissionName[]>>
}

export const GRANT_ADDITIONS: readonly GrantAddition[] = [
  { key: 'initial-role-presets', grants: ROLE_PRESETS },
  // Phase 3 ajoutera ici son entrée, et ainsi de suite
]
```

`ensureRoleGrantsSeeded()` est **remplacé** par `syncRoleGrants()` dans `GrantsService.ts` : lit les clés déjà appliquées, applique les manquantes en `createMany({ skipDuplicates: true })` + enregistre la clé, le tout dans une transaction par entrée. Un garde de module (`let synced = false`) fait que la synchronisation coûte **zéro requête** après le premier appel du process.

Trois propriétés qui règlent le problème pour de bon :

- **Additif** — aucun `deleteMany`, les personnalisations de la matrice d'accès survivent.
- **Idempotent** — la clé est enregistrée, donc une permission qu'un admin retire ensuite n'est **pas** réajoutée au redémarrage.
- **Automatique** — plus jamais de clic manuel : toute permission future ship avec son entrée `GRANT_ADDITIONS`.

Au passage, c'est aussi un gain de perf : le `count()` par requête que `ensureRoleGrantsSeeded()` déclenche à chaque `getSession()` disparaît. `ROLE_PRESETS` reste la source du bouton « preset », qui redevient ce qu'il doit être — une remise à zéro explicite et volontaire.

**Deux nettoyages dans le même fichier**, tant qu'on y est :

- [GrantsService.ts:65-67](src/core/services/auth/GrantsService.ts#L65-L67) — `if (isRoot) return X` puis `return X`, deux branches strictement identiques. Le paramètre `isRoot` n'est pas utilisé (le bypass root est fait ailleurs, dans `resolvePermissions`). Supprimer la branche morte.
- Les deux appels à `ensureRoleGrantsSeeded()` (`resolveAccountPermissions`, `readRoleGrants`) deviennent `syncRoleGrants()`.

---

## Phase 1 — Référentiels configurables

Quatre nouvelles collections. Le contrat de [src/core/services/reference/ReferenceService.ts](src/core/services/reference/ReferenceService.ts) fait le reste : routes, page, drag & drop, EmptyState, compteur d'usage, garde de suppression, journal — **rien de tout ça n'est à écrire**.

### 1.1 Modèles Prisma

```prisma
model Dispositif {          // ATRIA, PULSE
  id, name @unique, summary?, accent?, position
  skills Skill[]  juniors AcademyJunior[]  trainings Training[]  steps PimStepTemplate[]
}

model SkillCategory {       // Savoir-être, Technique, Rédaction...
  id, name @unique, accent?, position
  skills Skill[]
}

model Skill {
  id, name, description?, position
  categoryId    → SkillCategory (Cascade)
  functionId?   → JobFunction   (Cascade)   // null = toutes fonctions
  dispositifId? → Dispositif    (Cascade)   // null = tous dispositifs
  juniorSkills JuniorSkill[]
  @@unique([name, functionId, dispositifId])
  @@index([functionId, dispositifId])
}

model PimStepTemplate {     // la trame J-4 → 13e live
  id, title, description?, position, required @default(true)
  functionId?   → JobFunction
  dispositifId? → Dispositif
  stage  AcademyStage        // PREPARATION | DISCOVERY | REVIEW_ONE | PRACTICE | REVIEW_FINAL | BONUS
  anchor StepAnchor          // DAY | LIVE
  offset Int                 // -4, +3, +17 ... ou 6, 13
  owner  StepOwner           // RESPONSABLE | FORMATEURS | BOTH | JUNIOR
  steps AcademyStep[]
}
```

Trois nouveaux enums structurels (`AcademyStage`, `StepAnchor`, `StepOwner`) avec leur `createRegistry` dans [src/declarations/academy/registries.ts](src/declarations/academy/registries.ts) — pattern identique aux 5 registres déjà présents. Ce ne sont pas des valeurs métier éditables mais la mécanique du système, comme `FunctionKind` ou `PermissionEffect`.

### 1.2 Migration `AcademyTrack` → `Dispositif`

`ENTREE` → ligne `ATRIA`, `ADAPTATION` → ligne `PULSE` (libellés et résumés repris de `pim-explain.md`). `AcademyJunior.track` devient `dispositifId`. L'enum `AcademyTrack` et `ACADEMY_TRACK_REGISTRY` sont supprimés.

### 1.3 Branchement référentiel

Dans [src/declarations/reference/sections.ts](src/declarations/reference/sections.ts) : 4 clés dans `REFERENCE_KEYS` (`dispositifs`, `categories-competences`, `competences`, `etapes-pim`) + 4 objets `ReferenceSection` (label, singular, gender, description, icon, figure, reorderable, empty*).

Dans `ReferenceService.ts` : 4 `const … : ReferenceResource` réutilisant les helpers **déjà là** — `nameField`, `accentField`, `rethrow`, `nextPosition`, `applyOrder`, `noReorder` — puis 4 entrées dans `RESOURCES`. `usage` = `_count` des relations entrantes (`Skill._count.juniorSkills`, `Dispositif._count.juniors`, …), ce qui donne gratuitement le blocage de suppression d'une compétence déjà notée.

### 1.4 Icônes & seed

- 4 clés à ajouter à `ICONS` ([src/declarations/ui/icons.ts](src/declarations/ui/icons.ts)) : `skill` (Target), `objective` (Flag), `dispositif` (Route), `glossary` (BookOpen). `IconName` se met à jour seul.
- `prisma/seed.ts` : les 42 compétences du document (Twitch ATRIA 9, Twitch PULSE 9, Discord ATRIA 12, Discord PULSE 12) + les catégories + la trame PIMT du document, en `upsert` idempotents.

---

## Phase 2 — La fonction comme axe unique, et le scoping

### 2.1 Suppression de `AcademyProgram`

- `AcademySession.program` → `functionId → JobFunction` (`onDelete: Restrict`).
- `Training.program` → supprimé ; `Training.functionId` **devient filtrant** (il est déjà éditable dans `/configuration/formations` et n'a jamais servi) et gagne `dispositifId?`.
- `programTrainings(program)` → `sessionTrainings(functionId, dispositifId)` : `where: { OR: [{ functionId: null }, { functionId }], AND: { OR: [{ dispositifId: null }, { dispositifId }] } }`.
- L'enum `AcademyProgram`, `ACADEMY_PROGRAM_REGISTRY` et `AcademyPrograms` disparaissent. Migration : PIMT/PIMY/PIMD/PIMP → `upsert` de 4 `JobFunction` puis remappage.

### 2.2 Cycle de vie d'une Session

`AcademySessionStatus` passe de 3 à 5 valeurs, comme demandé : `DRAFT` (préparée) · `OPEN` (admissions ouvertes) · `RUNNING` (active) · `CLOSED` (clôturée) · `ARCHIVED`. Registre mis à jour ; les sessions `ARCHIVED` sortent des listes par défaut.

### 2.3 `Account.academyPeriod` supprimé

C'est un troisième doublon : la période d'un Junior est déjà portée par sa FSI. Elle devient **dérivée** de `AcademyJunior.stage` (Phase 3). Retirer le champ Prisma, le `visibleWhen` de `MemberService`, le badge inline de [MemberFileTabs.tsx:349](src/composites/members/MemberFileTabs.tsx#L349) → il lit la FSI.

### 2.4 Scoping par fonction

Nouveau `src/core/services/academy/AcademyScope.ts` — une fonction pure retournant un fragment `where` Prisma :

```ts
academyScope(session, access): Prisma.AcademySessionWhereInput
// isAdmin || isResponsable                → {}
// sinon → { functionId: { in: [primaryFunctionId, secondaryFunctionId].filter(Boolean) } }
```

Appliqué dans `listSessions`, `readSession`, `readJunior` et chaque mutation (un `notFound()` si la session est hors scope, jamais un `forbidden()` qui révèlerait son existence). Précédents à imiter, tous les deux dans le dépôt : `canReviewAbsence` ([AbsenceService.ts:43-55](src/core/services/absences/AbsenceService.ts#L43-L55)) et `allowedVisibilities` ([CalendarService.ts:107-118](src/core/services/calendar/CalendarService.ts#L107-L118)). Rien à changer côté infrastructure : `createProtectedRoute` passe déjà `session` **et** `access` au handler.

---

## Phase 3 — La FSI complète

L'écran `academy/[id]/[juniorId]` devient la FSI à 5 onglets, monté sur le `FileTabs` de la Phase 0. `AcademyJunior` reste le modèle ; « FSI » est son nom métier (inscrit au glossaire), pas une seconde table.

### 3.1 Modèles

```prisma
model AcademyJunior {                     // existant, étendu
  + stage        AcademyStage @default(PREPARATION)
  + dispositifId → Dispositif             // remplace track (Phase 1)
  + bonusLives   Int @default(0)
  skills     JuniorSkill[]
  notes      JuniorNote[]
  objectives JuniorObjective[]
}

model JuniorSkill {
  juniorId → AcademyJunior (Cascade)   skillId → Skill (Cascade)
  percent Int @default(0)              validatorId? → Account (SetNull)
  updatedAt                            note?
  @@unique([juniorId, skillId])
}

model JuniorNote {
  juniorId → AcademyJunior (Cascade)   authorId? → Account (SetNull)
  stage AcademyStage   kind NoteKind   // POSITIVE | NEGATIVE
  body String          createdAt
  @@index([juniorId, createdAt])
}

model JuniorObjective {                  // déverrouillé à partir de PRACTICE
  juniorId → AcademyJunior (Cascade)   authorId? → Account (SetNull)
  title  String        description?     dueAt?
  status ObjectiveStatus @default(OPEN)  // OPEN | REACHED | MISSED
  position Int
}
```

### 3.2 Refonte de `AcademyReview` — suppression du 3ᵉ doublon

`axes Json` (6 axes en dur) et `objectives String` sont **supprimés** : les compétences et les objectifs sont désormais des entités. Le bilan devient le compte-rendu du vocal et le support de la décision :

```prisma
model AcademyReview {
  juniorId  → AcademyJunior   authorId? → Account
  stage     AcademyStage
  heldAt    DateTime          durationMinutes Int?     // le vocal n'est pas informatif
  feeling   String?           summary String           // rédaction du Formateur
  advice    ReviewAdvice                               // PASS | BONUS | STOP — l'avis proposé
  status    ReviewStatus @default(DRAFT)               // DRAFT | SUBMITTED | VALIDATED | REJECTED
  decidedById? → Account      decidedAt?   decisionNote?
  @@index([juniorId, heldAt])
}
```

Migration : `axes` + `objectives` + `strategies` des lignes existantes sont concaténés en Markdown à la fin de `summary`, rien n'est perdu. `REVIEW_AXES` / `ACADEMY_REVIEW_AXES` et le spread `...REVIEW_AXES.map(...)` de `REVIEW_FIELDS` disparaissent.

### 3.3 Permissions

7 clés à ajouter à `Permissions` + `PermissionsList` ([src/utils/constants/permissions.ts](src/utils/constants/permissions.ts)), groupe `academy` existant :

`academy:skill:write` · `academy:note:read` · `academy:note:write` · `academy:objective:write` · `academy:review:validate` · `academy:self:read` · `academy:training:complete`

Puis `ROLE_PRESETS` ([src/declarations/access/roles.ts](src/declarations/access/roles.ts)) **et** une entrée dans `GRANT_ADDITIONS` (mécanisme de la Phase 0.8) — c'est elle qui fait réellement atterrir les droits sur la base existante, sans écraser les personnalisations :

```ts
{ key: 'academy-fsi', grants: {
    [MemberRoles.Responsable]: [
      Permissions.AcademySkillWrite, Permissions.AcademyNoteRead, Permissions.AcademyNoteWrite,
      Permissions.AcademyObjectiveWrite, Permissions.AcademyReviewValidate,
    ],
    [MemberRoles.Moderateur]: [Permissions.AcademySelfRead, Permissions.AcademyTrainingComplete],
} }
```

`ADMIN` n'est pas listé : `ROLE_PRESETS[Admin]` vaut `ALL_PERMISSIONS`, et le bypass root le couvre déjà.

Les droits **Formateur** ne passent ni par un rôle ni par `GRANT_ADDITIONS` : ils vivent sur la `JobFunction` (`function_permissions`, onglet Fonctions d'`AccessMatrixPanel`), qui est le porteur prévu pour ça. Un Formateur reste un `MODERATEUR` dont la fonction porte `academy:skill:write`, `academy:note:write`, `academy:review:write`.

### 3.4 Services, routes, hooks

Étendre [AcademyService.ts](src/core/services/academy/AcademyService.ts) plutôt que créer un service parallèle. Nouvelles routes, toutes via `createProtectedRoute` :

| Route                           | Méthodes          | Permission                              |
| ------------------------------- | ----------------- | --------------------------------------- |
| `/api/juniors/[id]/competences` | `GET`, `PATCH`    | `AcademyRead` / `AcademySkillWrite`     |
| `/api/juniors/[id]/notes`       | `GET`, `POST`     | `AcademyNoteRead` / `AcademyNoteWrite`  |
| `/api/notes-fsi/[id]`           | `PATCH`, `DELETE` | `AcademyNoteWrite`                      |
| `/api/juniors/[id]/objectifs`   | `GET`, `POST`     | `AcademyRead` / `AcademyObjectiveWrite` |
| `/api/objectifs/[id]`           | `PATCH`, `DELETE` | `AcademyObjectiveWrite`                 |
| `/api/bilans/[id]/decision`     | `POST`            | `AcademyReviewValidate`                 |

Conserver la convention maison : **toute mutation renvoie la collection recalculée**, ce qui fait vivre le `pickSelf` de [useJuniorFile.ts:56-61](src/core/hooks/data/useJuniorFile.ts#L56-L61) sans refetch. Les notes de FSI sont gatées **côté serveur** (`canReadNotes ? list : []`), pas seulement au rendu.

### 3.5 Écran FSI

`src/composites/academy/JuniorFile.tsx` réécrit sur `FileTabs` :

| Onglet           | Contenu                                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Informations** | En-tête (dispositif, fonction, référent, statut, étape courante en `StepTimeline`), `Progress` global des formations, `Progress` global des compétences, compteur de lives borné par `maxLives` (+ `bonusLives`) |
| **Notes**        | Liste triée, `Badge` de type (`success`/`danger`) + `Badge` d'étape + auteur + date, `AddRow` + `FormDialog`, `EmptyState` si vide                                                                               |
| **Objectifs**    | Verrouillé tant que `stage < PRACTICE` → `EmptyState` avec action « Voir les bilans ». Sinon liste réordonnable, statut `OPEN`/`REACHED`/`MISSED`, minimum `ACADEMY_SETTINGS.minObjectives` **enfin appliqué**   |
| **Bilans**       | Un bilan par étape. Formateur : rédige et soumet. Responsable : `ConfirmDialog` de décision (`VALIDATED` / `REJECTED` + note), qui déclenche l'avancement d'étape                                                |
| **Compétences**  | Groupées par `SkillCategory`, chaque ligne = nom + description + `Progress` éditable (pas de `step` en dur : `ACADEMY_SETTINGS.skillStep`) + date/auteur de dernière mise à jour                                 |

### 3.6 Fiche Modérateur

Dans `MemberFileTabs`, onglet **Academy** :

- lien vers la FSI si `AcademyJunior` existe (`ROUTES.junior(sessionId, juniorId)`) ;
- sinon `EmptyState` : « Ce Modérateur n'a pas de FSI associée. » ;
- nouvelle section **Parcours** → `<WipNotice figure="academy" />` ([WipNotice existe déjà](src/components/structures/WipNotice.tsx)).

---

## Phase 4 — Timeline & états de PIM

### 4.1 Instanciation

À la création d'une Session (`createSession`), `instantiateTimeline(sessionId)` copie les `PimStepTemplate` correspondant à `functionId` (+ `dispositifId` du junior pour les étapes individuelles) en `AcademyStep`. `AcademyStep` gagne : `templateId?`, `stage`, `owner`, `anchor`, `offset`, `required`, `validatedById?`, `validatedAt?`.

Calcul de `scheduledAt` :

- `anchor: DAY` → `session.startsAt + offset jours`
- `anchor: LIVE` → **pas de date** ; l'étape s'ouvre quand `junior.liveCount >= offset`

Une étape instanciée reste modifiable à la main sur la session (date, titre, notes) — le modèle est un point de départ, pas une contrainte.

### 4.2 États — dérivés, jamais stockés

`resolveStepState(step, junior, now)` dans un module pur `src/core/services/academy/timeline.ts`, réutilisable serveur et client (comme `resolvePermissions`) :

| État      | Condition                                                  | Rendu                                 |
| --------- | ---------------------------------------------------------- | ------------------------------------- |
| `done`    | `validatedAt !== null`                                     | grisé, barré, coche verte — `dotDone` |
| `late`    | échéance dépassée et non validée                           | rouge — `dotLate` (Phase 0)           |
| `current` | échéance atteinte (date ou nombre de lives) et non validée | rose, pleine opacité — `dotCurrent`   |
| `idle`    | échéance à venir                                           | grisé transparent — `dotIdle`         |

**Blocage** : une étape `late` bloque toutes les suivantes de la même `stage`. Le service refuse la validation (`conflict()`), l'UI désactive le bouton. Ne stocker que `validatedAt` / `validatedById` / `doneAt` — l'état se recalcule, il ne se duplique pas en base.

### 4.3 Machine à états de la PIM

`advanceJunior(juniorId, session)` — la seule porte d'entrée, appelée par la décision de bilan :

```
PREPARATION → DISCOVERY → REVIEW_ONE → PRACTICE → REVIEW_FINAL → [BONUS] → DONE
```

Garde-fous : toutes les étapes `required` de l'étape courante validées, bilan de l'étape `VALIDATED`, formations obligatoires terminées (`mandatoryPending === 0`). `BONUS` n'est ouvert que sur décision `advice: BONUS` validée, et borne `liveCount + bonusLives <= maxLives + bonusMaxLives`. À l'arrivée en `DONE` : `AcademyJunior.status = VALIDATED` et `Account.status = ACTIVE` (l'effet de bord existe déjà en [AcademyService.ts:657-662](src/core/services/academy/AcademyService.ts#L657-L662), il est déplacé ici). Chaque transition émet `recordEvent({ eventType: 'AcademyAdvanced' })`.

### 4.4 Onglets de la Session

`SessionPanel` passe de 2 à 5 onglets (sur `FileTabs`) : **Juniors** (existant) · **Timeline** (nouveau, `StepTimeline` verticale groupée par `stage`) · **Calendrier** · **Missions** · **Fil** (l'ancien `thread`, moments libres).

**Calendrier** : `CalendarEvent.sessionId` est déclaré depuis le début et **jamais lu ni écrit** ([schema.prisma:760](prisma/schema.prisma#L760)). On le branche enfin : le `CalendarBoard` existant est réutilisé tel quel, avec une prop `sessionId` qui borne le fetch. Les `AcademyStep` datés y sont **projetés en lecture**, jamais recopiés en `CalendarEvent` — pas de doublon de lignes.

**Missions** : `<WipNotice figure="tasks" />`.

### 4.5 Journal & réglages

Nouveaux `EVENT_TYPES` aux **ids libres suivants, jamais réattribués** : `SkillUpdated` (26), `ReviewValidated` (27), `StepValidated` (28), `JuniorEnrolled` (29).

`src/configurations/system/academy.json` gagne `bonusMaxLives: 4`, `skillStep: 5`, `skillMaxPercent: 100`, lus via `readInteger` dans `ACADEMY_SETTINGS` — en respectant l'idiome du dépôt : le majorant est extrait en `const` locale **avant** l'objet et passé en `max:`.

---

## Phase 5 — Page Formations côté Junior

### 5.1 `TrainingRecord` — migration additive, aucune ligne supprimée

**Correction d'une lecture trop rapide de la spec.** Le document dit : « Les contenus des formations sont **communs** à tous les Juniors d'une même spécialité. En revanche, leur progression est **personnelle**. » Le contraste porte sur _commun vs individuel_, pas sur _compte vs session_. Rien n'exige de recléer la progression sur la PIM — et le faire coûterait cher :

- suppression des `TrainingRecord` dont le compte n'a aucune FSI rattachable (validations réellement perdues) ;
- risque de collision sur le nouveau `@@unique([trainingId, juniorId])` pour un compte passé par deux FSI ;
- un modérateur qui repasse en session devrait refaire des formations qu'il a déjà faites, ce que le document ne demande nulle part.

**La clé `accountId` reste donc l'identité.** On ajoute le cycle de vie, plus un `juniorId` **nullable de provenance** — sous quelle PIM la formation a été faite. Ce n'est pas une seconde clé, c'est une métadonnée de traçabilité, et l'unicité ne bouge pas :

```prisma
model TrainingRecord {
  trainingId  → Training (Cascade)      accountId → Account (Cascade)   // inchangé
  status      TrainingStatus @default(NOT_STARTED)  // NOT_STARTED | IN_PROGRESS | DONE | ABANDONED
  attempts    Int @default(0)
  startedAt   DateTime?                 completedAt DateTime?           // existant
  abandonedAt DateTime?
  juniorId?   → AcademyJunior (SetNull) // provenance, pas une clé
  validatorId? → Account (SetNull)      note?                           // existants
  @@unique([trainingId, accountId])     // inchangé
  @@index([juniorId])
}
```

**Migration 100 % additive, zéro `DELETE`** :

- `status` rétro-rempli : `completedAt IS NOT NULL` → `DONE`, sinon `IN_PROGRESS` (une ligne existe = quelque chose a commencé) ;
- `startedAt` rétro-rempli depuis `createdAt` ;
- `juniorId` rétro-rempli quand le compte a **exactement une** FSI, laissé `null` sinon — aucune ligne n'est perdue dans le cas ambigu.

**Lecture côté FSI** : la progression d'un Junior = les `TrainingRecord` de son `accountId`, filtrés aux formations de sa fonction × son dispositif (`sessionTrainings`, Phase 2). `completedCount` et `mandatoryPending` se calculent là-dessus, sans nouvelle table. **Recommencer** = `attempts + 1`, `status = IN_PROGRESS`, `completedAt = null`, et `juniorId` re-tamponné sur la FSI courante — l'historique de provenance suit le junior sans dupliquer la ligne.

L'onglet Academy de la fiche Modérateur continue de lire les records du compte, sans changement.

### 5.2 La page

- `ROUTES.trainings = '/formations'`, entrée dans le groupe **Personnel** de `NAVIGATION` avec `visibleWhen: { statuses: ['ACADEMY'] }` (Phase 0.4), page gardée par `requireStatus(MemberStatuses.Academy)`.
- Liste des formations de sa fonction × son dispositif (`sessionTrainings` de la Phase 2), triées par période puis position. `Progress` global en tête.
- Actions, exactement celles du document : **démarrer** · **reprendre** · **recommencer** (`attempts + 1`, remet `IN_PROGRESS`) · **abandonner** · **terminer**. Pas de modification après coup.
- `Terminer` → `TrainingRecord.status = DONE`, `recordEvent('TrainingValidated')`, recalcul de `mandatoryPending`, validation automatique de l'`AcademyStep` de type formation s'il en reste un ouvert.
- Durée indicative (20-50 min) affichée depuis deux nouveaux réglages `academy.trainingMinMinutes` / `trainingMaxMinutes`.
- **Contenu** : `<WipNotice figure="academy" />`, comme demandé par le document.

Route : `/api/formations/[id]/progression` (`PATCH`, permission `AcademyTrainingComplete`), le service vérifie que le junior agit bien sur **sa** FSI.

---

## Phase 6 — Formulaire d'admission

```prisma
model SessionInvite {
  id, sessionId → AcademySession (Cascade)
  token String @unique   expiresAt DateTime   maxUses Int?   uses Int @default(0)
  dispositifId? → Dispositif                  createdById? → Account
}
```

- Page publique `/admission/[token]` + `createPublicRoute` pour la soumission — le formulaire est une `FieldDefinition[]` construite par le service, donc validé par `parseFormValues` comme partout ailleurs.
- Soumission → création de l'`Account` (statut `ACADEMY`, rôle `MODERATEUR`, fonction héritée de la session) + `AcademyJunior` rattaché à la session + `recordEvent('JuniorEnrolled')`.
- Le lien est généré depuis la Session quand elle passe en `OPEN` (Phase 2.2), ce qui correspond à l'étape « J-0 · Partage du formulaire d'admission » de la trame.
- Anti-abus : token à usage borné, expiration, rate-limit sur la route publique.

---

## Phase 7 — Contenu des formations

`TrainingChapter` (trainingId, title, position) → `TrainingBlock` (chapterId, kind `TEXT | QUIZ`, body Markdown, position) → `QuizQuestion` / `QuizChoice` (`correct Boolean`) / `JuniorAnswer`. Édition depuis `/configuration/formations/[id]` (le pattern « fiche openable » existe déjà : [configuration/youtubeurs/[id]/page.tsx](<src/app/(dashboard)/configuration/youtubeurs/[id]/page.tsx>)). Le rendu du quiz réutilise `FieldControl` (`select` / `multiselect`) et `FormSteps` pour la pagination des questions ; **seul le scoring est à écrire**, le moteur de formulaire valide déjà l'appartenance aux options côté serveur.

---

## Fichiers pivots — à étendre, jamais à dupliquer

`src/core/lib/http/route.ts` · `src/core/lib/registry.ts` · `src/core/lib/enumeration.ts` · `src/core/lib/forms/` · `src/core/services/reference/ReferenceService.ts` · `src/declarations/reference/sections.ts` · `src/utils/constants/permissions.ts` · `src/declarations/access/roles.ts` · `src/declarations/access/grants.ts` _(nouveau, Phase 0.8)_ · `src/core/services/auth/GrantsService.ts` · `src/declarations/configurations/settings.ts` · `src/declarations/navigation.ts` · `src/core/lib/api/routes.ts` · `src/declarations/ui/icons.ts` · `src/core/services/academy/AcademyService.ts`

**Toute permission ajoutée après la Phase 0.8** doit venir avec son entrée dans `GRANT_ADDITIONS` — c'est la seule façon qu'elle atterrisse sur une base existante. Ne jamais la « rattraper » par le bouton preset.

---

## Vérification

Aucune librairie de test n'est installée ([skill `dependencies`](.claude/skills/dependencies)) — la vérification est manuelle et par le compilateur, phase par phase.

**À chaque phase**

1. `yarn validate` (= `type-check` + `lint` + `build`) — le garde-fou principal : les `Record<Enum, …>` des registres et `RESOURCES: Record<ReferenceKey, ReferenceResource>` **échouent à la compilation** si un enum évolue sans que les métadonnées suivent.
2. `yarn db:validate`, puis `yarn db:dev` sur une copie et `npx prisma migrate diff` pour vérifier qu'il ne reste aucune dérive.
3. `yarn db:seed` — idempotent (`upsert`), doit pouvoir se rejouer sans effet de bord.
4. `jq empty src/configurations/system/academy.json` (le Quality Gate le fait aussi).

**Contrôle anti-destruction, sur une copie de la base de prod** — à faire avant chaque migration touchant des données :

```sql
-- avant / après chaque migration, les compteurs ne doivent jamais baisser
SELECT count(*) FROM training_records;
SELECT count(*) FROM account_notes;   -- doit AUGMENTER du nombre de pims (Phase 0.1)
SELECT count(*) FROM academy_reviews; -- doit rester identique (Phase 3.2)
```

Phase 0.1 : `count(account_notes)` après = avant + `count(pims)` avant. Phase 5.1 : `count(training_records)` strictement inchangé, et `count(*) WHERE status IS NULL` = 0.

**Parcours de recette end-to-end**, à rejouer après la Phase 4 :

1. `/configuration/dispositifs` → créer un 3ᵉ dispositif, vérifier qu'il apparaît immédiatement dans le formulaire de junior sans redéploiement.
2. `/configuration/competences` → créer une compétence, tenter de la supprimer une fois notée → doit être refusée par le compteur d'usage.
3. `/configuration/etapes-pim` → ajouter une étape `LIVE +6`, créer une session, vérifier qu'elle est instanciée à la bonne place.
4. Se connecter en **Formateur Discord** → la session Twitch doit être **absente de la liste et en 404 en URL directe**.
5. Sur une FSI : monter une compétence à 60 %, ajouter une note négative, rédiger et soumettre un bilan → l'onglet Objectifs reste verrouillé.
6. Se connecter en **Responsable** → valider le bilan → la PIM passe en `PRACTICE`, l'onglet Objectifs se déverrouille, `AcademyAdvanced` apparaît dans le journal de la fiche.
7. Laisser passer une échéance → l'étape passe en rouge et **bloque** la validation de la suivante.
8. Se connecter en **Junior** → « Formations » est visible dans Personnel ; terminer une formation → `Progress` de la FSI et compteur de session mis à jour. Se connecter en modérateur non-Junior → l'entrée disparaît **et** `/formations` redirige.
9. **Recommencer** une formation déjà terminée → `attempts` passe à 2, la ligne reste unique en base, `juniorId` pointe la FSI courante.
10. Onglet Calendrier de la session → seuls les évènements de cette session, plus les étapes datées.
11. Fiche Modérateur → plus aucune trace de l'ancienne PIM ; les fiches Markdown migrées sont retrouvables dans l'onglet Notes.

**Recette des migrations de permissions (Phase 0.8 + 3.3)**, sur une copie de la prod :

1. Avant la migration, retirer à la main une permission au rôle Responsable depuis `/configuration/acces`.
2. Déployer la Phase 3 → les 7 nouvelles permissions apparaissent sur le rôle, **et la permission retirée reste retirée** (rien n'est écrasé).
3. Redémarrer l'application → aucune permission n'est réajoutée en double, `grant_migrations` contient une ligne par clé appliquée.
4. Retirer une des 7 nouvelles permissions, redémarrer → elle **ne revient pas** (la clé est déjà marquée appliquée).
5. Sur une base vierge : `yarn db:migrate && yarn db:seed`, se connecter → le rôle Admin a tout, l'entrée `initial-role-presets` est enregistrée.

**Découpage des commits** (skill `commits`) : un commit par unité fonctionnelle, message = emoji + verbe anglais au passé + phrase courte, sans détail en dessous. Le bloc `nextjs-agent-rules` d'`AGENTS.md` est réécrit par `next dev` — le committer avec le travail plutôt que de le retirer du diff.
