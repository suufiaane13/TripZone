import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Trip } from '../types'

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          destinations (*)
        `)
        .eq('status', 'active')
        .order('date', { ascending: true })

      if (error) throw error
      setError(null)
      setTrips(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()

    // Real-time subscription
    const subscription = supabase
      .channel('trips_changes')
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'trips' 
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
