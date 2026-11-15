import { MAIL_THEME } from '@/declarations/mail/config'
import { MAIL_SHARED_COPY, MAIL_TEMPLATES } from '@/declarations/mail/copy'
import { APP_NAME } from '@/declarations/app'
import type { MailKindName } from '@/utils/constants/mail'

/**
 * Words that fill a mail
 * @typedef {Object} MailVariables
 * @property {string} name - Discord name of the person
 * @property {string} creator - Community the request was filed with
 * @property {string} reference - Reference of the request
 * @property {string | null} link - Follow-up address, none when unknown
 * @property {string | null} [note] - Message of the team
 */

export interface MailVariables {
  name: string
  creator: string
  reference: string
  link: string | null
  note?: string | null
}

/**
 * A mail ready for the provider
 * @typedef {Object} RenderedMail
 * @property {string} subject - Subject line
 * @property {string} html - Body for mail clients
 * @property {string} text - Plain body
 */

export interface RenderedMail {
  subject: string
  html: string
  text: string
}

// Characters that would open markup
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * Make a text safe inside markup
 * @param {string} text - Raw text
 * @return {string} - Escaped text
 */

export const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (c) => ESCAPES[c])

/**
 * Put the variables in a sentence, an unknown one stays as written
 * @param {string} sentence - Sentence with {name}-style holes
 * @param {MailVariables} variables - Words to put in
 * @param {(text: string) => string} [wrap] - Applied to each word
 * @return {string} - Filled sentence
 */

const fill = (
  sentence: string,
  variables: MailVariables,
  wrap: (text: string) => string = (text) => text
): string =>
  sentence.replace(/\{(name|creator|reference)\}/g, (_, key: 'name' | 'creator' | 'reference') =>
    wrap(variables[key])
  )

/**
 * Block holding the message of the team
 * @param {string} title - Heading
 * @param {string} note - Message
 * @return {string} - Markup
 */

const noteBlock = (title: string, note: string): string =>
  `<div style="margin:20px 0 4px;padding:14px 16px;background:${MAIL_THEME.note};border-left:3px solid ${MAIL_THEME.brand};border-radius:8px;">` +
  `<p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:${MAIL_THEME.subtle};">${escapeHtml(title)}</p>` +
  `<p style="margin:0;font-size:15px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(note)}</p></div>`

/**
 * Render one mail
 * @param {MailKindName} kind - Mail wanted
 * @param {MailVariables} variables - Words to put in
 * @return {RenderedMail} - Subject, markup and plain text
 */

export const renderMail = (kind: MailKindName, variables: MailVariables): RenderedMail => {
  const template = MAIL_TEMPLATES[kind]
  const note = variables.note?.trim() ? variables.note.trim() : null
  const hasNote = template.noteTitle !== ''
  const paragraphs = template.paragraphs.map((p) => fill(p, variables))

  // Copy is trusted, only the words put in need escaping
  const body = template.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${fill(p, variables, escapeHtml)}</p>`
    )
    .join('')

  const button = variables.link
    ? `<p style="margin:22px 0 0;"><a href="${escapeHtml(variables.link)}" style="display:inline-block;padding:12px 22px;background:${MAIL_THEME.brand};color:${MAIL_THEME.brandInk};font-weight:700;font-size:15px;text-decoration:none;border-radius:12px;">${escapeHtml(template.action)}</a></p>` +
      `<p style="margin:14px 0 0;font-size:12px;color:${MAIL_THEME.subtle};">${escapeHtml(MAIL_SHARED_COPY.linkHint)}<br><span style="word-break:break-all;">${escapeHtml(variables.link)}</span></p>`
    : ''

  const html =
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(fill(template.subject, variables))}</title></head>` +
    `<body style="margin:0;padding:24px 12px;background:${MAIL_THEME.page};color:${MAIL_THEME.ink};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">` +
    `<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(fill(template.preheader, variables))}</span>` +
    `<div style="max-width:520px;margin:0 auto;background:${MAIL_THEME.card};border:1px solid ${MAIL_THEME.line};border-radius:16px;padding:28px 26px;">` +
    `<p style="margin:0 0 18px;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${MAIL_THEME.brand};">${escapeHtml(APP_NAME)}</p>` +
    `<h1 style="margin:0 0 18px;font-size:22px;line-height:1.25;">${escapeHtml(template.title)}</h1>` +
    body +
    (hasNote ? noteBlock(template.noteTitle, note ?? MAIL_SHARED_COPY.noteFallback) : '') +
    button +
    `</div><p style="max-width:520px;margin:16px auto 0;font-size:12px;line-height:1.5;color:${MAIL_THEME.subtle};text-align:center;">${escapeHtml(MAIL_SHARED_COPY.footer)}<br>${escapeHtml(MAIL_SHARED_COPY.footerNoReply)}</p></body></html>`

  const text = [
    template.title,
    '',
    ...paragraphs.flatMap((p) => [p, '']),
    ...(hasNote ? [template.noteTitle, note ?? MAIL_SHARED_COPY.noteFallback, ''] : []),
    ...(variables.link ? [`${template.action} : ${variables.link}`, ''] : []),
    MAIL_SHARED_COPY.footer,
  ].join('\n')

  return { subject: fill(template.subject, variables), html, text }
}
