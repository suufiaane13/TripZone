import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Users, MapPin, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ReservationModal } from '../components/ReservationModal'
import { useTrips } from '../hooks/useTrips'
import { getWhatsAppLink, useSiteSettings } from '../lib/siteSettings'

export const TripDetails = () => {
  const { id } = useParams()
  const { trips, loading, error } = useTrips()
  const { settings } = useSiteSettings()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const trip = trips.find(t => t.id === id)

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  )

  if (error || !trip) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h2 className="text-2xl font-bold mb-4">{error ? 'Erreur de chargement' : 'Trajet non trouvé'}</h2>
      {error && <p className="text-gray-600 max-w-lg mb-6 text-sm">{error}</p>}
      <Link to="/" className="text-primary font-bold flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </Link>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen pb-24 lg:pb-40">
      <Helmet>
        <title>{trip.title} | TripZone</title>
        <meta name="description" content={trip.description?.substring(0, 160)} />
        <meta property="og:title" content={`${trip.title} | TripZone`} />
        <meta property="og:description" content={trip.description?.substring(0, 160)} />
        <meta property="og:image" content={trip.image_url} />
        <meta property="twitter:title" content={`${trip.title} | TripZone`} />
        <meta property="twitter:description" content={trip.description?.substring(0, 160)} />
        <meta property="twitter:image" content={trip.image_url} />
      </Helmet>

      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <img src={trip.image_url} alt={trip.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> Retour aux trajets
            </Link>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight max-w-4xl">
              {trip.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12 pb-20">
            {/* Quick Stats */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-wrap gap-8 justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(trip.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Départ</p>
                  <p className="text-lg font-bold text-gray-900">{trip.departure_time}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Places libres</p>
                  <p className="text-lg font-bold text-gray-900">{trip.places_total - trip.places_reserved} pour passagers</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black mb-6">À propos de l'excursion</h2>
              <p className="text-gray-600 leading-relaxed text-lg font-medium">
                {trip.description}
              </p>
              
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Transport Premium', 'Guide Local', 'Assurance Voyage', 'Assistance 24/7'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-gray-700">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-2xl font-black mb-10 ml-4">Programme du voyage</h2>
              <div className="space-y-0">
                {trip.destinations?.sort((a, b) => a.order_index - b.order_index).map((dest, idx) => (
                  <div key={dest.id} className="relative pl-12 pb-12 group">
                    {/* Line */}
                    {idx !== (trip.destinations?.length || 0) - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-200 group-hover:bg-primary/30 transition-colors" />
                    )}
                    {/* Dot */}
                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10 group-hover:border-primary transition-all">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300 group-hover:bg-primary transition-all" />
                    </div>
                    {/* Content */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{dest.name}</h3>
                      <p className="text-gray-500 font-medium">{dest.description || 'Étape du trajet.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Prix par personne</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black text-gray-900">{trip.price}</span>
                  <span className="text-xl font-bold text-gray-400">DH</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500">Capacité bus</span>
                    <span className="font-bold">{trip.places_total}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500">Passagers (réservations)</span>
                    <span className="font-bold text-gray-900">{trip.places_reserved}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500">Places libres</span>
                    <span className="font-bold text-green-600">{trip.places_total - trip.places_reserved}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium leading-snug px-1">
                    Le total « passagers » additionne le champ « nombre de personnes » de chaque demande (ex. 2 réservations de 2 et 3 pers. = 5).
                  </p>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  disabled={trip.places_total === trip.places_reserved}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-secondary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:translate-y-0"
                >
                  {trip.places_total === trip.places_reserved ? 'Complet' : 'Réserver maintenant'}
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>Plusieurs points de ramassage</span>
                </div>
              </div>

              <div className="mt-6 p-6 bg-primary rounded-[32px] text-white">
                <h4 className="font-bold mb-2">Besoin d'aide ?</h4>
                <p className="text-sm text-white/80 mb-4">Contactez-nous directement sur WhatsApp pour toute question.</p>
                <a
                  href={getWhatsAppLink(settings.whatsapp_number, 'Bonjour TripZone, j’ai une question sur ce trajet.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-primary px-6 py-2 rounded-xl text-sm font-black"
                >
                  Discuter
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReservationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        trip={trip} 
      />
    </div>
  )
}
