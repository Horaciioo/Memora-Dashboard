/**
 * What she says when no subject fits, the suggestions follow the line
 * @type {Record<'lost' | 'outside' | 'short', readonly string[]>}
 */

export const CHAT_FALLBACK = {
  // A sentence she cannot place
  lost: [
    'Celle-là m’échappe, {name}. Dis-la autrement, ou essaie par exemple :',
    'Je n’ai pas saisi. Je suis meilleure avec des phrases simples, comme :',
    'Hmm, je cherche et je ne trouve pas. Tu peux me demander par exemple :',
    'Là, tu me mets en difficulté. Voici ce que je sais faire :',
    'Je n’ai pas compris, mais je ne lâche pas. Essaie plutôt :',
    'Tu m’as perdue en route. Reprenons avec quelque chose comme :',
  ],
  // A question about the wider world
  outside: [
    'Ça sort de mon périmètre : je suis l’assistante de Memora, pas une encyclopédie. En revanche, je peux :',
    'Je n’ai pas la réponse, ce n’est pas mon rayon. Pour Memora, par contre, demande-moi :',
    'Bonne question, mais elle dépasse ce que je sais. Je suis forte sur ton équipe :',
    'Là, je ne peux pas t’aider, je reste dans l’univers de Memora. Par exemple :',
    'Je préfère ne pas inventer, ça ne fait pas partie de ce que je sais. Je peux faire :',
  ],
  // A word or two, nothing to hold on to
  short: [
    'Je t’écoute, mais je n’ai pas saisi. Précise un peu, ou essaie :',
    'Un peu court pour moi. Dis-m’en plus, ou choisis :',
    'Je vois à peu près, mais pas assez. Donne-moi un indice, par exemple :',
  ],
} as const
