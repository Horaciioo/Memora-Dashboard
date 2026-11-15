import { MailKinds } from '@/utils/constants/mail'
import type { MailKindName } from '@/utils/constants/mail'

/**
 * Words of one mail, {name} {creator} {reference} are filled at render
 * @typedef {Object} MailTemplate
 * @property {string} label - Name in the console
 * @property {string} when - Moment it leaves, for the console
 * @property {string} subject - Subject line
 * @property {string} preheader - Line shown beside the subject
 * @property {string} title - Heading of the body
 * @property {string[]} paragraphs - Body
 * @property {string} noteTitle - Heading of the team message, shown when there is one
 * @property {string} action - Button label
 */

export interface MailTemplate {
  label: string
  when: string
  subject: string
  preheader: string
  title: string
  paragraphs: string[]
  noteTitle: string
  action: string
}

/**
 * Every mail of the Deban. flow
 * @type {Record<MailKindName, MailTemplate>}
 */

export const MAIL_TEMPLATES: Record<MailKindName, MailTemplate> = {
  [MailKinds.UnbanReceived]: {
    label: 'Demande reçue',
    when: 'Dès que la personne envoie le formulaire.',
    subject: 'Votre demande de déban est bien reçue ({reference})',
    preheader: 'L’équipe de {creator} va l’examiner.',
    title: 'Demande reçue',
    paragraphs: [
      'Bonjour {name},',
      'L’équipe de modération de {creator} a bien reçu votre demande de déban. Sa référence est {reference}, gardez-la si vous devez nous écrire.',
      'Une personne de l’équipe va l’examiner. Vous recevrez un e-mail à chaque étape, et vous pouvez aussi suivre la demande à tout moment.',
    ],
    noteTitle: '',
    action: 'Suivre ma demande',
  },
  [MailKinds.UnbanTaken]: {
    label: 'Prise en charge',
    when: 'Quand un membre de l’équipe prend la demande en charge.',
    subject: 'Votre demande de déban est en cours d’examen ({reference})',
    preheader: 'Quelqu’un de l’équipe de {creator} la regarde.',
    title: 'Demande en cours d’examen',
    paragraphs: [
      'Bonjour {name},',
      'Un membre de l’équipe de modération de {creator} vient de prendre en charge votre demande {reference}.',
      'Vous recevrez un nouvel e-mail dès qu’une décision sera prise.',
    ],
    noteTitle: '',
    action: 'Suivre ma demande',
  },
  [MailKinds.UnbanAccepted]: {
    label: 'Demande acceptée',
    when: 'Quand la décision est prise en faveur de la personne.',
    subject: 'Votre demande de déban est acceptée ({reference})',
    preheader: 'L’équipe de {creator} a accepté votre demande.',
    title: 'Demande acceptée',
    paragraphs: [
      'Bonjour {name},',
      'Bonne nouvelle : l’équipe de modération de {creator} a accepté votre demande {reference}.',
      'Le bannissement va être levé sur le serveur Discord. Vous pourrez le rejoindre de nouveau une fois la levée faite.',
    ],
    noteTitle: 'Le message de l’équipe',
    action: 'Voir la décision',
  },
  [MailKinds.UnbanRefused]: {
    label: 'Demande refusée',
    when: 'Quand la décision est prise contre la demande.',
    subject: 'Réponse à votre demande de déban ({reference})',
    preheader: 'L’équipe de {creator} a rendu sa décision.',
    title: 'Demande refusée',
    paragraphs: [
      'Bonjour {name},',
      'Après examen, l’équipe de modération de {creator} a décidé de ne pas lever le bannissement pour votre demande {reference}.',
      'Vous retrouvez la réponse de l’équipe ci-dessous et sur la page de suivi.',
    ],
    noteTitle: 'Le message de l’équipe',
    action: 'Voir la décision',
  },
}

/**
 * Words shared by every mail
 * @type {Record<string, string>}
 */

export const MAIL_SHARED_COPY = {
  footer: 'Vous recevez ce message parce qu’une demande de déban a été envoyée avec cette adresse.',
  footerNoReply: 'Merci de ne pas répondre directement à cet e-mail.',
  linkHint: 'Si le bouton ne s’ouvre pas, copiez ce lien dans votre navigateur :',
  noteFallback: 'Aucun message n’a été joint à cette décision.',
} as const

/**
 * Words of the mail console and its errors
 * @type {Record<string, string>}
 */

export const MAIL_CONSOLE_COPY = {
  title: 'Console mail',
  lead: 'Tous les e-mails que Memora peut envoyer, et le journal de ceux partis.',
  catalogueTitle: 'Catalogue',
  catalogueLead:
    'Chaque e-mail tel que la personne le reçoit, rempli avec des mots d’exemple. Rien ne part tant que tu n’envoies pas un essai.',
  journalTitle: 'Journal',
  journalLead: 'Les derniers envois, sans jamais afficher l’adresse.',
  subjectLabel: 'Objet',
  whenLabel: 'Part',
  recipientLabel: 'Adresse de l’essai',
  recipientPlaceholder: 'adresse@exemple.fr',
  sendTest: 'Envoyer un essai',
  sent: 'Essai envoyé.',
  notConfigured:
    'Le service d’envoi n’est pas configuré : il manque RESEND_API_KEY ou MAIL_FROM. Les e-mails sont prévisualisés seulement.',
  configured: 'Service d’envoi prêt.',
  badAddress: 'Cette adresse n’est pas valide.',
  sendFailed: 'Le service d’envoi a refusé le message.',
  columnDate: 'Date',
  columnMail: 'E-mail',
  columnReference: 'Demande',
  columnStatus: 'État',
  columnDetail: 'Détail',
  empty: 'Aucun e-mail envoyé pour le moment.',
  statusSent: 'Envoyé',
  statusFailed: 'Échoué',
  statusSkipped: 'Non envoyé',
  sampleName: 'Camille',
  sampleCreator: 'la chaîne',
  sampleReference: 'K7M2Q',
  sampleNote: 'Merci pour ta franchise. Nous avons relu ton historique avant de décider.',
  skippedNoAddress: 'Aucune adresse sur la demande',
  skippedNotConfigured: 'Service d’envoi non configuré',
} as const
