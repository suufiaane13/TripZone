import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  CheckCircle, XCircle, Loader2, Phone, Calendar, Filter
} from 'lucide-react'
import { AdminLayout } from '../components/AdminLayout'

type Status = 'all' | 'pending' | 'confirmed' | 'cancelled'

export const AdminReservations = () => {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReservations()

    // Configuration du Temps Réel
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        () => {
          fetchReservations() // Re-fetch quand un changement arrive
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchReservations = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reservations')
      .select('*, trips(*)')
      .order('created_at', { ascending: false })
    setReservations(data || [])
    setLoading(false)
  }

  const updateReservationStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'pending') => {
    // 1. Mise à jour "Optimiste" (Instantie dans l'interface)
    const previousReservations = [...reservations]
    setReservations(current => 
      current.map(res => res.id === id ? { ...res, status } : res)
    )

    // 2. Mise à jour réelle dans Supabase
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)

    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message)
      setReservations(previousReservations) // Retour en arrière si erreur
    }
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé'
      case 'cancelled': return 'Annulé'
      default: return 'En attente'
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-600 border-green-100'
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-orange-50 text-orange-600 border-orange-100'
    }
  }

  const filteredReservations = reservations.filter(res => {
    const matchesFilter = filter === 'all' ? true : res.status === filter;
    const matchesSearch = res.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  })

  return (
    <AdminLayout>
      <div className="p-4 lg:p-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Flux Client</span>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Réservations</h1>
            <p className="text-gray-400 font-medium mt-4">Gérez les demandes et la satisfaction de vos voyageurs.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:min-w-[300px]">
              <input 
                type="text"
                placeholder="Rechercher un passager ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-100 px-6 py-3.5 rounded-[24px] text-sm font-bold shadow-sm focus:outline-none focus:border-primary/30 transition-all pl-12"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex bg-white p-1.5 rounded-[24px] border border-gray-100 shadow-sm overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'pending', label: 'Attente' },
                { id: 'confirmed', label: 'Confirmées' },
                { id: 'cancelled', label: 'Annulées' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as Status)}
                  className={`px-6 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === tab.id 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                    : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredReservations.map(res => (
              <div key={res.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col group">
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${
                  res.status === 'confirmed' ? 'bg-green-500' : res.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'
                }`} />

                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-gray-900 tracking-tight truncate leading-tight">{res.full_name}</h3>
                    <div className="flex items-center gap-1.5 text-primary font-black text-[9px] uppercase tracking-widest mt-1 truncate">
                      <Calendar className="w-3 h-3" /> {res.trips?.title}
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase shrink-0 transition-all ${getStatusStyle(res.status)}`}>
                    {translateStatus(res.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Passagers</p>
                    <p className="font-black text-sm text-gray-900">{res.persons} pers</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl overflow-hidden">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Contact</p>
                    <a href={`tel:${res.phone}`} className="font-black text-[11px] text-primary flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {res.phone}
                    </a>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
                  <button 
                    onClick={() => updateReservationStatus(res.id, 'confirmed')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-black text-[10px] transition-all ${
                      res.status === 'confirmed' 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                      : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> {res.status === 'confirmed' ? 'Confirmé' : 'Confirmer'}
                  </button>
                  <button 
                    onClick={() => updateReservationStatus(res.id, 'cancelled')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-black text-[10px] transition-all ${
                      res.status === 'cancelled' 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
                      : 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> {res.status === 'cancelled' ? 'Annulé' : 'Annuler'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredReservations.length === 0 && !loading && (
          <div className="text-center py-24 bg-white rounded-[48px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
            <Filter className="w-12 h-12 text-gray-100 mb-4" />
            <p className="text-gray-400 font-bold">Aucune réservation ne correspond à ce filtre.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
