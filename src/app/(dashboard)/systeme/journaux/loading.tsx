import { PageSkeleton } from '@/components/structures/PageSkeleton'

export default function Loading() {
  return (
    <PageSkeleton
      blocks={[
        { shape: 'tile', rows: 2 },
        { shape: 'row', rows: 6 },
      ]}
    />
  )
}
