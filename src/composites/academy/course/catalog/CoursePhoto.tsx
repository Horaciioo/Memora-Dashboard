import Image from 'next/image'

import { COURSE_PHOTOS } from '@/declarations/academy/photos'
import type { CourseSurface } from '@/declarations/academy/curriculum/types'

export interface CoursePhotoProps {
  surface: CourseSurface
  className: string
  sizes: string
  // Above the fold
  isPriority?: boolean
}

/**
 * Real photograph of the place a course takes place in
 * @param {CoursePhotoProps} props - Surface and sizing
 * @return {JSX.Element}
 */

export const CoursePhoto = ({ surface, className, sizes, isPriority }: CoursePhotoProps) => {
  const photo = COURSE_PHOTOS[surface]

  return (
    <Image
      src={photo.image}
      alt=""
      fill
      sizes={sizes}
      priority={isPriority}
      className={className}
      style={{ objectPosition: photo.position }}
    />
  )
}
