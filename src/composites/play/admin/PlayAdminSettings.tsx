'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { usePlayAdminConfig } from '@/core/hooks/data/play/usePlayAdminConfig'
import { PLAY_ANNOUNCEMENT_FIELDS, PLAY_CONFIG_COPY } from '@/declarations/play/config'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import type { PlayConfigView } from '@/types/play'

/**
 * Room controls: pause the new tables, the message above the hub
 * @param {{ initial: PlayConfigView }} props - Settings
 * @return {JSX.Element}
 */

export const PlayAdminSettings = ({ initial }: { initial: PlayConfigView }) => {
  const admin = usePlayAdminConfig(initial)
  const [isEditing, setEditing] = useState(false)
  const { config } = admin

  return (
    <PlayPageTitle
      aside={null}
      body={
        <div className={PLAY_ADMIN.list}>
          <p className={PLAY_ADMIN.note}>{PLAY_CONFIG_COPY.settingsIntro}</p>

          <div className={PLAY_ADMIN.control}>
            <div className={PLAY_ADMIN.controlText}>
              <span className={PLAY_ADMIN.controlName}>{PLAY_CONFIG_COPY.tablesPaused}</span>
              <span className={PLAY_ADMIN.controlNote}>{PLAY_CONFIG_COPY.tablesPausedNote}</span>
            </div>
            <Toggle
              bare
              checked={config.tablesPaused}
              disabled={admin.isSaving}
              label={PLAY_CONFIG_COPY.tablesPaused}
              onChange={(next) =>
                void admin.save({ tablesPaused: next }, PLAY_CONFIG_COPY.settingsSaved)
              }
            />
          </div>

          <div className={PLAY_ADMIN.control}>
            <div className={PLAY_ADMIN.controlText}>
              <span className={PLAY_ADMIN.controlName}>{PLAY_CONFIG_COPY.announcement}</span>
              <span className={PLAY_ADMIN.controlNote}>
                {config.announcement ?? PLAY_CONFIG_COPY.announcementEmpty}
              </span>
            </div>
            <div className={PLAY_ADMIN.controlTools}>
              <Button variant="arcade" onClick={() => setEditing(true)}>
                {PLAY_CONFIG_COPY.announcementEdit}
              </Button>
              <Toggle
                bare
                checked={config.announcementOn}
                disabled={admin.isSaving || !config.announcement}
                label={PLAY_CONFIG_COPY.announcement}
                onChange={(next) =>
                  void admin.save({ announcementOn: next }, PLAY_CONFIG_COPY.settingsSaved)
                }
              />
            </div>
          </div>

          <FormDrawer
            key={isEditing ? 'open' : 'closed'}
            subject={FORM_SUBJECTS.playAnnouncement}
            open={isEditing}
            title={PLAY_CONFIG_COPY.announcementEdit}
            fields={PLAY_ANNOUNCEMENT_FIELDS}
            initialValues={{ announcement: config.announcement ?? '' }}
            issues={admin.issues}
            isSaving={admin.isSaving}
            onSubmit={(values) =>
              admin.save(
                {
                  announcement: String(values.announcement ?? ''),
                  announcementOn: Boolean(String(values.announcement ?? '').trim()),
                },
                PLAY_CONFIG_COPY.settingsSaved
              )
            }
            onClose={() => setEditing(false)}
          />
        </div>
      }
    >
      {PLAY_CONFIG_COPY.titleSettings}
    </PlayPageTitle>
  )
}
