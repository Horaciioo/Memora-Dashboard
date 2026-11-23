/**
 * Ways Memora says she waits while the member handles a point on the page
 * @type {Record<string, readonly string[]>}
 */

export const GUIDE_VARIANTS = {
  waiting: [
    'Je reste là, fais-le à ton rythme.',
    'Prends ton temps, je ne bouge pas.',
    'Dis-moi quand c’est bon.',
    'Je t’attends ici, tout est devant toi.',
    'Vas-y, je regarde par-dessus ton épaule.',
    'Quand tu as terminé, je prends la suite.',
    'Pas de pression, je suis à côté.',
  ],
  elsewhere: [
    'Je ne vois pas où ça se passe, mais la page est ouverte.',
    'Je n’ai pas retrouvé l’élément, regarde sur cette page.',
    'Cherche de ce côté, je ne peux pas te le montrer du doigt.',
  ],
} as const
