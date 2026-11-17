import { PLAY_ADMIN } from '@/declarations/ui/variants'

// Creator banners while the board loads
const BANNERS = 4

export default function Loading() {
  return (
    <div className={PLAY_ADMIN.groups} aria-busy="true">
      {Array.from({ length: BANNERS }, (_, index) => (
        <span key={index} className={PLAY_ADMIN.skeleton} />
      ))}
    </div>
  )
}
