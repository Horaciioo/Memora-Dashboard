import { PageSkeleton } from '@/components/structures/PageSkeleton'

export default function Loading() {
  return (
    <PageSkeleton
      blocks={[
        { shape: 'line', rows: 1 },
        { shape: 'sheet', rows: 2 },
      ]}
    />
  )
}
