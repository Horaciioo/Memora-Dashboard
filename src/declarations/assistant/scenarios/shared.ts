/**
 * Lines every guided talk shares
 * @type {Record<string, string>}
 */

export const SCENARIO_COPY = {
  yes: 'Oui',
  no: 'Non',
  cancelled: 'Pas de souci, on arrête là. Je reste dispo.',
  notUnderstood: 'Je n’ai pas bien compris. Choisis une des réponses, ou écris-la autrement.',
  periodUnreadable:
    'Je n’arrive pas à lire cette période. Essaie « du 3 au 14 décembre » ou « pendant 2 semaines », ou clique dans le calendrier.',
  periodConfirm: 'Valider ces jours',
  periodHint: 'Clique le premier jour, puis le dernier.',
  periodPick: 'Choisir dans le calendrier',
  percentGo: 'Valider',
  percentUnreadable: 'Je n’ai pas lu de pourcentage. Écris un nombre, par exemple 60.',
  multiGo: 'Valider',
  searchGo: 'Rechercher',
  textPlaceholder: 'Ta réponse…',
  thinking: 'Memora réfléchit',
  failed: 'Je n’ai pas pu le faire : {error}',
  offline:
    'Je n’arrive pas à joindre Memora. Réessaie dans un instant, rien n’a été fait en double.',
} as const
