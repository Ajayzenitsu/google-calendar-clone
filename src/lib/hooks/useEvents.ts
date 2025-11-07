'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
// ...existing code...
import { CalendarEvent } from '../../types/calendar'
// ...existing code...
import { RealtimeChannel } from '@supabase/supabase-js'

export function useEvents(userId: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true })

      if (!error && data) {
        setEvents(data)
      }
      setLoading(false)
    }

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel('events-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'events',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            setEvents((prev) => [...prev, payload.new as CalendarEvent])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'events',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            setEvents((prev) =>
              prev.map((evt) =>
                evt.id === payload.new.id ? (payload.new as CalendarEvent) : evt
              )
            )
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'events',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            setEvents((prev) => prev.filter((evt) => evt.id !== payload.old.id))
          }
        )
        .subscribe()
    }

    fetchEvents()
    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId, supabase])

  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('events')
      .insert([{ ...eventData, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return { events, loading, addEvent, updateEvent, deleteEvent }
}
