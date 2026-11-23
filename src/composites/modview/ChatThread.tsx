'use client'

import { ChatRow } from '@/composites/modview/ChatRow'
import type { ChatRowProps } from '@/composites/modview/ChatRow'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_CHAT } from '@/declarations/ui/variants'
import type { ChatMessage } from '@/types/modview'

export interface ChatThreadProps {
  threadId: string
  messages: ChatMessage[]
  // Props every line of the chat shares
  rowProps: Omit<ChatRowProps, 'message' | 'onThread' | 'repeat'>
  onClose: () => void
}

/**
 * Thread of a conversation: first message, then every answer
 * @param {ChatThreadProps} props - Thread props
 * @return {JSX.Element}
 */

export const ChatThread = ({ threadId, messages, rowProps, onClose }: ChatThreadProps) => {
  const CloseIcon = ICONS.close
  const ChatIcon = ICONS.chat
  const root = messages.find((message) => message.id === threadId)
  const answers = messages.filter(
    (message) => message.id !== threadId && message.reply?.threadId === threadId
  )

  return (
    <section className={MODVIEW_CHAT.thread} aria-label={MODVIEW_COPY.thread}>
      <header className={MODVIEW_CHAT.threadHead}>
        <ChatIcon className={MODVIEW_CHAT.toolIcon} aria-hidden="true" />
        <span className="flex-1">{MODVIEW_COPY.thread}</span>
        <button
          type="button"
          className={MODVIEW_CHAT.replyClose}
          aria-label={MODVIEW_COPY.threadClose}
          title={MODVIEW_COPY.threadClose}
          onClick={onClose}
        >
          <CloseIcon className={MODVIEW_CHAT.toolIcon} aria-hidden="true" />
        </button>
      </header>
      <div className={MODVIEW_CHAT.threadBody}>
        <ul className="flex flex-col">{root && <ChatRow {...rowProps} message={root} />}</ul>
        <ul className={MODVIEW_CHAT.threadReplies}>
          {answers.map((message) => (
            <ChatRow key={message.id} {...rowProps} message={message} />
          ))}
        </ul>
      </div>
    </section>
  )
}
