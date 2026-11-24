/**
 * Ways Memora talks about a live that asks for the member
 * @type {Record<string, readonly string[]>}
 */

export const LIVE_VARIANTS = {
  // A live asks for the member's availability, the bubble says it and so does the first line
  bubbleAsk: [
    'Les Responsables ont besoin de connaître tes disponibilités pour le live {title}, tu es disponible ?',
    'Pour le live {title}, les Responsables aimeraient savoir si tu es disponible, tu peux nous dire ?',
  ],
  // Any other event that calls the roll
  bubbleEvent: [
    'Tu as été positionné sur {title}, tu es présent ?',
    'On compte sur toi pour {title}, tu seras là ?',
  ],
  until: ['D’accord ! Tu seras là de quand à quand ?', 'Super ! Confirme-moi tes horaires.'],
  undecided: [
    'Pas de souci, prends ton temps. Je te reposerai la question un peu plus tard.',
    'D’accord, tu me diras quand tu sauras, je te redemande plus tard.',
  ],
  sentYes: [
    'Ok, je leur transmets !',
    'C’est noté, je préviens l’équipe.',
    'Parfait, je leur transmets ta présence.',
    'Merci ! J’en informe les responsables.',
  ],
  sentNo: [
    'Pas de souci, je leur transmets.',
    'C’est noté, je préviens l’équipe que tu n’es pas là.',
    'D’accord, je leur dis que ça ne sera pas possible.',
    'Compris, je leur transmets ton absence.',
  ],
  // For the ones who run the live
  declared: [
    '{name} a déclaré être présent ce soir pour {title} !',
    '{name} sera là pour {title} !',
    'Bonne nouvelle : {name} confirme sa présence pour {title}.',
  ],
  fullList: [
    'Tu veux la liste complète ?',
    'Je te donne la liste complète ?',
    'Tu veux voir où en est toute l’équipe ?',
  ],
  listIntro: [
    'Voilà où en est l’équipe pour {title} :',
    'Voici le point sur {title} :',
    'Pour {title}, ça donne ça :',
  ],
  remind: [
    'Est-ce que tu veux qu’on relance les non-réponses ? Cela leur enverra une notification Push !',
    'Je relance ceux qui n’ont pas répondu ? Ils recevront une notification Push.',
    'Tu veux que je relance les non-réponses ? Ils auront une notification Push.',
  ],
  reminded: [
    'C’est parti, je les ai relancés.',
    'Relance envoyée !',
    'Voilà, ils viennent d’être relancés.',
  ],
  tooSoon: [
    'Ils ont déjà été relancés il y a peu, laissons-leur un peu de temps.',
    'Une relance vient de partir, on attend un peu avant la suivante.',
  ],
  nobodyWaiting: [
    'Tout le monde a répondu, rien à relancer.',
    'Plus personne n’est en attente de réponse.',
  ],
  groupPresent: 'Les modos présents',
  groupAbsent: 'Les modos absents',
  groupPending: 'Ceux qui n’ont pas répondu présent',
  groupLeave: 'Ceux sous absence déclarée',
} as const
