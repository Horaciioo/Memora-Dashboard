import { PLAY_ADMIN } from '@/declarations/ui/variants'

// Boxes drawn grey while a page loads
const BOXES = 4

export default function Loading() {
  return (
    <div className={PLAY_ADMIN.skeletons} aria-busy="true">
      {Array.from({ length: BOXES }, (_, index) => (
        <span key={index} className={PLAY_ADMIN.skeleton} />
      ))}
    </div>
  )
}
