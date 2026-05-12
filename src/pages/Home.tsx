import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import { Hero } from '../components/Hero'
import { TripCard } from '../components/TripCard'
import { ReservationModal } from '../components/ReservationModal'
import { Loader2, Map, AlertCircle, ArrowRight } from 'lucide-react'
import type { Trip } from '../types'

const PREVIEW_COUNT = 3

export const Home = () => {
  const { trips, loading, error } = useTrips()
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const activeTrips = useMemo(
    () => trips.filter((trip) => trip.status === 'active'),
    [trips]
  )

  const previewTrips = useMemo(
    () => activeTrips.slice(0, PREVIEW_COUNT),
    [activeTrips]
  )

  const handleBookClick = (trip: Trip) => {
    setSelectedTrip(trip)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-white">
      <Hero />

      <section id="preview-trips" className="py-24 lg:py-32 container mx-auto px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 block text-center md:text-left">
              Aperçu
            </span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter text-center md:text-left">
              Prochains départs
            </h2>
            <p className="text-gray-400 font-medium mt-4 max-w-xl text-center md:text-left">
              Quelques sélections — la liste complète est sur la page Trajets.
            </p>
          </div>
          {activeTrips.length > PREVIEW_COUNT && (
            <Link
              to="/trajets"
              className="inline-flex items-center justify-center gap-2 self-center md:self-auto bg-primary text-white px-8 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest hover:opacity-95 transition-opacity shrink-0"
            >
              Voir tous les trajets
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
              Chargement...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 md:p-12 text-left max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-black text-red-900 mb-2">Impossible de charger les trajets</h3>
                <p className="text-red-800/90 text-sm font-medium mb-4">{error}</p>
                <p className="text-red-900/70 text-xs font-medium leading-relaxed">
                  Sur Netlify : vérifie que <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_URL</code> et{' '}
                  <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> sont définies dans les variables d&apos;environnement, puis redéploie (clear cache).
                  Dans Supabase : vérifie les politiques RLS (lecture des trajets <code className="bg-red-100 px-1 rounded">active</code> pour les visiteurs) et que la table contient des lignes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {previewTrips.map((trip) => (
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
        )}

        {activeTrips.length === 0 && !loading && !error && (
          <div className="text-center py-24 bg-gray-50 rounded-[64px] border-2 border-dashed border-gray-100">
            <Map className="w-20 h-20 text-gray-200 mx-auto mb-8" />
            <h3 className="text-2xl font-black text-gray-400">Aucun départ prévu pour le moment.</h3>
            <p className="text-gray-400 mt-2 font-medium">Revenez bientôt pour de nouvelles destinations !</p>
          </div>
        )}
      </section>

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
