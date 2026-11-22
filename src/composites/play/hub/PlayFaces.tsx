import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { PLAY_FEATURE } from '@/declarations/ui/variants'
import type { PlayPerson } from '@/types/play'

// Faces drawn before the rest
const SHOWN = 4

/**
 * Players sitting at a game, overlapped
 * @param {Object} props - Faces
 * @param {PlayPerson[]} props.people - Players
 * @param {string} [props.className] - Row style
 * @return {JSX.Element | null}
 */

export const PlayFaces = ({
  people,
  className = PLAY_FEATURE.faces,
}: {
  people: PlayPerson[]
  className?: string
}) => {
  if (people.length === 0) return null

  return (
    <div className={className}>
      {people.slice(0, SHOWN).map((person) => (
        <PlayAvatar
          key={person.id}
          accountId={person.id}
          name={person.name}
          src={person.avatarUrl}
          size="sm"
          className={PLAY_FEATURE.face}
        />
      ))}
    </div>
  )
}
