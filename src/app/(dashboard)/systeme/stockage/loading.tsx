import { PageSkeleton } from '@/components/structures/PageSkeleton'

export default function Loading() {
  return (
    <PageSkeleton
      blocks={[
        { shape: 'tile', rows: 3 },
        { shape: 'row', rows: 3 },
      ]}
    />
  )
}
