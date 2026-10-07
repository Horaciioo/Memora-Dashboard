import type { CourseSurface } from '@/declarations/academy/curriculum/types'

/**
 * Photograph of a course surface
 * @typedef {Object} CoursePhoto
 * @property {string} image - Path of the optimised file in public/courses
 * @property {string} author - Photographer
 * @property {string} photo - Identifier of the photo on Unsplash
 * @property {string} position - Where the crop sits on the picture
 */

export interface CoursePhoto {
  image: string
  author: string
  photo: string
  position: string
}

/**
 * Real photograph behind each course, by the place it takes place in
 * @type {Record<CourseSurface, CoursePhoto>}
 */

export const COURSE_PHOTOS: Record<CourseSurface, CoursePhoto> = {
  twitch: {
    image: '/courses/twitch.jpg',
    author: 'Chuck Fortner',
    photo: 'LFVBohYmtgc',
    position: '60% 60%',
  },
  lives: {
    image: '/courses/twitch.jpg',
    author: 'Chuck Fortner',
    photo: 'LFVBohYmtgc',
    position: '60% 60%',
  },
  discord: {
    image: '/courses/discord.jpg',
    author: 'Ella Don',
    photo: 'GGrvJHq1cM4',
    position: 'center',
  },
  youtube: {
    image: '/courses/youtube.jpg',
    author: 'Theo',
    photo: 'JXsx7lVeaAA',
    position: '50% 45%',
  },
  general: {
    image: '/courses/general.jpg',
    author: 'Thanos Pal',
    photo: 'NXjBX_DaZuo',
    position: '50% 70%',
  },
}
