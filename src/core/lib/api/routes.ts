import { SANCTION_PARAMS } from '@/declarations/sanctions/params'
import { PUSH_JOURNAL_CURSOR } from '@/declarations/pwa/push'
import { WORKER_SUBSCRIPTION_PATH } from '@/declarations/pwa/worker'

/**
 * Single source of every API path
 * @type {Record<string, string | ((...parts: string[]) => string)>}
 */

export const API_ROUTES = {
  // Authentication
  signInWithDiscord: '/api/login/discord',
  welcomeConfirm: '/api/welcome/confirm',
  welcomePseudo: '/api/welcome/pseudo',
  /**
   * Welcome discord path
   * @param token - Access token
   * @return - Route path
   */

  welcomeDiscord: (token: string) => `/api/welcome/${token}/discord`,
  /**
   * Identity escalation path
   * @param id - Entity ID
   * @return - Route path
   */

  identityEscalation: (id: string) => `/api/identity/${id}`,
  /**
   * Identity preview path
   * @param id - Entity ID
   * @return - Route path
   */

  identityPreview: (id: string) => `/api/identity/${id}/preview`,
  /**
   * Identity resolve path
   * @param id - Entity ID
   * @return - Route path
   */

  identityResolve: (id: string) => `/api/identity/${id}/resolve`,
  discordCallback: '/api/login/discord/callback',
  // Preferences
  openSessions: '/api/preferences/sessions',
  /**
   * Open session path
   * @param id - Entity ID
   * @return - Route path
   */

  openSession: (id: string) => `/api/preferences/sessions/${id}`,
  personalExport: '/api/preferences/export',
  /**
   * Retry job path
   * @param name - Queue name
   * @return - Route path
   */

  retryJob: (name: string) => `/api/system/queues/${name}`,
  journalStream: '/api/logs/stream',
  /**
   * Journal export path
   * @param query - Query options
   * @return - Route path
   */

  journalExport: (query: string) => `/api/logs?${query}`,
  seenRelease: '/api/preferences/changelog',
  seenGuide: '/api/preferences/guides',
  favoritePage: '/api/preferences/favorites',
  // Platform links
  twitchLink: '/api/login/twitch',
  youtubeLink: '/api/login/youtube',
  health: '/api/health',
  twoFactor: '/api/two-factor',
  twoFactorSeal: '/api/two-factor/seal',
  // Creator settings
  /**
   * Creator teams path
   * @param id - Entity ID
   * @return - Route path
   */

  creatorTeams: (id: string) => `/api/settings/creators/${id}/teams`,
  /**
   * Whitelist path
   */

  whitelist: '/api/settings/whitelist',
  /**
   * Creator leads path
   * @param id - Entity ID
   * @return - Route path
   */

  creatorLeads: (id: string) => `/api/settings/creators/${id}/leads`,
  /**
   * Creator design path
   * @param id - Entity ID
   * @return - Route path
   */

  creatorDesign: (id: string) => `/api/settings/creators/${id}/design`,
  /**
   * Creator channels path
   * @param id - Entity ID
   * @return - Route path
   */

  creatorChannels: (id: string) => `/api/settings/creators/${id}/channel`,
  /**
   * Reference path
   * @param section - Section key
   * @return - Route path
   */

  reference: (section: string) => `/api/settings/${section}`,
  /**
   * Reference item path
   * @param section - Section key
   * @param id - Entity ID
   * @return - Route path
   */

  referenceItem: (section: string, id: string) => `/api/settings/${section}/${id}`,
  /**
   * Reference order path
   * @param section - Section key
   * @return - Route path
   */

  referenceOrder: (section: string) => `/api/settings/${section}/order`,
  // Members
  members: '/api/members',
  /**
   * Member path
   * @param id - Entity ID
   * @return - Route path
   */

  member: (id: string) => `/api/members/${id}`,
  /**
   * Member notes path
   * @param id - Entity ID
   * @return - Route path
   */

  memberNotes: (id: string) => `/api/members/${id}/notes`,
  /**
   * Member absences path
   * @param id - Entity ID
   * @return - Route path
   */

  memberAbsences: (id: string) => `/api/members/${id}/absences`,
  /**
   * Handle lookup path
   * @param networkId - Network ID
   * @param handle - Account handle
   * @return - Route path
   */

  handleLookup: (networkId: string, handle: string) =>
    `/api/socials/verification?network=${encodeURIComponent(networkId)}&handle=${encodeURIComponent(handle)}`,
  /**
   * Member socials path
   * @param id - Entity ID
   * @return - Route path
   */

  memberSocials: (id: string) => `/api/members/${id}/socials`,
  /**
   * Social path
   * @param id - Entity ID
   * @return - Route path
   */

  social: (id: string) => `/api/socials/${id}`,
  files: '/api/files',
  /**
   * Member admin path
   * @param id - Entity ID
   * @return - Route path
   */

  memberAdmin: (id: string) => `/api/members/${id}/admin`,
  realtimeTicket: '/api/realtime/ticket',
  // Play profile
  playProfile: '/api/play/profile',
  playActivities: '/api/play/activities',
  playLevels: '/api/play/levels',
  playPins: '/api/play/profile/pins',
  /**
   * Play card path
   * @param id - Entity ID
   * @return - Route path
   */

  playCard: (id: string) => `/api/play/players/${id}/card`,
  playFriends: '/api/play/friends',
  /**
   * Play friend path
   * @param id - Entity ID
   * @return - Route path
   */

  playFriend: (id: string) => `/api/play/friends/${id}`,
  /**
   * Play friend answer path
   * @param id - Entity ID
   * @return - Route path
   */

  playFriendAnswer: (id: string) => `/api/play/friends/requests/${id}`,
  /**
   * Play friend search path
   * @param term - Search term
   * @return - Route path
   */

  playFriendSearch: (term: string) => `/api/play/friends/search?q=${encodeURIComponent(term)}`,
  // Play sessions
  playSessions: '/api/play/sessions',
  /**
   * Play session path
   * @param id - Entity ID
   * @return - Route path
   */

  playSession: (id: string) => `/api/play/sessions/${id}`,
  playJoinCode: '/api/play/join-code',
  /**
   * Play visibility path
   * @param id - Entity ID
   * @return - Route path
   */

  playVisibility: (id: string) => `/api/play/sessions/${id}/visibility`,
  /**
   * Play join path
   * @param id - Entity ID
   * @return - Route path
   */

  playJoin: (id: string) => `/api/play/sessions/${id}/join`,
  /**
   * Play leave path
   * @param id - Entity ID
   * @return - Route path
   */

  playLeave: (id: string) => `/api/play/sessions/${id}/leave`,
  /**
   * Play start path
   * @param id - Entity ID
   * @return - Route path
   */

  playStart: (id: string) => `/api/play/sessions/${id}/start`,
  /**
   * Play vote path
   * @param id - Entity ID
   * @return - Route path
   */

  playVote: (id: string) => `/api/play/sessions/${id}/vote`,
  /**
   * Play cancel path
   * @param id - Entity ID
   * @return - Route path
   */

  playCancel: (id: string) => `/api/play/sessions/${id}/cancel`,
  /**
   * Play end path
   * @param id - Entity ID
   * @return - Route path
   */

  playEnd: (id: string) => `/api/play/sessions/${id}/end`,
  /**
   * Play rematch path
   * @param id - Entity ID
   * @return - Route path
   */

  playRematch: (id: string) => `/api/play/sessions/${id}/rematch`,
  /**
   * Play act path
   * @param id - Entity ID
   * @return - Route path
   */

  playAct: (id: string) => `/api/play/sessions/${id}/actions`,
  /**
   * Play kick path
   * @param id - Entity ID
   * @return - Route path
   */

  playKick: (id: string) => `/api/play/sessions/${id}/kick`,
  /**
   * Play bots path
   * @param id - Entity ID
   * @return - Route path
   */

  playBots: (id: string) => `/api/play/sessions/${id}/bots`,
  /**
   * Play ready path
   * @param id - Entity ID
   * @return - Route path
   */

  playReady: (id: string) => `/api/play/sessions/${id}/ready`,
  /**
   * Play seat role path
   * @param id - Entity ID
   * @return - Route path
   */

  playSeatRole: (id: string) => `/api/play/sessions/${id}/seat`,
  /**
   * Play messages path
   * @param id - Entity ID
   * @return - Route path
   */

  playMessages: (id: string) => `/api/play/sessions/${id}/messages`,
  /**
   * Play invite path
   * @param id - Entity ID
   * @return - Route path
   */

  playInvite: (id: string) => `/api/play/sessions/${id}/invite`,
  /**
   * Play invite answer path
   * @param id - Entity ID
   * @return - Route path
   */

  playInviteAnswer: (id: string) => `/api/play/invitations/${id}`,
  // Play notices
  playNotices: '/api/play/notices',
  /**
   * Play notice close path
   * @param id - Entity ID
   * @return - Route path
   */

  playNoticeClose: (id: string) => `/api/play/notices/${id}`,
  // Play groups
  playGroup: '/api/play/group',
  /**
   * Play group of path
   * @param groupId - Group ID
   * @return - Route path
   */

  playGroupOf: (groupId: string) => `/api/play/group/${groupId}`,
  /**
   * Play group host path
   * @param groupId - Group ID
   * @return - Route path
   */

  playGroupHost: (groupId: string) => `/api/play/group/${groupId}/host`,
  /**
   * Play group members path
   * @param groupId - Group ID
   * @return - Route path
   */

  playGroupMembers: (groupId: string) => `/api/play/group/${groupId}/members`,
  /**
   * Play group member path
   * @param groupId - Group ID
   * @param id - Entity ID
   * @return - Route path
   */

  playGroupMember: (groupId: string, id: string) => `/api/play/group/${groupId}/members/${id}`,
  /**
   * Play group invitation path
   * @param id - Entity ID
   * @return - Route path
   */

  playGroupInvitation: (id: string) => `/api/play/group/invitations/${id}`,
  /**
   * Play group proposals path
   * @param groupId - Group ID
   * @return - Route path
   */

  playGroupProposals: (groupId: string) => `/api/play/group/${groupId}/proposals`,
  /**
   * Play group proposal path
   * @param groupId - Group ID
   * @param id - Entity ID
   * @return - Route path
   */

  playGroupProposal: (groupId: string, id: string) => `/api/play/group/${groupId}/proposals/${id}`,
  /**
   * Play group quests path
   * @param groupId - Group ID
   * @return - Route path
   */

  playGroupQuests: (groupId: string) => `/api/play/group/${groupId}/quests`,
  /**
   * Play group launch path
   * @param groupId - Group ID
   * @return - Route path
   */

  playGroupLaunch: (groupId: string) => `/api/play/group/${groupId}/launch`,
  /**
   * Play group messages path
   * @param groupId - Group ID
   * @return - Route path
   */

  playGroupMessages: (groupId: string) => `/api/play/group/${groupId}/messages`,
  // Play players
  /**
   * Play follow path
   * @param id - Entity ID
   * @return - Route path
   */

  playFollow: (id: string) => `/api/play/sessions/${id}/follow`,
  /**
   * Play member path
   * @param id - Entity ID
   * @return - Route path
   */

  playMember: (id: string) => `/api/play/players/${id}`,
  /**
   * Play member xp path
   * @param id - Entity ID
   * @return - Route path
   */

  playMemberXp: (id: string) => `/api/play/players/${id}/xp`,
  // Play admin
  playAdminXp: '/api/play/admin/xp',
  playAdminReset: '/api/play/admin/reset',
  playAdminLogs: '/api/play/admin/logs',
  playAdminConfig: '/api/play/admin/config',
  playAdminGames: '/api/play/admin/games',
  /**
   * Play member level path
   * @param id - Entity ID
   * @return - Route path
   */

  playMemberLevel: (id: string) => `/api/play/players/${id}/level`,
  /**
   * Play member reset path
   * @param id - Entity ID
   * @return - Route path
   */

  playMemberReset: (id: string) => `/api/play/players/${id}/reset`,
  /**
   * Play member remove path
   * @param id - Entity ID
   * @return - Route path
   */

  playMemberRemove: (id: string) => `/api/play/players/${id}/remove`,
  /**
   * Play member stats path
   * @param id - Entity ID
   * @return - Route path
   */

  playMemberStats: (id: string) => `/api/play/players/${id}/stats`,
  /**
   * Play member ban path
   * @param id - Entity ID
   * @return - Route path
   */

  playMemberBan: (id: string) => `/api/play/players/${id}/ban`,
  /**
   * Play member unban path
   * @param id - Entity ID
   * @return - Route path
   */

  playMemberUnban: (id: string) => `/api/play/players/${id}/unban`,
  // Member admin
  participations: '/api/participations',
  /**
   * Member freeze path
   * @param id - Entity ID
   * @return - Route path
   */

  memberFreeze: (id: string) => `/api/members/${id}/admin/freeze`,
  membersDerank: '/api/members/derank',
  /**
   * Member departure path
   * @param id - Entity ID
   * @return - Route path
   */

  memberDeparture: (id: string) => `/api/members/${id}/admin/departure`,
  /**
   * Member suspension path
   * @param id - Entity ID
   * @return - Route path
   */

  memberSuspension: (id: string) => `/api/members/${id}/admin/suspension`,
  /**
   * Member access path
   * @param id - Entity ID
   * @return - Route path
   */

  memberAccess: (id: string) => `/api/members/${id}/access`,
  /**
   * Note path
   * @param id - Entity ID
   * @return - Route path
   */

  note: (id: string) => `/api/notes/${id}`,
  // Projects
  projects: '/api/projects',
  /**
   * Project path
   * @param id - Entity ID
   * @return - Route path
   */

  project: (id: string) => `/api/projects/${id}`,
  /**
   * Project communications path
   * @param id - Entity ID
   * @return - Route path
   */

  projectCommunications: (id: string) => `/api/projects/${id}/communications`,
  // Announcements
  announcements: '/api/announcements',
  /**
   * Announcement path
   * @param id - Entity ID
   * @return - Route path
   */

  announcement: (id: string) => `/api/announcements/${id}`,
  /**
   * Announcement status path
   * @param id - Entity ID
   * @return - Route path
   */

  announcementStatus: (id: string) => `/api/announcements/${id}/status`,
  /**
   * Communication path
   * @param id - Entity ID
   * @return - Route path
   */

  communication: (id: string) => `/api/communications/${id}`,
  // Tasks
  tasks: '/api/tasks',
  /**
   * Task path
   * @param id - Entity ID
   * @return - Route path
   */

  task: (id: string) => `/api/tasks/${id}`,
  taskSearch: '/api/tasks/search',
  /**
   * Task file path
   * @param id - Entity ID
   * @return - Route path
   */

  taskFile: (id: string) => `/api/tasks/${id}/fields`,
  // Juniors
  juniorSearch: '/api/juniors/search',
  /**
   * Junior file path
   * @param id - Entity ID
   * @return - Route path
   */

  juniorFile: (id: string) => `/api/juniors/${id}/file`,
  academyFollow: '/api/academy/follow',
  academyReferents: '/api/academy/referents',
  academyHistory: '/api/academy/history',
  /**
   * Task done path
   * @param id - Entity ID
   * @return - Route path
   */

  taskDone: (id: string) => `/api/tasks/${id}/done`,
  // Meetings
  meetings: '/api/meetings',
  /**
   * Meeting path
   * @param id - Entity ID
   * @return - Route path
   */

  meeting: (id: string) => `/api/meetings/${id}`,
  /**
   * Meeting attendees path
   * @param id - Entity ID
   * @return - Route path
   */

  meetingAttendees: (id: string) => `/api/meetings/${id}/participants`,
  /**
   * Meeting topics path
   * @param id - Entity ID
   * @return - Route path
   */

  meetingTopics: (id: string) => `/api/meetings/${id}/topics`,
  /**
   * Meeting topic path
   * @param id - Entity ID
   * @return - Route path
   */

  meetingTopic: (id: string) => `/api/topics/${id}`,
  // Absences
  absences: '/api/absences',
  /**
   * Absence path
   * @param id - Entity ID
   * @return - Route path
   */

  absence: (id: string) => `/api/absences/${id}`,
  // Lives
  livecon: '/api/livecon',
  lives: '/api/lives',
  livesStream: '/api/lives/stream',
  livePlanning: '/api/lives/planning',
  liveOwnFigures: '/api/lives/me/stats',
  /**
   * Live path
   * @param id - Entity ID
   * @return - Route path
   */

  live: (id: string) => `/api/lives/${id}`,
  /**
   * Live gesture path
   * @param id - Entity ID
   * @param actionId - Action ID
   * @return - Route path
   */

  liveGesture: (id: string, actionId: string) => `/api/lives/${id}/gestures/${actionId}`,
  /**
   * Live mod time path
   * @param id - Entity ID
   * @param accountId - Account ID
   * @return - Route path
   */

  liveModTime: (id: string, accountId: string) => `/api/lives/${id}/time/${accountId}`,
  /**
   * Live mod view path
   * @param id - Entity ID
   * @return - Route path
   */

  liveModView: (id: string) => `/api/lives/${id}/modview`,
  /**
   * Live emotes path
   * @param id - Entity ID
   * @return - Route path
   */

  liveEmotes: (id: string) => `/api/lives/${id}/emotes`,
  /**
   * Live avatars path
   * @param id - Entity ID
   * @param ids - Account IDs
   * @return - Route path
   */

  liveAvatars: (id: string, ids: string[]) =>
    `/api/lives/${id}/avatars?ids=${ids.map(encodeURIComponent).join(',')}`,
  /**
   * Live feed path
   * @param id - Entity ID
   * @return - Route path
   */

  liveFeed: (id: string) => `/api/lives/${id}/stream`,
  /**
   * Live presence path
   * @param id - Entity ID
   * @return - Route path
   */

  livePresence: (id: string) => `/api/lives/${id}/presence`,
  /**
   * Live reinforcement path
   * @param id - Entity ID
   * @return - Route path
   */

  liveReinforcement: (id: string) => `/api/lives/${id}/reinforcement`,
  /**
   * Live reopen path
   * @param id - Entity ID
   * @return - Route path
   */

  liveReopen: (id: string) => `/api/lives/${id}/reopen`,
  /**
   * Live coordinators path
   * @param id - Entity ID
   * @return - Route path
   */

  liveCoordinators: (id: string) => `/api/lives/${id}/coordinators`,
  /**
   * Live mod stop path
   * @param id - Entity ID
   * @return - Route path
   */

  liveModStop: (id: string) => `/api/lives/${id}/stop`,
  /**
   * Live roster path
   * @param id - Entity ID
   * @return - Route path
   */

  liveRoster: (id: string) => `/api/lives/${id}/roll-call`,
  /**
   * Live coordination path
   * @param id - Entity ID
   * @return - Route path
   */

  liveCoordination: (id: string) => `/api/lives/${id}/coordination`,
  /**
   * Live instructions path
   * @param id - Entity ID
   * @return - Route path
   */

  liveInstructions: (id: string) => `/api/lives/${id}/instructions`,
  /**
   * Live viewer path
   * @param id - Entity ID
   * @param viewerId - Viewer ID
   * @return - Route path
   */

  liveViewer: (id: string, viewerId: string) => `/api/lives/${id}/viewers/${viewerId}`,
  /**
   * Live ban path
   * @param id - Entity ID
   * @param viewerId - Viewer ID
   * @return - Route path
   */

  liveBan: (id: string, viewerId: string) => `/api/lives/${id}/banned/${viewerId}`,
  /**
   * Live viewer comments path
   * @param id - Entity ID
   * @param viewerId - Viewer ID
   * @return - Route path
   */

  liveViewerComments: (id: string, viewerId: string) =>
    `/api/lives/${id}/viewers/${viewerId}/comments`,
  /**
   * Live shared words path
   * @param id - Entity ID
   * @param [wordId] - Word ID
   * @return - Route path
   */

  liveSharedWords: (id: string, wordId?: string) =>
    `/api/lives/${id}/shared-words${wordId ? `/${wordId}` : ''}`,
  /**
   * Live viewer chat path
   * @param id - Entity ID
   * @param viewerId - Viewer ID
   * @param [cursor] - Page cursor
   * @return - Route path
   */

  liveViewerChat: (id: string, viewerId: string, cursor?: string | null) =>
    `/api/lives/${id}/viewers/${viewerId}/chat${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
  /**
   * Live inspect path
   * @param id - Entity ID
   * @param accountId - Account ID
   * @return - Route path
   */

  liveInspect: (id: string, accountId: string) => `/api/lives/${id}/moderators/${accountId}`,
  /**
   * Mod view preferences path
   * @param [liveId] - Live ID
   * @return - Route path
   */

  modViewPreferences: (liveId?: string | null) =>
    `/api/modview/preferences${liveId ? `?live=${encodeURIComponent(liveId)}` : ''}`,
  /**
   * Live focus path
   * @param id - Entity ID
   * @return - Route path
   */

  liveFocus: (id: string) => `/api/lives/${id}/focus`,
  /**
   * Live team chat path
   * @param id - Entity ID
   * @param scope - Chat scope
   * @param [cursor] - Page cursor
   * @return - Route path
   */

  liveTeamChat: (id: string, scope: string, cursor?: string | null) =>
    `/api/lives/${id}/team-chat?${new URLSearchParams({ scope, ...(cursor ? { cursor } : {}) })}`,
  // Sanctions
  /**
   * Sanctions path
   * @param youtuberId - Creator ID
   * @param panel - Panel key
   * @param [levelId] - Level ID
   * @param [replace] - Replace flag
   * @return - Route path
   */

  sanctions: (youtuberId: string, panel: string, levelId?: string | null, replace = false) =>
    `/api/sanctions?${new URLSearchParams({
      [SANCTION_PARAMS.creator]: youtuberId,
      [SANCTION_PARAMS.panel]: panel,
      ...(levelId ? { [SANCTION_PARAMS.level]: levelId } : {}),
      ...(replace ? { [SANCTION_PARAMS.replace]: SANCTION_PARAMS.yes } : {}),
    }).toString()}`,
  /**
   * Sanction offenses path
   * @param youtuberId - Creator ID
   * @param panel - Panel key
   * @return - Route path
   */

  sanctionOffenses: (youtuberId: string, panel: string) =>
    `/api/sanctions/infractions?${new URLSearchParams({
      [SANCTION_PARAMS.creator]: youtuberId,
      [SANCTION_PARAMS.panel]: panel,
    })}`,
  /**
   * Sanction offense path
   * @param id - Entity ID
   * @return - Route path
   */

  sanctionOffense: (id: string) => `/api/sanctions/${id}`,
  /**
   * Sanction ladder path
   * @param id - Entity ID
   * @return - Route path
   */

  sanctionLadder: (id: string) => `/api/sanctions/${id}/ladder`,
  // Calendar
  /**
   * Calendar path
   * @param from - Range start
   * @param to - Range end
   * @param [sessionId] - Session ID
   * @return - Route path
   */

  calendar: (from: string, to: string, sessionId?: string) =>
    `/api/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` +
    (sessionId ? `&session=${encodeURIComponent(sessionId)}` : ''),
  calendarEntries: '/api/calendar',
  /**
   * Calendar entry path
   * @param id - Entity ID
   * @return - Route path
   */

  calendarEntry: (id: string) => `/api/calendar/${id}`,
  /**
   * Calendar entry attendance path
   * @param id - Entity ID
   * @return - Route path
   */

  calendarEntryAttendance: (id: string) => `/api/calendar/${id}/presence`,
  /**
   * Calendar entry reminder path
   * @param id - Entity ID
   * @return - Route path
   */

  calendarEntryReminder: (id: string) => `/api/calendar/${id}/presence/reminder`,
  // Academy
  academy: '/api/academy',
  /**
   * Session path
   * @param id - Entity ID
   * @return - Route path
   */

  session: (id: string) => `/api/academy/${id}`,
  /**
   * Session juniors path
   * @param id - Entity ID
   * @return - Route path
   */

  sessionJuniors: (id: string) => `/api/academy/${id}/juniors`,
  /**
   * Session comments path
   * @param id - Entity ID
   * @return - Route path
   */

  sessionComments: (id: string) => `/api/academy/${id}/comments`,
  /**
   * Academy comment path
   * @param id - Entity ID
   * @return - Route path
   */

  academyComment: (id: string) => `/api/pim-comments/${id}`,
  /**
   * Session launch path
   * @param id - Entity ID
   * @return - Route path
   */

  sessionLaunch: (id: string) => `/api/academy/${id}/launch`,
  /**
   * Session second period path
   * @param id - Entity ID
   * @return - Route path
   */

  sessionSecondPeriod: (id: string) => `/api/academy/${id}/period-2`,
  // Departures
  /**
   * Departure path
   * @param id - Entity ID
   * @return - Route path
   */

  departure: (id: string) => `/api/departures/${id}`,
  departuresMerge: '/api/departures/merge',
  /**
   * Junior path
   * @param id - Entity ID
   * @return - Route path
   */

  junior: (id: string) => `/api/juniors/${id}`,
  /**
   * Junior trainings path
   * @param id - Entity ID
   * @return - Route path
   */

  juniorTrainings: (id: string) => `/api/juniors/${id}/trainings`,
  /**
   * Junior reviews path
   * @param id - Entity ID
   * @return - Route path
   */

  juniorReviews: (id: string) => `/api/juniors/${id}/reports`,
  /**
   * Junior skills path
   * @param id - Entity ID
   * @return - Route path
   */

  juniorSkills: (id: string) => `/api/juniors/${id}/skills`,
  /**
   * Junior parkour path
   * @param id - Entity ID
   * @return - Route path
   */

  juniorParkour: (id: string) => `/api/juniors/${id}/track`,
  /**
   * Junior comments path
   * @param id - Entity ID
   * @return - Route path
   */

  juniorComments: (id: string) => `/api/juniors/${id}/comments`,
  /**
   * Junior notes path
   * @param id - Entity ID
   * @return - Route path
   */

  juniorNotes: (id: string) => `/api/juniors/${id}/notes`,
  /**
   * Junior objectives path
   * @param id - Entity ID
   * @return - Route path
   */

  juniorObjectives: (id: string) => `/api/juniors/${id}/objectives`,
  /**
   * Junior objectives order path
   * @param id - Entity ID
   * @return - Route path
   */

  juniorObjectivesOrder: (id: string) => `/api/juniors/${id}/objectives/order`,
  // Reviews
  /**
   * Review path
   * @param id - Entity ID
   * @return - Route path
   */

  review: (id: string) => `/api/reports/${id}`,
  /**
   * Review submit path
   * @param id - Entity ID
   * @return - Route path
   */

  reviewSubmit: (id: string) => `/api/reports/${id}/submit`,
  /**
   * Review decision path
   * @param id - Entity ID
   * @return - Route path
   */

  reviewDecision: (id: string) => `/api/reports/${id}/decision`,
  /**
   * Junior note path
   * @param id - Entity ID
   * @return - Route path
   */

  juniorNote: (id: string) => `/api/fsi-notes/${id}`,
  /**
   * Objective path
   * @param id - Entity ID
   * @return - Route path
   */

  objective: (id: string) => `/api/objectives/${id}`,
  /**
   * My training progress path
   * @param id - Entity ID
   * @return - Route path
   */

  myTrainingProgress: (id: string) => `/api/trainings/${id}/progress`,
  /**
   * My training content path
   * @param id - Entity ID
   * @return - Route path
   */

  myTrainingContent: (id: string) => `/api/trainings/${id}/content`,
  /**
   * Course exercise path
   * @param id - Entity ID
   * @return - Route path
   */

  courseExercise: (id: string) => `/api/trainings/${id}/exercises`,
  /**
   * Course feedback path
   * @param id - Entity ID
   * @return - Route path
   */

  courseFeedback: (id: string) => `/api/trainings/${id}/reviews`,
  // Legacy tracks
  legacyTracks: '/api/legacy',
  /**
   * Legacy track path
   * @param id - Entity ID
   * @return - Route path
   */

  legacyTrack: (id: string) => `/api/legacy/${id}`,
  /**
   * Legacy grade path
   * @param id - Entity ID
   * @param key - Module key
   * @return - Route path
   */

  legacyGrade: (id: string, key: string) => `/api/legacy/${id}/modules/${key}`,
  // Integrations
  /**
   * Integration path
   * @param token - Access token
   * @return - Route path
   */

  integration: (token: string) => `/api/integration/${token}`,
  /**
   * Integration discord path
   * @param token - Access token
   * @return - Route path
   */

  integrationDiscord: (token: string) => `/api/integration/${token}/discord`,
  /**
   * Recruitment activation path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentActivation: (id: string) => `/api/recruitments/${id}/activation`,
  // Training content
  /**
   * Training chapters path
   * @param id - Entity ID
   * @return - Route path
   */

  trainingChapters: (id: string) => `/api/trainings/${id}/chapters`,
  /**
   * Training chapters order path
   * @param id - Entity ID
   * @return - Route path
   */

  trainingChaptersOrder: (id: string) => `/api/trainings/${id}/chapters/order`,
  /**
   * Chapter path
   * @param id - Entity ID
   * @return - Route path
   */

  chapter: (id: string) => `/api/chapters/${id}`,
  /**
   * Chapter blocks path
   * @param id - Entity ID
   * @return - Route path
   */

  chapterBlocks: (id: string) => `/api/chapters/${id}/blocks`,
  /**
   * Chapter blocks order path
   * @param id - Entity ID
   * @return - Route path
   */

  chapterBlocksOrder: (id: string) => `/api/chapters/${id}/blocks/order`,
  /**
   * Block path
   * @param id - Entity ID
   * @return - Route path
   */

  block: (id: string) => `/api/blocks/${id}`,
  /**
   * Block questions path
   * @param id - Entity ID
   * @return - Route path
   */

  blockQuestions: (id: string) => `/api/blocks/${id}/questions`,
  /**
   * Block questions order path
   * @param id - Entity ID
   * @return - Route path
   */

  blockQuestionsOrder: (id: string) => `/api/blocks/${id}/questions/order`,
  /**
   * Block quiz path
   * @param id - Entity ID
   * @return - Route path
   */

  blockQuiz: (id: string) => `/api/blocks/${id}/quiz`,
  /**
   * Question path
   * @param id - Entity ID
   * @return - Route path
   */

  question: (id: string) => `/api/questions/${id}`,
  /**
   * Question choices path
   * @param id - Entity ID
   * @return - Route path
   */

  questionChoices: (id: string) => `/api/questions/${id}/choices`,
  /**
   * Question choices order path
   * @param id - Entity ID
   * @return - Route path
   */

  questionChoicesOrder: (id: string) => `/api/questions/${id}/choices/order`,
  /**
   * Choice path
   * @param id - Entity ID
   * @return - Route path
   */

  choice: (id: string) => `/api/choices/${id}`,
  // Recruitment
  recruitments: '/api/recruitments',
  candidateSearch: '/api/candidates/search',
  /**
   * Candidate fields path
   * @param id - Entity ID
   * @return - Route path
   */

  candidateFields: (id: string) => `/api/candidates/${id}/fields`,
  recruitmentFields: '/api/recruitments/fields',
  recruitmentHistory: '/api/recruitments/history',
  recruitmentBlacklist: '/api/recruitments/blacklist',
  /**
   * Recruitment path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitment: (id: string) => `/api/recruitments/${id}`,
  /**
   * Recruitment closure path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentClosure: (id: string) => `/api/recruitments/${id}/closing`,
  /**
   * Recruitment candidates path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentCandidates: (id: string) => `/api/recruitments/${id}/candidates`,
  /**
   * Recruitment steps path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentSteps: (id: string) => `/api/recruitments/${id}/steps`,
  /**
   * Recruitment comments path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentComments: (id: string) => `/api/recruitments/${id}/comments`,
  /**
   * Recruitment comment path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentComment: (id: string) => `/api/recruitment-comments/${id}`,
  /**
   * Recruitment instructions path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentInstructions: (id: string) => `/api/recruitments/${id}/instructions`,
  /**
   * Recruitment identifiers path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentIdentifiers: (id: string) => `/api/recruitments/${id}/identifiers`,
  /**
   * Recruitment announcement path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentAnnouncement: (id: string) => `/api/recruitments/${id}/announcement`,
  /**
   * Candidate stage path
   * @param id - Entity ID
   * @param stage - Stage key
   * @return - Route path
   */

  candidateStage: (id: string, stage: string) => `/api/candidates/${id}/steps/${stage}`,
  /**
   * Candidate observation path
   * @param id - Entity ID
   * @return - Route path
   */

  candidateObservation: (id: string) => `/api/candidates/${id}/observation`,
  /**
   * Candidate path
   * @param id - Entity ID
   * @return - Route path
   */

  candidate: (id: string) => `/api/candidates/${id}`,
  /**
   * Candidate review path
   * @param id - Entity ID
   * @return - Route path
   */

  candidateReview: (id: string) => `/api/candidates/${id}/report`,
  /**
   * Candidate column path
   * @param id - Entity ID
   * @return - Route path
   */

  candidateColumn: (id: string) => `/api/candidates/${id}/column`,
  /**
   * Candidate interview path
   * @param id - Entity ID
   * @return - Route path
   */

  candidateInterview: (id: string) => `/api/candidates/${id}/interview`,
  /**
   * Candidate answer path
   * @param id - Entity ID
   * @param key - Module key
   * @return - Route path
   */

  candidateAnswer: (id: string, key: string) => `/api/candidates/${id}/answers/${key}`,
  /**
   * Candidate exercises path
   * @param id - Entity ID
   * @return - Route path
   */

  candidateExercises: (id: string) => `/api/candidates/${id}/exercises`,
  /**
   * Exercise expiry path
   * @param id - Entity ID
   * @return - Route path
   */

  exerciseExpiry: (id: string) => `/api/exercises/${id}/expiration`,
  /**
   * Exercise discord path
   * @param token - Access token
   * @return - Route path
   */

  exerciseDiscord: (token: string) => `/api/exercise/${token}/discord`,
  /**
   * Exercise play path
   * @param token - Access token
   * @return - Route path
   */

  exercisePlay: (token: string) => `/api/exercise/${token}/read`,
  // Unban
  unbanRequests: '/api/unban/requests',
  /**
   * Unban request path
   * @param id - Entity ID
   * @return - Route path
   */

  unbanRequest: (id: string) => `/api/unban/requests/${id}`,
  /**
   * Unban request action path
   * @param id - Entity ID
   * @param action - Action key
   * @return - Route path
   */

  unbanRequestAction: (id: string, action: string) => `/api/unban/requests/${id}/${action}`,
  unbanForm: '/api/unban/form',
  unbanFormPublish: '/api/unban/form/publish',
  unbanFormVersions: '/api/unban/form/versions',
  /**
   * Unban public path
   * @param slug - Form slug
   * @return - Route path
   */

  unbanPublic: (slug: string) => `/api/unban/public/${slug}`,
  /**
   * Unban discord path
   * @param slug - Form slug
   * @return - Route path
   */

  unbanDiscord: (slug: string) => `/api/unban/public/${slug}/discord`,
  /**
   * Unban submit path
   * @param slug - Form slug
   * @return - Route path
   */

  unbanSubmit: (slug: string) => `/api/unban/public/${slug}/submit`,
  // Work comments
  /**
   * Candidate comments path
   * @param id - Entity ID
   * @return - Route path
   */

  candidateComments: (id: string) => `/api/candidates/${id}/comments`,
  /**
   * Candidate comment path
   * @param id - Entity ID
   * @return - Route path
   */

  candidateComment: (id: string) => `/api/recruitment-comments/${id}`,
  /**
   * Work comments path
   * @param kind - Entity kind
   * @param id - Entity ID
   * @return - Route path
   */

  workComments: (kind: string, id: string) => `/api/work-comments/${kind}/${id}`,
  /**
   * Work comment path
   * @param kind - Entity kind
   * @param id - Entity ID
   * @param commentId - Comment ID
   * @return - Route path
   */

  workComment: (kind: string, id: string, commentId: string) =>
    `/api/work-comments/${kind}/${id}/${commentId}`,
  /**
   * Recruitment step path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentStep: (id: string) => `/api/recruitment-steps/${id}`,
  /**
   * Recruitment step status path
   * @param id - Entity ID
   * @return - Route path
   */

  recruitmentStepStatus: (id: string) => `/api/recruitment-steps/${id}/status`,
  // Notifications
  /**
   * Notifications path
   * @param [size] - Page size
   * @param [after] - After cursor
   * @return - Route path
   */

  notifications: (size?: number, after?: string) =>
    size
      ? `/api/notifications?taille=${size}${after ? `&apres=${after}` : ''}`
      : '/api/notifications',
  notificationsStream: '/api/notifications/stream',
  /**
   * Notification path
   * @param id - Entity ID
   * @return - Route path
   */

  notification: (id: string) => `/api/notifications/${id}`,
  /**
   * Notification unread path
   * @param id - Entity ID
   * @return - Route path
   */

  notificationUnread: (id: string) => `/api/notifications/${id}/unread`,
  // Recap
  /**
   * Recap path
   * @param [query] - Query options
   * @param [query.from] - Range start
   * @param [query.demo] - Demo flag
   * @return - Route path
   */

  recap: (query: { from?: string; demo?: boolean } = {}) => {
    const params = new URLSearchParams()
    if (query.from) params.set('depuis', query.from)
    if (query.demo) params.set('demo', '1')
    const text = params.toString()

    return text ? `/api/recap?${text}` : '/api/recap'
  },
  // Lives that ask the member, and who answered
  liveAsks: '/api/live-asks',
  /**
   * Who answered what on a live
   * @param eventId - Roll-call event
   * @return - Route path
   */

  liveAskGroups: (eventId: string) => `/api/live-asks/${eventId}`,
  // Push and mail
  push: '/api/push',
  pushSubscription: WORKER_SUBSCRIPTION_PATH,
  /**
   * Push device path
   * @param id - Entity ID
   * @return - Route path
   */

  pushDevice: (id: string) => `/api/push/devices/${id}`,
  pushTrial: '/api/push/trial',
  /**
   * Push journal path
   * @param [after] - After cursor
   * @return - Route path
   */

  pushJournal: (after?: string) =>
    after ? `/api/system/push?${PUSH_JOURNAL_CURSOR}=${after}` : '/api/system/push',
  /**
   * Push sample path
   * @param kind - Entity kind
   * @return - Route path
   */

  pushSample: (kind: string) => `/api/system/push/${kind}`,
  /**
   * Mail sample path
   * @param kind - Entity kind
   * @return - Route path
   */

  mailSample: (kind: string) => `/api/system/mail/${kind}`,
  // Preferences
  mobileDock: '/api/preferences/bar',
  availability: '/api/preferences/availability',
  // Access and features
  features: '/api/features',
  access: '/api/access',
  accessStream: '/api/access/stream',
  accessFunctions: '/api/access/functions',
  /**
   * Access function path
   * @param id - Entity ID
   * @return - Route path
   */

  accessFunction: (id: string) => `/api/access/functions/${id}`,
  accessMembers: '/api/access/members',
  accessSimulation: '/api/access/simulation',
  profile: '/api/preferences',
  displayPreferences: '/api/preferences/display',
  tourIntake: '/api/preferences/tour',
  tourHurdle: '/api/preferences/tour/difficulty',
  // Calendar slots
  meetingRequests: '/api/calendar/requests',
  /**
   * Calendar slot path
   * @param id - Entity ID
   * @return - Route path
   */

  calendarSlot: (id: string) => `/api/calendar/${id}/slot`,
  /**
   * Calendar slot clear path
   * @param id - Entity ID
   * @return - Route path
   */

  calendarSlotClear: (id: string) => `/api/calendar/${id}/slot/empty`,
  /**
   * Calendar slot cancel path
   * @param id - Entity ID
   * @return - Route path
   */

  calendarSlotCancel: (id: string) => `/api/calendar/${id}/slot/cancellation`,
  // Dashboard and search
  board: '/api/dashboard',
  search: '/api/search',
  assistant: '/api/assistant',
  mentionable: '/api/mentionable',
  mentionsRead: '/api/mentions/read',
  /**
   * Comment unread path
   * @param id - Entity ID
   * @return - Route path
   */

  commentUnread: (id: string) => `/api/unread-comments/${id}`,
  // Private pages
  pages: '/api/pages',
  /**
   * Page path
   * @param id - Entity ID
   * @return - Route path
   */

  page: (id: string) => `/api/pages/${id}`,
  pageCategories: '/api/pages/categories',
  /**
   * Page category path
   * @param id - Entity ID
   * @return - Route path
   */

  pageCategory: (id: string) => `/api/pages/categories/${id}`,
  /**
   * Page move path
   * @param id - Entity ID
   * @return - Route path
   */

  pageMove: (id: string) => `/api/pages/${id}/move`,
  /**
   * Page restore path
   * @param id - Entity ID
   * @return - Route path
   */

  pageRestore: (id: string) => `/api/pages/${id}/restore`,
  /**
   * Page purge path
   * @param id - Entity ID
   * @return - Route path
   */

  pagePurge: (id: string) => `/api/pages/${id}/permanent`,
  /**
   * Page sharing path
   * @param id - Entity ID
   * @return - Route path
   */

  pageSharing: (id: string) => `/api/pages/${id}/share`,
  /**
   * Page share path
   * @param id - Entity ID
   * @param shareId - Share ID
   * @return - Route path
   */

  pageShare: (id: string, shareId: string) => `/api/pages/${id}/share/${shareId}`,
  /**
   * Page media upload path
   * @param id - Entity ID
   * @return - Route path
   */

  pageMediaUpload: (id: string) => `/api/pages/${id}/media`,
  /**
   * Page media path
   * @param mediaId - Media ID
   * @return - Route path
   */

  pageMedia: (mediaId: string) => `/api/pages/media/${mediaId}`,
  /**
   * Page comments path
   * @param id - Entity ID
   * @return - Route path
   */

  pageComments: (id: string) => `/api/pages/${id}/comments`,
  /**
   * Page revisions path
   * @param id - Entity ID
   * @return - Route path
   */

  pageRevisions: (id: string) => `/api/pages/${id}/versions`,
  /**
   * Page revision path
   * @param id - Entity ID
   * @param versionId - Version ID
   * @return - Route path
   */

  pageRevision: (id: string, versionId: string) => `/api/pages/${id}/versions/${versionId}`,
  /**
   * Page revision restore path
   * @param id - Entity ID
   * @param versionId - Version ID
   * @return - Route path
   */

  pageRevisionRestore: (id: string, versionId: string) =>
    `/api/pages/${id}/versions/${versionId}/restore`,
  /**
   * Page comment path
   * @param commentId - Comment ID
   * @return - Route path
   */

  pageComment: (commentId: string) => `/api/pages/comments/${commentId}`,
  pageTrash: '/api/pages/trash',
  /**
   * Page search path
   * @param term - Search term
   * @return - Route path
   */

  pageSearch: (term: string) => `/api/pages/search?q=${encodeURIComponent(term)}`,
} as const

/**
 * Single source of every client cache key
 * @type {Record<string, (...parts: string[]) => string>}
 */

export const CACHE_KEYS = {
  /**
   * Reference key
   * @param section - Section key
   * @return - Cache key
   */

  reference: (section: string) => `reference:${section}`,
  // Members
  /**
   * Members key
   * @return - Cache key
   */

  members: () => 'members',
  /**
   * Member key
   * @param id - Entity ID
   * @return - Cache key
   */

  member: (id: string) => `member:${id}`,
  // Projects
  /**
   * Projects key
   * @return - Cache key
   */

  projects: () => 'projects',
  /**
   * Project key
   * @param id - Entity ID
   * @return - Cache key
   */

  project: (id: string) => `project:${id}`,
  // Tasks
  /**
   * Tasks key
   * @return - Cache key
   */

  tasks: () => 'tasks',
  /**
   * Task key
   * @param id - Entity ID
   * @return - Cache key
   */

  task: (id: string) => `task:${id}`,
  // Meetings
  /**
   * Meetings key
   * @return - Cache key
   */

  meetings: () => 'meetings',
  /**
   * Meeting key
   * @param id - Entity ID
   * @return - Cache key
   */

  meeting: (id: string) => `meeting:${id}`,
  // Absences
  /**
   * Absences key
   * @return - Cache key
   */

  absences: () => 'absences',
  // Lives
  /**
   * Livecon key
   * @return - Cache key
   */

  livecon: () => 'livecon',
  /**
   * Lives key
   * @return - Cache key
   */

  lives: () => 'lives',
  // Sanctions
  /**
   * Sanctions key
   * @param youtuberId - Creator ID
   * @return - Cache key
   */

  sanctions: (youtuberId: string) => `sanctions:${youtuberId}`,
  /**
   * Teams key
   * @return - Cache key
   */

  teams: () => 'teams',
  // Calendar
  /**
   * Calendar key
   * @param from - Range start
   * @param to - Range end
   * @return - Cache key
   */

  calendar: (from: string, to: string) => `calendar:${from}:${to}`,

  /**
   * Recruitments key
   * @return - Cache key
   */

  recruitments: () => 'recruitments',
  /**
   * Recruitment key
   * @param id - Entity ID
   * @return - Cache key
   */

  recruitment: (id: string) => `recruitment:${id}`,
  /**
   * Sessions key
   * @return - Cache key
   */

  sessions: () => 'academy:sessions',
  /**
   * Session key
   * @param id - Entity ID
   * @return - Cache key
   */

  session: (id: string) => `academy:session:${id}`,
  /**
   * Junior key
   * @param id - Entity ID
   * @return - Cache key
   */

  junior: (id: string) => `academy:junior:${id}`,
  /**
   * Access key
   * @return - Cache key
   */

  access: () => 'access',

  /**
   * Notifications key
   * @return - Cache key
   */

  notifications: () => 'notifications',
  /**
   * Profile key
   * @return - Cache key
   */

  profile: () => 'profile',
  /**
   * Search key
   * @param term - Search term
   * @return - Cache key
   */

  search: (term: string) => `search:${term}`,
} as const
