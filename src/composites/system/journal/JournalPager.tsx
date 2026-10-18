'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Pagination } from '@/components/elements/navigation/Pagination'
import { JOURNAL_PARAMS } from '@/declarations/system/monitoring/journal'

export interface JournalPagerProps {
  page: number
  pages: number
}

/**
 * Page switcher bound to the address
 * @param {number} page - Current page
 * @param {number} pages - Page count
 * @return {JSX.Element}
 */

export const JournalPager = ({ page, pages }: JournalPagerProps) => {
  const router = useRouter()
  const params = useSearchParams()

  const go = (next: number) => {
    const query = new URLSearchParams(params.toString())
    query.set(JOURNAL_PARAMS.page, String(next))
    router.replace(`?${query.toString()}`, { scroll: false })
  }

  return <Pagination page={page} totalPages={pages} onPageChange={go} />
}
