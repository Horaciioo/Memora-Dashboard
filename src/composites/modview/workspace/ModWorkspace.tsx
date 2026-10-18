'use client'

import { Fragment, useRef, useState } from 'react'
import type { DragEvent, ReactNode } from 'react'

import { SplitHandle } from '@/composites/modview/workspace/SplitHandle'
import { WindowChromeProvider } from '@/composites/modview/workspace/WindowChrome'
import type { WindowChrome } from '@/composites/modview/workspace/WindowChrome'
import type { useModLayout } from '@/core/hooks/interaction/layout/useModLayout'
import { SCALE_STEP, shownColumns } from '@/core/lib/modview/layout'
import type { DropSpot } from '@/core/lib/modview/layout'
import { MODVIEW_WORKSPACE_COPY } from '@/declarations/modview/workspace'
import { MODVIEW_WORKSPACE } from '@/declarations/ui/variants'
import type { ModViewWindow } from '@/types/modview'
import { cn } from '@/utils/classnames'

export interface ModWorkspaceProps {
  model: ReturnType<typeof useModLayout>
  render: (id: ModViewWindow) => ReactNode
}

// Share of a window's width that opens a column instead of a row
const EDGE_SHARE = 0.2

/**
 * Where a pointer over a window would drop
 * @param {DragEvent} event - Drag event
 * @param {ModViewWindow} id - Window under the pointer
 * @param {ReturnType<typeof useModLayout>['layout']} layout - Layout
 * @return {{ spot: DropSpot, side: 'left' | 'right' | 'top' | 'bottom' } | null} - Spot
 */

const spotOver = (
  event: DragEvent,
  id: ModViewWindow,
  layout: ReturnType<typeof useModLayout>['layout']
): { spot: DropSpot; side: 'left' | 'right' | 'top' | 'bottom' } | null => {
  const box = event.currentTarget.getBoundingClientRect()
  const x = (event.clientX - box.left) / box.width
  const y = (event.clientY - box.top) / box.height
  const columnIndex = layout.columns.findIndex((column) => column.windows.some((w) => w.id === id))
  const column = layout.columns[columnIndex]
  if (!column) return null
  const index = column.windows.findIndex((entry) => entry.id === id)

  if (x < EDGE_SHARE) return { spot: { newColumnAt: columnIndex }, side: 'left' }
  if (x > 1 - EDGE_SHARE) return { spot: { newColumnAt: columnIndex + 1 }, side: 'right' }

  return y < 0.5
    ? { spot: { column: column.id, index }, side: 'top' }
    : { spot: { column: column.id, index: index + 1 }, side: 'bottom' }
}

/**
 * Windows in columns, stretched by handles, moved by drag and drop
 * @param {ReturnType<typeof useModLayout>} model - Layout and its gestures
 * @param {(id: ModViewWindow) => ReactNode} render - Window content
 * @return {JSX.Element}
 */

export const ModWorkspace = ({ model, render }: ModWorkspaceProps) => {
  const { layout } = model
  const rootRef = useRef<HTMLDivElement>(null)
  const columnRefs = useRef(new Map<string, HTMLDivElement>())
  const [dragging, setDragging] = useState<ModViewWindow | null>(null)
  const [over, setOver] = useState<{ id: ModViewWindow; side: string; spot: DropSpot } | null>(null)

  const columns = shownColumns(layout, model.isShown)
  const maximized = layout.maximized && model.isShown(layout.maximized) ? layout.maximized : null
  const totalWidth = columns.reduce((sum, column) => sum + column.weight, 0)

  const drop = () => {
    if (dragging && over && over.id !== dragging) model.move(dragging, over.spot)
    setDragging(null)
    setOver(null)
  }

  const chromeOf = (id: ModViewWindow, isFolded: boolean): WindowChrome => ({
    id,
    isFolded,
    isMaximized: maximized === id,
    onDragStart: (event) => {
      event.dataTransfer.setData('text/plain', id)
      event.dataTransfer.effectAllowed = 'move'
      setDragging(id)
    },
    onDragEnd: () => {
      setDragging(null)
      setOver(null)
    },
    commands: {
      fold: () => model.fold(id),
      maximize: () => model.maximize(id),
      taller: () => model.scaleWindow(id, SCALE_STEP),
      shorter: () => model.scaleWindow(id, 1 / SCALE_STEP),
      wider: () => model.scaleColumn(id, SCALE_STEP),
      narrower: () => model.scaleColumn(id, 1 / SCALE_STEP),
      hide: () => model.toggleHidden(id),
    },
  })

  return (
    <div ref={rootRef} className={MODVIEW_WORKSPACE.root}>
      {columns.map((column, columnIndex) => {
        const previous = columns[columnIndex - 1]
        const hasMaximized = maximized !== null && column.windows.some((w) => w.id === maximized)
        const weights = column.windows.filter((entry) => !entry.isFolded)
        const totalHeight = weights.reduce((sum, entry) => sum + entry.weight, 0)

        return (
          <Fragment key={column.id}>
            {previous && !maximized && (
              <SplitHandle
                orientation="vertical"
                label={MODVIEW_WORKSPACE_COPY.resizeColumns}
                onMove={(pixels) =>
                  model.resizeColumns(
                    previous.id,
                    column.id,
                    (pixels / (rootRef.current?.clientWidth || 1)) * totalWidth
                  )
                }
              />
            )}
            <div
              ref={(node) => {
                if (node) columnRefs.current.set(column.id, node)
                else columnRefs.current.delete(column.id)
              }}
              className={cn(
                MODVIEW_WORKSPACE.column,
                maximized && !hasMaximized && MODVIEW_WORKSPACE.away
              )}
              style={{ flex: `${maximized ? 1 : column.weight} 1 0%` }}
            >
              {column.windows.map((entry, windowIndex) => {
                const above = column.windows[windowIndex - 1]
                const isAway = maximized !== null && entry.id !== maximized
                const hint = over?.id === entry.id ? over : null

                return (
                  <Fragment key={entry.id}>
                    {above && !maximized && (
                      <SplitHandle
                        orientation="horizontal"
                        label={MODVIEW_WORKSPACE_COPY.resizeWindows}
                        onMove={(pixels) =>
                          model.resizeWindows(
                            above.id,
                            entry.id,
                            (pixels / (columnRefs.current.get(column.id)?.clientHeight || 1)) *
                              totalHeight
                          )
                        }
                      />
                    )}
                    <div
                      className={cn(
                        MODVIEW_WORKSPACE.slot,
                        isAway && MODVIEW_WORKSPACE.away,
                        dragging === entry.id && MODVIEW_WORKSPACE.dragging
                      )}
                      style={{
                        flex: entry.isFolded && !maximized ? '0 0 auto' : `${entry.weight} 1 0%`,
                      }}
                      onDragOver={(event) => {
                        if (!dragging || dragging === entry.id) return
                        event.preventDefault()
                        const next = spotOver(event, entry.id, layout)
                        if (next) setOver({ id: entry.id, ...next })
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        drop()
                      }}
                    >
                      <WindowChromeProvider
                        value={chromeOf(entry.id, entry.isFolded && !maximized)}
                      >
                        {render(entry.id)}
                      </WindowChromeProvider>
                      {hint && (
                        <span
                          className={
                            {
                              left: MODVIEW_WORKSPACE.dropLeft,
                              right: MODVIEW_WORKSPACE.dropRight,
                              top: MODVIEW_WORKSPACE.dropTop,
                              bottom: MODVIEW_WORKSPACE.dropBottom,
                            }[hint.side]
                          }
                        />
                      )}
                    </div>
                  </Fragment>
                )
              })}
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
