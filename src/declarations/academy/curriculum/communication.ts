import type { Course } from '@/declarations/academy/curriculum/types'

/**
 * Communication and posture course, built on the warnings the reference panel gives
 * @type {Course}
 */

export const COMMUNICATION_POSTURE: Course = {
  key: 'communication-posture',
  name: 'La communication & la posture',
  summary:
    'Parler comme l’équipe, garder son calme face à la colère et formuler un avertissement qui passe.',
  track: 'indispensable',
  surface: 'general',
  functions: [],
  minutes: 30,
  chapters: [
    {
      key: 'posture',
      title: 'La posture du modérateur',
      blocks: [
        {
          kind: 'text',
          key: 'posture-text',
          body: 'Tu représentes **l’équipe** et le créateur à chaque message que tu écris. On te reconnaît à trois choses : tu restes **calme**, tu es **constant** d’un viewer à l’autre, et tu expliques **sans jamais attaquer** la personne.\n\nLe ton compte autant que la sanction : un viewer bien averti corrige son comportement, un viewer humilié s’en va ou revient pire.',
        },
        {
          kind: 'keypoints',
          key: 'posture-points',
          title: 'Ce qui te fait reconnaître',
          points: [
            {
              glyph: 'shield',
              title: 'Calme',
              body: 'Même face à un viewer agressif, ton ton ne monte pas.',
              tone: 'info',
            },
            {
              glyph: 'rule',
              title: 'Constant',
              body: 'La même mesure pour un habitué et pour un inconnu.',
              tone: 'brand',
            },
            {
              glyph: 'success',
              title: 'Sans attaque',
              body: 'Tu expliques la règle, tu ne juges jamais la personne.',
              tone: 'success',
            },
          ],
        },
        {
          kind: 'compare',
          key: 'posture-compare',
          title: 'La règle, pas la personne',
          good: {
            title: 'On dit',
            items: [
              '« Ce message n’est pas permis sur ce chat. »',
              'Une réponse **courte et calme**',
              'La **règle citée**, une seule fois',
            ],
          },
          bad: {
            title: 'On ne dit pas',
            items: [
              '« Tu es pénible. »',
              'De l’**ironie** devant le chat',
              'Un **débat** de plusieurs messages sur la sanction',
            ],
          },
        },
        {
          kind: 'sort',
          key: 'posture-sort',
          title: 'Ce qui aide, ce qui abîme',
          prompt: 'Classe ces attitudes.',
          buckets: [
            { key: 'good', label: 'À garder' },
            { key: 'bad', label: 'À éviter' },
          ],
          items: [
            {
              key: 'calm',
              label: 'Répondre calmement, même si le viewer est agressif',
              bucket: 'good',
            },
            { key: 'rule', label: 'Citer la règle plutôt que juger la personne', bucket: 'good' },
            { key: 'same', label: 'Traiter un habitué et un inconnu pareil', bucket: 'good' },
            { key: 'sarcasm', label: 'Répondre avec de l’ironie devant le chat', bucket: 'bad' },
            { key: 'debate', label: 'Débattre longuement d’une sanction en public', bucket: 'bad' },
            { key: 'favour', label: 'Tolérer un ami, sanctionner un inconnu', bucket: 'bad' },
          ],
          explanation:
            'La posture tient à peu de choses : du calme, la règle avant la personne, la même mesure pour tous. L’ironie et le débat public font perdre la maîtrise du chat.',
        },
        {
          kind: 'callout',
          key: 'posture-rule',
          tone: 'rule',
          title: 'La règle, pas la personne',
          body: 'Dis « ce message n’est pas permis », jamais « tu es pénible ». On critique un comportement, jamais un individu.',
        },
      ],
    },
    {
      key: 'avertir',
      title: 'Formuler un avertissement',
      blocks: [
        {
          kind: 'text',
          key: 'avertir-text',
          body: 'Les avertissements de l’équipe suivent presque toujours le **même chemin** : une salutation courte, la règle rappelée, ce qui peut arriver ensuite, puis un remerciement. Cette régularité rassure le viewer.',
        },
        {
          kind: 'diagram',
          key: 'avertir-diagram',
          title: 'Les quatre temps d’un avertissement',
          nodes: [
            { glyph: 'emoji', label: 'Salutation', note: '« Hello, »', tone: 'brand' },
            { glyph: 'rule', label: 'La règle', note: 'Rappelée sans reproche', tone: 'info' },
            { glyph: 'climb', label: 'La suite', note: 'Ce qui peut arriver', tone: 'caution' },
            { glyph: 'success', label: 'Merci', note: 'Pour la compréhension', tone: 'success' },
          ],
        },
        {
          kind: 'demo',
          key: 'avertir-demo',
          title: 'Démo : de la demande à l’avertissement',
          surface: 'twitch',
          lines: [
            { author: 'Lyra', text: 'le boss est enfin tombé !!', role: 'viewer' },
            { author: 'Zorka', text: 'streamer dédicace moi stp !!!', role: 'viewer' },
          ],
          steps: [
            {
              caption: 'Zorka demande une dédicace : c’est une infraction du panel.',
              target: 1,
            },
            {
              caption: 'Dès constaté, tu supprimes le message.',
              target: 1,
              act: 'delete',
            },
            {
              caption:
                'Puis tu écris l’avertissement : une salutation, la règle, un remerciement. Aucun reproche.',
              say: {
                author: 'Malo',
                text: 'Hello, le streamer ne peut malheureusement pas répondre aux demandes de dédicaces pendant ses lives. Merci pour ta compréhension, bon live à toi !',
                role: 'moderator',
              },
            },
          ],
        },
        {
          kind: 'chat',
          key: 'avertir-chat',
          surface: 'twitch',
          caption: 'Un avertissement réussi',
          lines: [
            {
              author: 'Zorka',
              text: 'streamer dédicace moi stp !!!',
              role: 'viewer',
              flagged: true,
            },
            {
              author: 'Malo',
              text: 'Hello, le streamer ne peut malheureusement pas répondre aux demandes de dédicaces pendant ses lives. Merci pour ta compréhension, bon live à toi !',
              role: 'moderator',
            },
          ],
        },
        {
          kind: 'order',
          key: 'avertir-order',
          title: 'Construire un avertissement',
          prompt: 'Remets les parties d’un avertissement dans l’ordre.',
          items: [
            { key: 'hello', label: 'Une salutation courte : « Hello, »' },
            {
              key: 'rule',
              label: 'La règle rappelée : « le flood excessif gêne la lecture du chat. »',
            },
            {
              key: 'next',
              label:
                'Ce qui peut arriver : « En cas de récidive, ça peut entraîner une sanction. »',
            },
            {
              key: 'thanks',
              label: 'Un remerciement : « Merci pour ta compréhension et bon live ! »',
            },
          ],
          explanation:
            'Salutation, règle, conséquence éventuelle, remerciement. Tu restes bienveillant sans rien céder sur la règle.',
        },
        {
          kind: 'fill',
          key: 'avertir-fill',
          title: 'Compléter l’avertissement',
          text: 'Hello, le [[flood]] excessif gêne la lecture du chat. En cas de [[récidive]], ça peut entraîner une [[sanction]]. Merci pour ta [[compréhension]] et bon live !',
          bank: ['flood', 'récidive', 'sanction', 'compréhension', 'colère'],
          explanation:
            'C’est l’avertissement type du flood excessif : court, poli, sans reproche personnel.',
        },
        {
          kind: 'quiz',
          key: 'avertir-quiz',
          title: 'Lequel enverrais-tu ?',
          questions: [
            {
              key: 'q1',
              prompt:
                'Un viewer écrit dans une autre langue que le français. Quel avertissement choisis-tu ?',
              choices: [
                {
                  key: 'a',
                  label:
                    'Hello, écrire dans une autre langue que le français n’est pas permis sur ce chat. Merci pour ta compréhension, bon live à toi !',
                  correct: true,
                },
                {
                  key: 'b',
                  label: 'Tu ne sais pas lire les règles ou quoi ? Le chat est en français.',
                  correct: false,
                },
                {
                  key: 'c',
                  label: 'Dernier avertissement, je te bannis la prochaine fois.',
                  correct: false,
                },
              ],
              explanation:
                'Le bon message rappelle la règle sans jugement et se termine par un remerciement. Les deux autres attaquent la personne ou menacent d’emblée.',
            },
          ],
        },
      ],
    },
    {
      key: 'desamorcer',
      title: 'Désamorcer la colère',
      blocks: [
        {
          kind: 'text',
          key: 'desamorcer-text',
          body: 'Un viewer sanctionné se défend parfois avec colère, surtout quand il pense avoir raison. **Ne rentre pas dans la dispute.** Une réponse courte, calme, qui rappelle la règle, suffit. Si ça continue, tu passes le relais au Responsable.',
        },
        {
          kind: 'diagram',
          key: 'desamorcer-diagram',
          title: 'Face à la colère, quatre réflexes',
          nodes: [
            { glyph: 'shield', label: 'Reste calme', note: 'Ton ton ne monte pas', tone: 'info' },
            { glyph: 'rule', label: 'Rappelle la règle', note: 'Une seule fois', tone: 'brand' },
            {
              glyph: 'blocked',
              label: 'Ne débats pas',
              note: 'Pas de dispute publique',
              tone: 'caution',
            },
            {
              glyph: 'lead',
              label: 'Passe le relais',
              note: 'Un Responsable tranche',
              tone: 'success',
            },
          ],
        },
        {
          kind: 'simulation',
          key: 'desamorcer-sim',
          title: 'La plainte en direct',
          surface: 'twitch',
          context:
            'Un viewer vient de recevoir un avertissement et le conteste devant tout le chat.',
          steps: [
            {
              key: 's1',
              lines: [
                {
                  author: 'Zorka',
                  text: 'c’est n’importe quoi, j’ai rien fait de mal !!',
                  role: 'viewer',
                  flagged: true,
                },
                {
                  author: 'Zorka',
                  text: 'les modos abusent complètement ici',
                  role: 'viewer',
                  flagged: true,
                },
              ],
              prompt: 'Comment réponds-tu ?',
              options: [
                {
                  key: 'calm',
                  label: 'Je réponds calmement en rappelant la règle une fois',
                  correct: true,
                  feedback:
                    'Exact : court, calme, sans juger. Tu rappelles la règle et tu ne débats pas.',
                },
                {
                  key: 'argue',
                  label: 'Je détaille pourquoi il a tort, message après message',
                  correct: false,
                  feedback:
                    'Un débat public donne de l’attention à la colère et fait perdre le contrôle du chat.',
                },
                {
                  key: 'ban',
                  label: 'Je le sanctionne pour insolence',
                  correct: false,
                  feedback:
                    'Une plainte n’est pas en soi une infraction : réponds et regarde la suite avant d’agir.',
                },
              ],
            },
            {
              key: 's2',
              lines: [
                { author: 'Zorka', text: 'je veux parler à quelqu’un qui décide', role: 'viewer' },
              ],
              prompt: 'Il insiste, poliment cette fois. Que fais-tu ?',
              options: [
                {
                  key: 'relay',
                  label: 'Je l’invite à s’adresser à un Responsable après le live, sans débattre',
                  correct: true,
                  feedback:
                    'Exact : tu ne tranches pas seul, tu donnes un chemin clair et tu gardes ton calme.',
                },
                {
                  key: 'cancel',
                  label: 'J’annule l’avertissement pour le calmer',
                  correct: false,
                  feedback:
                    'Céder sous la pression crée des inégalités. Une erreur se corrige avec un Responsable.',
                },
                {
                  key: 'ignore',
                  label: 'Je l’ignore complètement',
                  correct: false,
                  feedback: 'Une demande polie mérite une réponse, même courte.',
                },
              ],
            },
          ],
        },
        {
          kind: 'case',
          key: 'desamorcer-case',
          title: 'Écrire au nom de l’équipe',
          context:
            'Un membre de longue date écrit en privé : il trouve que ton timeout était injuste et te demande de le lever « entre nous ».',
          questions: [
            {
              type: 'choice',
              key: 'c1',
              prompt: 'Que réponds-tu ?',
              choices: [
                {
                  key: 'a',
                  label:
                    'Je remercie, j’explique la règle et je propose d’en parler avec un Responsable',
                  correct: true,
                },
                { key: 'b', label: 'Je lève le timeout, c’est un habitué', correct: false },
                { key: 'c', label: 'Je ne réponds pas, ce n’est pas mon rôle', correct: false },
              ],
              explanation:
                'Tu restes cohérent avec le panel, tu respectes la personne et tu ouvres un chemin de recours au lieu de faire une exception.',
            },
            {
              type: 'open',
              key: 'c2',
              prompt: 'Rédige ta réponse en trois ou quatre phrases.',
              expert:
                'Bonjour, merci d’avoir pris le temps de m’écrire. Le timeout a été posé selon le panel pour un message qui n’était pas permis, et je ne peux pas le lever à titre personnel. Si tu penses qu’il y a eu une erreur, un Responsable peut réexaminer la situation avec toi. Merci pour ta compréhension.',
            },
          ],
        },
      ],
    },
  ],
}
