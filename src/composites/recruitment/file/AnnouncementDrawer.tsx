'use client'

import { Button } from '@/components/elements/actions/Button'
import { DiscordMessage } from '@/components/elements/display/DiscordMessage'
import { Textarea } from '@/components/elements/forms/Textarea'
import { Drawer } from '@/components/structures/Drawer'
import { NewIdentifierRow } from '@/composites/recruitment/file/NewIdentifierRow'
import { LIVE_PALETTE, renderPlanningPng } from '@/composites/recruitment/file/planningImage'
import { WeekPlanning } from '@/composites/recruitment/file/WeekPlanning'
import { useCopy } from '@/core/hooks/interaction/useCopy'
import { unknownTokens } from '@/core/lib/discord/identifiers'
import type { WeekPlan } from '@/core/lib/recruitment/weekPlanning'
import { PLANNING_COPY } from '@/declarations/recruitment/copy'
import { ANNOUNCEMENT_DRAWER } from '@/declarations/ui/variants'
import { ANNOUNCEMENT_COPY } from '@/declarations/work/announcements'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { FormValues } from '@/types/forms'
import type { MentionEntry } from '@/utils/format/discord'
import { toRaw } from '@/utils/format/discord'

export interface AnnouncementDrawerProps {
  open: boolean
  // Wording as typed, names instead of numbers
  text: string
  isModified: boolean
  withImage: boolean
  plan: WeekPlan
  entries: MentionEntry[]
  isSaving: boolean
  canManage: boolean
  onAnnounce: (raw: string) => Promise<boolean>
  onText: (text: string) => void
  onRestore: () => void
  onWithImage: (withImage: boolean) => void
  onStore: (values: FormValues) => Promise<boolean>
  onClose: () => void
}

/**
 * Announcement to edit, preview and copy
 * @param {AnnouncementDrawerProps} props - Wording and week
 * @return {JSX.Element}
 */

export const AnnouncementDrawer = ({
  open,
  text,
  isModified,
  withImage,
  plan,
  entries,
  isSaving,
  canManage,
  onAnnounce,
  onText,
  onRestore,
  onWithImage,
  onStore,
  onClose,
}: AnnouncementDrawerProps) => {
  const { notify } = useNotifications()
  const { session } = useAuthContext()
  const copyText = useCopy(PLANNING_COPY.textCopied)
  const raw = toRaw(text, entries)
  const unknown = unknownTokens(text, entries)

  // Picture straight onto the clipboard
  const copyImage = async () => {
    try {
      const png = renderPlanningPng(plan)
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
      notify({ tone: 'success', title: PLANNING_COPY.imageCopied })
    } catch {
      notify({ tone: 'danger', title: PLANNING_COPY.imageFailed })
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      isWide
      icon="discordAnnounce"
      title={PLANNING_COPY.previewTitle}
      footer={
        <div className={ANNOUNCEMENT_DRAWER.actions}>
          <Button icon="copy" variant="primary" onClick={() => void copyText(raw)}>
            {PLANNING_COPY.copyText}
          </Button>
          <Button
            icon="discordAnnounce"
            disabled={isSaving || !canManage}
            onClick={() => void onAnnounce(raw)}
          >
            {ANNOUNCEMENT_COPY.markAnnounced}
          </Button>
          {withImage && (
            <Button icon="copy" disabled={plan.count === 0} onClick={copyImage}>
              {PLANNING_COPY.copyImage}
            </Button>
          )}
        </div>
      }
    >
      <div className={ANNOUNCEMENT_DRAWER.split}>
        <div className={ANNOUNCEMENT_DRAWER.column}>
          <div className={ANNOUNCEMENT_DRAWER.head}>
            <h3 className={ANNOUNCEMENT_DRAWER.label}>{PLANNING_COPY.editTitle}</h3>
            <Button variant="ghost" disabled={!isModified} onClick={onRestore}>
              {PLANNING_COPY.restore}
            </Button>
          </div>
          <Textarea
            aria-label={PLANNING_COPY.editTitle}
            className={ANNOUNCEMENT_DRAWER.editor}
            value={text}
            onChange={(event) => onText(event.target.value)}
          />
        </div>

        <div className={ANNOUNCEMENT_DRAWER.column}>
          <div className={ANNOUNCEMENT_DRAWER.head}>
            <h3 className={ANNOUNCEMENT_DRAWER.label}>{PLANNING_COPY.previewLabel}</h3>
            <Button
              variant="ghost"
              icon={withImage ? 'check' : undefined}
              aria-pressed={withImage}
              onClick={() => onWithImage(!withImage)}
            >
              {PLANNING_COPY.includeImage}
            </Button>
          </div>
          <div className={ANNOUNCEMENT_DRAWER.preview}>
            <DiscordMessage
              source={raw}
              mentions={entries}
              author={session?.displayName ?? PLANNING_COPY.author}
              avatarUrl={session?.avatarUrl}
            />
            {withImage && (
              <div className={ANNOUNCEMENT_DRAWER.picture}>
                <WeekPlanning plan={plan} palette={LIVE_PALETTE} />
              </div>
            )}
          </div>
        </div>
      </div>

      {unknown.length > 0 && (
        <div className={ANNOUNCEMENT_DRAWER.newBlock}>
          <h3 className={ANNOUNCEMENT_DRAWER.label}>{PLANNING_COPY.newIdentifierTitle}</h3>
          <p className={ANNOUNCEMENT_DRAWER.hint}>{PLANNING_COPY.newIdentifierHint}</p>
          {unknown.map((token) => (
            <NewIdentifierRow
              key={token}
              token={token}
              isSaving={isSaving || !canManage}
              onStore={onStore}
            />
          ))}
        </div>
      )}
    </Drawer>
  )
}
