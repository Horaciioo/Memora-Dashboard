/**
 * What Memora says while she opens a recruitment with a member
 * @type {Record<string, string>}
 */

export const RECRUITMENT_SCENARIO_COPY = {
  offer: 'On recrute des p’tits nouveaux ?',
  offerYes: 'Avec plaisir, on ouvre ça ensemble !',
  offerNo: 'D’accord, pas de recrutement. Je reste là si tu changes d’avis.',
  creatorAsk: 'Pour quel créateur ?',
  creatorNone: 'Je ne vois aucun créateur pour lequel tu peux ouvrir un recrutement.',
  jobAsk: 'Pour quel poste ?',
  jobNone: 'Je ne trouve aucun poste ouvert au recrutement pour {creator}.',
  periodAsk:
    'Quelles sont les dates du recrutement ? Le premier jour est l’ouverture, le dernier la clôture.',
  periodPast: 'Ces jours sont déjà passés. On en choisit d’autres ?',
  periodNoted: 'C’est noté, {range}.',
  recap: 'Je récapitule : {job} pour {creator}, {range}.',
  recapAsk: 'Je lance ?',
  launch: 'Lancer',
  redo: 'Changer quelque chose',
  done: 'C’est fait ! Voici le recrutement :',
  draft:
    'Il est en brouillon : tu pourras régler les étapes et l’équipe avant de l’ouvrir aux candidats.',
} as const
