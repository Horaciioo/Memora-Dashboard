import { PageSkeleton } from '@/components/structures/PageSkeleton'

/**
 * Placeholder of the moderation board
 * @return {JSX.Element}
 */

export default function Loading() {
  return (
    <PageSkeleton
      blocks={[
        { shape: 'tile', rows: 1 },
        { shape: 'card', rows: 8 },
      ]}
    />
  )
}
