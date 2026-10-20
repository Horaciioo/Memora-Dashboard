/**
 * Copy shared by every thread of remarks
 * @type {Record<string, string>}
 */

export const COMMENT_COPY = {
  title: 'Commentaires',
  add: 'Écrire un commentaire',
  emptyTitle: 'Aucun commentaire',
  emptyDescription: 'Consigne ici ce qui mérite d’être retenu.',
  deleteTitle: 'Supprimer ce commentaire ?',
  deleteDescription: 'Il ne sera plus lisible par personne.',
  field: 'Commentaire',
  placeholder: 'Écris ton commentaire…',
  hint: 'Markdown accepté, @ pour mentionner, Ctrl + Entrée pour publier.',
  publish: 'Publier',
  markUnread: 'Marquer comme non lu',
  noMention: 'Personne ne correspond',
} as const
