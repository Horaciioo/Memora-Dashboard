import {
  DELTA_RUNS,
  FOXTROT_NODES,
  FOXTROT_OPENING,
  SUPPORT_GUIDE_STEPS,
} from '@/declarations/academy/curriculum/scenes/supportScenes'
import type { Course, DiscordExampleLine } from '@/declarations/academy/curriculum/types'
import { author } from '@/declarations/replicas/discordKit'

// Moderator writing the examples
const MODO = author('modo', { name: 'MODO', glyph: 'shield', colour: '#dfa5ae' })

/**
 * One example line written by the moderator
 * @param {string} text - Message
 * @return {DiscordExampleLine[]} - Lines
 */

const modo = (text: string): DiscordExampleLine[] => [{ author: MODO, text }]

/**
 * Support and ticket handling
 * @type {Course}
 */

export const SUPPORT_TICKETS: Course = {
  key: 'support-prise-en-charge',
  name: 'Le support & la prise en charge',
  summary: 'Prendre en charge un Ticket du début à la fin, comme nous le voulons.',
  track: 'indispensable',
  surface: 'discord',
  functions: ['Discord'],
  minutes: 25,
  intro: {
    objective:
      'À l’issue de celle-ci, tu seras en mesure de prendre en charge des Tickets et agir comme nous le voulons.',
    outline:
      'Chaque chapitre contient des exercices, des cas d’étude par simulation, ou bien d’autres pratiques visant à concrétiser la théorie. Les chapitres sont courts. La formation a été écrite de sorte à ce que tu n’aies pas des pavés à lire.',
    feedback:
      'À la fin de ta formation, tu seras invité(e) à nous dire si cette formation t’a été utile ou non et si tu le souhaites : y laisser un commentaire constructif. Seuls les développeurs et les responsables verront ceci.',
    start: 'On entame cette 2nde formation ?',
  },
  chapters: [
    {
      key: 'trois-etapes',
      title: 'Les 3 étapes de prise en charge',
      blocks: [
        {
          kind: 'text',
          key: 'ticket-definition',
          body: '### Qu’est-ce qu’un « Ticket » ?\n\nAttaquons par le vif du sujet.\n\nUn ticket est une conversation privée entre un membre et l’équipe : c’est un espace dédié où la demande doit être suivie du début à la fin.',
        },
        {
          kind: 'callout',
          key: 'ticket-image',
          tone: 'warning',
          title: 'Attention',
          body: 'La qualité de cette prise en charge reflète directement l’image de l’équipe, même quand le membre est exigeant ou désagréable. La prise en charge repose toujours sur trois étapes : l’engagement, la prise en charge et la fermeture.',
        },
        {
          kind: 'text',
          key: 'engagement-intro',
          body: '## 1️⃣ L’engagement\n\nLe premier message est capital : il donne le ton et installe le cadre.\n\nOn entame toujours la conversation avec une formule polie. Un simple :',
        },
        {
          kind: 'discordExample',
          key: 'engagement-bonjour',
          verdict: 'good',
          lines: modo('Bonjour, comment puis-je t’aider ?'),
        },
        {
          kind: 'text',
          key: 'engagement-adapter',
          body: 'suffit à montrer professionnalisme et disponibilité.\n\nSi la demande est déjà claire, que le membre a déjà entamé la discussion, adapte-le en conséquence :',
        },
        {
          kind: 'discordExample',
          key: 'engagement-report',
          verdict: 'good',
          lines: modo('Bonjour. Je m’occupe de ton report de suite.'),
        },
        {
          kind: 'text',
          key: 'engagement-sec',
          body: 'À l’inverse, commencer de façon trop sèche ou familière décrédibilise immédiatement :',
        },
        {
          kind: 'discordExample',
          key: 'engagement-proscrire',
          verdict: 'bad',
          lines: modo('Ouais ? Tu veux quoi ?'),
        },
        {
          kind: 'text',
          key: 'engagement-posture',
          body: 'est à proscrire.\n\nMême si le membre ne fait pas l’effort de saluer, il reste indispensable de garder ce minimum de politesse. Un modérateur n’est ni un robot qui exécute froidement une tâche, ni un copain qui dépanne à la va-vite. Il incarne une posture équilibrée : disponible, clair et courtois.',
        },
        {
          kind: 'callout',
          key: 'engagement-bonjour-droit',
          tone: 'tip',
          title: 'Attention',
          body: 'Comme dit précédemment : tu n’es pas un robot, tu as le droit à ton bonjour. S’il ne le précise pas, n’hésite pas à lui rappeler que la politesse est gratuite (de manière chill ~~(ou pas)~~).',
        },
        {
          kind: 'text',
          key: 'prise-intro',
          body: '## 2️⃣ La prise en charge\n\nUne fois engagé, le ticket doit être traité rapidement.\n\nLes réponses doivent être claires, structurées et respectueuses. L’orthographe et les majuscules sont attendues, car elles traduisent du sérieux.\n\nÉviter le ton trop mécanique comme « Votre requête est en cours de traitement ». L’objectif est un ton humain, professionnel mais accessible.\n\nPar exemple :',
        },
        {
          kind: 'discordExample',
          key: 'prise-exemple',
          verdict: 'good',
          lines: modo(
            'Bien noté, je prends ta demande en charge. Peux-tu préciser le pseudo exact de la personne concernée ?'
          ),
        },
        {
          kind: 'text',
          key: 'prise-transmettre',
          body: 'Cette formulation est efficace : elle valide la prise en compte et demande une information précise.\n\nAucune prise en charge ne doit s’éterniser. Une demande doit être suivie jusqu’au bout ou transmise aux bonnes personnes. Si le sujet dépasse tes compétences ou nécessite une décision de l’administration, il faut prévenir le membre :',
        },
        {
          kind: 'discordExample',
          key: 'prise-transmission',
          verdict: 'good',
          lines: modo(
            'Ta demande va être transmise à l’administration, tu auras une réponse rapidement.'
          ),
        },
        {
          kind: 'text',
          key: 'prise-salon',
          body: 'Ensuite, direction le salon Serveur staff → `🔨 Modération` → `#discussion`. Là encore, la qualité du message transmis est cruciale. Une bonne formulation donne un contexte clair et exploitable :',
        },
        {
          kind: 'disclosure',
          key: 'prise-superieur',
          title: 'Contacter son supérieur',
          blocks: [
            {
              kind: 'discordExample',
              key: 'superieur-bon',
              verdict: 'good',
              lines: modo(
                'Hello @responsable, un membre (@Delta) a ouvert un ticket (#ticket-delta) pour contester son bannissement (ID infraction : 1042). Décision prise par un ancien modérateur il y a plusieurs mois. Quelle suite donner ?'
              ),
            },
            {
              kind: 'discordExample',
              key: 'superieur-mauvais',
              verdict: 'bad',
              caption: 'À éviter absolument',
              lines: modo('@responsable y’a un mec qui veut un débann, je fais quoi ?'),
            },
            {
              kind: 'text',
              key: 'superieur-pourquoi',
              body: 'Ce type de message ralentit la prise de décision et oblige le responsable à redemander toutes les informations manquantes.',
            },
          ],
        },
        {
          kind: 'text',
          key: 'fermeture-intro',
          body: '## 3️⃣ La fermeture du ticket\n\nUn ticket ne doit jamais être fermé sans que le membre **confirme** qu’il n’a plus de question. Fermer trop vite conduit à des réouvertures ou à un sentiment de mauvaise écoute. La règle est simple : demander explicitement.',
        },
        {
          kind: 'discordExample',
          key: 'fermeture-demander',
          verdict: 'good',
          lines: modo('Tout est bon pour toi ? Tu n’as plus de question ?'),
        },
        {
          kind: 'text',
          key: 'fermeture-conclure',
          body: 'permet de s’assurer que la demande est réellement terminée. Une fois validé, on peut conclure par une formule simple et cordiale :',
        },
        {
          kind: 'discordExample',
          key: 'fermeture-formule',
          verdict: 'good',
          lines: modo('D’accord, je te souhaite une bonne soirée.'),
        },
        {
          kind: 'text',
          key: 'fermeture-eviter',
          body: 'À éviter :',
        },
        {
          kind: 'discordExample',
          key: 'fermeture-proscrire',
          verdict: 'bad',
          lines: modo('Ok bah je ferme, tchao.'),
        },
        {
          kind: 'text',
          key: 'fermeture-image',
          body: 'Ce ton donne l’impression de se débarrasser du membre, ce qui nuit directement à l’image de l’équipe.',
        },
        {
          kind: 'keypoints',
          key: 'consignes',
          title: '⭐️ Consignes',
          points: [
            {
              glyph: 'chat',
              title: 'Poli et suivi',
              body: 'Chaque ticket doit rester poli, clair et suivi jusqu’au bout.',
            },
            {
              glyph: 'lead',
              title: 'Un responsable',
              body: 'Le droit du membre à demander l’intervention d’un responsable est inconditionnel, et il doit être respecté.',
              tone: 'caution',
            },
            {
              glyph: 'lock',
              title: 'Validation',
              body: 'Aucune fermeture ne se fait sans validation explicite.',
              tone: 'danger',
            },
            {
              glyph: 'shield',
              title: 'Crédibilité',
              body: 'Chaque prise en charge reflète la crédibilité de l’équipe. Bien gérer un ticket, c’est montrer que la Marsha Squad est attentive, organisée et digne de confiance.',
              tone: 'brand',
            },
            {
              glyph: 'spark',
              title: 'Tutoiement',
              body: 'On évite le vouvoiement, sauf demande explicite (ce qui est très rare).',
              tone: 'info',
            },
          ],
        },
      ],
    },
    {
      key: 'cas-courants',
      title: 'Les cas courants',
      blocks: [
        {
          kind: 'text',
          key: 'simulations-accroche',
          body: 'Je pense désormais que tu as suffisamment de connaissances.\n\nOn passe aux simulations ?',
        },
        {
          kind: 'compareRuns',
          key: 'delta',
          title: 'Delta',
          context:
            'Pour cet exercice, on va commencer en douceur : tu vas te trouver face à **Delta**. Tu vas visionner 3 cas différents et devras cliquer sur celui que tu trouves le plus adéquat.\n\nTu es prêt ? N’hésite pas, à gauche, à cliquer sur l’encoche pour faire apparaître le guide.',
          startLabel: 'Déclencher la simulation',
          guide: SUPPORT_GUIDE_STEPS,
          runs: DELTA_RUNS,
          question: 'Quelle prise en charge est la plus adéquate ?',
        },
        {
          kind: 'text',
          key: 'foxtrot-accroche',
          body: 'Nous allons entamer un second exercice.\n\nCelui-ci va être un petit peu plus dur.',
        },
        {
          kind: 'branching',
          key: 'foxtrot',
          title: 'Foxtrot',
          context:
            'Dans ce cas présent : **Foxtrot**, un habitué, qui n’a qu’une envie : créer des embrouilles.\n\nCette fois-ci, tu te trouves face à un cas pénible. Foxtrot a gagné un jeu concours, mais celui-ci est très insistant, à la fois sur son gain, mais cherche un peu la petite bête.',
          startLabel: 'Déclencher la simulation',
          guide: SUPPORT_GUIDE_STEPS,
          opening: FOXTROT_OPENING,
          root: 'insiste',
          nodes: FOXTROT_NODES,
        },
      ],
    },
  ],
}
