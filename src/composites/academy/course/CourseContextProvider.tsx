'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

import type { CourseContext } from '@/types/academy'

const EMPTY: CourseContext = { ladder: { admins: [], responsables: [] }, livecon: [] }

const Context = createContext<CourseContext>(EMPTY)

/**
 * Hand the course context to every block
 * @param {Object} props - Provider props
 * @param {CourseContext} props.value - Context read server-side
 * @param {ReactNode} props.children - Course
 * @return {JSX.Element}
 */

export const CourseContextProvider = ({
  value,
  children,
}: {
  value: CourseContext
  children: ReactNode
}) => <Context.Provider value={value}>{children}</Context.Provider>

/**
 * Read the course context
 * @return {CourseContext} - Context
 */

export const useCourseContext = (): CourseContext => useContext(Context)
