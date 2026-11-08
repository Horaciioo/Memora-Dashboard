import { Avatar } from '@/components/elements/display/Avatar'
import { WELCOME_STYLES } from '@/declarations/ui/variants'

/**
 * Discord identity shown in the thread
 * @typedef {Object} ThreadIdentity
 * @property {string} name - Discord handle
 * @property {string} discordId - Discord identifier
 * @property {string | null} avatarUrl - Discord portrait
 */

export interface ThreadIdentity {
  name: string
  discordId: string
  avatarUrl: string | null
}

/**
 * Avatar on the left, name and identifier under it on the right
 * @param {ThreadIdentity} identity - Identity shown
 * @return {JSX.Element}
 */

export const WelcomeIdentity = ({ identity }: { identity: ThreadIdentity }) => (
  <div className={WELCOME_STYLES.identity}>
    <Avatar name={identity.name} src={identity.avatarUrl} size="lg" />
    <div className="flex min-w-0 flex-col">
      <span className={WELCOME_STYLES.identityName}>{identity.name}</span>
      <span className={WELCOME_STYLES.identityHandle}>{identity.discordId}</span>
    </div>
  </div>
)
