/**
 * What Memora says while she updates a candidate with a member
 * @type {Record<string, string>}
 */

export const CANDIDATE_SCENARIO_COPY = {
  who: 'De quel candidat veux-tu parler ?',
  whoHint: 'Un pseudo, un nom ou un identifiant Discord',
  whoNone: 'Je ne trouve personne avec « {text} ». On essaie autrement ?',
  whoMany: 'J’en vois plusieurs, c’est lequel ?',
  whoTooMany:
    'Il y en a beaucoup, je t’en montre {shown}. Si ce n’est pas lui, précise ta recherche.',
  whoOther: 'Chercher quelqu’un d’autre',
  picked: 'Noté, on met quoi à jour sur {name} ?',
  again: 'C’est à jour ! On met autre chose à jour sur {name} ?',
  finished: 'Parfait, {name} est à jour. Je reste dispo.',
  // On the file of a candidate
  fileAsk: 'Je peux t’aider avec {name} ?',
  fileNo: 'D’accord, je reste dispo si tu changes d’avis.',
  fileWhich: 'Qu’est-ce qu’on met à jour ?',
  fileGo: 'Parfait, on les prend une par une.',
  fileDone: 'C’est tout bon, {name} est à jour.',
  noted: 'C’est noté !',
  // Properties
  interviewAt: 'Entretien',
  recruiters: 'Recruteurs',
  observers: 'Observateurs',
  outcome: 'Colonne',
  attended: 'Présence',
  displayName: 'Pseudo',
  formId: 'Formulaire',
  discordId: 'Identifiant Discord',
  done: 'C’est tout',
  empty: 'à renseigner',
  nobody: 'personne',
  present: 's’est présenté',
  absent: 'absent',
  // Asking each property
  interviewAsk: 'Quand a lieu l’entretien ?',
  interviewHint: 'Par exemple « demain 20h30 » ou « le 12 à 18h ». Écris « aucun » pour l’enlever.',
  interviewUnreadable:
    'Je n’arrive pas à lire cette date. Essaie « vendredi 20h30 », avec le jour et l’heure.',
  interviewNoTime: 'J’ai le jour, mais pas l’heure. À quelle heure ?',
  attendedAsk: 'Il s’est présenté à l’entretien ?',
  outcomeAsk: 'Dans quelle colonne on le met ?',
  outcomeNone: 'Aucune colonne',
  textAsk: 'Quel est le nouveau {field} ? Écris « aucun » pour l’enlever.',
  idAsk: 'Quel est le nouvel identifiant Discord ?',
  seatsAsk: '{field} : qui retire-t-on, ou qui ajoute-t-on ?',
  seatsAdd: 'Ajouter quelqu’un',
  seatsAddAsk: 'Qui ajoute-t-on ?',
  seatsAddNone: 'Je ne trouve personne avec « {text} ». On essaie autrement ?',
  seatsRemove: 'Retirer {name}',
  seatsTooMany: 'Il y en a beaucoup, précise ta recherche.',
} as const
