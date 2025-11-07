'use client'

import { useState } from 'react'
import { EventFormData, CalendarEvent } from '../../types/calendar'
import { X } from 'lucide-react'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: EventFormData) => void
  event?: CalendarEvent | null
  initialDate?: Date
}

function EventModalContent({ onClose, onSave, event, initialDate }: Omit<EventModalProps, 'isOpen'>) {
  // ✅ Initialize state based on props - runs fresh each time component mounts
  const [formData, setFormData] = useState<EventFormData>(() => {
    if (event) {
      return {
        title: event.title,
        description: event.description || '',
        start_time: new Date(event.start_time),
        end_time: new Date(event.end_time),
        all_day: event.all_day,
        color: event.color,
        location: event.location || '',
        is_recurring: event.is_recurring,
        recurrence_rule: event.recurrence_rule || '',
        recurrence_end: event.recurrence_end ? new Date(event.recurrence_end) : undefined,
      }
    }
    
    const startTime = initialDate || new Date()
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
    
    return {
      title: '',
      description: '',
      start_time: startTime,
      end_time: endTime,
      all_day: false,
      color: '#3B82F6',
      location: '',
      is_recurring: false,
      recurrence_rule: '',
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {event ? 'Edit Event' : 'New Event'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start
              </label>
              <input
                type="datetime-local"
                value={formData.start_time.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, start_time: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End
              </label>
              <input
                type="datetime-local"
                value={formData.end_time.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, end_time: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="all-day"
              checked={formData.all_day}
              onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="all-day" className="text-sm font-medium text-gray-700">
              All day
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex gap-2">
              {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
              Recurring event
            </label>
          </div>

          {formData.is_recurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repeat
              </label>
              <select
                value={formData.recurrence_rule}
                onChange={(e) => setFormData({ ...formData, recurrence_rule: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select frequency</option>
                <option value="FREQ=DAILY">Daily</option>
                <option value="FREQ=WEEKLY">Weekly</option>
                <option value="FREQ=MONTHLY">Monthly</option>
                <option value="FREQ=YEARLY">Yearly</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EventModal({ isOpen, onClose, onSave, event, initialDate }: EventModalProps) {
  if (!isOpen) return null

  // ✅ Use key to force remount when event/date changes - NO useEffect needed!
  const key = event ? `edit-${event.id}` : `new-${initialDate?.getTime() || 'default'}`
  
  return (
    <EventModalContent
      key={key}
      onClose={onClose}
      onSave={onSave}
      event={event}
      initialDate={initialDate}
    />
  )
}
