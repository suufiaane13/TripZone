import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, Users, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react'
import { useState, useRef } from 'react'
import type { Trip } from '../types'
import { supabase } from '../lib/supabase'
import { getWhatsAppLink, useSiteSettings } from '../lib/siteSettings'
import { formatReservationDuplicateError } from '../lib/reservationErrors'

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip
}

export const ReservationModal = ({ isOpen, onClose, trip }: ReservationModalProps) => {
  const { settings } = useSiteSettings()
  const submitLock = useRef(false)
  const [status, setStatus] = useState<'form' | 'submitting' | 'success' | 'error'>('form')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resId, setResId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    persons: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitLock.current || status === 'submitting') return
    submitLock.current = true
    setStatus('submitting')
    setErrorMsg(null)

    try {
      const { data: newId, error } = await supabase.rpc('create_public_reservation', {
        p_trip_id: trip.id,
        p_full_name: formData.fullName,
        p_phone: formData.phone,
        p_persons: formData.persons,
      })

      if (error) throw error
      if (!newId) throw new Error('Réponse invalide du serveur.')
      setResId(newId as string)
      setStatus('success')

      void supabase.functions
        .invoke('notify-telegram', {
          body: {
            trip_title: `${trip.title} (${new Date(trip.date).toLocaleDateString('fr-FR')})`,
            record: {
              id: newId as string,
              trip_id: trip.id,
              full_name: formData.fullName,
              phone: formData.phone,
              persons: formData.persons,
              status: 'pending',
            },
          },
        })
        .then(({ data, error: invokeErr }) => {
          if (invokeErr) {
            console.warn('[TripZone] Telegram échec:', invokeErr.message, invokeErr)
            return
          }
          if (data && typeof data === 'object' && 'ok' in data && data.ok === false) {
            console.warn('[TripZone] Telegram refusé:', data)
            return
          }
          if (import.meta.env.DEV) {
            console.info('[TripZone] Telegram OK', data)
          }
        })
    } catch (err: any) {
      const raw = err.message || 'Une erreur est survenue lors de la réservation.'
      setErrorMsg(formatReservationDuplicateError(raw))
      setStatus('error')
    } finally {
      submitLock.current = false
    }
  }

  const openWhatsApp = () => {
    const text =
      `Bonjour TripZone ! Je viens de réserver ma place pour :\n\n` +
      `📦 *Trajet :* ${trip.title}\n` +
      `👤 *Nom :* ${formData.fullName}\n` +
      `👥 *Nombre de personnes :* ${formData.persons}\n` +
      `🆔 *ID Réservation :* ${resId?.slice(0, 8)}\n\n` +
      `Merci de me confirmer la réservation.`
    window.open(getWhatsAppLink(settings.whatsapp_number, text), '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl flex flex-col max-h-[92vh]"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors z-[70]">
              <X className="w-6 h-6" />
            </button>

            <div className="overflow-y-auto flex-1">
              {status === 'success' ? (
                <div className="p-8 sm:p-10 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">C'est réservé !</h2>
                  <p className="text-gray-500 mb-6 font-medium">
                    Votre demande a bien été enregistrée. Notre équipe vous contactera pour confirmer.
                  </p>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 mb-8 text-left text-sm">
                    <p className="font-black text-gray-900 mb-2">{trip.title}</p>
                    <p className="text-gray-600"><span className="font-bold text-gray-900">{formData.fullName}</span> · {formData.persons} pers.</p>
                    <p className="text-gray-500 mt-1">
                      {new Date(trip.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  
                  <button onClick={openWhatsApp} className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-all">
                    <Send className="w-5 h-5" /> Confirmer sur WhatsApp
                  </button>
                </div>
              ) : (
              <div className="p-8 sm:p-12">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Réserver ma place</h2>
                  <p className="text-gray-500 font-medium">
                    {trip.title} • <span className="text-primary font-bold">{trip.price} DH / pers</span>
                  </p>
                </div>

                {status === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Nom Complet</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input required disabled={status === 'submitting'} type="text" placeholder="Ex: Ahmed Alaoui" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-medium disabled:opacity-50" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Numéro de Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input required disabled={status === 'submitting'} type="tel" placeholder="Ex: 06 12 34 56 78" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-medium disabled:opacity-50" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Nombre de Personnes</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select disabled={status === 'submitting'} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-medium appearance-none disabled:opacity-50" value={formData.persons} onChange={(e) => setFormData({...formData, persons: parseInt(e.target.value)})} >
                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n > 1 ? 'personnes' : 'personne'}</option>)}
                      </select>
                    </div>
                  </div>

                  <button disabled={status === 'submitting'} type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white py-5 rounded-2xl text-lg font-black shadow-xl shadow-secondary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-3" >
                    {status === 'submitting' ? <><Loader2 className="w-6 h-6 animate-spin" /> Envoi...</> : 'Confirmer ma réservation'}
                  </button>
                </form>
              </div>
            )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
