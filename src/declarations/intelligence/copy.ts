/**
 * Words of the Memora Intelligence page
 * @type {Record<string, string | readonly string[]>}
 */

export const INTELLIGENCE_COPY = {
  pageTitle: 'Memora Intelligence',
  // One per day, so the page greets the same way all day
  titles: [
    'On repart, {name}',
    'Content de te voir, {name}',
    'Par quoi on commence, {name} ?',
    'Je suis là, {name}',
    'Qu’est-ce qu’on fait, {name} ?',
  ],
  placeholder: 'Comment puis-je t’aider aujourd’hui ?',
  send: 'Envoyer',
  agendaTitle: 'Ton récap',
  recapTitle: 'Ton récap',
  recapLead:
    'Memora te résume ce que tu as manqué depuis ta dernière visite : tâches, absences, événements, lives, débans.',
  recapSteps: [
    'Elle classe ce qui te demande quelque chose en premier.',
    'Elle peut faire à ta place les gestes les plus courants.',
    'Ce que tu ne traites pas reste ici, tu peux y revenir quand tu veux.',
  ],
  recapStart: 'Voir ce que j’ai manqué',
  recapEmpty: 'Rien à rattraper pour le moment.',
  recapMore: 'Voir la suite',
} as const
