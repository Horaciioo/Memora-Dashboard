import { MAIL_CONSOLE_COPY, MAIL_TEMPLATES } from '@/declarations/mail/copy'
import { MailKinds } from '@/utils/constants/mail'
import type { MailKindName } from '@/utils/constants/mail'
import { renderMail } from './render'
import type { MailVariables, RenderedMail } from './render'

/**
 * One mail of the catalogue, filled with sample words
 * @typedef {Object} MailCatalogueEntry
 * @property {MailKindName} kind - Mail
 * @property {string} label - Name in the console
 * @property {string} when - Moment it leaves
 * @property {RenderedMail} mail - Subject and bodies
 */

export interface MailCatalogueEntry {
  kind: MailKindName
  label: string
  when: string
  mail: RenderedMail
}

// Mails that carry a team message
const WITH_NOTE: MailKindName[] = [MailKinds.UnbanAccepted, MailKinds.UnbanRefused]

/**
 * Sample words of one mail
 * @param {MailKindName} kind - Mail
 * @param {string | null} origin - Public address, the link is left out when unknown
 * @return {MailVariables} - Words
 */

export const sampleVariables = (kind: MailKindName, origin: string | null): MailVariables => ({
  name: MAIL_CONSOLE_COPY.sampleName,
  creator: MAIL_CONSOLE_COPY.sampleCreator,
  reference: MAIL_CONSOLE_COPY.sampleReference,
  link: origin ? `${origin}/exemple/contest` : null,
  note: WITH_NOTE.includes(kind) ? MAIL_CONSOLE_COPY.sampleNote : null,
})

/**
 * Every mail, in the order of the flow
 * @param {string | null} origin - Public address, the link is left out when unknown
 * @return {MailCatalogueEntry[]} - Catalogue
 */

export const mailCatalogue = (origin: string | null): MailCatalogueEntry[] =>
  (Object.keys(MAIL_TEMPLATES) as MailKindName[]).map((kind) => ({
    kind,
    label: MAIL_TEMPLATES[kind].label,
    when: MAIL_TEMPLATES[kind].when,
    mail: renderMail(kind, sampleVariables(kind, origin)),
  }))
