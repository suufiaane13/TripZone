import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Phone, User, CheckCircle, Loader2, Calendar, MapPin } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Trip } from '../types'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip | null
}

export const BookingModal = ({ isOpen, onClose, trip }: BookingModalProps) => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    persons: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trip) return
    
    setLoading(true)
    try {
      const { error } = await supabase.from('reservations').insert({
        trip_id: trip.id,
        full_name: formData.full_name,
        phone: formData.phone,
        persons: formData.persons
      })

      if (error) throw error
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 3000)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && trip && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative bg-white w-full sm:max-w-md rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden"
          >
            {success ? (
              <div className="p-12 text-center">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8"
                >
                  <CheckCircle className="w-12 h-12" />
                </motion.div>
                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">C'est réservé !</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Merci {formData.full_name}, nous avons bien reçu votre demande pour {trip.title}. Notre équipe vous contactera bientôt.
                </p>
              </div>
            ) : (
              <>
                {/* Header with Image Preview */}
                <div className="relative h-48 overflow-hidden">
                  <img src={trip.image_url} className="w-full h-full object-cover" alt={trip.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-6 left-8 right-8">
                    <h3 className="text-2xl font-black text-white tracking-tight leading-tight">{trip.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-white/80 text-[10px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(trip.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Oriental, MA</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        required
                        placeholder="Votre nom complet"
                        className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[24px] outline-none font-bold transition-all"
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        required
                        type="tel"
                        placeholder="N° de téléphone"
                        className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[24px] outline-none font-bold transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>

                    <div className="relative">
                      <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select 
                        className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[24px] outline-none font-bold appearance-none transition-all"
                        value={formData.persons}
                        onChange={e => setFormData({...formData, persons: parseInt(e.target.value)})}
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <option key={n} value={n}>{n} {n > 1 ? 'personnes' : 'personne'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-primary text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Réserver maintenant • {trip.price * formData.persons} DH</>}
                  </button>
                  
                  <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                    Paiement à la montée du bus
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
