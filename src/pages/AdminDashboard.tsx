import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTrips } from '../hooks/useTrips'
import { TrendingUp, UserCheck, Map, Users } from 'lucide-react'
import { AdminLayout } from '../components/AdminLayout'
import type { Reservation, Trip } from '../types'

interface ReservationWithTrip extends Reservation {
  trips: Trip | null
}

export const AdminDashboard = () => {
  const { trips } = useTrips()
  const [reservations, setReservations] = useState<ReservationWithTrip[]>([])

  const fetchReservations = async () => {
    const { data } = await supabase
      .from('reservations')
      .select('*, trips(*)')
      .order('created_at', { ascending: false })
    setReservations((data as ReservationWithTrip[]) || [])
  }

  useEffect(() => {
    Promise.resolve().then(() => fetchReservations())
  }, [])

  const stats = {
    revenue: reservations.filter(r => r.status === 'confirmed').reduce((acc, r) => acc + (r.persons * (r.trips?.price || 0)), 0),
    totalPassengers: reservations.filter(r => r.status === 'confirmed').reduce((acc, r) => acc + r.persons, 0),
    activeTrips: trips.filter(t => t.status === 'active').length
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-12">
        <div className="mb-10 lg:mb-16">
          <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Administration</span>
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Accueil</h1>
          <p className="text-gray-400 font-medium mt-4">Aperçu global de votre activité TripZone.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-12">
          {[
            { label: 'Revenus', val: `${stats.revenue}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Voyageurs', val: stats.totalPassengers, icon: UserCheck, color: 'text-primary', bg: 'bg-primary/5' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 sm:p-12 rounded-[32px] sm:rounded-[48px] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className={`${s.bg} p-4 sm:p-6 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6`}>
                <s.icon className="w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-2xl sm:text-6xl font-black text-gray-900 tracking-tight">
                {s.val}
                {s.label === 'Revenus' && <span className="text-xs sm:text-2xl ml-2">DH</span>}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Map className="w-5 h-5 text-primary" /> État de la flotte</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="font-bold text-gray-500">Trajets actifs</span>
                <span className="font-black text-xl text-primary">{stats.activeTrips}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="font-bold text-gray-500">Trajets terminés</span>
                <span className="font-black text-xl text-gray-400">{trips.filter(t => t.status === 'completed').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Réservations</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="font-bold text-gray-500">Confirmées</span>
                <span className="font-black text-xl text-green-600">{reservations.filter(r => r.status === 'confirmed').length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="font-bold text-gray-500">En attente</span>
                <span className="font-black text-xl text-orange-500">{reservations.filter(r => r.status === 'pending').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
