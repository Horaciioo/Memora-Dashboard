import { Avatar } from '@/components/elements/display/Avatar'
import { RoleGlyph } from '@/composites/members/MemberBadges'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { DATE_COPY } from '@/declarations/ui/dates'
import { PROFILE_CARD } from '@/declarations/ui/variants'
import type { ProfileDetail } from '@/types/preferences'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

export interface ProfileCardProps {
  profile: ProfileDetail
}

/**
 * Who is signed in, with the facts of the file, beside every settings tab
 * @param {ProfileCardProps} props - Profile resolved server-side
 * @return {JSX.Element}
 */

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  const facts = [
    { label: FIELD_COPY.division, value: profile.division },
    {
      label: FIELD_COPY.youtuber,
      value: profile.youtubers.length > 0 ? profile.youtubers.join(', ') : null,
    },
    { label: FIELD_COPY.mainFunction, value: profile.primaryFunctions },
    { label: FIELD_COPY.secondFunction, value: profile.secondaryFunctions },
    { label: FIELD_COPY.joinedAt, value: formatDay(profile.joinedAt) },
    { label: PREFERENCES_COPY.academyDispositif, value: profile.academyDispositif },
  ]

  return (
    <aside className={PROFILE_CARD.root}>
      <Avatar name={profile.displayName} src={profile.avatarUrl} size="lg" />
      <p className={PROFILE_CARD.name}>{profile.displayName}</p>
      <RoleGlyph role={profile.role} />
      <dl className={PROFILE_CARD.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={PROFILE_CARD.fact}>
            <dt className={PROFILE_CARD.label}>{fact.label}</dt>
            <dd className={cn(PROFILE_CARD.value, !fact.value && PROFILE_CARD.empty)}>
              {fact.value || DATE_COPY.none}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
