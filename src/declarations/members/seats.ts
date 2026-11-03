import { FunctionNames } from '@/declarations/reference/fixed'

/**
 * Secondary functions that last one session
 * @typedef {'recruiter' | 'observer' | 'trainer'} TemporaryKind
 */

export type TemporaryKind = 'recruiter' | 'observer' | 'trainer'

/**
 * Gestures on the seat a temporary function holds
 * @typedef {'revoke' | 'restore' | 'forget'} SeatAction
 */

export type SeatAction = 'revoke' | 'restore' | 'forget'

/**
 * Family of session a seat belongs to
 * @typedef {'recruitment' | 'academy'} SeatFamily
 */

export type SeatFamily = 'recruitment' | 'academy'

/**
 * Function and form field of each temporary seat
 * @type {Record<TemporaryKind, { functionName: string, field: string, family: SeatFamily }>}
 */

export const TEMPORARY_SEATS: Record<
  TemporaryKind,
  { functionName: string; field: string; family: SeatFamily }
> = {
  recruiter: {
    functionName: FunctionNames.Recruiters,
    field: 'recruiterSessionId',
    family: 'recruitment',
  },
  observer: {
    functionName: FunctionNames.Observers,
    field: 'observerSessionId',
    family: 'recruitment',
  },
  trainer: {
    functionName: FunctionNames.Trainers,
    field: 'trainerSessionId',
    family: 'academy',
  },
}

/**
 * Kinds in showing order
 * @type {TemporaryKind[]}
 */

export const TEMPORARY_KINDS: TemporaryKind[] = ['recruiter', 'observer', 'trainer']

/**
 * Copy of the temporary seats
 * @type {Record<string, unknown>}
 */

export const SEAT_COPY = {
  fieldLabel: {
    recruiter: 'Session des Recruteurs',
    observer: 'Session des Observateurs',
    trainer: 'Session des Formateurs',
  },
  fieldInfo: 'Cette fonction ne dure que le temps d’une session, elle n’ouvre que celle-ci.',
  currentGroup: 'Sessions actuelles',
  archivedGroup: 'Sessions archivées',
  missing: 'À choisir',
  unidentified: {
    recruiter: 'Recruteur non identifié',
    observer: 'Observateur non identifié',
    trainer: 'Formateur non identifié',
  },
  menuTitle: 'Participation',
  revoke: 'Enlever ses accès',
  restore: 'Rendre ses accès',
  forget: 'Supprimer ses archives',
  forgetTitle: 'Supprimer ses archives ?',
  forgetDescription:
    'Il disparaît de partout dans la session, son avatar devient « {label} ». Ses commentaires et ses bilans restent en place.',
  revokedHint: 'Accès retiré',
  seatsTitle: 'Participants',
  seatsEmpty: 'Personne n’est affilié à cette session.',
  responsable: 'Responsable',
} as const
