'use client'

import { useState } from 'react'
import { initialsOf } from '@/utils/format/initials'

export interface AvatarImageProps {
  name: string
  src: string
  size: number
}

/**
 * Portrait picture, the initials take over when the file is gone
 * @param {string} name - Display name
 * @param {string} src - Portrait URL
 * @param {number} size - Pixel size
 * @return {JSX.Element}
 */

export const AvatarImage = ({ name, src, size }: AvatarImageProps) => {
  const [failed, setFailed] = useState<string | null>(null)

  if (failed === src) return <>{initialsOf(name)}</>

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(src)}
      className="h-full w-full object-cover"
    />
  )
}
