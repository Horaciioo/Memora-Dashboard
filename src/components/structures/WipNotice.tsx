import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Badge } from '@/components/elements/display/Badge'
import { WIP_COPY } from '@/declarations/ui/copy'
import type { IllustrationName } from '@/declarations/ui/illustrations'

export interface WipNoticeProps {
  figure?: IllustrationName
  description?: string
}

/**
 * Placeholder of a route that is declared but not wired yet
 * @param {IllustrationName} [figure] - Drawn figure, defaults to the start box
 * @param {string} [description] - Supporting line replacing the generic one
 * @return {JSX.Element}
 */

export const WipNotice = ({ figure = 'start', description }: WipNoticeProps) => (
  <EmptyState
    figure={figure}
    title={WIP_COPY.title}
    description={description ?? WIP_COPY.description}
    action={<Badge label={WIP_COPY.badge} tone="warning" icon="clock" />}
  />
)
