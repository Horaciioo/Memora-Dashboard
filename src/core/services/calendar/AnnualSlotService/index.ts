export type { OpenedSlots } from '@/core/services/calendar/AnnualSlotService/shared'
export { openAnnualSlots } from '@/core/services/calendar/AnnualSlotService/opening'
export {
  assertSeriesInScope,
  takeSlot,
  placeSlot,
  cancelSlot,
  placeable,
} from '@/core/services/calendar/AnnualSlotService/slots'
export {
  sweepAnnualReminders,
  closeSeriesIfComplete,
  removeOpenSlots,
  reshapeSeries,
  syncAnnualProjectStates,
} from '@/core/services/calendar/AnnualSlotService/series'
