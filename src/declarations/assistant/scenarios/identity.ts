/**
 * What Memora says to a Responsable when a candidate cannot find their identifier
 * @type {Record<string, string>}
 */

export const IDENTITY_SCENARIO_COPY = {
  hello: 'Salut {name}, un candidat n’arrive pas à trouver son ID et nécessite ton intervention.',
  explain:
    'Je te laisse prendre contact avec lui, donne-moi l’identifiant et je te fais générer un lien qui lui permet de l’entrer et de poursuivre son parcours.',
  ask: 'Écris-moi simplement son identifiant Discord, je te le fais valider.',
  // The case already handled by someone
  gone: 'Quelqu’un s’en est déjà occupé, merci quand même.',
  // The typed identifier is not one
  unreadable:
    'Ce n’est pas un identifiant Discord : il compte entre 17 et 20 chiffres. Tu peux le réécrire ?',
  checking: 'Je regarde qui se cache derrière cet identifiant.',
  confirm: 'Est-ce bien de lui dont on parle ?',
  yes: 'Oui, c’est lui',
  no: 'Non, ce n’est pas lui',
  retry: 'Dans ce cas, donne-moi le bon.',
  // Several accepted applications could be his
  which: 'À quelle candidature je le rattache ?',
  none: 'Je ne trouve aucune candidature acceptée à laquelle le rattacher. Vérifie que les comptes du recrutement sont activés.',
  adding: 'Très bien, je l’ajoute !',
  link: 'Voici son lien : {url}',
  warning:
    'Attention, il s’agit d’un lien unique, propre à cet identifiant : toute entrée extérieure à cet ID recevra un refus.',
  copy: 'Copier le lien',
  copied: 'C’est copié, tu peux lui envoyer.',
  done: 'Terminé',
  bye: 'Parfait, je reste dispo si besoin.',
} as const
