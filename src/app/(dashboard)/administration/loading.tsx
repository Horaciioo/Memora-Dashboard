import { PageSkeleton } from '@/components/structures/PageSkeleton'

export default function Loading() {
  return (
    <PageSkeleton
      blocks={[
        { shape: 'tile', rows: 4 },
        { shape: 'sheet', rows: 1 },
      ]}
    />
  )
}
