import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CoursePlayer } from '@/composites/academy/course/CoursePlayer'
import { API_ROUTES } from '@/core/lib/api/routes'
import { readModule } from '@/core/services/academy/LegacyService'
import { requireUser } from '@/core/wrappers/requireUser'
import { LEGACY_COPY } from '@/declarations/academy/legacy/copy'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_STYLES } from '@/declarations/ui/variants'

interface LegacyModulePageProps {
  params: Promise<{ id: string; key: string }>
}

export const metadata: Metadata = { title: LEGACY_COPY.ownTitle }

/**
 * One module of a Legacy track, played by the member it belongs to
 * @param {LegacyModulePageProps} props - Track and module keys
 * @return {Promise<JSX.Element>} - Module page
 */

export default async function LegacyModulePage({ params }: LegacyModulePageProps) {
  const { id, key } = await params
  const { session } = await requireUser()

  // Only the member plays it, anyone else goes back to the track
  const found = await readModule(id, key, session, false).catch(() => null)
  if (!found || !found.playable) redirect(ROUTES.legacyTrack(id))

  return (
    <div className={PAGE_STYLES.wrapper}>
      <CoursePlayer
        submitPath={API_ROUTES.legacyExercise(id, key)}
        course={found.course}
        initialProgress={found.progress}
        backHref={ROUTES.legacyTrack(id)}
        backLabel={LEGACY_COPY.back}
      />
    </div>
  )
}
