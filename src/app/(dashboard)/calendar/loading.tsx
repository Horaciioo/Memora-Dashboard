import { PageSkeleton } from '@/components/structures/page/PageSkeleton'

export default function Loading() {
  return <PageSkeleton blocks={[{ shape: 'board', rows: 1 }]} />
}
