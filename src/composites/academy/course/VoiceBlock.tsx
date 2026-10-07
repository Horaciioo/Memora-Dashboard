import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_TONES, COURSE_VOICE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Discord voice channels with the team inside
 * @param {Object} props - Block
 * @return {JSX.Element}
 */

export const VoiceBlock = ({ block }: { block: Extract<ReadBlock, { kind: 'voices' }> }) => (
  <ul className={COURSE_VOICE.list}>
    {block.channels.map((channel) => {
      const Icon = channel.isCreator ? ICONS.add : ICONS.voice

      return (
        <li key={channel.key} className={COURSE_VOICE.channel}>
          <span className={COURSE_VOICE.row}>
            <Icon className={COURSE_VOICE.rowIcon} aria-hidden="true" />
            {channel.name}
          </span>
          {channel.members.map((member) => (
            <span key={member.name} className={COURSE_VOICE.member}>
              <span className={cn(COURSE_VOICE.avatar, COURSE_TONES[member.tone])}>
                {member.name.charAt(0)}
              </span>
              {member.name}
            </span>
          ))}
        </li>
      )
    })}
  </ul>
)
