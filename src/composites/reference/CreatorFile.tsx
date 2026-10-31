'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { FileTabs } from '@/components/structures/page/FileTabs'
import { Section } from '@/components/structures/page/Section'
import { CreatorDesignPanel } from '@/composites/reference/CreatorDesignPanel'
import { CreatorChannelsPanel } from '@/composites/reference/CreatorChannelsPanel'
import { CreatorLeadsPanel } from '@/composites/reference/CreatorLeadsPanel'
import { CreatorTeamsPanel } from '@/composites/reference/CreatorTeamsPanel'
import { CHANNEL_COPY } from '@/declarations/platforms/copy'
import { DESIGN_COPY } from '@/declarations/reference/design'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import { TEAM_COPY } from '@/declarations/teams/copy'
import { CREATOR_FILE, MEMBER_FILE } from '@/declarations/ui/blocks'
import { LIVE_STAGE } from '@/declarations/ui/variants'
import type { LeadAnchor } from '@/types/access'
import type { CreatorDesign } from '@/types/design'
import type { CreatorChannelView } from '@/types/platforms'
import type { CreatorTeamData } from '@/types/teams'

export interface CreatorFileProps {
  youtuberId: string
  name: string
  avatarUrl: string | null
  bannerUrl: string | null
  channels: CreatorChannelView[]
  anchors: LeadAnchor[]
  teams: CreatorTeamData
  design: CreatorDesign
  canManageTeams: boolean
  canManageCreator: boolean
}

/**
 * Creator file: a left box with the logo and name, channels and administration under it, teams beside
 * @param {CreatorFileProps} props - Data resolved server-side
 * @return {JSX.Element}
 */

export const CreatorFile = ({
  youtuberId,
  name,
  avatarUrl,
  bannerUrl,
  channels,
  anchors,
  teams,
  design,
  canManageTeams,
  canManageCreator,
}: CreatorFileProps) => (
  <div className={MEMBER_FILE.layout}>
    <div className={MEMBER_FILE.railStack}>
      <aside className={MEMBER_FILE.rail}>
        <div className={CREATOR_FILE.railHead}>
          {(bannerUrl ?? avatarUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl ?? avatarUrl ?? ''} alt="" className={LIVE_STAGE.backdrop} />
          )}
          <div className={LIVE_STAGE.wash} aria-hidden="true" />
          <Avatar name={name} src={avatarUrl} size="lg" className={CREATOR_FILE.railPortrait} />
          <h2 className={CREATOR_FILE.railName}>{name}</h2>
        </div>
        <div className={CREATOR_FILE.railBody}>
          <div className={MEMBER_FILE.railItem}>
            <span className={MEMBER_FILE.groupTitle}>{CHANNEL_COPY.title}</span>
            <CreatorChannelsPanel
              key={channels.map((channel) => channel.id).join()}
              youtuberId={youtuberId}
              initialChannels={channels}
              canManage={canManageCreator}
            />
          </div>
          <div className={MEMBER_FILE.railItem}>
            <span className={MEMBER_FILE.groupTitle}>{REFERENCE_FIELD_COPY.leadsTitle}</span>
            <CreatorLeadsPanel
              key={anchors.map((anchor) => anchor.accountId).join()}
              youtuberId={youtuberId}
              initialAnchors={anchors}
              canManage={canManageCreator}
              isStacked
            />
          </div>
        </div>
      </aside>
    </div>
    <div className={MEMBER_FILE.main}>
      <FileTabs
        label={name}
        tabs={[
          {
            value: 'teams',
            label: TEAM_COPY.title,
            icon: 'teams',
            render: () => (
              <Section title={TEAM_COPY.title} description={TEAM_COPY.lead} padded>
                <CreatorTeamsPanel
                  youtuberId={youtuberId}
                  initial={teams}
                  canManage={canManageTeams}
                />
              </Section>
            ),
          },
          {
            value: 'design',
            label: DESIGN_COPY.tab,
            icon: 'spark',
            render: () => (
              <Section padded>
                <CreatorDesignPanel
                  youtuberId={youtuberId}
                  initial={design}
                  canManage={canManageCreator}
                />
              </Section>
            ),
          },
        ]}
      />
    </div>
  </div>
)
