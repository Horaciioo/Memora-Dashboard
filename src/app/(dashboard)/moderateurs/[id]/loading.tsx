import { PageSkeleton } from '@/components/structures/PageSkeleton'

export default function Loading() {
  return (
    <PageSkeleton
      blocks={[
        { shape: 'tile', rows: 1 },
        { shape: 'sheet', rows: 2 },
      ]}
    />
  )
}
