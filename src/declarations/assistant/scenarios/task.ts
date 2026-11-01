/**
 * What Memora says while she updates a task with a member
 * @type {Record<string, string>}
 */

export const TASK_SCENARIO_COPY = {
  who: 'De quelle tâche veux-tu parler ?',
  whoHint: 'Un bout du titre suffit',
  whoNone: 'Je ne trouve aucune tâche avec « {text} ». On essaie autrement ?',
  whoMany: 'J’en vois plusieurs, c’est laquelle ?',
  whoOther: 'Chercher une autre tâche',
  picked: 'Noté, on met quoi à jour sur « {name} » ?',
  again: 'C’est à jour ! On met autre chose à jour sur « {name} » ?',
  finished: 'Parfait, « {name} » est à jour. Je reste dispo.',
  noted: 'C’est noté !',
  // On the file of a task
  fileAsk: 'Je peux t’aider avec « {name} » ?',
  fileNo: 'D’accord, je reste dispo si tu changes d’avis.',
  fileWhich: 'Qu’est-ce qu’on met à jour ?',
  fileGo: 'Parfait, on les prend une par une.',
  fileDone: 'C’est tout bon, « {name} » est à jour.',
  // Properties
  title: 'Titre',
  description: 'Description',
  ownerId: 'Responsable',
  projectId: 'Projet',
  youtuberIds: 'Créateurs',
  stateId: 'État',
  priorityId: 'Priorité',
  dueDate: 'Échéance',
  done: 'C’est tout',
  empty: 'à renseigner',
  nobody: 'personne',
  written: 'rédigée',
  // Asking each property
  textAsk: 'Quel est le nouveau {field} ? Écris « aucun » pour l’enlever.',
  titleAsk: 'Quel est le nouveau titre ?',
  dateAsk: 'Pour quand est la tâche ?',
  dateHint: 'Par exemple « demain », « vendredi » ou « le 12 ». Écris « aucune » pour l’enlever.',
  dateUnreadable: 'Je n’arrive pas à lire cette date. Essaie « vendredi » ou « dans 3 jours ».',
  pickAsk: 'Quel est le nouveau {field} ?',
  pickNone: 'Aucun',
  pickSearch: 'Il y a beaucoup de choix, tape un bout du nom.',
  pickEmpty: 'Je ne trouve personne avec « {text} ». On essaie autrement ?',
  pickTooMany: 'Il y en a beaucoup, précise ta recherche.',
  multiAsk: '{field} : qui retire-t-on, ou qui ajoute-t-on ?',
  multiAdd: 'Ajouter',
  multiRemove: 'Retirer {name}',
} as const
