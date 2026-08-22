'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { apiUpload } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { FILE_COPY } from '@/declarations/ui/copy'
import { FILE_SETTINGS } from '@/declarations/configurations/settings'
import { FILE_INPUT_STYLES } from '@/declarations/ui/variants'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { StorageBucket } from '@/types/storage'
import { cn } from '@/utils/classnames'

export interface FileInputProps {
  id: string
  value: string | null
  bucket: StorageBucket
  disabled?: boolean
  invalid?: boolean
  onChange: (url: string | null) => void
}

/**
 * Picture field, the file travelling to the storage route and only its URL landing in the form
 * @param {string} id - Control identifier
 * @param {string | null} value - Stored picture URL
 * @param {StorageBucket} bucket - Destination bucket
 * @param {boolean} [disabled] - Blocks the control
 * @param {boolean} [invalid] - Paints the rejection border
 * @param {(url: string | null) => void} onChange - Value handler
 * @return {JSX.Element}
 */

export const FileInput = ({ id, value, bucket, disabled, invalid, onChange }: FileInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { notifyError } = useNotifications()
  const [isUploading, setUploading] = useState(false)

  const upload = async (file: File) => {
    setUploading(true)

    try {
      const form = new FormData()
      form.set('file', file)
      form.set('bucket', bucket)

      const stored = await apiUpload<{ url: string }>(API_ROUTES.files, form)
      onChange(stored.url)
    } catch (error) {
      notifyError(error)
    } finally {
      setUploading(false)
      // Picking the very same file again still fires a change
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn(FILE_INPUT_STYLES.frame, invalid && FILE_INPUT_STYLES.invalid)}>
      {value ? (
        // The picture is user supplied, so no static import and no optimiser
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className={FILE_INPUT_STYLES.preview} />
      ) : (
        <span className={FILE_INPUT_STYLES.placeholder} aria-hidden="true" />
      )}
      <div className={FILE_INPUT_STYLES.actions}>
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="sr-only"
          accept={FILE_SETTINGS.allowedTypes.join(',')}
          disabled={disabled || isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
          }}
        />
        <Button
          icon="add"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? FILE_COPY.uploading : value ? FILE_COPY.replace : FILE_COPY.choose}
        </Button>
        {value && (
          <Button
            variant="ghost"
            icon="remove"
            disabled={disabled || isUploading}
            onClick={() => onChange(null)}
          >
            {FILE_COPY.remove}
          </Button>
        )}
      </div>
    </div>
  )
}
