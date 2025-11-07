export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  all_day: boolean
  color: string
  location?: string
  is_recurring: boolean
  recurrence_rule?: string
  recurrence_end?: string
  parent_event_id?: string
  created_at: string
  updated_at: string
}

export interface EventFormData {
  title: string
  description?: string
  start_time: Date
  end_time: Date
  all_day: boolean
  color: string
  location?: string
  is_recurring: boolean
  recurrence_rule?: string
  recurrence_end?: Date
}
