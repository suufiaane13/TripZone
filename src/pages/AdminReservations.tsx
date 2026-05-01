import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { 
  CheckCircle, XCircle, Loader2, Phone, Calendar, Filter, ChevronRight, X, Trash2
} from 'lucide-react'
import { AdminLayout } from '../components/AdminLayout'
import { PaginationControls } from '../components/PaginationControls'
import { ConfirmModal } from '../components/ConfirmModal'

type Status = 'all' | 'pending' | 'confirmed' | 'cancelled'

export const AdminReservations = () => {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null)
  const [reservationToDelete, setReservationToDelete] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

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

  const deleteReservation = async (id: string) => {
    const previousReservations = [...reservations]
    setReservations((current) => current.filter((res) => res.id !== id))

    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)

    if (error) {
      alert("Erreur lors de la suppression : " + error.message)
      setReservations(previousReservations)
    }
  }

  const confirmDeleteReservation = async () => {
    if (!reservationToDelete) return
    setDeleting(true)
    await deleteReservation(reservationToDelete.id)
    setDeleting(false)
    setReservationToDelete(null)
    setSelectedReservation(null)
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

  const filteredReservations = useMemo(() => reservations.filter(res => {
    const matchesFilter = filter === 'all' ? true : res.status === filter;
    const matchesSearch = res.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  }), [reservations, filter, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchTerm, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedReservations = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredReservations.slice(start, start + pageSize)
  }, [filteredReservations, currentPage, pageSize])

  const counters = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mb-8 lg:mb-16">
          <div>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Flux Client</span>
            <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Réservations</h1>
            <p className="text-gray-400 font-medium mt-3 lg:mt-4">Vue mobile simplifiée pour traiter vite les demandes.</p>
          </div>
          
          <div className="flex flex-col gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative w-full lg:min-w-[360px]">
              <input 
                type="text"
                placeholder="Rechercher un passager ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-100 px-6 py-3.5 rounded-[20px] text-sm font-bold shadow-sm focus:outline-none focus:border-primary/30 transition-all pl-12"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 bg-white p-1.5 rounded-[20px] border border-gray-100 shadow-sm gap-1.5 w-full">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'pending', label: 'Attente' },
                { id: 'confirmed', label: 'Confirmées' },
                { id: 'cancelled', label: 'Annulées' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as Status)}
                  className={`px-3 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all text-center ${
                    filter === tab.id 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                    : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({counters[tab.id as Status]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <>
          {/* Mobile: compact list */}
          <div className="md:hidden space-y-3">
            {paginatedReservations.map((res) => (
              <div key={res.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-gray-900 truncate">{res.full_name}</h3>
                    <p className="text-xs text-gray-500 font-semibold truncate mt-0.5">{res.trips?.title}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase shrink-0 ${getStatusStyle(res.status)}`}>
                    {translateStatus(res.status)}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>{res.persons} pers</span>
                  <span>{new Date(res.created_at).toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <a href={`tel:${res.phone}`} className="flex items-center gap-1 text-primary font-black text-sm">
                    <Phone className="w-4 h-4" /> Appeler
                  </a>
                  <button
                    onClick={() => setSelectedReservation(res)}
                    className="flex items-center gap-1 text-gray-700 font-black text-xs uppercase tracking-wider"
                  >
                    Gérer <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: rich cards */}
          <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
            {paginatedReservations.map(res => (
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
                  <button
                    onClick={() => {
                      setReservationToDelete(res)
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-black text-[10px] transition-all bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredReservations.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 40]}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
          </>
        )}

        {filteredReservations.length === 0 && !loading && (
          <div className="text-center py-24 bg-white rounded-[48px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
            <Filter className="w-12 h-12 text-gray-100 mb-4" />
            <p className="text-gray-400 font-bold">Aucune réservation ne correspond à ce filtre.</p>
          </div>
        )}
      </div>

      {/* Mobile action sheet */}
      {selectedReservation && (
        <div className="md:hidden fixed inset-0 z-[120]">
          <button
            onClick={() => setSelectedReservation(null)}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            aria-label="Fermer"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] p-5 border-t border-gray-100 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="font-black text-gray-900 truncate">{selectedReservation.full_name}</h3>
                <p className="text-xs text-gray-500 font-semibold truncate">{selectedReservation.trips?.title}</p>
              </div>
              <button
                onClick={() => setSelectedReservation(null)}
                className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  updateReservationStatus(selectedReservation.id, 'confirmed')
                  setSelectedReservation(null)
                }}
                className="py-3 rounded-xl bg-green-50 text-green-600 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Confirmer
              </button>
              <button
                onClick={() => {
                  updateReservationStatus(selectedReservation.id, 'cancelled')
                  setSelectedReservation(null)
                }}
                className="py-3 rounded-xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Annuler
              </button>
            </div>
            <button
              onClick={() => {
                setReservationToDelete(selectedReservation)
              }}
              className="w-full mt-2 py-3 rounded-xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(reservationToDelete)}
        onClose={() => setReservationToDelete(null)}
        onConfirm={confirmDeleteReservation}
        loading={deleting}
        title="Supprimer cette réservation ?"
        message={`Cette action supprimera définitivement la réservation de "${reservationToDelete?.full_name || ''}".`}
      />
    </AdminLayout>
  )
}
