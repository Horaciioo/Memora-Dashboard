'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { FormRenderer } from '@/components/structures/FormRenderer'
import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { TOUR_COPY, TOUR_REQUIRED_NETWORK } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import type { MemberSocial } from '@/types/members'

export interface SocialsReplyProps {
  fields: FieldDefinition[]
  onAnswer: (text: string, patch?: IntakeAnswers) => void
}

/**
 * The networks asked as the file asks them, each one added lands on the member's file
 * @param {SocialsReplyProps} props - Social form and handler
 * @return {JSX.Element}
 */

export const SocialsReply = ({ fields, onAnswer }: SocialsReplyProps) => {
  const { session } = useAuthContext()
  const { run, isSaving, issues } = useMutation()
  // The required network is asked first
  const required = fields
    .find((field) => field.name === 'networkId')
    ?.options?.find((option) => option.label === TOUR_REQUIRED_NETWORK)?.value
  const [values, setValues] = useState<FormValues>(required ? { networkId: required } : {})
  const [added, setAdded] = useState<MemberSocial[]>([])

  const isFilled = Boolean(values.networkId) && Boolean(values.handle)

  // Written on the file right away, never held back
  const add = async () => {
    if (!session) return

    const social = await run(() =>
      apiPost<MemberSocial>(API_ROUTES.memberSocials(session.id), values)
    )
    if (!social) return

    setAdded((current) => [...current, social])
    setValues({})
  }

  return (
    <div className={TOUR_CHAT.reply}>
      <p className={TOUR_CHAT.embedTitle}>{TOUR_COPY.socialsLabel}</p>

      {added.length > 0 && (
        <ul className={TOUR_CHAT.added}>
          {added.map((social) => (
            <li key={social.id} className={TOUR_CHAT.addedTag}>
              {social.label}
              <span>{social.handle}</span>
            </li>
          ))}
        </ul>
      )}

      <FormRenderer
        fields={fields}
        values={values}
        issues={issues}
        onChange={(name: string, value: FieldValue) =>
          setValues((current) => ({ ...current, [name]: value }))
        }
        idPrefix="tour-social"
        single
        disabled={isSaving}
      />

      <div className={TOUR_CHAT.replyActions}>
        <Button
          variant="primary"
          className={TOUR_CHAT.replyAction}
          disabled={!isFilled}
          isLoading={isSaving}
          onClick={() => void add()}
        >
          {TOUR_COPY.socialAdd}
        </Button>
        <span className={TOUR_CHAT.replyDivider} role="separator" />
        <Button
          variant="ghost"
          className={TOUR_CHAT.replyAction}
          disabled={isSaving}
          onClick={() =>
            onAnswer(
              added.length > 0
                ? added.map((social) => `${social.label} : ${social.handle}`).join(', ')
                : TOUR_COPY.socialNone,
              { instagram: added.some((social) => social.label === TOUR_REQUIRED_NETWORK) }
            )
          }
        >
          {added.length > 0 ? TOUR_COPY.socialDone : TOUR_COPY.socialNone}
        </Button>
      </div>
    </div>
  )
}
