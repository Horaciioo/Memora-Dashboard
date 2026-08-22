import { PageSkeleton } from '@/components/structures/PageSkeleton'

export default function Loading() {
  return (
    <PageSkeleton
      blocks={[
        { shape: 'sheet', rows: 1 },
        { shape: 'row', rows: 4 },
      ]}
    />
  )
}
