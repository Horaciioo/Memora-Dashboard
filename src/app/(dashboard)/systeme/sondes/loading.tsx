import { PageSkeleton } from '@/components/structures/PageSkeleton'

export default function Loading() {
  return <PageSkeleton blocks={[{ shape: 'row', rows: 8 }]} />
}
