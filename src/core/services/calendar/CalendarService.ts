import 'server-only'

import { roleGroupedOptions } from '@/core/lib/forms/options'
import { prisma } from '@/core/lib/db'
import { readFullPerimeter, scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { toOptions } from '@/core/lib/forms/options'
import { wholeDays } from '@/core/lib/calendar/wholeDays'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import {
  buildRoster,
  eventsAskingHours,
  reinforcedByEvent,
  expandRoster,
  notifyConvened,
  readRosterFor,
  sweepDueReminders,
  syncRoster,
} from '@/core/services/calendar/attendance'
import type { RosterAudience } from '@/core/services/calendar/attendance'
import {
  absenceEntries,
  academySessionEntries,
  academyZoneEntries,
  birthdayEntries,
  meetingEntries,
  memberFunction,
  recruitmentEntries,
} from '@/core/services/calendar/projections'
import type { ProjectedPosts, ProjectionContext } from '@/core/services/calendar/projections'
import {
  cancelLivesOfEntries,
  liveFormFields,
  openLive,
  readLiveInput,
  readLiveTemplates,
  withTemplatePlatform,
  syncLiveWithEntry,
} from '@/core/services/lives/LiveService'
import { assertNoLiveClash } from '@/core/services/lives/LiveClashService'
import { peopleInScope, projectOptions, youtuberOptions } from '@/core/services/work/shared'
import {
  AUDIENCE_KEYS,
  audienceClauses,
  audienceOptions,
  audienceValue,
  isYoutuberAudience,
  parseAudience,
  audienceYoutuberId,
  youtuberAudienceValue,
} from '@/core/services/calendar/audience'
import { logger } from '@/core/lib/logger'
import { emojiOrRandom } from '@/core/lib/work'
import { projected } from '@/core/services/calendar/projections'
import {
  openAnnualSlots,
  reshapeSeries,
  sweepAnnualReminders,
  syncAnnualProjectStates,
} from '@/core/services/calendar/AnnualSlotService'
import { instantToWall, wallToInstant } from '@/utils/format/zone'
import { openDueReviews } from '@/core/services/calendar/reviewEntries'
import { openMeetingForEntry } from '@/core/services/work/MeetingService'
import { ROOT_IDENTITY } from '@/declarations/access/identity'
import { workViewerOf } from '@/core/services/work/visibility'
import type { WorkViewer } from '@/core/services/work/visibility'
import {
  AUDIENCE_COPY,
  CALENDAR_FIELD_COPY,
  ANNUAL_REVIEW_COPY,
  CALENDAR_FIELD_INFO,
  TEMPLATE_CATEGORIES,
} from '@/declarations/calendar/copy'
import { CALENDAR_KIND_REGISTRY } from '@/declarations/calendar/registries'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import {
  academyFields,
  isTemplateGreyed,
  readAcademyForm,
} from '@/core/services/calendar/academyForm'
import type { AcademyFormContext } from '@/core/services/calendar/academyForm'
import { resolveAcademyEntry } from '@/core/services/calendar/academyEntries'
import {
  CALENDAR_SETTINGS,
  EMOJI_SETTINGS,
  FORM_SETTINGS,
  LIVE_SETTINGS,
} from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { FORM_COPY, FORM_GROUPS } from '@/declarations/ui/copy'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { AttendanceRoster, CalendarEntry } from '@/types/calendar'
import type { FieldCondition, FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import {
  AcademySessionStatuses,
  GONE_MEMBER_STATUSES,
  MemberRoles,
} from '@/utils/constants/hierarchy'
import { RecruitmentStatuses } from '@/utils/constants/recruitment'
import { Permissions } from '@/utils/constants/permissions'
import { CalendarKinds, CalendarSources, EventVisibilities } from '@/utils/constants/workflow'
import type { CalendarKindName, EventVisibilityName } from '@/utils/constants/workflow'

/**
 * Read the members an entry may be attached to
 * @param {AccessScope} [scope] - Viewer perimeter
 * @return {Promise<FieldOption[]>} - Select options
 */

const subjectOptions = async (scope?: AccessScope): Promise<FieldOption[]> => {
  const rows = await prisma.account.findMany({
    where: { status: { notIn: GONE_MEMBER_STATUSES }, ...peopleInScope(scope) },
    orderBy: { displayName: 'asc' },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      youtubers: { select: { id: true } },
      teamMemberships: { select: { teamId: true } },
      ledTeams: { select: { teamId: true } },
      functions: {
        select: {
          jobFunction: { select: { name: true, accent: true, kind: true, position: true } },
        },
      },
    },
  })

  return roleGroupedOptions(rows, (row) => ({
    accent: memberFunction(row)?.accent,
    hint: memberFunction(row)?.name,
    // Picks that already cover this member: the whole team of a creator, or a team they sit in or lead
    owners: [
      ...row.youtubers.map((youtuber) => youtuberAudienceValue(youtuber.id)),
      ...[...row.teamMemberships, ...row.ledTeams].map((seat) => `team:${seat.teamId}`),
    ],
  }))
}

/**
 * Read the templates a new entry may start from
 * @param {AcademyFormContext} academy - Academy templates and juniors
 * @param {{ templateIds: string[], allowed: boolean }} live - Live templates and whether the viewer may announce
 * @param {boolean} isLead - Viewer sits at responsable level
 * @param {Record<string, boolean>} running - Whether a recruitment or an academy session runs
 * @return {Promise<FieldOption[]>} - Select options
 */

const templateOptions = async (
  academy: AcademyFormContext,
  live: { templateIds: string[]; allowed: boolean },
  isLead: boolean,
  running: Record<string, boolean>
): Promise<FieldOption[]> => {
  const rows = await prisma.eventTemplate.findMany({
    where: { archived: false },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
  })

  // One heading per theme, the shape of each model shows in a tag under the pointer
  const themes = [
    ...TEMPLATE_CATEGORIES,
    ...new Set(
      rows.map((row) => row.category ?? '').filter((name) => !TEMPLATE_CATEGORIES.includes(name))
    ),
  ]

  return themes.flatMap((theme) =>
    rows
      .filter((row) => (row.category ?? '') === theme)
      .map((row) => ({
        value: row.id,
        label: row.name,
        accent: row.accent ?? undefined,
        icon: row.icon,
        // Only offered under the type it belongs to
        owner: row.kind,
        // A model tied to recruitments or the academy waits for one to run
        hint: row.linksTo && !running[row.linksTo] ? CALENDAR_FIELD_INFO.noSession : undefined,
        slot:
          row.weekday && row.startTime
            ? { weekday: row.weekday, time: row.startTime, minutes: row.defaultMinutes }
            : undefined,
        // A check-in nobody is left to be planned for is shown but shut
        disabled:
          Boolean(row.linksTo && !running[row.linksTo]) ||
          isTemplateGreyed(academy, row.id) ||
          (live.templateIds.includes(row.id) && !live.allowed) ||
          // A trainer plans interviews and check-ins only
          (!isLead && !academy.purposes.has(row.id)),
        group: theme === '' ? undefined : theme,
      }))
  )
}

/**
 * Read the teams a roll-call may convene
 * @param {AccessScope} [scope] - Creator perimeter
 * @return {Promise<FieldOption[]>} - Select options
 */

const teamOptions = async (scope?: AccessScope): Promise<FieldOption[]> => {
  const rows = await prisma.team.findMany({
    where: scope ? scopedWhere('team', scope, { archived: false }) : { archived: false },
    orderBy: [{ youtuber: { position: 'asc' } }, { name: 'asc' }],
    include: { youtuber: { select: { name: true, avatarUrl: true } } },
  })

  // Told apart by the creator they belong to
  return rows.map((row) => ({
    value: row.id,
    label: row.name,
    group: row.youtuber?.name ?? AUDIENCE_COPY.noYoutuber,
    image: row.youtuber?.avatarUrl,
    icon: 'teams',
  }))
}

// Recruitment campaigns that count as running
const ACTIVE_RECRUITMENTS = [RecruitmentStatuses.Announced, RecruitmentStatuses.Interviews]

// Roll-call form fields show only once presence is asked for
const WHEN_ROLL_CALL = { field: 'rollCall', truthy: true } as const

// Whole-Memora events convene everyone, nobody is added by hand
const WHEN_MEMBERS_BY_HAND: FieldCondition = {
  field: 'rollCall',
  truthy: true,
  and: { field: 'visibility', oneOf: [EventVisibilities.Everyone], negate: true },
}

// Words under the audience a model fixes
const VISIBILITY_HINTS: Record<string, string> = {
  [EventVisibilities.Everyone]: 'Tout Memora est concerné !',
  [EventVisibilities.Responsables]: 'Seuls les Responsables sont concernés !',
  [EventVisibilities.Admins]: 'Réservé aux Administrateurs !',
}

// Fields a model opening slots has no use for
const SLOT_HIDDEN_FIELDS = [
  'emoji',
  'title',
  'description',
  'audienceLeadsOnly',
  'startsAt',
  'endsAt',
  'allDay',
  'youtuberId',
  'accountId',
  'projectId',
  'rollCall',
  'teamIds',
  'memberIds',
  'remindAt',
]

// Plain event fields the Live model replaces with its own
const PLAIN_EVENT_FIELDS = [
  'emoji',
  'description',
  'visibility',
  'audienceLeadsOnly',
  'allDay',
  'accountId',
  'projectId',
  'rollCall',
  'teamIds',
  'memberIds',
  'remindAt',
]

/**
 * Build the calendar entry form declarations
 * @param {AccessScope} [scope] - Creator perimeter
 * @param {WorkViewer} [viewer] - Who reads
 * @param {AcademyScope} [academy] - Juniors the member may plan for, none without it
 * @param {boolean} [canAnnounceLive] - Viewer may post a live
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const calendarFields = async (
  scope?: AccessScope,
  viewer?: WorkViewer,
  academy?: AcademyScope,
  canAnnounceLive = false,
  isLead = true
): Promise<FieldDefinition[]> => {
  const liveTemplates = await readLiveTemplates()
  const liveTemplateIds = [...liveTemplates.keys()]
  const academyContext = academy
    ? await readAcademyForm(academy)
    : { purposes: new Map(), juniors: [] }
  // Sessions running right now: models tied to them are offered only then
  const [runningRecruitments, runningAcademies, linkedZones] = await Promise.all([
    prisma.recruitmentSession.findMany({
      where: scope
        ? scopedWhere('recruitmentSession', scope, { status: { in: ACTIVE_RECRUITMENTS } })
        : { status: { in: ACTIVE_RECRUITMENTS } },
      orderBy: { opensAt: 'asc' },
      select: { id: true, name: true, opensAt: true, closesAt: true },
    }),
    prisma.academySession.findMany({
      where: {
        status: { notIn: [AcademySessionStatuses.Closed, AcademySessionStatuses.Archived] },
      },
      orderBy: { startsAt: 'desc' },
      select: { id: true, startsAt: true, endsAt: true, jobFunction: { select: { name: true } } },
    }),
    prisma.eventTemplate.findMany({
      where: { archived: false, kind: CalendarKinds.Zone, linksTo: { not: null } },
      select: { id: true, linksTo: true },
    }),
  ])
  const running = {
    RECRUITMENT: runningRecruitments.length > 0,
    ACADEMY: runningAcademies.length > 0,
  }

  const [templates, subjects, youtubers, projects, teams, audiences, academyExtras, liveExtras] =
    await Promise.all([
      templateOptions(
        academyContext,
        { templateIds: liveTemplateIds, allowed: canAnnounceLive },
        isLead,
        running
      ),
      subjectOptions(scope),
      youtuberOptions(scope),
      projectOptions(scope, viewer),
      teamOptions(scope),
      audienceOptions(scope),
      academyFields(academyContext, viewer?.id ?? ''),
      // The Live template brings its own fields
      canAnnounceLive ? liveFormFields(scope, liveTemplateIds) : Promise.resolve([]),
    ])

  // Models that open a series of slots ask days and hours, nothing of the plain entry
  const slotTemplateIds = (
    await prisma.eventTemplate.findMany({
      where: { slotMinutes: { not: null }, archived: false },
      select: { id: true },
    })
  ).map((row) => row.id)
  const whenSlots = { field: 'templateId', oneOf: slotTemplateIds }

  // A series of slots concerns one team: the ones the Responsable leads, any team for an Administrator without one
  const ledTeams = viewer
    ? await prisma.teamLead.findMany({
        where: { accountId: viewer.id, team: { archived: false } },
        select: { teamId: true },
      })
    : []
  const slotTeamIds =
    ledTeams.length > 0 ? ledTeams.map((lead) => lead.teamId) : teams.map((option) => option.value)
  const teamModerators = await prisma.teamMember.findMany({
    where: {
      teamId: { in: slotTeamIds },
      account: { role: MemberRoles.Moderateur, status: { notIn: GONE_MEMBER_STATUSES } },
    },
    select: { teamId: true, accountId: true },
  })
  const moderatorsOf = (teamId: string): string[] =>
    teamModerators.filter((seat) => seat.teamId === teamId).map((seat) => seat.accountId)

  // A team meeting is shown to the team of the creator for its function, run by the leads of that team
  const teamMeetings = await prisma.eventTemplate.findMany({
    where: { functionName: { not: null }, archived: false },
    select: { id: true, functionName: true },
  })
  const functionTeams = teamMeetings.length
    ? await prisma.team.findMany({
        where: {
          archived: false,
          youtuberId: { not: null },
          jobFunction: { name: { in: teamMeetings.flatMap((row) => row.functionName ?? []) } },
        },
        select: {
          id: true,
          youtuberId: true,
          jobFunction: { select: { name: true } },
          leads: { select: { accountId: true }, orderBy: { createdAt: 'asc' }, take: 1 },
        },
      })
    : []
  const teamAudience: Record<string, string> = {}
  const teamLead: Record<string, string> = {}
  for (const meeting of teamMeetings) {
    for (const team of functionTeams.filter(
      (row) => row.jobFunction?.name === meeting.functionName
    )) {
      teamAudience[`${meeting.id}|${team.youtuberId}`] = `team:${team.id}`
      const lead = team.leads[0]?.accountId
      if (lead) teamLead[`${meeting.id}|${team.youtuberId}`] = lead
    }
  }
  const whenTeamMeeting = { field: 'templateId', oneOf: teamMeetings.map((row) => row.id) }

  // Models whose audience is given: meetings of everyone or of the administration, the maintenance
  const fixedModels = await prisma.eventTemplate.findMany({
    where: {
      archived: false,
      kind: CalendarKinds.Event,
      functionName: null,
      slotMinutes: null,
      platform: null,
      purpose: null,
      linksTo: null,
      OR: [{ rollCall: true }, { visibility: EventVisibilities.Admins }],
    },
    select: { id: true, visibility: true, rollCall: true },
  })
  const root = ROOT_IDENTITY.discordId
    ? await prisma.account.findFirst({
        where: { discordId: ROOT_IDENTITY.discordId },
        select: { id: true, displayName: true },
      })
    : null
  const rootName = root?.displayName ?? ''
  const fixedAudience = Object.fromEntries(
    fixedModels.map((model) => [`${model.id}|`, model.visibility as string])
  )
  const fixedLead = Object.fromEntries(
    fixedModels.flatMap((model) => (model.rollCall && root ? [[`${model.id}|`, root.id]] : []))
  )

  // Models that always call the roll
  const forcedRollCalls = await prisma.eventTemplate.findMany({
    where: { rollCall: true, archived: false },
    select: { id: true },
  })

  // Only an administrator may close an entry to administrators
  const levels = toOptions(EVENT_VISIBILITY_REGISTRY).filter(
    (option) =>
      option.value !== EventVisibilities.Team &&
      option.value !== EventVisibilities.Youtuber &&
      (viewer?.isAdmin || option.value !== EventVisibilities.Admins)
  )

  // A creator's whole team already covers every function, only Memora-wide events skip both
  const whenTeamsByHand: FieldCondition = {
    field: 'rollCall',
    truthy: true,
    and: {
      field: 'visibility',
      oneOf: [
        EventVisibilities.Everyone,
        ...audiences.filter((option) => isYoutuberAudience(option.value)).map((o) => o.value),
      ],
      negate: true,
    },
  }

  const fields: FieldDefinition[] = [
    {
      name: 'emoji',
      kind: 'emoji',
      label: CALENDAR_FIELD_COPY.emoji,
      maxLength: EMOJI_SETTINGS.maxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'title',
      kind: 'text',
      label: CALENDAR_FIELD_COPY.title,
      info: CALENDAR_FIELD_INFO.title,
      required: true,
      glyph: 'emoji',
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'kind',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.kind,
      info: CALENDAR_FIELD_INFO.kind,
      required: true,
      options: toOptions(CALENDAR_KIND_REGISTRY),
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.essentials,
      // A template already carries the shape it draws as
      visibleWhen: { field: 'templateId', truthy: false },
    },
    {
      name: 'templateId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.template,
      info: CALENDAR_FIELD_INFO.template,
      options: templates,
      ownerField: 'kind',
      needs: { field: 'kind', hint: CALENDAR_FIELD_INFO.templateNeedsKind },
      slotFor: 'startsAt',
      mark: 'glyph',
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'slotDays',
      kind: 'daterange',
      dayOnly: true,
      label: CALENDAR_FIELD_COPY.slotDays,
      info: CALENDAR_FIELD_INFO.slotDays,
      required: true,
      group: FORM_GROUPS.planning,
      visibleWhen: whenSlots,
    },
    {
      name: 'slotFrom',
      kind: 'time',
      label: CALENDAR_FIELD_COPY.slotFrom,
      initial: '09:00',
      span: 'half',
      group: FORM_GROUPS.planning,
      visibleWhen: whenSlots,
    },
    {
      name: 'slotTo',
      kind: 'time',
      label: CALENDAR_FIELD_COPY.slotTo,
      initial: '18:00',
      span: 'half',
      group: FORM_GROUPS.planning,
      visibleWhen: whenSlots,
    },
    {
      name: 'slotTeamId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.slotTeam,
      info: CALENDAR_FIELD_INFO.slotTeam,
      required: true,
      options: teams.filter((option) => slotTeamIds.includes(option.value)),
      // A Responsable leading a single team has no other choice
      preset: 'sole',
      mark: 'glyph',
      span: 'half',
      group: FORM_GROUPS.visibility,
      visibleWhen: whenSlots,
      frozen:
        slotTeamIds.length === 1
          ? [{ when: whenSlots, hint: CALENDAR_FIELD_INFO.slotTeamSole }]
          : [],
    },
    {
      name: 'slotMembers',
      kind: 'multiselect',
      label: CALENDAR_FIELD_COPY.slotMembers,
      options: subjects.filter((option) =>
        teamModerators.some((seat) => seat.accountId === option.value)
      ),
      mark: 'avatar',
      group: FORM_GROUPS.visibility,
      visibleWhen: whenSlots,
      frozen: [{ when: whenSlots, hint: CALENDAR_FIELD_INFO.slotMembers }],
      valueFrom: {
        fields: ['templateId', 'slotTeamId'],
        map: Object.fromEntries(
          slotTemplateIds.flatMap((id) =>
            slotTeamIds.map((teamId) => [`${id}|${teamId}`, moderatorsOf(teamId)])
          )
        ),
      },
    },
    {
      name: 'recruitmentSessionId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.recruitmentSession,
      info: CALENDAR_FIELD_INFO.recruitmentSession,
      options: runningRecruitments.map((session) => ({
        value: session.id,
        label: session.name,
        icon: 'recruitment',
        dates: session.opensAt
          ? {
              startsAt: session.opensAt.toISOString(),
              endsAt: session.closesAt?.toISOString() ?? null,
            }
          : undefined,
      })),
      slotFor: 'startsAt',
      preset: 'sole',
      mark: 'glyph',
      span: 'half',
      group: FORM_GROUPS.essentials,
      visibleWhen: {
        field: 'templateId',
        oneOf: linkedZones.filter((zone) => zone.linksTo === 'RECRUITMENT').map((zone) => zone.id),
      },
    },
    {
      name: 'zoneSessionId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.session,
      info: CALENDAR_FIELD_INFO.zoneSession,
      options: runningAcademies.map((session) => ({
        value: session.id,
        label: session.jobFunction.name,
        icon: 'academy',
        dates: {
          startsAt: session.startsAt.toISOString(),
          endsAt: session.endsAt?.toISOString() ?? null,
        },
      })),
      slotFor: 'startsAt',
      preset: 'sole',
      mark: 'glyph',
      span: 'half',
      group: FORM_GROUPS.essentials,
      visibleWhen: {
        field: 'templateId',
        oneOf: linkedZones.filter((zone) => zone.linksTo === 'ACADEMY').map((zone) => zone.id),
      },
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.youtuber,
      info: CALENDAR_FIELD_INFO.youtuber,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'description',
      kind: 'textarea',
      label: CALENDAR_FIELD_COPY.description,
      info: CALENDAR_FIELD_INFO.description,
      maxLength: FORM_SETTINGS.longTextMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'visibility',
      // The model fixes who sees it: the team of a team meeting, the audience of the others
      frozen: [
        { when: whenTeamMeeting, hint: CALENDAR_FIELD_INFO.teamOnly },
        { when: whenSlots, hint: CALENDAR_FIELD_INFO.slotAudience },
        ...fixedModels.map((model) => ({
          when: { field: 'templateId', oneOf: [model.id] },
          hint: VISIBILITY_HINTS[model.visibility] ?? CALENDAR_FIELD_INFO.fixedAudience,
        })),
      ],
      valueFrom: [
        { fields: ['templateId', 'youtuberId'], map: { ...teamAudience, ...fixedAudience } },
        // A series of slots is shown to its team alone
        {
          fields: ['templateId', 'slotTeamId'],
          map: Object.fromEntries(
            slotTemplateIds.flatMap((id) =>
              slotTeamIds.map((teamId) => [`${id}|${teamId}`, `team:${teamId}`])
            )
          ),
        },
      ],
      kind: 'select',
      label: CALENDAR_FIELD_COPY.visibility,
      info: CALENDAR_FIELD_INFO.visibility,
      // The whole of Memora, the whole team of the creator, the other levels, then the teams
      options: [
        ...levels.slice(0, 1),
        ...audiences.filter((option) => isYoutuberAudience(option.value)),
        ...levels.slice(1),
        ...audiences.filter((option) => !isYoutuberAudience(option.value)),
      ],
      ownerField: 'youtuberId',
      mark: 'glyph',
      span: 'half',
      group: FORM_GROUPS.visibility,
    },
    {
      name: 'audienceLeadsOnly',
      kind: 'toggle',
      label: AUDIENCE_COPY.leadsOnly,
      info: AUDIENCE_COPY.leadsOnlyInfo,
      group: FORM_GROUPS.visibility,
      visibleWhen: {
        field: 'visibility',
        oneOf: audiences
          .filter((option) => !isYoutuberAudience(option.value))
          .map((option) => option.value),
      },
    },
    {
      name: 'startsAt',
      kind: 'datetime',
      label: CALENDAR_FIELD_COPY.startsAt,
      info: CALENDAR_FIELD_INFO.startsAt,
      hoursOffWhen: 'allDay',
      preset: 'today',
      required: true,
      span: 'half',
      group: FORM_GROUPS.planning,
    },
    {
      name: 'endsAt',
      kind: 'datetime',
      label: CALENDAR_FIELD_COPY.endsAt,
      info: CALENDAR_FIELD_INFO.endsAt,
      hoursOffWhen: 'allDay',
      notBefore: 'startsAt',
      // A live ends its usual duration after it starts, until the end is edited
      ...(liveTemplateIds.length > 0 && {
        follows: {
          field: 'startsAt',
          minutes: LIVE_SETTINGS.defaultDurationMinutes,
          when: { field: 'templateId', oneOf: liveTemplateIds },
        },
      }),
      span: 'half',
      group: FORM_GROUPS.planning,
    },
    {
      name: 'allDay',
      kind: 'toggle',
      label: CALENDAR_FIELD_COPY.allDay,
      // A zone or a period always spans whole days
      lockedOnWhen: { field: 'kind', oneOf: [CalendarKinds.Zone, CalendarKinds.Period] },
      group: FORM_GROUPS.planning,
    },
    {
      name: 'accountId',
      valueFrom: {
        fields: ['templateId', 'youtuberId'],
        map: { ...teamLead, ...fixedLead },
        onlyIfEmpty: true,
      },
      // The root administrator runs the fixed meetings
      frozen: fixedModels
        .filter((model) => model.rollCall)
        .map((model) => ({
          when: { field: 'templateId', oneOf: [model.id] },
          hint: CALENDAR_FIELD_INFO.fixedLead.replace('{name}', rootName),
        })),
      kind: 'select',
      label: CALENDAR_FIELD_COPY.subject,
      info: CALENDAR_FIELD_INFO.subject,
      options: subjects,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    ...academyExtras,
    ...liveExtras.map((field) => ({ ...field, group: FORM_GROUPS.assignment })),
    {
      name: 'projectId',
      kind: 'select',
      mark: 'emoji',
      label: CALENDAR_FIELD_COPY.project,
      info: CALENDAR_FIELD_INFO.project,
      options: projects,
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'rollCall',
      kind: 'toggle',
      label: CALENDAR_FIELD_COPY.rollCall,
      info: CALENDAR_FIELD_INFO.rollCall,
      // Some models always ask for presence
      lockedOnWhen: { field: 'templateId', oneOf: forcedRollCalls.map((row) => row.id) },
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'teamIds',
      kind: 'multiselect',
      label: CALENDAR_FIELD_COPY.teams,
      info: CALENDAR_FIELD_INFO.teams,
      options: teams,
      mark: 'glyph',
      group: FORM_GROUPS.visibility,
      visibleWhen: whenTeamsByHand,
    },
    {
      name: 'memberIds',
      kind: 'multiselect',
      label: CALENDAR_FIELD_COPY.members,
      info: CALENDAR_FIELD_INFO.members,
      options: subjects,
      mark: 'avatar',
      group: FORM_GROUPS.visibility,
      ownerField: 'visibility',
      excludeOwned: true,
      visibleWhen: WHEN_MEMBERS_BY_HAND,
    },
    {
      name: 'remindAt',
      kind: 'datetime',
      label: CALENDAR_FIELD_COPY.remindAt,
      info: CALENDAR_FIELD_INFO.remindAt,
      hint: CALENDAR_FIELD_COPY.remindAtHint,
      span: 'half',
      group: FORM_GROUPS.planning,
      visibleWhen: WHEN_ROLL_CALL,
    },
  ]

  // The Live model and the slot models replace the plain entry fields with their own
  const notLive = { field: 'templateId', oneOf: liveTemplateIds, negate: true }
  const notSlots = { field: 'templateId', oneOf: slotTemplateIds, negate: true }
  const fixedIds = fixedModels.map((model) => model.id)
  const hidings = [
    // Fixed models and team meetings have no use for the creator's teams, a project or whole days
    {
      when: {
        field: 'templateId',
        oneOf: [...fixedIds, ...teamMeetings.map((model) => model.id)],
        negate: true,
      },
      names: ['allDay', 'projectId', 'teamIds', 'audienceLeadsOnly'],
    },
    // A fixed model convenes its own audience, a team meeting still takes members on top
    {
      when: { field: 'templateId', oneOf: fixedIds, negate: true },
      names: ['youtuberId', 'memberIds'],
    },
  ]

  return fields.map((field) => {
    let next = field
    if (liveTemplateIds.length > 0 && PLAIN_EVENT_FIELDS.includes(field.name)) {
      next = { ...next, visibleWhen: andAlso(next.visibleWhen, notLive) }
    }
    if (slotTemplateIds.length > 0 && SLOT_HIDDEN_FIELDS.includes(field.name)) {
      next = { ...next, visibleWhen: andAlso(next.visibleWhen, notSlots) }
    }
    for (const hiding of hidings) {
      if (hiding.names.includes(field.name)) {
        next = { ...next, visibleWhen: andAlso(next.visibleWhen, hiding.when) }
      }
    }

    return next
  })
}

/**
 * Add a rule at the end of the chain of a display rule
 * @param {FieldCondition | undefined} condition - Rule held
 * @param {FieldCondition} extra - Rule that must hold too
 * @return {FieldCondition} - Both rules
 */

const andAlso = (condition: FieldCondition | undefined, extra: FieldCondition): FieldCondition =>
  condition ? { ...condition, and: andAlso(condition.and, extra) } : extra

/**
 * Read the visibility levels a member is allowed to see
 * @param {PermissionHelpers} access - Permission helpers
 * @return {EventVisibilityName[]} - Allowed levels
 */

const allowedVisibilities = (access: PermissionHelpers): EventVisibilityName[] => {
  if (access.isAdmin) return EVENT_VISIBILITY_REGISTRY.keys

  return access.isResponsable
    ? [EventVisibilities.Everyone, EventVisibilities.Responsables]
    : [EventVisibilities.Everyone]
}

// Everything an entry row needs to become a view
const ENTRY_SHAPE = {
  template: true,
  youtuber: { select: { accent: true } },
  owner: { select: { displayName: true } },
  subject: {
    select: {
      displayName: true,
      functions: {
        select: {
          jobFunction: { select: { name: true, accent: true, kind: true, position: true } },
        },
      },
    },
  },
  attendances: { select: { accountId: true } },
  live: { select: { id: true } },
} as const

/**
 * Shape one stored entry
 * @param {object} row - Entry row with its template
 * @param {AttendanceRoster | null} [roster] - Roll-call standings for the viewer
 * @return {CalendarEntry} - Calendar entry
 */

const toEntry = (
  row: {
    id: string
    title: string
    emoji: string | null
    description: string | null
    kind: CalendarKindName
    templateId: string | null
    accountId: string | null
    visibility: EventVisibilityName | null
    audienceTeamId: string | null
    audienceSessionId: string | null
    audienceLeadsOnly: boolean
    startsAt: Date
    endsAt: Date | null
    allDay: boolean
    youtuberId: string | null
    projectId: string | null
    meetingId: string | null
    live?: { id: string } | null
    sessionId: string | null
    juniorId: string | null
    trainerId: string | null
    rollCall: boolean
    rollCallTeamIds: string[]
    remindAt: Date | null
    template: {
      name: string
      accent: string | null
      visibility: EventVisibilityName
      slotMinutes: number | null
      category: string | null
    } | null
    youtuber: { accent: string | null } | null
    owner: { displayName: string } | null
    subject: ({ displayName: string } & ProjectedPosts) | null
    attendances: { accountId: string }[]
  },
  roster: AttendanceRoster | null = null
): CalendarEntry => {
  const bounds = row.allDay
    ? wholeDays(row.startsAt, row.endsAt)
    : { startsAt: row.startsAt, endsAt: row.endsAt }

  return {
    id: row.id,
    source: CalendarSources.Entry,
    kind: row.kind,
    title: row.title,
    emoji: row.emoji,
    description: row.description,
    templateId: row.templateId,
    templateName: row.template?.name ?? null,
    category: row.template?.category ?? null,
    // A slot of the annual reviews is open until a Moderator takes it
    slot: !row.template?.slotMinutes
      ? null
      : row.kind === CalendarKinds.Period
        ? 'series'
        : row.accountId
          ? 'taken'
          : 'open',
    accent: row.youtuber?.accent ?? null,
    youtuberId: row.youtuberId,
    muted: false,
    // The entry may tighten what its template allows
    visibility: row.visibility ?? row.template?.visibility ?? EventVisibilities.Everyone,
    // A whole day saved with stray hours still reads as the whole day
    startsAt: bounds.startsAt.toISOString(),
    endsAt: bounds.endsAt?.toISOString() ?? null,
    allDay: row.allDay,
    ownerName: row.owner?.displayName ?? null,
    subjectName: row.subject?.displayName ?? null,
    // A posted entry standing for a meeting still points at the file that owns its content
    href: row.live
      ? ROUTES.live(row.live.id)
      : row.meetingId
        ? ROUTES.meeting(row.meetingId)
        : row.juniorId && row.sessionId
          ? ROUTES.junior(row.sessionId, row.juniorId)
          : null,
    body: null,
    readOnly: false,
    rollCall: row.rollCall,
    attendance: roster,
    values: {
      title: row.title,
      emoji: row.emoji,
      kind: row.kind,
      templateId: row.templateId,
      accountId: row.accountId,
      // The days, hours and team a series of slots was opened with
      ...(row.template?.slotMinutes && row.kind === CalendarKinds.Period
        ? {
            slotDays: [
              instantToWall(row.startsAt).slice(0, 10),
              instantToWall(row.endsAt ?? row.startsAt).slice(0, 10),
            ],
            slotFrom: instantToWall(row.startsAt).slice(11, 16),
            slotTo: instantToWall(row.endsAt ?? row.startsAt).slice(11, 16),
            slotTeamId: row.audienceTeamId,
          }
        : {}),
      visibility: audienceValue(row),
      audienceLeadsOnly: row.audienceLeadsOnly,
      startsAt: row.startsAt.toISOString().slice(0, 16),
      endsAt: row.endsAt ? row.endsAt.toISOString().slice(0, 16) : null,
      allDay: row.allDay,
      youtuberId: row.youtuberId,
      projectId: row.projectId,
      description: row.description,
      rollCall: row.rollCall,
      remindAt: row.remindAt ? row.remindAt.toISOString().slice(0, 16) : null,
      teamIds: row.rollCallTeamIds,
      memberIds: row.attendances.map((seat) => seat.accountId),
      sessionId: row.sessionId,
      juniorId: row.juniorId,
      trainerId: row.trainerId,
      // Whoever is convened beside the junior and their trainer
      responsableIds: row.juniorId
        ? row.attendances
            .map((seat) => seat.accountId)
            .filter((id) => id !== row.accountId && id !== row.trainerId)
        : [],
    },
  }
}

/**
 * Resolve every roll-call roster of a window in one round trip
 * @param {{ id: string, rollCall: boolean }[]} rows - Window rows
 * @param {string} viewerId - Signed-in member identifier
 * @param {boolean} canManage - Viewer holds the manage permission
 * @return {Promise<Map<string, AttendanceRoster>>} - Roster per event
 */

const rollCallRosters = async (
  rows: { id: string; rollCall: boolean }[],
  viewerId: string,
  canManage: boolean
): Promise<Map<string, AttendanceRoster>> => {
  const rollCalls = rows.filter((row) => row.rollCall)
  if (rollCalls.length === 0) return new Map()

  const seats = await prisma.eventAttendance.findMany({
    where: { eventId: { in: rollCalls.map((row) => row.id) } },
    include: { account: { select: { displayName: true, avatarUrl: true, role: true } } },
  })

  const asking = await eventsAskingHours(rollCalls.map((row) => row.id))

  const reinforced = await reinforcedByEvent(rollCalls.map((row) => row.id))

  return new Map(
    rollCalls.map((row) => [
      row.id,
      buildRoster({
        reinforced: reinforced.get(row.id) ?? new Set<string>(),
        rows: seats.filter((seat) => seat.eventId === row.id),
        viewerId,
        canManage,
        asksHours: asking.has(row.id),
      }),
    ])
  )
}

/**
 * Read the entries of one window
 * @param {Object} input - Read context
 * @param {Date} input.from - First moment shown
 * @param {Date} input.to - Last moment shown
 * @param {string} input.viewerId - Signed-in member identifier
 * @param {PermissionHelpers} input.access - Permission helpers
 * @param {AccessScope} input.scope - Creator perimeter
 * @param {string} [input.sessionId] - Bounds the window to one academy session
 * @return {Promise<CalendarEntry[]>} - Visible entries
 */

export const listEntries = async ({
  from,
  to,
  viewerId,
  access,
  scope,
  sessionId,
}: {
  from: Date
  to: Date
  viewerId: string
  access: PermissionHelpers
  scope: AccessScope
  sessionId?: string
}): Promise<CalendarEntry[]> => {
  // Reminders fire lazily, and so do the check-ins of periods about to end
  await sweepDueReminders()
  await openDueReviews().catch((error: unknown) => logger.error('calendar.reviews', error))
  await sweepAnnualReminders().catch((error: unknown) => logger.error('calendar.annual', error))
  await syncAnnualProjectStates().catch((error: unknown) => logger.error('calendar.annual', error))

  const levels = allowedVisibilities(access)
  const audiences = access.isAdmin
    ? []
    : [
        ...(await audienceClauses(viewerId)),
        // The whole team of a creator reads what is shown to it
        { visibility: EventVisibilities.Youtuber, youtuberId: { in: scope.youtuberIds } },
      ]

  const rows = await prisma.calendarEvent.findMany({
    where: scopedWhere('calendarEvent', scope, {
      startsAt: { lte: to },
      ...(sessionId ? { sessionId } : {}),
      AND: [
        {
          // A band or a zone is still on screen when it merely overlaps the window
          OR: [{ endsAt: { gte: from } }, { endsAt: null, startsAt: { gte: from } }],
        },
        {
          OR: [
            // Someone always sees what they posted themselves
            { ownerId: viewerId },
            // A convened member always sees their own roll-call
            { attendances: { some: { accountId: viewerId } } },
            { visibility: { in: levels } },
            ...audiences,
            { visibility: null, template: { visibility: { in: levels } } },
            { visibility: null, templateId: null },
          ],
        },
      ],
    }),
    include: ENTRY_SHAPE,
    orderBy: { startsAt: 'asc' },
  })

  const rosters = await rollCallRosters(rows, viewerId, access.can(Permissions.CalendarManage))

  const context: ProjectionContext = {
    from,
    to,
    access,
    scope,
    viewer: workViewerOf(viewerId, access),
  }

  // A session board only ever shows its own rows and its own zones
  const projections = sessionId
    ? await academyZoneEntries(context, sessionId)
    : (
        await Promise.all([
          absenceEntries(context),
          meetingEntries(context),
          birthdayEntries(context),
          academySessionEntries(context),
          academyZoneEntries(context),
          recruitmentEntries(context),
        ])
      ).flat()

  const entries = rows.map((row) =>
    maskTakenSlot(toEntry(row, rosters.get(row.id) ?? null), viewerId, access.isResponsable)
  )

  return [...entries, ...projections].sort((left, right) =>
    left.startsAt.localeCompare(right.startsAt)
  )
}

/**
 * Hide who holds a taken slot of the annual reviews from the members it does not concern
 * @param {CalendarEntry} entry - Entry read
 * @param {string} viewerId - Signed-in member
 * @param {boolean} seesNames - Viewer sits at responsable level
 * @return {CalendarEntry} - Entry, anonymised when the slot belongs to someone else
 */

const maskTakenSlot = (
  entry: CalendarEntry,
  viewerId: string,
  seesNames: boolean
): CalendarEntry => {
  if (entry.slot !== 'taken' || seesNames || entry.values.accountId === viewerId) return entry

  return {
    ...entry,
    title: ANNUAL_REVIEW_COPY.slotTaken,
    subjectName: null,
    description: null,
    attendance: null,
    href: null,
    values: {},
  }
}

/**
 * Read several entries as the viewer sees them
 * @param {string[]} ids - Entry identifiers
 * @param {string} viewerId - Signed-in member identifier
 * @param {PermissionHelpers} access - Permission helpers
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<CalendarEntry[]>} - Entries found
 */

export const getEntries = async (
  ids: string[],
  viewerId: string,
  access: PermissionHelpers,
  scope: AccessScope
): Promise<CalendarEntry[]> => {
  const rows = await Promise.all(ids.map((id) => getEntry(id, viewerId, access, scope)))

  return rows.filter((entry): entry is CalendarEntry => entry !== null)
}

/**
 * Perimeter the calendar reads through
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<AccessScope>} - Perimeter without the active creator
 */

export const readCalendarScope = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<AccessScope> =>
  access.isAdmin
    ? { isGlobal: true, youtuberIds: [], activeYoutuberId: null }
    : {
        isGlobal: false,
        youtuberIds: await readFullPerimeter(viewer, access),
        activeYoutuberId: null,
      }

/**
 * Turn parsed values into an entry payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toEntryData = (values: FormValues) => ({
  title: readText(values, 'title') ?? '',
  emoji: readText(values, 'emoji'),
  description: readText(values, 'description'),
  kind: (readText(values, 'kind') ?? CalendarKinds.Event) as CalendarKindName,
  templateId: readText(values, 'templateId'),
  accountId: readText(values, 'accountId'),
  ...parseAudience(values),
  startsAt: readDate(values, 'startsAt') ?? new Date(),
  endsAt: readDate(values, 'endsAt'),
  allDay: readFlag(values, 'allDay'),
  youtuberId: readText(values, 'youtuberId'),
  projectId: readText(values, 'projectId'),
  rollCall: readFlag(values, 'rollCall'),
  remindAt: readDate(values, 'remindAt'),
  rollCallTeamIds: readList(values, 'teamIds'),
  // An academy template fixes these afterwards
  juniorId: null as string | null,
  trainerId: null as string | null,
})

/**
 * Refuse an entry ending before it starts
 * @param {ReturnType<typeof toEntryData>} data - Payload read off the form
 * @return {void} - Throws on an end behind the start
 */

const assertEndAfterStart = (data: ReturnType<typeof toEntryData>): void => {
  if (data.endsAt && data.endsAt < data.startsAt) {
    throw invalidInput([{ field: 'endsAt', message: FORM_COPY.endBeforeStart }])
  }
}

// Milliseconds in a day
const DAY = 86_400_000

/**
 * Settle when the reminder fires
 * @param {Date} startsAt - Event start
 * @param {Date | null} remindAt - Moment picked on the form
 * @return {Date | null} - Reminder moment
 */

const resolveRemindAt = (startsAt: Date, remindAt: Date | null): Date | null => {
  if (remindAt) return remindAt

  const at = new Date(startsAt.getTime() - CALENDAR_SETTINGS.rollCallReminderLeadDays * DAY)
  at.setHours(CALENDAR_SETTINGS.rollCallReminderHour, 0, 0, 0)

  return at.getTime() <= Date.now() ? null : at
}

// Minutes are stored on the template
const MINUTE = 60_000

/**
 * Fill what a form left blank with what its template already declares
 * @param {ReturnType<typeof toEntryData>} data - Payload read off the form
 * @return {Promise<ReturnType<typeof toEntryData>>} - Payload the template completed
 */

const applyTemplate = async (data: ReturnType<typeof toEntryData>) => {
  const filled = await fillFromTemplate(data)

  // A whole day starts at midnight and ends at the last minute
  return filled.allDay ? { ...filled, ...wholeDays(filled.startsAt, filled.endsAt) } : filled
}

/**
 * Who a model that always calls the roll convenes
 * @param {string | null} templateId - Model of the entry
 * @param {string | null} youtuberId - Creator it is posted for
 * @return {Promise<RosterAudience>} - Convened audience
 */

const templateAudience = async (
  templateId: string | null,
  youtuberId: string | null
): Promise<RosterAudience> => {
  const template = templateId
    ? await prisma.eventTemplate.findUnique({ where: { id: templateId } })
    : null
  // An interview with responsables convenes them too
  if (template?.purpose) return { includeLeadership: true }
  if (!template?.rollCall) return {}

  return {
    includeLeadership: true,
    responsables: template.visibility === EventVisibilities.Responsables && !template.functionName,
    team: template.functionName ? { youtuberId, functionName: template.functionName } : null,
  }
}

/**
 * Fill the blanks of a payload from its template
 * @param {ReturnType<typeof toEntryData>} data - Payload read off the form
 * @return {Promise<ReturnType<typeof toEntryData>>} - Payload the template completed
 */

const fillFromTemplate = async (data: ReturnType<typeof toEntryData>) => {
  if (!data.templateId) return data

  const template = await prisma.eventTemplate.findUnique({ where: { id: data.templateId } })
  if (!template) return data

  const allDay = data.allDay || template.allDay

  // A team meeting is shown to the team of the creator for its function
  const team =
    template.functionName && data.youtuberId
      ? await prisma.team.findFirst({
          where: { youtuberId: data.youtuberId, jobFunction: { name: template.functionName } },
          select: { id: true, leads: { select: { accountId: true }, take: 1 } },
        })
      : null
  if (template.functionName && !team) {
    throw invalidInput([{ field: 'youtuberId', message: FORM_COPY.required }])
  }

  return {
    ...data,
    rollCall: data.rollCall || template.rollCall,
    // The template is a pre-designed thing
    kind: template.kind,
    description: data.description ?? template.body,
    visibility: data.visibility ?? template.visibility,
    allDay,
    endsAt:
      data.endsAt ??
      (template.defaultMinutes && !allDay
        ? new Date(data.startsAt.getTime() + template.defaultMinutes * MINUTE)
        : null),
    ...(team && {
      visibility: EventVisibilities.Team,
      audienceTeamId: team.id,
      audienceSessionId: null,
      // Run by a lead of the team when nobody was named
      accountId: data.accountId ?? team.leads[0]?.accountId ?? null,
    }),
  }
}

/**
 * Open a series of annual review slots and hand them back with the message to show
 * @param {string} templateId - Annual reviews model
 * @param {FormValues} values - Parsed body
 * @param {string} ownerId - Responsable opening it
 * @return {Promise<CalendarEntry>} - First slot, the others in `siblings`
 */

const openSeries = async (
  templateId: string,
  values: FormValues,
  ownerId: string
): Promise<CalendarEntry> => {
  // Days and hours come from their own fields
  const [firstDay, lastDay] = readList(values, 'slotDays')
  const from = readText(values, 'slotFrom')
  const to = readText(values, 'slotTo')
  const teamId = readText(values, 'slotTeamId')
  if (!teamId) throw invalidInput([{ field: 'slotTeamId', message: FORM_COPY.required }])
  if (!firstDay || !lastDay) {
    throw invalidInput([{ field: 'slotDays', message: FORM_COPY.required }])
  }
  if (!from || !to) throw invalidInput([{ field: 'slotFrom', message: FORM_COPY.required }])

  const opened = await openAnnualSlots(
    {
      templateId,
      teamId,
      startsAt: wallToInstant(`${firstDay.slice(0, 10)}T${from}`),
      endsAt: wallToInstant(`${lastDay.slice(0, 10)}T${to}`),
    },
    ownerId
  )
  const rows = await prisma.calendarEvent.findMany({
    where: { projectId: opened.projectId },
    orderBy: { startsAt: 'asc' },
    include: ENTRY_SHAPE,
  })
  // The period leads, its slots follow
  const ordered = [...rows].sort(
    (left, right) =>
      Number(right.kind === CalendarKinds.Period) - Number(left.kind === CalendarKinds.Period)
  )
  const [first, ...others] = ordered.map((row) => toEntry(row))

  return {
    ...(first as CalendarEntry),
    notice: ANNUAL_REVIEW_COPY.projectCreated,
    siblings: others,
  }
}

/**
 * Apply new days and hours to a series of slots
 * @param {string} periodId - Period of the series
 * @param {FormValues} values - Parsed body
 * @return {Promise<CalendarEntry>} - The period, new slots in `siblings`, dropped ones in `dropped`
 */

const reshapeEntry = async (periodId: string, values: FormValues): Promise<CalendarEntry> => {
  const [firstDay, lastDay] = readList(values, 'slotDays')
  const from = readText(values, 'slotFrom')
  const to = readText(values, 'slotTo')
  if (!firstDay || !lastDay) {
    throw invalidInput([{ field: 'slotDays', message: FORM_COPY.required }])
  }
  if (!from || !to) throw invalidInput([{ field: 'slotFrom', message: FORM_COPY.required }])

  const { created, removed } = await reshapeSeries(periodId, {
    firstDay: firstDay.slice(0, 10),
    lastDay: lastDay.slice(0, 10),
    from,
    to,
  })

  const rows = await prisma.calendarEvent.findMany({
    where: { id: { in: [periodId, ...created] } },
    include: ENTRY_SHAPE,
  })
  const entries = rows.map((row) => toEntry(row))
  const period = entries.find((entry) => entry.id === periodId) as CalendarEntry

  return {
    ...period,
    siblings: entries.filter((entry) => entry.id !== periodId),
    dropped: removed,
  }
}

/**
 * Zone model tied to a session kind
 * @typedef {Object} LinkedZone
 * @property {string} name - Model name
 * @property {'RECRUITMENT' | 'ACADEMY'} linksTo - Session kind it follows
 */

interface LinkedZone {
  name: string
  linksTo: 'RECRUITMENT' | 'ACADEMY'
}

/**
 * Read the zone model an entry starts from, when it follows a session
 * @param {string | null} templateId - Model of the entry
 * @return {Promise<LinkedZone | null>} - Zone model, none for any other
 */

const readLinkedZone = async (templateId: string | null): Promise<LinkedZone | null> => {
  const template = templateId
    ? await prisma.eventTemplate.findUnique({ where: { id: templateId } })
    : null
  if (!template || template.kind !== CalendarKinds.Zone || !template.linksTo) return null

  return { name: template.name, linksTo: template.linksTo as LinkedZone['linksTo'] }
}

/**
 * Put a zone on the calendar through its session: a recruitment takes the dates given, the academy keeps its timeline
 * @param {LinkedZone} zone - Zone model
 * @param {ReturnType<typeof toEntryData>} base - Payload read off the form
 * @param {FormValues} values - Parsed body
 * @return {Promise<CalendarEntry>} - Zone as the calendar draws it
 */

const fileLinkedZone = async (
  zone: LinkedZone,
  base: ReturnType<typeof toEntryData>,
  values: FormValues
): Promise<CalendarEntry> => {
  const field = zone.linksTo === 'RECRUITMENT' ? 'recruitmentSessionId' : 'zoneSessionId'
  const sessionId = readText(values, field)
  if (!sessionId) throw invalidInput([{ field, message: FORM_COPY.required }])

  if (zone.linksTo === 'RECRUITMENT') {
    const session = await prisma.recruitmentSession.findFirst({
      where: { id: sessionId, status: { in: ACTIVE_RECRUITMENTS } },
    })
    if (!session) throw invalidInput([{ field, message: FORM_COPY.notAnOption }])

    // The campaign follows the dates given, its zone follows the campaign
    const closesAt = base.endsAt ?? session.closesAt
    await prisma.recruitmentSession.update({
      where: { id: sessionId },
      data: { opensAt: base.startsAt, closesAt },
    })

    return projected({
      source: CalendarSources.Recruitment,
      id: `${sessionId}:written`,
      title: `${zone.name}, ${session.name}`,
      startsAt: base.startsAt,
      endsAt: closesAt,
      allDay: true,
      kind: CalendarKinds.Zone,
      accent: null,
      description: null,
      subjectName: null,
      href: ROUTES.recruitment(sessionId),
    })
  }

  const session = await prisma.academySession.findFirst({
    where: {
      id: sessionId,
      status: { notIn: [AcademySessionStatuses.Closed, AcademySessionStatuses.Archived] },
    },
    include: { jobFunction: { select: { name: true } } },
  })
  if (!session) throw invalidInput([{ field, message: FORM_COPY.notAnOption }])

  // The timeline draws the zones itself, nothing is stored
  return projected({
    source: CalendarSources.AcademyPeriod,
    id: `${sessionId}:zone`,
    title: `${zone.name}, ${session.jobFunction.name}`,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    allDay: true,
    kind: CalendarKinds.Zone,
    accent: null,
    description: null,
    subjectName: null,
    href: ROUTES.session(sessionId),
  })
}

/**
 * Post an entry on the calendar
 * @param {string} ownerId - Who posts it
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {AcademyScope} academy - Juniors the member may plan for
 * @return {Promise<CalendarEntry>} - Created entry
 */

export const createEntry = async (
  ownerId: string,
  values: FormValues,
  scope: AccessScope,
  academy: AcademyScope
): Promise<CalendarEntry> => {
  const base = toEntryData(values)
  assertEndAfterStart(base)

  // A model that opens slots makes a whole series, not one entry
  const slotTemplate = base.templateId
    ? await prisma.eventTemplate.findUnique({ where: { id: base.templateId } })
    : null
  if (slotTemplate?.slotMinutes) return openSeries(slotTemplate.id, values, ownerId)

  // A zone tied to a session is never typed in by hand, the session carries it
  const linkedZone = await readLinkedZone(base.templateId)
  if (linkedZone) return fileLinkedZone(linkedZone, base, values)

  const { memberIds: convened, ...fixed } = await resolveAcademyEntry(
    base.templateId,
    values,
    ownerId,
    academy
  )
  const applied = await applyTemplate({ ...base, ...fixed })
  // Nobody picked a glyph, one is drawn at random
  applied.emoji = emojiOrRandom(applied.emoji)

  // A live is checked before anything is written, and always calls the roll
  const liveTemplates = await readLiveTemplates()
  const isLive = applied.templateId !== null && liveTemplates.has(applied.templateId)
  const live = isLive ? await readLiveInput(withTemplatePlatform(values, liveTemplates)) : null
  if (live) await assertNoLiveClash({ ...live, startsAt: applied.startsAt, endsAt: applied.endsAt })
  const data = live ? { ...applied, rollCall: true, youtuberId: live.youtuberId } : applied

  const row = await prisma.calendarEvent.create({
    data: {
      ownerId,
      ...data,
      remindAt: data.rollCall ? resolveRemindAt(data.startsAt, data.remindAt) : null,
    },
    include: ENTRY_SHAPE,
  })

  if (live) {
    // The live convenes its team and asks its Coordinators itself
    await openLive({
      entry: row,
      live: {
        ...live,
        pickedIds: [],
      },
      actorId: ownerId,
      scope,
    })

    const fresh = await prisma.calendarEvent.findUnique({
      where: { id: row.id },
      include: ENTRY_SHAPE,
    })

    return toEntry(fresh ?? row, await readRosterFor(row.id, ownerId, true))
  }

  if (!data.rollCall) return toEntry(row)

  // Fan the roll-call out to its convened members
  const memberIds = await expandRoster(
    data.rollCallTeamIds,
    convened ?? readList(values, 'memberIds'),
    scope,
    data.startsAt,
    {
      everyone: data.visibility === EventVisibilities.Everyone,
      youtuberId: audienceYoutuberId(values),
      ...(await templateAudience(data.templateId, data.youtuberId)),
    }
  )
  await syncRoster(row.id, memberIds)
  await notifyConvened({ id: row.id, title: row.title, ownerId }, memberIds)
  await fileMeeting(row, ownerId, memberIds)

  const fresh = await prisma.calendarEvent.findUnique({
    where: { id: row.id },
    include: ENTRY_SHAPE,
  })

  return toEntry(fresh ?? row, await readRosterFor(row.id, ownerId, true))
}

/**
 * File a meeting model on the Réunions page and link the entry to it
 * @param {{ id: string, title: string, emoji: string | null, startsAt: Date, endsAt: Date | null, templateId: string | null, youtuberId: string | null }} row - Entry just created
 * @param {string} ownerId - Who planned it
 * @param {string[]} memberIds - Members convened
 * @return {Promise<void>} - Linked
 */

const fileMeeting = async (
  row: {
    id: string
    title: string
    emoji: string | null
    startsAt: Date
    endsAt: Date | null
    templateId: string | null
    youtuberId: string | null
  },
  ownerId: string,
  memberIds: string[]
): Promise<void> => {
  const template = row.templateId
    ? await prisma.eventTemplate.findUnique({ where: { id: row.templateId } })
    : null
  if (!template?.meetingAudience) return

  // A team meeting is run by the Responsables of the team, the others by the root administrator
  const team = template.functionName
    ? await prisma.team.findFirst({
        where: { youtuberId: row.youtuberId, jobFunction: { name: template.functionName } },
        select: { leads: { select: { accountId: true } } },
      })
    : null
  const root = ROOT_IDENTITY.discordId
    ? await prisma.account.findFirst({
        where: { discordId: ROOT_IDENTITY.discordId },
        select: { id: true },
      })
    : null
  const leadIds = team ? team.leads.map((lead) => lead.accountId) : [root?.id ?? ownerId]

  const meetingId = await openMeetingForEntry({
    title: row.title,
    emoji: row.emoji,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    audience: template.meetingAudience,
    youtuberId: row.youtuberId,
    leadIds,
    participantIds: memberIds,
    actorId: ownerId,
  })

  await prisma.calendarEvent.update({ where: { id: row.id }, data: { meetingId } })
}

/**
 * Edit an entry
 * @param {string} id - Entry identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member identifier
 * @param {boolean} canManage - Viewer holds the manage permission
 * @param {AcademyScope} academy - Juniors the member may plan for
 * @return {Promise<CalendarEntry>} - Updated entry
 */

export const updateEntry = async (
  id: string,
  values: FormValues,
  scope: AccessScope,
  viewerId: string,
  canManage: boolean,
  academy: AcademyScope
): Promise<CalendarEntry> => {
  // A series of slots is reshaped through its days and hours, the entry itself holds none of the usual fields
  const stored = await prisma.calendarEvent.findUnique({
    where: { id },
    include: { template: { select: { slotMinutes: true } } },
  })
  if (stored?.template?.slotMinutes && stored.kind === CalendarKinds.Period) {
    return reshapeEntry(id, values)
  }

  const base = toEntryData(values)
  assertEndAfterStart(base)
  const { memberIds: convened, ...fixed } = await resolveAcademyEntry(
    base.templateId,
    values,
    viewerId,
    academy
  )
  const data = await applyTemplate({ ...base, ...fixed })

  const row = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...data,
      remindAt: data.rollCall ? resolveRemindAt(data.startsAt, data.remindAt) : null,
    },
    include: ENTRY_SHAPE,
  })
  await syncLiveWithEntry(id, withTemplatePlatform(values, await readLiveTemplates()), viewerId)

  // The card of the Réunions page follows its entry
  await syncMeetingCard(row)

  if (!data.rollCall) return toEntry(row)

  // Widen the roster
  const known = new Set(row.attendances.map((seat) => seat.accountId))
  const memberIds = await expandRoster(
    data.rollCallTeamIds,
    convened ?? readList(values, 'memberIds'),
    scope,
    data.startsAt,
    {
      everyone: data.visibility === EventVisibilities.Everyone,
      youtuberId: audienceYoutuberId(values),
      ...(await templateAudience(data.templateId, data.youtuberId)),
    }
  )
  await syncRoster(id, memberIds)
  await notifyConvened(
    { id, title: row.title, ownerId: row.ownerId },
    memberIds.filter((memberId) => !known.has(memberId))
  )

  const fresh = await prisma.calendarEvent.findUnique({ where: { id }, include: ENTRY_SHAPE })

  return toEntry(fresh ?? row, await readRosterFor(id, viewerId, canManage))
}

/**
 * Move an entry to another moment
 * @param {string} id - Entry identifier
 * @param {Date} startsAt - New start
 * @return {Promise<CalendarEntry>} - Moved entry
 */

export const moveEntry = async (id: string, startsAt: Date): Promise<CalendarEntry> => {
  const current = await prisma.calendarEvent.findUnique({ where: { id } })
  if (!current) throw notFound()

  // Dragging never stretches an entry
  const shift = startsAt.getTime() - current.startsAt.getTime()
  const endsAt = current.endsAt ? new Date(current.endsAt.getTime() + shift) : null

  const row = await prisma.calendarEvent.update({
    where: { id },
    data: { startsAt, endsAt },
    include: ENTRY_SHAPE,
  })
  await syncLiveWithEntry(id)
  await syncMeetingCard(row)

  return toEntry(row)
}

/**
 * Keep the card of the Réunions page in line with the entry it was filed for
 * @param {Object} row - Entry just written
 * @param {string | null} row.meetingId - Card it is linked to
 * @param {string} row.title - Entry title
 * @param {string | null} row.emoji - Entry glyph
 * @param {Date} row.startsAt - Start
 * @param {Date | null} row.endsAt - End
 * @param {boolean} row.allDay - Spans whole days
 * @return {Promise<void>} - Card updated
 */

const syncMeetingCard = async (row: {
  meetingId: string | null
  title: string
  emoji: string | null
  startsAt: Date
  endsAt: Date | null
  allDay: boolean
}): Promise<void> => {
  if (!row.meetingId) return

  await prisma.meeting.updateMany({
    where: { id: row.meetingId },
    data: {
      title: row.title,
      emoji: row.emoji,
      scheduledAt: row.startsAt,
      durationMin:
        row.endsAt && !row.allDay
          ? Math.round((row.endsAt.getTime() - row.startsAt.getTime()) / 60_000)
          : null,
    },
  })
}

/**
 * Drop the cards of the Réunions page that entries of a meeting or slot model had filed
 * @param {string[]} ids - Entries about to be removed
 * @return {Promise<void>} - Cards removed
 */

const dropMeetingCards = async (ids: string[]): Promise<void> => {
  const rows = await prisma.calendarEvent.findMany({
    where: {
      id: { in: ids },
      meetingId: { not: null },
      template: { OR: [{ meetingAudience: { not: null } }, { slotMinutes: { not: null } }] },
    },
    select: { meetingId: true },
  })
  const cards = rows.flatMap((row) => (row.meetingId ? [row.meetingId] : []))
  if (cards.length > 0) await prisma.meeting.deleteMany({ where: { id: { in: cards } } })
}

/**
 * Stretch an entry to a new end
 * @param {string} id - Entry identifier
 * @param {Date} endsAt - New end
 * @return {Promise<CalendarEntry>} - Resized entry
 */

export const resizeEntry = async (id: string, endsAt: Date): Promise<CalendarEntry> => {
  const current = await prisma.calendarEvent.findUnique({ where: { id } })
  if (!current) throw notFound()
  if (endsAt <= current.startsAt) throw notFound()

  const row = await prisma.calendarEvent.update({
    where: { id },
    data: { endsAt },
    include: ENTRY_SHAPE,
  })
  await syncLiveWithEntry(id)
  await syncMeetingCard(row)

  return toEntry(row)
}

/**
 * Drop an entry
 * @param {string} id - Entry identifier
 * @return {Promise<void>} - Removed
 */

export const removeEntry = async (id: string): Promise<void> => {
  await cancelLivesOfEntries([id])
  await dropMeetingCards([id])
  await prisma.calendarEvent.delete({ where: { id } })
}

/**
 * Apply one change to a whole selection
 * @param {string[]} ids - Selected entries
 * @param {FormValues} values - Parsed body
 * @return {Promise<CalendarEntry[]>} - Updated entries
 */

export const updateEntries = async (
  ids: string[],
  values: FormValues
): Promise<CalendarEntry[]> => {
  // A live is posted one at a time, it needs its platform and its Coordinators
  if ((await readLiveTemplates()).has(readText(values, 'templateId') ?? '')) {
    throw invalidInput([{ field: 'templateId', message: CALENDAR_FIELD_INFO.liveAlone }])
  }

  // Only the keys actually sent are written
  const data = Object.fromEntries(
    Object.entries(toEntryData(values)).filter(
      ([key]) =>
        key in values ||
        (AUDIENCE_KEYS.some((audienceKey) => audienceKey === key) && 'visibility' in values)
    )
  )

  await prisma.calendarEvent.updateMany({ where: { id: { in: ids } }, data })

  const rows = await prisma.calendarEvent.findMany({
    where: { id: { in: ids } },
    include: ENTRY_SHAPE,
  })

  return rows.map((row) => toEntry(row))
}

/**
 * Drop a whole selection
 * @param {string[]} ids - Selected entries
 * @return {Promise<void>} - Removed
 */

export const removeEntries = async (ids: string[]): Promise<void> => {
  await cancelLivesOfEntries(ids)
  await dropMeetingCards(ids)
  await prisma.calendarEvent.deleteMany({ where: { id: { in: ids } } })
}

/**
 * Guard a write
 * @param {string} id - Entry identifier
 * @param {string} viewerId - Signed-in member identifier
 * @param {boolean} canManage - Member holds the manage permission
 * @return {Promise<void>} - Throws when neither owner nor manager
 */

export const assertEntryAccess = async (
  id: string,
  viewerId: string,
  canManage: boolean
): Promise<void> => {
  if (canManage) return

  const row = await prisma.calendarEvent.findUnique({ where: { id }, select: { ownerId: true } })
  if (!row) throw notFound()
  if (row.ownerId !== viewerId) throw forbidden()
}

/**
 * Guard a bulk write
 * @param {string[]} ids - Selected entries
 * @param {string} viewerId - Signed-in member identifier
 * @param {boolean} canManage - Member holds the manage permission
 * @return {Promise<void>} - Throws on the first entry out of reach
 */

export const assertEntriesAccess = async (
  ids: string[],
  viewerId: string,
  canManage: boolean
): Promise<void> => {
  if (canManage) return

  const reachable = await prisma.calendarEvent.count({
    where: { id: { in: ids }, ownerId: viewerId },
  })
  if (reachable !== ids.length) throw forbidden()
}

/**
 * Read one entry by identifier
 * @param {string} id - Entry identifier
 * @param {string} viewerId - Signed-in member identifier
 * @param {PermissionHelpers} access - Permission helpers
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<CalendarEntry | null>} - Entry
 */

export const getEntry = async (
  id: string,
  viewerId: string,
  access: PermissionHelpers,
  scope: AccessScope
): Promise<CalendarEntry | null> => {
  const row = await prisma.calendarEvent.findFirst({
    where: scopedWhere('calendarEvent', scope, { id }),
    include: ENTRY_SHAPE,
  })
  if (!row) return null

  const roster = row.rollCall
    ? await readRosterFor(id, viewerId, access.can(Permissions.CalendarManage))
    : null

  return maskTakenSlot(toEntry(row, roster), viewerId, access.isResponsable)
}
