'use client'

import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { SlotList } from '@/composites/search/assistant/SlotList'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_STYLES, PALETTE_STYLES } from '@/declarations/ui/variants'
import type { AssistantProposal } from '@/types/assistant'
import { cn } from '@/utils/classnames'

export interface AssistantPreviewRowProps {
  proposal: AssistantProposal | null
  isLoading: boolean
  isActive: boolean
  onHover: () => void
  onSelect: () => void
}

/**
 * Memora's reading of a command
 * @param {AssistantPreviewRowProps} props - Proposal and row state
 * @return {JSX.Element}
 */

export const AssistantPreviewRow = ({
  proposal,
  isLoading,
  isActive,
  onHover,
  onSelect,
}: AssistantPreviewRowProps) => (
  <div>
    <p className={PALETTE_STYLES.group}>{ASSISTANT_COPY.section}</p>
    <button
      type="button"
      onMouseEnter={onHover}
      onClick={onSelect}
      className={cn('brain-wake', PALETTE_STYLES.result, isActive && PALETTE_STYLES.resultActive)}
    >
      <BrainMark motion={isLoading ? 'loop' : 'idle'} className={ASSISTANT_STYLES.rowMark} />
      <span className={ASSISTANT_STYLES.rowBody}>
        <span className={ASSISTANT_STYLES.rowReply}>
          {isLoading || !proposal ? ASSISTANT_COPY.thinking : proposal.reply}
        </span>
        {proposal && <SlotList slots={proposal.slots} inline />}
      </span>
      <span className={ASSISTANT_STYLES.rowHint} aria-hidden="true">
        ↵
      </span>
    </button>
  </div>
)
