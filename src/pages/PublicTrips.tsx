import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import { TripCard } from '../components/TripCard'
import { ReservationModal } from '../components/ReservationModal'
import { Loader2, Map, AlertCircle, ArrowLeft } from 'lucide-react'
import type { Trip } from '../types'
import { PaginationControls } from '../components/PaginationControls'

export const PublicTrips = () => {
  const { trips, loading, error } = useTrips()
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)

  const activeTrips = useMemo(
    () => trips.filter((trip) => trip.status === 'active'),
    [trips]
  )

  const totalPages = Math.max(1, Math.ceil(activeTrips.length / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return activeTrips.slice(start, start + pageSize)
  }, [activeTrips, currentPage, pageSize])

  const handleBookClick = (trip: Trip) => {
    setSelectedTrip(trip)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      <Helmet>
        <title>Tous les trajets | TripZone</title>
        <meta
          name="description"
          content="Découvrez tous les départs TripZone : excursions premium dans l'Oriental."
        />
      </Helmet>

      <div className="pt-28 lg:pt-32 container mx-auto px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
        </Link>

        <div className="mb-16">
          <span className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 block">
            Catalogue
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter">
            Tous les trajets
          </h1>
          <p className="text-gray-400 font-medium mt-4 max-w-2xl">
            Parcourez les départs disponibles et réservez votre place en quelques clics.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
              Chargement des trajets...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 md:p-12 text-left max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-black text-red-900 mb-2">Impossible de charger les trajets</h2>
                <p className="text-red-800/90 text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {paginatedTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onBookClick={(e) => {
                    e.preventDefault()
                    handleBookClick(trip)
                  }}
                />
              ))}
            </div>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={activeTrips.length}
              pageSize={pageSize}
              pageSizeOptions={[6, 9, 12]}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setCurrentPage(1)
              }}
            />
          </>
        )}

        {activeTrips.length === 0 && !loading && !error && (
          <div className="text-center py-40 bg-gray-50 rounded-[64px] border-2 border-dashed border-gray-100">
            <Map className="w-20 h-20 text-gray-200 mx-auto mb-8" />
            <h2 className="text-2xl font-black text-gray-400">Aucun trajet disponible pour le moment.</h2>
            <p className="text-gray-400 mt-2 font-medium">Revenez bientôt pour de nouvelles destinations.</p>
          </div>
        )}
      </div>

      {selectedTrip && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          trip={selectedTrip}
        />
      )}
    </div>
  )
}
