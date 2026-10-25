import { PLAY_HUB } from '@/declarations/ui/variants'

// Placeholder cards while the room loads
const CARDS = 3

export default function Loading() {
  return (
    <div className={PLAY_HUB.games} aria-busy="true">
      {Array.from({ length: CARDS }, (_, index) => (
        <span key={index} className={PLAY_HUB.skeleton} />
      ))}
    </div>
  )
}
