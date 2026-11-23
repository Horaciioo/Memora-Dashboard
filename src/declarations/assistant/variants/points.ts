/**
 * Ways Memora tells one point of the recap, drawn so the talk never repeats itself
 * @type {Record<string, readonly string[]>}
 */

export const POINT_VARIANTS = {
  // Between two points, so the talk reads as one thread
  next: [
    'Passons au suivant.',
    'On continue.',
    'Autre chose maintenant.',
    'Ensuite, il y a ça.',
    'Je te montre la suite.',
    'Allez, le point d’après.',
    'Un autre sujet qui t’attend.',
  ],
  last: ['Dernier point.', 'Et pour finir.', 'Le tout dernier.', 'Il ne reste plus que celui-là.'],
  // One absence waiting for the member
  absenceOne: [
    '{name} a posé une absence {range}. Tu valides ?',
    'Il y a une demande d’absence de {name}, {range}. Qu’est-ce que tu en dis ?',
    'Côté absences, {name} attend ton avis pour {range}.',
    '{name} demande à s’absenter {range}. Tu valides ?',
    '{name} a prévenu d’une absence {range}. Tu t’en occupes ?',
    'Tu as une absence à traiter : {name}, {range}. Tu valides ?',
  ],
  absenceReason: [
    'Le motif donné : {reason}.',
    'Il précise : {reason}.',
    'Raison indiquée : {reason}.',
  ],
  // Several absences waiting
  absenceMany: [
    '{count} absences attendent ton avis : {names}. Tu veux faire quoi ?',
    'Il y a {count} demandes d’absence en attente, celles de {names}. Comment on s’y prend ?',
    'Tu as {count} absences à traiter, de {names}. Tu préfères tout régler d’un coup ?',
    '{names} ont chacun posé une absence, ça fait {count} en tout. On en fait quoi ?',
  ],
  // The member chooses which ones
  pick: [
    'D’accord ! Dans ce cas, sélectionne ceux dont tu souhaites t’occuper :',
    'Très bien, choisis celles dont tu veux t’occuper :',
    'Ok, coche les absences à traiter :',
    'Pas de souci, dis-moi lesquelles tu prends :',
  ],
  verdict: [
    'Et tu veux en faire quoi ?',
    'Je les valide ou je les refuse ?',
    'Qu’est-ce que je fais de celles-là ?',
    'Tu me dis : je valide ou je refuse ?',
  ],
  // Done in the member's place
  approved: [
    'C’est validé.',
    'Voilà, c’est validé.',
    'Fait, je l’ai validée.',
    'C’est noté, validé.',
  ],
  approvedMany: [
    'Je les ai toutes validées.',
    'C’est fait, elles sont toutes validées.',
    'Voilà, tout est validé.',
  ],
  refused: [
    'C’est refusé.',
    'Voilà, c’est refusé.',
    'Fait, je l’ai refusée.',
    'C’est noté, refusé.',
  ],
  refusedMany: [
    'Je les ai toutes refusées.',
    'C’est fait, elles sont toutes refusées.',
    'Voilà, tout est refusé.',
  ],
  // Some are left
  stillMany: [
    'Il en reste {count}. On continue ?',
    'Il y en a encore {count} en attente. Tu veux faire quoi ?',
    'Encore {count} à voir, qu’est-ce que tu décides ?',
  ],
  // Nothing left to do
  nothing: [
    'Il n’y a plus rien à traiter ici.',
    'Tout est réglé de ce côté.',
    'Plus rien en attente, c’est propre.',
  ],
} as const
