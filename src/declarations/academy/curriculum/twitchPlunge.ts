import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'

/**
 * Opening scene of the Twitch course, played before anything is explained
 * @type {Extract<ExerciseBlock, { kind: 'plunge' }>}
 */

export const TWITCH_PLUNGE: Extract<ExerciseBlock, { kind: 'plunge' }> = {
  kind: 'plunge',
  key: 'plunge-nyra',
  title: 'Un soir chez Nyra',
  context:
    'Nyra est en plein live, un boss difficile l’attend. Tu es modérateur, tu viens d’arriver et le chat défile déjà. Pas de consigne, pas de règle : fais ce que tu ferais. Touche un message pour agir dessus, ou laisse-le passer.',
  streamer: 'Nyra',
  messages: [
    {
      key: 'lyra-saut',
      line: { author: 'Lyra', text: 'ahah il a encore raté le saut, c’est le 5e', role: 'viewer' },
      verdict: 'leave',
      why: 'Elle se moque du jeu, et Nyra en rit elle-même depuis le début du live. Une blague sur une partie n’est pas une attaque.',
    },
    {
      key: 'tim-classement',
      line: {
        author: 'Tim',
        text: 'MALO TU M’AS VOLÉ MA PLACE AU CLASSEMENT ☠️☠️',
        role: 'vip',
      },
      verdict: 'leave',
      why: 'Des majuscules et des têtes de mort entre habitués : c’est de la joie, pas du bruit.',
    },
    {
      key: 'zorka-pique',
      line: {
        author: 'Zorka',
        text: 't’as jamais passé ce boss Lyra, arrête de commenter',
        role: 'viewer',
      },
      verdict: 'split',
      why: 'Deux habitués qui se chambrent depuis des mois, ou une pique qui blesse ? L’équipe n’est pas d’accord, et c’est normal. Ce qui compte, c’est de regarder comment Lyra répond.',
    },
    {
      key: 'lyra-reponse',
      line: {
        author: 'Lyra',
        text: 'mdr Zorka je t’ai vu galérer dessus hier aussi 😂',
        role: 'viewer',
      },
      verdict: 'leave',
      why: 'La réponse de Lyra montre que tout allait bien. Un geste sur la pique précédente l’a fait taire pour rien.',
      reaction: {
        after: 'zorka-pique',
        acted: { author: 'Lyra', text: 'ok… je vais me taire alors', role: 'viewer' },
        left: {
          author: 'Lyra',
          text: 'mdr Zorka je t’ai vu galérer dessus hier aussi 😂',
          role: 'viewer',
        },
      },
    },
    {
      key: 'paul-jeu',
      line: { author: 'Paul_bzh', text: 'salut, c’est quoi le jeu ?', role: 'viewer' },
      verdict: 'leave',
      why: 'Un nouveau qui pose une question. Il mérite une réponse d’un modérateur, pas un geste.',
    },
    {
      key: 'kiri-physique',
      line: {
        author: 'Kiri',
        text: 'vous avez vu la tête de Mila hier en vocal ? elle devrait pas se montrer',
        role: 'viewer',
      },
      verdict: 'act',
      why: 'C’est une moquerie sur le physique d’une personne du chat. Piquer le jeu, c’est permis ; viser quelqu’un, non. C’est ici que la limite passe.',
    },
    {
      key: 'dexo-meute',
      line: { author: 'Dexo_77', text: 'Kiri t’as raison lol elle est moche', role: 'viewer' },
      verdict: 'act',
      why: 'Il rebondit et lance la meute : c’est le début d’un harcèlement. Plus on attend, plus ça s’installe.',
    },
    {
      key: 'mila-depart',
      line: {
        author: 'Mila',
        text: 'bon je vais y aller, bonne soirée à tous',
        role: 'viewer',
      },
      verdict: 'leave',
      why: 'Mila a lu les messages qui parlaient d’elle. Un viewer qui part sans bruit, c’est le coût que personne ne voit.',
      reaction: {
        after: 'kiri-physique',
        acted: {
          author: 'Mila',
          text: 'merci les modos, j’ai failli partir 🙏',
          role: 'viewer',
        },
        left: {
          author: 'Mila',
          text: 'bon je vais y aller, bonne soirée à tous',
          role: 'viewer',
        },
      },
    },
    {
      key: 'nyra-coeurs',
      line: {
        author: 'Nyra',
        text: 'BOSS TOMBÉ !! Allez les cœurs si vous êtes contents !',
        role: 'creator',
      },
      verdict: 'leave',
      why: 'La streameuse le demande elle-même.',
    },
    {
      key: 'coeurs-rafale',
      line: {
        author: 'Lyra',
        text: '❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️',
        role: 'viewer',
      },
      verdict: 'leave',
      why: 'Une rafale qui répond à une demande de Nyra est de l’euphorie. On l’aurait traitée autrement hors de ce moment.',
    },
    {
      key: 'jarvis-critique',
      line: { author: 'Jarvis_44', text: 'nul ce stream, je me désabonne', role: 'viewer' },
      verdict: 'leave',
      why: 'Une critique sans insulte. Elle vit de l’attention qu’on lui donne : on ne répond pas, on laisse.',
    },
    {
      key: 'shop-viewers',
      line: {
        author: 'Follows_Shop',
        text: 'achète des viewers pas chers sur follow-boost.example',
        role: 'viewer',
      },
      verdict: 'act',
      why: 'Une publicité pour acheter des viewers. C’est le cas simple : on agit sans hésiter.',
    },
  ],
  lessons: [
    {
      glyph: 'rule',
      title: 'Viser quelqu’un',
      body: 'Piquer est permis, une moquerie sur une personne ne l’est pas. C’est la limite de l’équipe.',
      tone: 'danger',
    },
    {
      glyph: 'hidden',
      title: 'Laisser, c’est agir',
      body: 'Laisser passer est un vrai choix. Trop intervenir refroidit le chat autant que trop peu l’enflamme.',
      tone: 'info',
    },
    {
      glyph: 'livecon',
      title: 'Le contexte décide',
      body: 'Le même message passe un soir calme et pas un soir de drama. C’est le rôle du Livecon, on y vient.',
      tone: 'brand',
    },
  ],
}
