import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Dotted } from '@/components/elements/display/Dotted'

export interface BylineProps {
  name: string | null
  avatar?: string | null
  // Pieces following the name
  items?: (ReactNode | null | undefined | false)[]
  // Moment written, under the name
  date?: string
}

/**
 * Portrait beside the author, the moment small and italic under the name
 * @param {BylineProps} props - Author, trailing pieces and moment
 * @return {JSX.Element}
 */

export const Byline = ({ name, avatar, items = [], date }: BylineProps) => (
  <span className="inline-flex items-center gap-2">
    {name && <Avatar name={name} src={avatar} size="xs" />}
    <span className="inline-flex flex-col">
      <Dotted items={[name, ...items]} />
      {date && <span className="text-xs font-normal italic opacity-80">{date}</span>}
    </span>
  </span>
)
