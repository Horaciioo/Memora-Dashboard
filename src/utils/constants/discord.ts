/**
 * What a stored Discord identifier points at
 * @type {Record<string, string>}
 */

export const DiscordIdKinds = {
  Member: 'MEMBER',
  Role: 'ROLE',
  AcademyRole: 'ACADEMY_ROLE',
  RecruitmentRole: 'RECRUITMENT_ROLE',
  TextChannel: 'TEXT_CHANNEL',
  VoiceChannel: 'VOICE_CHANNEL',
  Server: 'SERVER',
} as const

export type DiscordIdKindName = (typeof DiscordIdKinds)[keyof typeof DiscordIdKinds]
