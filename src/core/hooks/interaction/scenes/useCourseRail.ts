'use client'

import { useSyncExternalStore } from 'react'

/**
 * What the left sidebar shows while a course is open
 * @typedef {Object} CourseRailState
 * @property {string} courseName - Course title
 * @property {string} surfaceLabel - Surface it is about
 * @property {string} backHref - Where the way back leads
 * @property {string} backLabel - Words of the way back
 * @property {{ key: string, title: string }[]} chapters - Chapters
 * @property {number} current - Chapter being read
 * @property {{ key: string, label: string }[]} steps - Screens of the open chapter
 * @property {number} step - Screen being read
 * @property {(index: number) => void} onStep - Goes back to an earlier screen
 * @property {boolean} finished - Every chapter cleared
 * @property {(index: number) => void} onSelect - Goes back to an earlier chapter
 */

export interface CourseRailState {
  courseName: string
  surfaceLabel: string
  backHref: string
  backLabel: string
  chapters: { key: string; title: string }[]
  current: number
  steps: { key: string; label: string }[]
  step: number
  onStep: (index: number) => void
  finished: boolean
  onSelect: (index: number) => void
}

let rail: CourseRailState | null = null
const listeners = new Set<() => void>()

/**
 * Hands the open course to the sidebar
 * @param {CourseRailState | null} next - Course state
 * @return {void}
 */

export const publishCourseRail = (next: CourseRailState | null): void => {
  rail = next
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

/**
 * Course open in the page
 * @return {CourseRailState | null} - Course state
 */

export const useCourseRail = (): CourseRailState | null =>
  useSyncExternalStore(
    subscribe,
    () => rail,
    () => null
  )
