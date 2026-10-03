'use client'

import { Button } from '@/components/elements/actions/Button'
import { ModWindow, WindowEmpty } from '@/composites/modview/ModWindow'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_FEED } from '@/declarations/ui/variants'
import type { UnbanRequest } from '@/types/modview'
import { formatSince } from '@/utils/format/dates'

export interface UnbanRequestsWindowProps {
  requests: UnbanRequest[]
  isLit: boolean
  gate: GateCheck
  onAct: ActRunner
}

/**
 * Requests to be unbanned, settled by responsables and admins
 * @param {UnbanRequest[]} requests - Requests
 * @param {boolean} isLit - Lit by a scene
 * @param {GateCheck} gate - Permission check
 * @param {ActRunner} onAct - Gesture runner
 * @return {JSX.Element}
 */

export const UnbanRequestsWindow = ({ requests, isLit, gate, onAct }: UnbanRequestsWindowProps) => (
  <ModWindow title={MODVIEW_COPY.unbanRequests} isLit={isLit} grow>
    {requests.length === 0 ? (
      <WindowEmpty
        icon="unbanRequest"
        title={MODVIEW_COPY.unbanEmptyTitle}
        body={MODVIEW_COPY.unbanEmptyBody}
      />
    ) : (
      <ul className={MODVIEW_FEED.list}>
        {requests.map((request) => {
          const check = gate({ kind: 'unbanRequest', requestId: request.id, approve: true })

          return (
            <li key={request.id} className={MODVIEW_FEED.item}>
              <div className={MODVIEW_FEED.main}>
                <p>
                  <span className={MODVIEW_FEED.who}>{request.author.name}</span>
                  {` · ${formatSince(request.at)}`}
                </p>
                <p className={MODVIEW_FEED.quote}>{request.text}</p>
                <div className={MODVIEW_FEED.actions}>
                  <Button
                    variant="success"
                    disabled={!check.allowed}
                    title={check.reason ?? undefined}
                    onClick={() =>
                      onAct({ kind: 'unbanRequest', requestId: request.id, approve: true })
                    }
                  >
                    {MODVIEW_COPY.approve}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={!check.allowed}
                    title={check.reason ?? undefined}
                    onClick={() =>
                      onAct({ kind: 'unbanRequest', requestId: request.id, approve: false })
                    }
                  >
                    {MODVIEW_COPY.deny}
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    )}
  </ModWindow>
)
