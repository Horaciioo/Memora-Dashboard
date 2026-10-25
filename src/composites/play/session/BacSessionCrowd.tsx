import { Avatar } from '@/components/elements/display/Avatar'
import { Tip } from '@/components/elements/feedback/Tip'
import { BAC_SESSION_COPY } from '@/declarations/play'
import { BAC_SESSION } from '@/declarations/ui/variants'

/**
 * Face shown in a stack
 * @typedef {Object} PlayFace
 */

export interface PlayFace {
  id: string
  name: string
  avatarUrl: string | null
}

/**
 * Overlapping avatars, name on hover
 * @param {Object} props - Faces
 * @param {PlayFace[]} props.faces - People
 * @return {JSX.Element}
 */

const FaceStack = ({ faces }: { faces: PlayFace[] }) => (
  <div className={BAC_SESSION.stack}>
    {faces.map((face) => (
      <Tip key={face.id} label={face.name} floating>
        <Avatar name={face.name} src={face.avatarUrl} size="sm" className={BAC_SESSION.stacked} />
      </Tip>
    ))}
  </div>
)

/**
 * Window of who is there: players, then spectators when some watch
 * @param {Object} props - Crowd
 * @param {PlayFace[]} props.players - Seated
 * @param {PlayFace[]} props.spectators - Watching
 * @return {JSX.Element}
 */

export const BacSessionCrowd = ({
  players,
  spectators,
}: {
  players: PlayFace[]
  spectators: PlayFace[]
}) => (
  <section className={BAC_SESSION.crowd}>
    <div className={BAC_SESSION.group}>
      <h2 className={BAC_SESSION.groupTitle}>{BAC_SESSION_COPY.players}</h2>
      <FaceStack faces={players} />
    </div>
    {spectators.length > 0 && (
      <div className={BAC_SESSION.group}>
        <h2 className={BAC_SESSION.groupTitle}>{BAC_SESSION_COPY.spectators}</h2>
        <FaceStack faces={spectators} />
      </div>
    )}
  </section>
)
