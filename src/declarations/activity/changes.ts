/**
 * Nouns naming an edited field in a journal sentence, article included
 * @type {Record<string, string>}
 */

export const FIELD_NOUNS = {
  title: 'le titre',
  emoji: 'l’émoji',
  name: 'le nom',
  description: 'la description',
  summary: 'le résumé',
  body: 'le contenu',
  notes: 'les notes',
  minutes: 'le compte-rendu',
  introduction: 'l’introduction',
  outro: 'la conclusion',
  dueDate: 'l’échéance',
  deadline: 'la deadline',
  startsAt: 'le début',
  endsAt: 'la fin',
  scheduledAt: 'la date',
  publishedAt: 'la date de publication',
  durationMin: 'la durée',
  allDay: 'la journée entière',
  ownerId: 'le responsable',
  accountId: 'le membre concerné',
  subjectId: 'le membre concerné',
  leadId: 'le responsable',
  leadIds: 'les responsables',
  assistantIds: 'les assistants',
  stateId: 'l’état',
  statusId: 'le statut',
  priorityId: 'la priorité',
  youtuberId: 'le YouTubeur',
  projectId: 'le projet',
  platformId: 'la plateforme',
  divisionId: 'la division',
  functionId: 'la fonction',
  primaryFunctionId: 'la fonction principale',
  secondaryFunctionId: 'la fonction secondaire',
  templateId: 'le modèle',
  kind: 'le type',
  accent: 'la couleur',
  colour: 'la couleur',
  visibility: 'la visibilité',
  role: 'le rôle',
  email: 'le mail',
  phone: 'le téléphone',
  birthday: 'la date de naissance',
  timezone: 'le fuseau horaire',
  languages: 'les langues',
  avatarUrl: 'la photo de profil',
  celebrateBirthday: 'l’anniversaire dans l’équipe',
} as const

/**
 * Building blocks
 * @type {Record<string, string>}
 */

export const CHANGE_COPY = {
  // Past participles
  verbAdded: 'ajouté',
  verbRemoved: 'retiré',
  verbReplaced: 'remplacé',
  verbSet: 'renseigné',
  verbChanged: 'modifié',
  verbCleared: 'vidé',
  verbEnabled: 'activé',
  verbDisabled: 'désactivé',
  // Rest of the sentence
  restEmojiAdded: 'l’émoji {value} au titre',
  restEmojiRemoved: 'l’émoji du titre',
  restEmojiReplaced: 'l’émoji du titre par {value}',
  restSet: '{noun} sur « {value} »',
  restSetPlain: '{noun}',
  restChanged: '{noun} en « {value} »',
  restChangedPlain: '{noun}',
  restCleared: '{noun}',
  restToggle: '{noun}',
  // List joiners for a multi-field edit
  listSeparator: ', ',
  listLast: ' et ',
  listOverflow: '{shown} et {count} autres champs',
  // Longest a quoted value gets before it is cut
  valueMaxLength: 40,
  ellipsis: '…',
  toggleOn: 'activée',
  toggleOff: 'désactivée',
} as const
