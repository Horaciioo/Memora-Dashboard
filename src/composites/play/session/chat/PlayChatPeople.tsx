import { Avatar } from '@/components/elements/display/Avatar'
import { Tip } from '@/components/elements/feedback/Tip'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { BAC_SESSION_COPY } from '@/declarations/play'
import { PLAY_CHAT_UI } from '@/declarations/ui/variants'

/**
 * Faces of one group, name on hover
 * @param {Object} props - Group
 * @param {string} props.label - Group name
 * @param {PlayFace[]} props.faces - People
 * @return {JSX.Element}
 */

const FaceGroup = ({ label, faces }: { label: string; faces: PlayFace[] }) => (
  <div className={PLAY_CHAT_UI.peopleGroup} aria-label={label} role="group">
    <span className={PLAY_CHAT_UI.peopleLabel}>{label}</span>
    <div className={PLAY_CHAT_UI.peopleStack}>
      {faces.map((face) => (
        <Tip key={face.id} label={face.name} floating>
          <Avatar
            name={face.name}
            src={face.avatarUrl}
            size="xs"
            className={PLAY_CHAT_UI.peopleFace}
          />
        </Tip>
      ))}
    </div>
  </div>
)

/**
 * Strip under the tabs: players, then spectators when some watch
 * @param {Object} props - Crowd
 * @param {PlayFace[]} props.players - Seated
 * @param {PlayFace[]} props.spectators - Watching
 * @return {JSX.Element}
 */

export const PlayChatPeople = ({
  players,
  spectators,
}: {
  players: PlayFace[]
  spectators: PlayFace[]
}) => (
  <div className={PLAY_CHAT_UI.people}>
    <FaceGroup label={BAC_SESSION_COPY.players} faces={players} />
    {spectators.length > 0 && (
      <>
        <span className={PLAY_CHAT_UI.peopleSplit} aria-hidden="true" />
        <FaceGroup label={BAC_SESSION_COPY.spectators} faces={spectators} />
      </>
    )}
  </div>
)
