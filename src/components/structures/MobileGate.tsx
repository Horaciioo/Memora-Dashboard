import type { ReactNode } from 'react'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { MOBILE_GATE_COPY } from '@/declarations/ui/copy'

export interface MobileGateProps {
  children: ReactNode
}

/**
 * Whole app on larger screens, one message on a phone
 * @param {ReactNode} children - The app
 * @return {JSX.Element}
 */

export const MobileGate = ({ children }: MobileGateProps) => (
  <>
    <div className="hidden md:contents">{children}</div>
    <div className="flex min-h-dvh items-center justify-center p-8 md:hidden">
      <EmptyState
        figure="start"
        title={MOBILE_GATE_COPY.title}
        description={MOBILE_GATE_COPY.description}
        action={null}
      />
    </div>
  </>
)
