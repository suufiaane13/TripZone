import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Users, Check, Loader2, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ReservationModal } from '../components/ReservationModal'
import { useTrips } from '../hooks/useTrips'
import { getWhatsAppLink, useSiteSettings } from '../lib/siteSettings'

export const TripDetails = () => {
  const { id } = useParams()
  const { trips, loading, error } = useTrips()
  const { settings } = useSiteSettings()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)

  const trip = trips.find(t => t.id === id)

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null || !trip) return
      
      if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) => (prev! + 1) % trip.images.length)
      } else if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) => (prev! - 1 + trip.images.length) % trip.images.length)
      } else if (e.key === 'Escape') {
        setSelectedPhotoIndex(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhotoIndex, trip])

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
        <title>{`${trip.title} - ${trip.price} DH | TripZone`}</title>
        <meta name="description" content={`${trip.title} : ${trip.description?.substring(0, 150)}... Réservez votre place pour seulement ${trip.price} DH.`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={`${trip.title} - ${trip.price} DH | TripZone Oujda`} />
        <meta property="og:description" content={trip.description?.substring(0, 160)} />
        <meta property="og:image" content={trip.images?.[0] || '/og-default.jpg'} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={`${trip.title} - ${trip.price} DH | TripZone`} />
        <meta name="twitter:description" content={trip.description?.substring(0, 160)} />
        <meta name="twitter:image" content={trip.images?.[0] || '/og-default.jpg'} />
      </Helmet>

      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <img src={trip.images?.[0] || 'https://via.placeholder.com/1200x800'} alt={trip.title} className="w-full h-full object-cover" />
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
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 flex items-center justify-around gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Départ</span>
                  <span className="text-sm sm:text-lg font-black text-gray-900">{trip.departure_time.substring(0, 5)}</span>
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-100" /> {/* Séparateur */}

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Libres</span>
                  <span className="text-sm sm:text-lg font-black text-gray-900">{trip.places_total - trip.places_reserved} places</span>
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

            {/* Gallery */}
            {trip.images && trip.images.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-black mb-8 ml-4">Galerie photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                  {trip.images.map((url, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className="aspect-square rounded-[32px] overflow-hidden shadow-sm border border-gray-100 group cursor-pointer relative bg-gray-100"
                    >
                      <img 
                        src={url} 
                        alt={`Photo ${idx + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                          <Maximize2 className="w-10 h-10 text-white drop-shadow-2xl" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="mt-16">
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
                    <span className="text-sm font-bold text-gray-500">Places libres</span>
                    <span className="font-bold text-green-600">{trip.places_total - trip.places_reserved}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  disabled={trip.places_total === trip.places_reserved}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-secondary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:translate-y-0"
                >
                  {trip.places_total === trip.places_reserved ? 'Complet' : 'Réserver maintenant'}
                </button>
                
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

      {/* Lightbox / Photo Viewer */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col p-4 sm:p-10"
          >
            {/* Header / Actions */}
            <div className="w-full flex justify-between items-center text-white mb-4 sm:mb-6">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                {selectedPhotoIndex + 1} / {trip.images.length}
              </span>
              <button 
                onClick={() => setSelectedPhotoIndex(null)}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Main Image Container - Stable box */}
            <div className="flex-1 relative w-full flex items-center justify-center overflow-hidden py-2 sm:py-0">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedPhotoIndex}
                  src={trip.images[selectedPhotoIndex]}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-2xl"
                  alt={`Photo ${selectedPhotoIndex + 1}`}
                />
              </AnimatePresence>

              {/* Navigation Arrows - Optimized for Mobile */}
              {trip.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex((prev) => (prev! - 1 + trip.images.length) % trip.images.length); }}
                    className="absolute left-0 sm:left-4 w-10 h-10 sm:w-14 sm:h-14 bg-black/20 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 z-20"
                  >
                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex((prev) => (prev! + 1) % trip.images.length); }}
                    className="absolute right-0 sm:right-4 w-10 h-10 sm:w-14 sm:h-14 bg-black/20 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 z-20"
                  >
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Strip - Adaptive sizes */}
            <div className="mt-4 sm:mt-8 flex justify-center w-full">
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 max-w-full no-scrollbar px-4 items-center">
                {trip.images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 transition-all duration-300 border-2 ${
                      idx === selectedPhotoIndex 
                      ? 'border-primary scale-110 shadow-[0_0_30px_rgba(27,67,50,0.5)] z-10' 
                      : 'border-white/10 opacity-30 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <img src={url} className="absolute inset-0 w-full h-full object-cover" alt={`Thumb ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
