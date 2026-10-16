import { RevealMark } from '@/components/elements/display/marks/RevealMark'
import { DEADLINE_COPY } from '@/declarations/work/copy'

export interface OverdueMarkProps {
  kind: keyof typeof DEADLINE_COPY
}

/**
 * Glyph warning of a late item
 * @param {keyof typeof DEADLINE_COPY} kind - Project, task or meeting
 * @return {JSX.Element}
 */

export const OverdueMark = ({ kind }: OverdueMarkProps) => (
  <RevealMark icon="failure" tone="danger" label={DEADLINE_COPY[kind]} />
)
