'use client'

import { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { useEvents } from '../../lib/hooks/useEvents'
import EventModal from './EventModal'
import { CalendarEvent, EventFormData } from '../../types/calendar'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface CalendarViewProps {
  userId: string
}

export default function CalendarView({ userId }: CalendarViewProps) {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useEvents(userId)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const calendarRef = useRef<any>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.date)
    setSelectedEvent(null)
    setModalOpen(true)
  }

  const handleEventClick = (arg: any) => {
    const event = events.find(e => e.id === arg.event.id)
    if (event) {
      setSelectedEvent(event)
      setModalOpen(true)
    }
  }

  const handleSaveEvent = async (formData: EventFormData) => {
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, {
          title: formData.title,
          description: formData.description,
          start_time: formData.start_time.toISOString(),
          end_time: formData.end_time.toISOString(),
          all_day: formData.all_day,
          color: formData.color,
          location: formData.location,
          is_recurring: formData.is_recurring,
          recurrence_rule: formData.recurrence_rule,
          recurrence_end: formData.recurrence_end?.toISOString(),
        })
      } else {
        await addEvent({
          title: formData.title,
          description: formData.description,
          start_time: formData.start_time.toISOString(),
          end_time: formData.end_time.toISOString(),
          all_day: formData.all_day,
          color: formData.color,
          location: formData.location,
          is_recurring: formData.is_recurring,
          recurrence_rule: formData.recurrence_rule,
          recurrence_end: formData.recurrence_end?.toISOString(),
        })
      }
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event')
    }
  }

  const handleDeleteEvent = async () => {
    if (selectedEvent && confirm('Delete this event?')) {
      try {
        await deleteEvent(selectedEvent.id)
        setModalOpen(false)
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event')
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </header>

      <main className="flex-1 p-6 bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm h-full">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            events={events.map(event => ({
              id: event.id,
              title: event.title,
              start: event.start_time,
              end: event.end_time,
              allDay: event.all_day,
              backgroundColor: event.color,
              borderColor: event.color,
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            height="100%"
          />
        </div>
      </main>

      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedEvent(null)
        }}
        onSave={handleSaveEvent}
        event={selectedEvent}
        initialDate={selectedDate}
      />

      {selectedEvent && modalOpen && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleDeleteEvent}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Event
          </button>
        </div>
      )}
    </div>
  )
}
