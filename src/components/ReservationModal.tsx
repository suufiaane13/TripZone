import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, Users, CheckCircle2, AlertCircle, Loader2, Send, Download } from 'lucide-react'
import { useState, useRef } from 'react'
import type { Trip } from '../types'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { getWhatsAppLink, useSiteSettings } from '../lib/siteSettings'

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip
}

export const ReservationModal = ({ isOpen, onClose, trip }: ReservationModalProps) => {
  const { settings } = useSiteSettings()
  const [status, setStatus] = useState<'form' | 'submitting' | 'success' | 'error'>('form')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resId, setResId] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    persons: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // Telegram : envoi direct (record + titre) — fonctionne même sans SERVICE_ROLE_KEY sur Edge.
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
            console.warn('[TripZone] Telegram:', invokeErr.message, invokeErr)
          } else if (import.meta.env.DEV) {
            console.info('[TripZone] Telegram OK', data)
          }
        })
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de la réservation.')
      setStatus('error')
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

  /** html2canvas ne parse pas oklch() (Tailwind v4) — on force du hex sur le clone. */
  const injectPdfSafeColors = (doc: Document) => {
    const style = doc.createElement('style')
    style.setAttribute('data-pdf-override', '1')
    style.textContent = `
      [data-ticket-pdf] {
        background-color: #ffffff !important;
        color: #111827 !important;
        border-color: #e5e7eb !important;
      }
      [data-ticket-pdf] * {
        box-shadow: none !important;
        background-image: none !important;
      }
      [data-ticket-pdf] [data-pdf-accent] {
        color: #1B4332 !important;
      }
      [data-ticket-pdf] [data-pdf-muted] {
        color: #9ca3af !important;
      }
      [data-ticket-pdf] [data-pdf-bar] {
        background-color: rgba(27, 67, 50, 0.2) !important;
      }
      [data-ticket-pdf] [data-pdf-qr-wrap] {
        background-color: #ffffff !important;
        border-color: #f3f4f6 !important;
      }
      [data-ticket-pdf] h3,
      [data-ticket-pdf] p:not([data-pdf-accent]):not([data-pdf-muted]) {
        color: #111827 !important;
      }
    `
    doc.head.appendChild(style)
  }

  const downloadTicket = async () => {
    if (!ticketRef.current || isDownloading) return
    
    setIsDownloading(true)
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // Plus haute résolution
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          injectPdfSafeColors(clonedDoc)
        },
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height)
      pdf.save(`Ticket_TripZone_${formData.fullName.split(' ')[0]}.pdf`)
    } catch (err) {
      console.error('Erreur PDF:', err)
      alert("Erreur lors de la génération du PDF. Vous pouvez faire une capture d'écran.")
    } finally {
      setIsDownloading(false)
    }
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
                  <p className="text-gray-500 mb-6 font-medium">Votre ticket numérique est prêt.</p>
                  
                  {/* Digital Ticket */}
                  <div
                    ref={ticketRef}
                    data-ticket-pdf
                    className="bg-white rounded-[32px] p-6 sm:p-8 mb-6 border-2 border-dashed border-gray-200 relative overflow-hidden"
                  >
                    <div data-pdf-bar className="absolute top-0 left-0 w-full h-2 bg-primary/20" />
                    <div className="flex flex-col items-center">
                      <div
                        data-pdf-qr-wrap
                        className="bg-white p-4 rounded-3xl shadow-sm mb-4 border border-gray-100"
                      >
                        <QRCodeSVG 
                          value={`tripzone-res-${resId}`}
                          size={120}
                          level="H"
                        />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-1">{trip.title}</h3>
                      <p data-pdf-accent className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">{formData.fullName}</p>
                      
                      <div className="grid grid-cols-2 gap-8 w-full pt-4 border-t border-gray-100">
                        <div>
                          <p data-pdf-muted className="text-[10px] font-black text-gray-400 uppercase">Passagers</p>
                          <p className="font-bold text-gray-900">{formData.persons}</p>
                        </div>
                        <div>
                          <p data-pdf-muted className="text-[10px] font-black text-gray-400 uppercase">Date</p>
                          <p className="font-bold text-gray-900">{new Date(trip.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button onClick={openWhatsApp} className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-all">
                      <Send className="w-5 h-5" /> Confirmer sur WhatsApp
                    </button>
                    <button 
                      onClick={downloadTicket} 
                      disabled={isDownloading}
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {isDownloading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Génération...</>
                      ) : (
                        <><Download className="w-5 h-5" /> Télécharger mon ticket</>
                      )}
                    </button>
                  </div>
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
