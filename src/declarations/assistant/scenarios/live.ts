/**
 * What Memora says while she plans or removes a live with a member
 * @type {Record<string, string>}
 */

export const LIVE_SCENARIO_COPY = {
  offer: 'Tu veux planifier un live, ou en supprimer un ?',
  create: 'Planifier un live',
  remove: 'Supprimer un live',
  leave: 'Rien pour l’instant',
  offerNo: 'D’accord, je reste dispo si tu changes d’avis.',
  platformAsk: 'Sur quelle plateforme ?',
  platformNone: 'Je ne trouve aucun modèle de live, il faut en configurer un dans le calendrier.',
  creatorAsk: 'Pour quel créateur ?',
  creatorNone: 'Tu n’as aucun créateur pour qui annoncer un live.',
  whenAsk: 'Quand commence-t-il ?',
  whenHint: 'Par exemple « demain 21h », « vendredi 20h30 » ou « le 12 à 19h ».',
  whenUnreadable: 'Je n’arrive pas à lire ce moment. Essaie « demain 21h » ou « vendredi 20h30 ».',
  timeAsk: 'À quelle heure ? Par exemple 21h ou 20h30.',
  lengthAsk: 'Combien de temps dure-t-il ?',
  recap: 'Je pose un live {platform} pour {creator}, {when}, pendant {length}.',
  recapAsk: 'C’est bon pour toi ?',
  title: 'Live {creator}',
  go: 'Planifier',
  redo: 'Recommencer',
  done: 'C’est fait, le live est planifié.',
  doneLink: 'Voir le live',
  removeNone: 'Aucun live à venir à supprimer.',
  removeWhich: 'Lequel supprime-t-on ?',
  removeSure:
    'Je supprime le live {platform} de {creator}, {when} ? Il disparaît aussi du calendrier.',
  removeYes: 'Oui, supprimer',
  removeKeep: 'Non, le garder',
  removeKept: 'D’accord, je le garde.',
  removeDone: 'C’est supprimé.',
} as const
