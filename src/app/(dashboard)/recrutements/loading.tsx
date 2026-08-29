import { PageSkeleton } from '@/components/structures/PageSkeleton'

export default function Loading() {
  return <PageSkeleton blocks={[{ shape: 'card', rows: 3 }]} />
}
