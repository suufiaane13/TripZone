import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Trip } from '../types'

type PlacesRow = { trip_id: string; places_reserved: number }

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const [tripsResult, countsResult] = await Promise.all([
        supabase
          .from('trips')
          .select(`
            *,
            destinations (*)
          `)
          .eq('status', 'active')
          .order('date', { ascending: true }),
        supabase.rpc('get_reserved_places_by_trip'),
      ])

      if (tripsResult.error) throw tripsResult.error

      const countMap = new Map<string, number>()
      if (!countsResult.error && Array.isArray(countsResult.data)) {
        for (const row of countsResult.data as PlacesRow[]) {
          countMap.set(row.trip_id, row.places_reserved)
        }
      }

      const raw = (tripsResult.data || []) as Trip[]
      const merged = raw.map((t) => ({
        ...t,
        places_reserved: countsResult.error
          ? t.places_reserved
          : (countMap.get(t.id) ?? 0),
      }))

      setError(null)
      setTrips(merged)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()

    const subscription = supabase
      .channel('trips_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
        },
        () => {
          fetchTrips()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
        },
        () => {
          fetchTrips()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  return { trips, loading, error, refetch: fetchTrips }
}
