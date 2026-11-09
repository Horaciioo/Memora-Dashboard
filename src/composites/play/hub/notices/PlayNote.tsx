import { PLAY_NOTE } from '@/declarations/ui/variants'

export interface PlayNoteProps {
  text: string | null
}

/**
 * Floating line above the dock
 * @param {PlayNoteProps} props - Text, empty hides it
 * @return {JSX.Element | null}
 */

export const PlayNote = ({ text }: PlayNoteProps) =>
  text && (
    <p role="status" className={PLAY_NOTE.note}>
      {text}
    </p>
  )
