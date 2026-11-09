import 'server-only'
import { roleGroupedOptions } from '@/core/lib/forms/options'
import { prisma } from '@/core/lib/db'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { toOptions } from '@/core/lib/forms/options'
import { memberFunction } from '@/core/services/calendar/projections'
import { liveFormFields, readLiveTemplates } from '@/core/services/lives/LiveService'
import { LIVE_FIELD_COPY } from '@/declarations/lives/copy'
import { LIVE_PLATFORMS_SOON } from '@/declarations/lives/registries'
import { peopleInScope, projectOptions, youtuberOptions } from '@/core/services/work/shared'
import {
  audienceOptions,
  isYoutuberAudience,
  youtuberAudienceValue,
} from '@/core/services/calendar/audience'
import { ROOT_IDENTITY } from '@/declarations/access/identity'
import type { WorkViewer } from '@/core/services/work/visibility'
import {
  AUDIENCE_COPY,
  CALENDAR_FIELD_COPY,
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
import {
  EMOJI_SETTINGS,
  FORM_SETTINGS,
  LIVE_SETTINGS,
} from '@/declarations/configurations/settings'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import type { FieldCondition, FieldDefinition, FieldOption } from '@/types/forms'
import {
  AcademySessionStatuses,
  GONE_MEMBER_STATUSES,
  MemberRoles,
} from '@/utils/constants/hierarchy'
import { RecruitmentStatuses } from '@/utils/constants/recruitment'
import { CalendarKinds, EventVisibilities } from '@/utils/constants/workflow'
import { andAlso } from '@/core/services/calendar/CalendarService/reads'

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
  // A live on a platform Memora cannot hold yet is shown but shut
  const soon = (platform: string | null) =>
    platform !== null && LIVE_PLATFORMS_SOON.some((name) => name === platform)

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
        hint: soon(row.platform)
          ? LIVE_FIELD_COPY.platformSoon
          : row.linksTo && !running[row.linksTo]
            ? CALENDAR_FIELD_INFO.noSession
            : undefined,
        slot:
          row.weekday && row.startTime
            ? { weekday: row.weekday, time: row.startTime, minutes: row.defaultMinutes }
            : undefined,
        // A check-in nobody is left to be planned for is shown but shut
        disabled:
          soon(row.platform) ||
          Boolean(row.linksTo && !running[row.linksTo]) ||
          isTemplateGreyed(academy, row.id) ||
          (live.templateIds.includes(row.id) && !live.allowed) ||
          // A referent plans interviews and check-ins only
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
export const ACTIVE_RECRUITMENTS = [RecruitmentStatuses.Announced, RecruitmentStatuses.Interviews]

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
  [EventVisibilities.Everyone]: AUDIENCE_COPY.everyoneHint,
  [EventVisibilities.Responsables]: AUDIENCE_COPY.responsablesHint,
  [EventVisibilities.Admins]: AUDIENCE_COPY.adminsHint,
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
