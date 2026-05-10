import { motion } from 'framer-motion'
import { Calendar, Users, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Trip } from '../types'

interface TripCardProps {
  trip: Trip
  onBookClick: (e: React.MouseEvent) => void
}

export const TripCard = ({ trip, onBookClick }: TripCardProps) => {
  const navigate = useNavigate()

  return (
    <motion.div 
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      onClick={() => navigate(`/trip/${trip.id}`)}
      className="group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all border border-gray-100 flex flex-col h-full relative cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-72 overflow-hidden shrink-0">
        <img src={trip.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={trip.title} />
        
        {/* Badge Prix */}
        <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-gray-900 font-black text-lg shadow-xl flex items-center gap-1">
          {trip.price} <span className="text-[10px] text-gray-400">DH</span>
        </div>

        {/* Badge Places */}
        <div className="absolute bottom-6 left-6 flex gap-2">
          <div
            className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white font-bold text-[10px] flex items-center gap-1.5 border border-white/10 uppercase tracking-widest"
            title="Places restantes pour passagers (chaque réservation peut être pour plusieurs personnes)"
          >
            <Users className="w-3.5 h-3.5 text-primary" /> {trip.places_total - (trip.places_reserved || 0)} libres
          </div>
        </div>

        {trip.places_reserved >= trip.places_total && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest">Complet</span>
          </div>
        )}
      </div>

      <div className="p-10 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-3">
          <MapPin className="w-3.5 h-3.5" /> Destination Oriental
        </div>
        
        <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight group-hover:text-primary transition-colors leading-tight">
          {trip.title}
        </h3>
        
        <div className="flex items-center gap-6 mb-8 mt-auto">
          <div className="flex items-center gap-2 text-gray-400 font-bold text-xs">
            <Calendar className="w-4 h-4 text-primary/60" /> {new Date(trip.date).toLocaleDateString()}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-gray-50 mt-auto">
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBookClick(e)
            }}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            Réserver
          </button>
        </div>
      </div>
    </motion.div>
  )
}
