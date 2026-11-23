/**
 * Ways Memora opens and closes the recap, drawn so it never opens the same way twice
 * @type {Record<string, readonly string[]>}
 */

export const RECAP_VARIANTS = {
  // Said from her button when the member is not on her page
  waiting: [
    'Je t’ai gardé ce que tu as manqué dans Memora Intelligence.',
    'Ton récap t’attend dans Memora Intelligence.',
    'Passe me voir, j’ai préparé ce que tu as manqué.',
  ],
  // What Memora says on a card, by what she can do for the member
  cardTask: [
    'Tu veux que je la marque faite ?',
    'Si c’est réglé, je peux la cocher pour toi.',
    'C’est fait de ton côté ? Je la marque.',
  ],
  cardEvent: [
    'Tu seras là ? Je réponds pour toi.',
    'Dis-moi si tu viens, je préviens.',
    'Je peux confirmer ta présence, ou ton absence.',
  ],
  cardUnban: [
    'Je peux prendre cette demande à ta place.',
    'Tu t’en occupes ? Je te l’assigne.',
    'Cette demande attend quelqu’un, je t’y mets ?',
  ],
  cardOpen: [
    'Je t’emmène voir ça si tu veux.',
    'Tu veux que je te montre où c’est ?',
    'Je t’y conduis, dis-moi.',
  ],
} as const
