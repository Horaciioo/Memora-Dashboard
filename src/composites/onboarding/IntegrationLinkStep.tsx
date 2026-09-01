'use client'

import { useState } from 'react'

import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDialog } from '@/components/structures/FormDialog'
import { CopyInviteLink } from '@/composites/onboarding/CopyInviteLink'
import { INTEGRATION_LINK_COPY } from '@/declarations/onboarding/copy'
import { INTEGRATION_LINK_KIND_REGISTRY } from '@/declarations/onboarding/registries'
import { INTEGRATION_STEP_STYLES } from '@/declarations/ui/variants'
import type { FieldDefinition, FieldIssue, FormValues } from '@/types/forms'
import type { IntegrationLinkView } from '@/types/onboarding'
import { formatDay } from '@/utils/format/dates'

export interface IntegrationLinkStepProps {
  link: IntegrationLinkView | null
  fields: FieldDefinition[]
  issues: FieldIssue[]
  isSaving: boolean
  canManage: boolean
  onEmit: (values: FormValues) => Promise<boolean>
  onRevoke: () => void
}

/**
 * Controls of the closing timeline step — the moment the integration form is handed out
 * @param {IntegrationLinkView | null} link - Form handed out, if any
 * @param {FieldDefinition[]} fields - Declarations of the emission form
 * @param {FieldIssue[]} issues - Rejections returned by the server
 * @param {boolean} isSaving - Mutation in flight
 * @param {boolean} canManage - Member may hand out and close the form
 * @param {(values: FormValues) => Promise<boolean>} onEmit - Emission handler
 * @param {() => void} onRevoke - Revocation handler
 * @return {JSX.Element}
 */

export const IntegrationLinkStep = ({
  link,
  fields,
  issues,
  isSaving,
  canManage,
  onEmit,
  onRevoke,
}: IntegrationLinkStepProps) => {
  const [isEmitting, setEmitting] = useState(false)
  const [isRevoking, setRevoking] = useState(false)

  const seats = `${link?.uses ?? 0} / ${link?.maxUses ?? INTEGRATION_LINK_COPY.unlimited}`

  return (
    <div className={INTEGRATION_STEP_STYLES.frame}>
      {link ? (
        <>
          <div className={INTEGRATION_STEP_STYLES.row}>
            <Badge
              label={INTEGRATION_LINK_KIND_REGISTRY.label(link.kind)}
              accent={INTEGRATION_LINK_KIND_REGISTRY.get(link.kind).accent}
              dot
            />
            <span className={INTEGRATION_STEP_STYLES.meta}>
              {`${seats} ${INTEGRATION_LINK_COPY.usesLabel} · ${formatDay(link.expiresAt)}`}
            </span>
            {!link.usable && (
              <Badge
                label={
                  link.uses >= (link.maxUses ?? Number.POSITIVE_INFINITY)
                    ? INTEGRATION_LINK_COPY.exhaustedBadge
                    : INTEGRATION_LINK_COPY.expiredBadge
                }
                tone="danger"
              />
            )}
          </div>

          <div className={INTEGRATION_STEP_STYLES.row}>
            {link.usable && <CopyInviteLink token={link.token} />}
            {canManage && (
              <>
                <Button icon="refresh" onClick={() => setEmitting(true)}>
                  {INTEGRATION_LINK_COPY.reissue}
                </Button>
                <Button icon="remove" onClick={() => setRevoking(true)}>
                  {INTEGRATION_LINK_COPY.revoke}
                </Button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className={INTEGRATION_STEP_STYLES.row}>
          <Button
            variant="primary"
            icon="link"
            disabled={!canManage}
            onClick={() => setEmitting(true)}
          >
            {INTEGRATION_LINK_COPY.emit}
          </Button>
          <span className={INTEGRATION_STEP_STYLES.meta}>{INTEGRATION_LINK_COPY.pendingHint}</span>
        </div>
      )}

      <FormDialog
        open={isEmitting}
        title={INTEGRATION_LINK_COPY.emitTitle}
        description={INTEGRATION_LINK_COPY.emitDescription}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        submitLabel={INTEGRATION_LINK_COPY.emit}
        onSubmit={onEmit}
        onClose={() => setEmitting(false)}
      />

      <ConfirmDialog
        open={isRevoking}
        title={INTEGRATION_LINK_COPY.revokeTitle}
        description={INTEGRATION_LINK_COPY.revokeDescription}
        confirmLabel={INTEGRATION_LINK_COPY.revoke}
        pending={isSaving}
        onConfirm={() => {
          onRevoke()
          setRevoking(false)
        }}
        onCancel={() => setRevoking(false)}
      />
    </div>
  )
}
