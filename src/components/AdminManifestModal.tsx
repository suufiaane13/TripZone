import { motion, AnimatePresence } from 'framer-motion'
import { X, Printer, Phone, Users, Clock, Loader2, FileText, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import * as XLSX from 'xlsx'
import type { Trip, Reservation } from '../types'

interface AdminManifestModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip | null
}

export const AdminManifestModal = ({ isOpen, onClose, trip }: AdminManifestModalProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchManifest = async () => {
    if (!trip) return
    setLoading(true)
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('trip_id', trip.id)
      .order('full_name', { ascending: true })
    setReservations((data as Reservation[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    if (trip && isOpen) {
      Promise.resolve().then(() => fetchManifest())
    }
  }, [trip, isOpen, fetchManifest])

  const handlePrint = () => window.print()

  const handleExportExcel = () => {
    if (!trip) return;

    // Préparation des données pour Excel
    const data = reservations.map((res, i) => ({
      'N°': i + 1,
      'Nom Complet': res.full_name,
      'Nombre de places': res.persons,
      'Téléphone': res.phone,
      'Statut': res.status === 'confirmed' ? 'Confirmé' : 'En attente',
      'Date de réservation': new Date(res.created_at).toLocaleDateString('fr-FR')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Passagers');

    // Sauvegarde du fichier
    XLSX.writeFile(workbook, `Manifeste_${trip.title.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('fr-FR')}.xlsx`);
  }
  
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').reduce((acc, r) => acc + r.persons, 0)
  const totalCount = reservations.reduce((acc, r) => acc + r.persons, 0)

  return (
    <AnimatePresence>
      {isOpen && trip && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center sm:p-4">
          {/* Overlay - Hidden on Print */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm print:hidden" />
          
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="relative bg-white w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden print:static print:w-full print:h-auto print:shadow-none print:rounded-none"
          >
            {/* Header - Screen Only */}
            <div className="p-4 sm:p-8 border-b border-gray-100 bg-gray-50/50 print:hidden shrink-0 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="bg-primary p-2 rounded-xl text-white shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-tight">
                      Liste des Passagers
                    </h2>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-black uppercase tracking-wider truncate max-w-[58vw] sm:max-w-[520px]">
                      {trip.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 bg-white text-gray-400 border border-gray-100 rounded-2xl active:scale-95 transition-all shrink-0"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:flex gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-green-500/20 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 print:p-0 print:overflow-visible">
              
              {/* PRINT ONLY SECTION - Ultra Clean Layout */}
              <div id="print-area" className="hidden print:block text-black font-serif">
                <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter">TripZone</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">Transport Touristique de l'Oriental</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-black uppercase">Manifeste de Voyage</h2>
                    <p className="text-sm font-bold">Départ à {trip.departure_time.substring(0, 5)}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl mb-8 border border-gray-100 flex justify-between">
                  <div>
                    <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Trajet</p>
                    <p className="text-sm font-black text-gray-900">{trip.title}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Nombre total de passagers</p>
                    <p className="text-sm font-black text-gray-900">{totalCount} Personnes</p>
                  </div>
                </div>

                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="py-3 px-2 text-left font-black uppercase text-[9px]">N°</th>
                      <th className="py-3 px-2 text-left font-black uppercase text-[9px]">Nom du Passager</th>
                      <th className="py-3 px-2 text-center font-black uppercase text-[9px]">Places</th>
                      <th className="py-3 px-2 text-left font-black uppercase text-[9px]">N° Téléphone</th>
                      <th className="py-3 px-2 text-left font-black uppercase text-[9px]">Status</th>
                      <th className="py-3 px-2 text-left font-black uppercase text-[9px] w-32">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((res, i) => (
                      <tr key={`${res.id || 'print-row'}-${res.phone || 'na'}-${i}`} className="border-b border-gray-100">
                        <td className="py-4 px-2 font-bold text-gray-400">{i + 1}</td>
                        <td className="py-4 px-2 font-black text-gray-900">{res.full_name}</td>
                        <td className="py-4 px-2 text-center font-black">{res.persons}</td>
                        <td className="py-4 px-2 font-bold text-gray-600">{res.phone}</td>
                        <td className="py-4 px-2">
                          <span className="text-[8px] font-bold uppercase">{res.status === 'confirmed' ? 'Confirmé' : 'En attente'}</span>
                        </td>
                        <td className="py-4 px-2 border-l border-gray-50"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-16 grid grid-cols-2 gap-20">
                  <div>
                    <p className="text-[9px] font-black uppercase mb-12">Signature du Chauffeur</p>
                    <div className="h-20 border border-dashed border-gray-200 rounded-lg"></div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase mb-12">Cachet TripZone</p>
                    <div className="inline-block w-40 h-20 border border-dashed border-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>

              {/* SCREEN ONLY SECTION - Responsive UI */}
              <div className="print:hidden">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirmés</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-gray-900">{confirmedCount}</span>
                      <span className="text-sm font-bold text-gray-300 mb-1">/{trip.places_total}</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Réservé</p>
                    <span className="text-3xl font-black text-gray-900">{totalCount}</span>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                ) : (
                  <div className="space-y-3">
                    {reservations.map((res, i) => (
                      <div key={`${res.id || 'screen-row'}-${res.phone || 'na'}-${i}`} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center justify-between gap-4 group hover:border-primary/20 transition-all">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 text-xs font-black text-gray-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-gray-900 leading-tight truncate">{res.full_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{res.persons} places</span>
                            <div className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span className={`text-[10px] font-black uppercase ${res.status === 'confirmed' ? 'text-green-500' : 'text-orange-500'}`}>
                              {res.status === 'confirmed' ? 'Confirmé' : 'Attente'}
                            </span>
                          </div>
                        </div>
                        <a href={`tel:${res.phone}`} className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                          <Phone className="w-5 h-5" />
                        </a>
                      </div>
                    ))}
                    {reservations.length === 0 && (
                      <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">
                        <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">Aucun passager pour le moment.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Footer - Screen Only */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center print:hidden shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" /> Mis à jour en temps réel
              </p>
              <button onClick={onClose} className="text-[10px] font-black text-primary uppercase tracking-widest">Fermer</button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        @media print {
          /* Force white background for everything */
          html, body { 
            background: white !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          
          /* Hide everything except our print-area */
          body * { visibility: hidden; }
          #print-area, #print-area * { 
            visibility: visible; 
            background-color: white !important;
          }
          
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          
          @page { margin: 1cm; }
        }
      `}</style>
    </AnimatePresence>
  )
}
