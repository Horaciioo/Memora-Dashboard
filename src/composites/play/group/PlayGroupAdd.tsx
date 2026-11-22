import { ICONS } from '@/declarations/ui/icons'
import { PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_GROUP } from '@/declarations/ui/variants'

/**
 * Dashed box with the same footprint as a group card, opens the creation steps
 * @param {Object} props - Handler
 * @param {() => void} props.onOpen - Open the steps
 * @return {JSX.Element}
 */

export const PlayGroupAdd = ({ onOpen }: { onOpen: () => void }) => {
  const AddIcon = ICONS.add

  return (
    <button type="button" className={PLAY_GROUP.addBox} onClick={onOpen}>
      <AddIcon className={PLAY_GROUP.addIcon} aria-hidden="true" />
      {PLAY_GROUP_COPY.createNew}
    </button>
  )
}
