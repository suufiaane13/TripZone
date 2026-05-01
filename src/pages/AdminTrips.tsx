import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTrips } from '../hooks/useTrips'
import { 
  Plus, Trash2, Calendar, Tag, Loader2, Edit, FileText, Map, Users
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { AdminManifestModal } from '../components/AdminManifestModal'
import { ConfirmModal } from '../components/ConfirmModal'
import { PaginationControls } from '../components/PaginationControls'
import type { Trip } from '../types'

export const AdminTrips = () => {
  const { trips, loading, refetch } = useTrips()
  const navigate = useNavigate()
  const [isManifestOpen, setIsManifestOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(trips.length / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return trips.slice(start, start + pageSize)
  }, [trips, currentPage, pageSize])

  const handleDeleteClick = (trip: Trip) => {
    setSelectedTrip(trip)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedTrip) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('trips').delete().eq('id', selectedTrip.id)
      if (error) throw error
      setIsConfirmOpen(false)
      refetch()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditTrip = (trip: Trip) => {
    navigate(`/admin/trips/${trip.id}/edit`)
  }

  const handleOpenManifest = (trip: Trip) => {
    setSelectedTrip(trip)
    setIsManifestOpen(true)
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Logistique</span>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Gestion des Trajets</h1>
            <p className="text-gray-400 font-medium mt-4">Créez et organisez vos itinéraires d'exception.</p>
          </div>
          <button 
            onClick={() => navigate('/admin/trips/new')}
            className="w-full lg:w-auto bg-gray-900 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-gray-900/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" /> Nouveau Trajet
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <>
          <div className="grid grid-cols-1 gap-6">
            {paginatedTrips.map(trip => (
              <div key={trip.id} className={`group bg-white p-4 lg:p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 lg:gap-10 transition-all hover:shadow-xl ${trip.status === 'completed' ? 'opacity-60 grayscale' : ''}`}>
                <div className="w-full sm:w-32 h-32 rounded-[24px] overflow-hidden shrink-0 relative">
                  <img src={trip.image_url} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{trip.title}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase ${trip.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                      {trip.status === 'active' ? 'Actif' : 'Terminé'}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <Calendar className="w-4 h-4 text-primary" /> {new Date(trip.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <Tag className="w-4 h-4 text-primary" /> {trip.price} DH
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <Users className="w-4 h-4 text-primary" /> {trip.places_reserved}/{trip.places_total} places
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => handleOpenManifest(trip)} className="flex-1 sm:flex-none p-4 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" title="Liste passagers">
                    <FileText className="w-6 h-6 mx-auto" />
                  </button>
                  <button onClick={() => handleEditTrip(trip)} className="flex-1 sm:flex-none p-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-blue-500 transition-all shadow-sm">
                    <Edit className="w-6 h-6 mx-auto" />
                  </button>
                  <button onClick={() => handleDeleteClick(trip)} className="flex-1 sm:flex-none p-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 transition-all shadow-sm">
                    <Trash2 className="w-6 h-6 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={trips.length}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20]}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
          />
          </>
        )}

        {trips.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-[48px] border-2 border-dashed border-gray-100">
            <Map className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">Aucun trajet pour le moment.</p>
          </div>
        )}
      </div>

      <AdminManifestModal 
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        trip={selectedTrip}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title="Supprimer ce trajet ?"
        message={`Attention, cette action supprimera définitivement le trajet "${selectedTrip?.title}" ainsi que toutes les réservations associées.`}
      />
    </AdminLayout>
  )
}
