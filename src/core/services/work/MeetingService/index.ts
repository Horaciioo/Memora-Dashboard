export { MEETING_INCLUDE, toMeetingSummary } from '@/core/services/work/MeetingService/shape'
export { meetingFields } from '@/core/services/work/MeetingService/fields'
export {
  listMeetings,
  createMeeting,
  openMeetingForEntry,
  updateMeeting,
  removeMeeting,
  readMeeting,
  readMeetingCalendar,
  touchMeeting,
  moveMeeting,
} from '@/core/services/work/MeetingService/meetings'
export type { EntryMeeting } from '@/core/services/work/MeetingService/meetings'
export {
  topicFields,
  listTopics,
  addTopic,
  updateTopic,
  removeTopic,
  topicMeetingId,
  readTopic,
} from '@/core/services/work/MeetingService/topics'
