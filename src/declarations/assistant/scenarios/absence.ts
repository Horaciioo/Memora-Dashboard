/**
 * What Memora says while she walks a member through their absences
 * @type {Record<string, string>}
 */

export const ABSENCE_SCENARIO_COPY = {
  // Reply when a typed sentence opens the talk
  openCreate: 'Avec plaisir, on la pose ensemble.',
  openEdit: 'Pas de souci, on la modifie ensemble.',
  openDelete: 'D’accord, on regarde ça ensemble.',
  openList: 'Je regarde tes absences.',
  offer: 'On te fait une absence aujourd’hui ?',
  offerYes: 'D’accord !',
  offerNo: 'D’accord, pas d’absence. Je reste là si tu changes d’avis.',
  period: 'Quelle est la période ?',
  periodAgain: 'Quelle est la nouvelle période ?',
  periodPast: 'Ces jours sont déjà passés. On en choisit d’autres ?',
  periodTooLong:
    'Ça fait {days} jours, et une absence ne peut pas dépasser {max} jours (6 mois). Je ne peux pas la poser comme ça. On raccourcit ?',
  periodTooShort:
    'Ça fait {days} jours. En dessous de {min} jours, tu n’as pas besoin de poser d’absence : profite, fais ce que tu as à faire. Tu peux seulement prévenir tes responsables ou ton équipe si tu veux.',
  periodTaken: 'Tu as déjà une absence {range}, ça se chevauche.',
  periodOther: 'Autre période',
  periodGiveUp: 'Laisser tomber',
  periodEditThat: 'Modifier celle-là',
  periodNoted: 'C’est noté ! Ça fait {days} jours, {range}.',
  reasonAsk: 'Une raison ?',
  reasonWhich: 'D’accord, laquelle ?',
  reasonHint: 'C’est facultatif, tu n’es pas obligé(e) de te justifier.',
  reasonTooLong: 'C’est un peu long, {max} caractères maximum. Tu peux la raccourcir ?',
  done: 'C’est fait ! Voici ton absence :',
  sentToTeam:
    'Elle est envoyée à tes responsables, tu seras prévenu(e) dès qu’elle est prise en compte.',
  // Listing
  listIntro: 'Voici tes absences à venir ou en cours :',
  listNone: 'Tu n’as aucune absence à venir ou en cours.',
  listLine: '{range}, {days} jours, {status}',
  listMore: 'Je t’en montre {shown}, les autres sont sur la page.',
  listNext: 'Je peux faire autre chose pour tes absences ?',
  menuCreate: 'Poser une absence',
  menuEdit: 'Modifier une absence',
  menuDelete: 'Supprimer une absence',
  menuNothing: 'Non, merci',
  menuBye: 'Parfait, je reste dispo.',
  // Editing
  editNone: 'Tu n’as aucune absence à modifier : seules celles en cours ou à venir peuvent bouger.',
  editNoneOffer: 'On en pose une ?',
  editWhich: 'Laquelle on modifie ?',
  editOnly: 'Tu as une absence {range}.',
  editWhat: 'Qu’est-ce qu’on change ?',
  editDates: 'Les dates',
  editReason: 'La raison',
  editNothing: 'Rien finalement',
  editReasonNew: 'Quelle est la nouvelle raison ? Écris « aucune » pour l’enlever.',
  editDone: 'C’est modifié ! Voici ton absence :',
  editReopened: 'Comme les dates ont changé, tes responsables la reprennent en compte.',
  // Deleting
  deleteNone: 'Tu n’as aucune absence à supprimer : seules celles en cours ou à venir comptent.',
  deleteWhich: 'Laquelle on supprime ?',
  deleteSure: 'Tu veux vraiment retirer l’absence {range} ?',
  deleteYes: 'Oui, la retirer',
  deleteKeep: 'Non, je la garde',
  deleteDone: 'C’est fait, l’absence {range} est retirée.',
  deleteKept: 'D’accord, je ne touche à rien.',
  // Statuses
  statusPending: 'envoyée',
  statusApproved: 'prise en compte',
  statusRefused: 'refusée',
  statusCancelled: 'annulée',
} as const
