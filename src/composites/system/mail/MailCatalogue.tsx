'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { MailCatalogueEntry } from '@/core/lib/mail/catalogue'
import { MAIL_CONSOLE_COPY } from '@/declarations/mail/copy'
import { MAIL_STYLES } from '@/declarations/ui/variants'

export interface MailCatalogueProps {
  entries: MailCatalogueEntry[]
  isConfigured: boolean
}

/**
 * Every mail as the person reads it, each one sendable as a trial
 * @param {MailCatalogueEntry[]} entries - Catalogue
 * @param {boolean} isConfigured - The provider is set up
 * @return {JSX.Element}
 */

export const MailCatalogue = ({ entries, isConfigured }: MailCatalogueProps) => {
  const [address, setAddress] = useState('')
  const { isSaving, run } = useMutation()

  return (
    <div className={MAIL_STYLES.stack}>
      <p className={MAIL_STYLES.status}>
        {isConfigured ? MAIL_CONSOLE_COPY.configured : MAIL_CONSOLE_COPY.notConfigured}
      </p>
      <label className={MAIL_STYLES.sendField}>
        <span className={MAIL_STYLES.sendLabel}>{MAIL_CONSOLE_COPY.recipientLabel}</span>
        <Input
          type="email"
          value={address}
          placeholder={MAIL_CONSOLE_COPY.recipientPlaceholder}
          onChange={(event) => setAddress(event.target.value)}
        />
      </label>
      {entries.map(({ kind, label, when, mail }) => (
        <section key={kind} className={MAIL_STYLES.card}>
          <div className={MAIL_STYLES.head}>
            <h3 className={MAIL_STYLES.title}>{label}</h3>
            <p className={MAIL_STYLES.meta}>
              {MAIL_CONSOLE_COPY.whenLabel} : {when}
            </p>
            <p className={MAIL_STYLES.subject}>
              {MAIL_CONSOLE_COPY.subjectLabel} : {mail.subject}
            </p>
          </div>
          <iframe title={label} srcDoc={mail.html} sandbox="" className={MAIL_STYLES.frame} />
          <div>
            <Button
              variant="secondary"
              icon="mail"
              disabled={!isConfigured || !address || isSaving}
              onClick={() =>
                void run(
                  () => apiPost(API_ROUTES.mailSample(kind), { to: address }),
                  MAIL_CONSOLE_COPY.sent
                )
              }
            >
              {MAIL_CONSOLE_COPY.sendTest}
            </Button>
          </div>
        </section>
      ))}
    </div>
  )
}
