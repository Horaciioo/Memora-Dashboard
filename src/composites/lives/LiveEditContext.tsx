'use client'

import { createContext, useContext } from 'react'

/**
 * Live whose data the viewer corrects
 * @typedef {Object} LiveEdit
 * @property {string} liveId - Live
 * @property {boolean} canEdit - Viewer may correct its data
 */

export interface LiveEdit {
  liveId: string
  canEdit: boolean
}

const LiveEditContext = createContext<LiveEdit>({ liveId: '', canEdit: false })

export const LiveEditProvider = LiveEditContext.Provider

export const useLiveEdit = (): LiveEdit => useContext(LiveEditContext)
