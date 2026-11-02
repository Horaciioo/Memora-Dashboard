/**
 * Private pages copy
 * @type {Record<string, string>}
 */

export const PAGES_COPY = {
  title: 'Pages privées',
  heroDescription: 'Tes notes, rien qu’à toi',
  railGroup: 'Privé',
  railShared: 'Partagées avec toi',
  railNew: 'Créer une page',
  railNewCategory: 'Créer une catégorie',
  railCategoryName: 'Nouvelle catégorie',
  railCategoryRename: 'Nom de la catégorie',
  railCategoryAdd: 'Ajouter une page ici',
  railCategoryEmpty: 'Dépose une page ici',
  railDropRoot: 'Dépose ici pour sortir d’une catégorie',
  railAddChild: 'Ajouter une sous-page',
  railExpand: 'Déplier',
  railEmpty: 'Aucune page',
  untitled: 'Sans titre',
  titlePlaceholder: 'Sans titre',
  welcomeTitle: 'Ton espace privé',
  welcomeLead:
    'Une page t’appartient tant que tu ne la partages pas. Personne d’autre ne la voit, ne la trouve en recherche ni ne l’ouvre par son lien.',
  startBlank: 'Page vide',
  startFromTemplate: 'Partir d’un modèle',
  templatesTitle: 'Modèles',
  recentTitle: 'Tes pages',
  sharedTitle: 'Partagées avec toi',
  searchPlaceholder: 'Chercher dans tes pages',
  searchEmpty: 'Aucune page ne correspond.',
  searchEmptyHint: 'La recherche ne parcourt que les pages qui te sont ouvertes.',
  emptyTitle: 'Aucune page pour l’instant',
  emptyLead: 'Crée ta première page ou pars d’un modèle.',
  trashTitle: 'Corbeille',
  trashLead:
    'Les pages supprimées restent ici, avec leurs sous-pages, jusqu’à ce que tu les effaces.',
  trashOpen: 'Ouvrir la corbeille',
  trashEmptyTitle: 'Corbeille vide',
  trashEmptyLead: 'Une page mise à la corbeille se restaure d’ici.',
  trashRestore: 'Restaurer',
  trashPurge: 'Supprimer définitivement',
  trashPurgeConfirm:
    'Supprimer définitivement cette page et ses sous-pages ? Rien ne pourra être récupéré.',
  trashedOn: 'Supprimée le {date}',
  trashedBanner: 'Cette page est dans la corbeille.',
  editedAgo: 'Modifiée {ago}',
  editedBy: 'par {name}',
  createFailed: 'La page n’a pas pu être créée.',
  notFoundTitle: 'Page introuvable',
  notFoundLead: 'Cette page n’existe pas ou ne t’est pas ouverte.',
  backToPages: 'Retour aux pages',
  coverAdd: 'Ajouter une couverture',
  coverChange: 'Changer la couverture',
  coverRemove: 'Retirer la couverture',
  iconAdd: 'Ajouter une icône',
  iconRemove: 'Retirer l’icône',
  readOnly: 'Lecture seule',
  readOnlyHint: 'Tu peux lire cette page sans la modifier.',
  subpagesTitle: 'Sous-pages',
} as const

/**
 * Access levels copy
 * @type {Record<string, string>}
 */

export const PAGE_ACCESS_COPY = {
  owner: 'Propriétaire',
  ownerHint: 'A créé la page, garde tous les droits.',
  full: 'Accès complet',
  fullHint: 'Modifier, partager, déplacer et supprimer.',
  edit: 'Peut modifier',
  editHint: 'Écrire, commenter et ajouter des sous-pages.',
  comment: 'Peut commenter',
  commentHint: 'Lire et laisser des commentaires.',
  view: 'Peut lire',
  viewHint: 'Lire seulement.',
  capabilityRead: 'Voir',
  capabilityComment: 'Commenter',
  capabilityWrite: 'Écrire',
  capabilityOrganize: 'Déplacer',
  capabilityShare: 'Partager',
  capabilityTrash: 'Supprimer et restaurer',
} as const

/**
 * Share panel copy
 * @type {Record<string, string>}
 */

export const PAGE_SHARE_COPY = {
  button: 'Partager',
  title: 'Partager',
  invitePlaceholder: 'Ajouter des personnes ou un rôle',
  inviteEmpty: 'Personne ne correspond.',
  peopleGroup: 'Personnes',
  rolesGroup: 'Rôles',
  workspace: 'Tout Memora',
  workspaceHint: 'Chaque membre de Memora',
  workspaceOff: 'Seules les personnes invitées',
  workspaceEnable: 'Ouvrir à tout Memora',
  generalAccess: 'Accès général',
  restricted: 'Restreint',
  peopleWithAccess: 'Personnes avec accès',
  you: '(toi)',
  remove: 'Retirer l’accès',
  inherit: 'Reprendre les accès de la page parente',
  inheritHint: 'Les personnes qui ont accès à « {parent} » ont aussi accès à cette page.',
  inheritedFrom: 'Par « {parent} »',
  copyLink: 'Copier le lien',
  linkCopied: 'Lien copié',
  linkHint: 'Le lien n’ouvre la page qu’aux personnes qui y ont accès.',
  levelLabel: 'Niveau d’accès',
  role: 'Rôle {role}',
  saved: 'Partage mis à jour',
  failed: 'Le partage n’a pas pu être modifié.',
  matrixTitle: 'Ce que permet chaque niveau',
  closed: 'Privée',
  shared: 'Partagée',
} as const

/**
 * Page menu copy
 * @type {Record<string, string>}
 */

export const PAGE_MENU_COPY = {
  removeCategory: 'Supprimer la catégorie',
  privacyTitle: 'Confidentialité',
  privacyNote:
    'Les développeurs de Memora voient le titre de cette page et qui y a accès, jamais son contenu tant qu’ils n’y ont pas été invités.',
  copyLink: 'Copier le lien',
  wide: 'Pleine largeur',
  panelTitle: 'Cette page',
  showComments: 'Afficher les commentaires',
  createdLine: 'A été créée le {date}',
  editedLine: 'A été modifiée le {date}',
  trash: 'Mettre à la corbeille',
  trashed: 'Page mise à la corbeille',
  restored: 'Page restaurée',
  purged: 'Page supprimée',
  moveTo: 'Déplacer vers',
  moveRoot: 'Racine de ton espace',
  moved: 'Page déplacée',
  failed: 'L’action n’a pas abouti.',
} as const

/**
 * Sync states copy
 * @type {Record<string, string>}
 */

export const PAGE_SYNC_COPY = {
  saved: 'Enregistré',
  saving: 'Enregistrement…',
  pending: 'Modifications en attente',
  offline: 'Hors ligne, gardé sur cet appareil',
  failed: 'Modification refusée, recharge la page',
  retry: 'Recharger',
  draftRestored: 'Brouillon hors ligne repris',
  offlineCopy: 'Copie hors ligne du {date}',
} as const

/**
 * Editor copy
 * @type {Record<string, string>}
 */

export const PAGE_EDITOR_COPY = {
  label: 'Contenu de la page',
  placeholder: 'Écris, ou tape / pour insérer un bloc',
  headingPlaceholder: 'Titre',
  emptyPlaceholder: 'Tape / pour les afficher les commandes',
  slashLabel: 'Insérer un bloc',
  slashEmpty: 'Aucun bloc ne correspond',
  formatLabel: 'Mise en forme',
  handleLabel: 'Glisser ou ouvrir les options du bloc',
  blockMenuTitle: 'Bloc',
  duplicate: 'Dupliquer',
  remove: 'Supprimer',
  moveUp: 'Monter',
  moveDown: 'Descendre',
  turnInto: 'Transformer en {block}',
  turnIntoMenu: 'Transformer en',
  sectionBlock: 'Bloc',
  copyBlockLink: 'Copier le lien du bloc',
  blockLinkCopied: 'Lien du bloc copié',
  linkPrompt: 'Adresse du lien',
  linkInvalid: 'Adresse refusée : http, https, mailto ou un chemin de Memora.',
  linkLabel: 'Lien',
  imageUploading: 'Envoi de l’image…',
  imageFailed: 'L’image n’a pas pu être envoyée.',
  imageAlt: 'Image de la page',
  subpageMissing: 'Page introuvable ou fermée',
  subpageCreateFailed: 'La sous-page n’a pas pu être créée.',
  calloutPlaceholder: 'Écris ton encadré',
  toolbarLabel: 'Barre d’édition',
  insert: 'Insérer un bloc',
  undo: 'Annuler',
  redo: 'Rétablir',
  indent: 'Décaler à droite',
  outdent: 'Décaler à gauche',
  done: 'Terminer',
  taskOpen: 'Cocher « {task} »',
  taskChecked: 'Décocher « {task} »',
  taskEmpty: 'tâche vide',
} as const

/**
 * Comments copy
 * @type {Record<string, string>}
 */

export const PAGE_COMMENT_COPY = {
  title: 'Commentaires',
  open: 'Ouvrir les commentaires',
  close: 'Fermer les commentaires',
  placeholder: 'Ajouter un commentaire',
  resolve: 'Résoudre',
  reopen: 'Rouvrir',
  remove: 'Supprimer',
  empty: 'Aucun commentaire.',
  reply: 'Répondre',
  failed: 'Le commentaire n’a pas pu être enregistré.',
} as const

/**
 * Admin registry copy
 * @type {Record<string, string>}
 */

export const PAGE_REGISTRY_COPY = {
  title: 'Pages privées',
  lead: 'Chaque page de Memora, qui y a accès et depuis quand. Le contenu reste fermé.',
  heroDescription: 'Titres et accès, jamais le contenu',
  columnPage: 'Page',
  columnOwner: 'Propriétaire',
  columnAccess: 'Accès',
  columnCreated: 'Créée le',
  columnEdited: 'Modifiée le',
  columnState: 'État',
  onlyOwner: 'Propriétaire seulement',
  inherited: 'Hérite de « {parent} »',
  trashed: 'Corbeille',
  active: 'Active',
  emptyTitle: 'Aucune page',
  emptyLead: 'Aucun membre n’a encore créé de page privée.',
  sealed: 'Contenu fermé aux développeurs',
  filterAll: 'Toutes',
  filterShared: 'Partagées',
  filterPrivate: 'Privées',
  filterTrash: 'Corbeille',
  searchPlaceholder: 'Chercher un titre ou un propriétaire',
} as const

/**
 * Offline reading copy
 * @type {Record<string, string>}
 */

export const PAGE_OFFLINE_COPY = {
  title: 'Pages lisibles hors ligne',
  lead: 'Les dernières pages ouvertes sur cet appareil, en lecture seule.',
  empty: 'Aucune page gardée sur cet appareil.',
  back: 'Retour à la liste',
  pendingDraft: 'Modifications non envoyées',
} as const

/**
 * Refused document copy, one line per broken rule
 * @type {Record<string, string>}
 */

export const PAGE_DOCUMENT_COPY = {
  size: 'Cette page est trop longue pour être enregistrée.',
  shape: 'Le contenu envoyé ne suit pas le format des pages.',
  depth: 'Trop de blocs imbriqués les uns dans les autres.',
  count: 'Cette page compte trop de blocs.',
  link: 'Un lien pointe vers une adresse refusée.',
  image: 'Une image ne vient pas de cette page.',
  subpage: 'Une sous-page citée n’appartient pas à cette page.',
  title: 'Le titre est trop long.',
  icon: 'L’icône doit être un seul emoji.',
  cover: 'La couverture doit être une image de cette page.',
  moveLoop: 'Une page ne peut pas aller sous l’une de ses sous-pages.',
  shareSelf: 'Le propriétaire a déjà tous les droits.',
  shareLevel: 'Tu ne peux pas donner plus de droits que les tiens.',
  shareTarget: 'Choisis une personne, un rôle ou tout Memora.',
  comment: 'Le commentaire est vide ou trop long.',
  template: 'Ce modèle n’existe pas.',
  categoryName: 'Donne un nom court à la catégorie.',
  categoryLimit: 'Tu as atteint le nombre maximal de catégories.',
  categoryTarget: 'Cette catégorie n’existe pas.',
} as const

/**
 * Version history copy
 * @type {Record<string, string>}
 */

export const PAGE_HISTORY_COPY = {
  open: 'Historique des versions',
  title: 'Historique',
  empty: 'Aucune version gardée pour l’instant.',
  pick: 'Choisis une version pour la lire.',
  byline: '{date}, par {name}',
  bylineAnonymous: '{date}',
  compare: '{changed} modifiés, {removed} retirés et {added} ajoutés depuis',
  same: 'Identique à la page actuelle',
  restore: 'Restaurer cette version',
  restored: 'Version restaurée',
  loading: 'Chargement…',
} as const
