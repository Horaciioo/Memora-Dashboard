/**
 * Words of the Memora Intelligence page
 * @type {Record<string, string | readonly string[]>}
 */

export const INTELLIGENCE_COPY = {
  pageTitle: 'Memora Intelligence',
  // One per day within the pool of the hour, so the page greets the same way all day
  titles: [
    'On repart, {name}',
    'Content de te voir, {name}',
    'Par quoi on commence, {name} ?',
    'Je suis là, {name}',
    'Qu’est-ce qu’on fait, {name} ?',
    'Une envie de productivité, {name} ?',
    'Besoin d’aide, {name} ?',
    'On bosse dur, {name} ?',
    'Prêt à avancer, {name} ?',
    'Un petit coup de main, {name} ?',
    'On s’y met, {name} ?',
    'Quoi de neuf, {name} ?',
    'Heureuse de te retrouver, {name}',
    'À ton service, {name}',
    'Alors, {name}, on s’organise ?',
    'Du pain sur la planche, {name} ?',
  ],
  // Small hours, until 5h
  titlesNight: [
    'Un couche-tard, {name} ?',
    'Encore debout, {name} ?',
    'Les yeux ouverts, {name} ?',
    'La nuit porte conseil, {name}',
    'Une nuit studieuse, {name} ?',
  ],
  // Early hours, from 5h to 8h
  titlesEarly: [
    'Un lève-tôt, {name} !',
    'Déjà là, {name} ?',
    'Le café est prêt, {name} ?',
    'Bien dormi, {name} ?',
    'Un matin productif, {name} ?',
  ],
  placeholder: 'Comment puis-je t’aider aujourd’hui ?',
  notice:
    'Memora Intelligence est en phase expérimentale et n’est pas finie. Elle peut faire des erreurs.',
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
