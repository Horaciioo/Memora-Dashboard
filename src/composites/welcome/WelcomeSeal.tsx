import { WELCOME_COPY } from '@/declarations/onboarding/welcome'
import { WELCOME_STYLES } from '@/declarations/ui/variants'
import { fillTemplate } from '@/utils/format/strings'

export interface WelcomeSealProps {
  sessionName: string
}

/**
 * The check drawn once the file is confirmed, then the welcome in the session
 * @param {string} sessionName - Promotion joined
 * @return {JSX.Element}
 */

export const WelcomeSeal = ({ sessionName }: WelcomeSealProps) => (
  <div className={WELCOME_STYLES.seal} role="status">
    <span className={WELCOME_STYLES.sealRing}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={WELCOME_STYLES.sealCheck}
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" className="seal-check" />
      </svg>
    </span>
    <div className={WELCOME_STYLES.sealText}>
      <p className={WELCOME_STYLES.sealTitle}>
        {fillTemplate(WELCOME_COPY.welcome, { session: sessionName })}
      </p>
      <p className={WELCOME_STYLES.sealSub}>{WELCOME_COPY.welcomeSub}</p>
    </div>
  </div>
)
