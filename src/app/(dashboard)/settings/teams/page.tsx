import { redirect } from 'next/navigation'
import { ROUTES } from '@/declarations/navigation'

/**
 * Teams live in each creator file now
 * @return {never} - Redirect
 */

export default function TeamsPage() {
  redirect(ROUTES.settingsSection('youtubeurs'))
}
