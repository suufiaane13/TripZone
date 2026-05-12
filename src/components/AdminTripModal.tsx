import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Loader2, Image as ImageIcon, Upload, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Trip } from '../types'

interface AdminTripModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tripToEdit?: Trip | null
}

export const AdminTripModal = ({ isOpen, onClose, onSuccess, tripToEdit }: AdminTripModalProps) => {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    title: '', description: '', price: 45, date: '', departure_time: '08:00', image_url: '', places_total: 20
  })

  const [destinations, setDestinations] = useState<{name: string, description: string}[]>([
    { name: '', description: '' }
  ])

  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => {
        if (tripToEdit) {
          setFormData({
            title: tripToEdit.title,
            description: tripToEdit.description || '',
            price: tripToEdit.price,
            date: tripToEdit.date,
            departure_time: tripToEdit.departure_time,
            image_url: tripToEdit.images?.[0] || '',
            places_total: tripToEdit.places_total
          })
          setDestinations(
            tripToEdit.destinations?.map(d => ({ name: d.name, description: d.description || '' })) || [{ name: '', description: '' }]
          )
        } else {
          setFormData({ title: '', description: '', price: 45, date: '', departure_time: '08:00', image_url: '', places_total: 20 })
          setDestinations([{ name: '', description: '' }])
        }
      })
    }
  }, [tripToEdit, isOpen])

  // --- FONCTION DE COMPRESSION ---
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200 // Taille idéale pour le web
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Compression échouée'))
          }, 'image/jpeg', 0.8) // Qualité 80% (excellent ratio poids/qualité)
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    setUploadProgress(10) // Début du processus
    
    try {
      // 1. Compresser l'image
      const compressedBlob = await compressImage(file)
      setUploadProgress(40) // Compression terminée
      
      const fileExt = 'jpg'
      const fileName = `${Math.random()}.${fileExt}`
      
      // 2. Upload sur Supabase
      const { error: uploadError } = await supabase.storage
        .from('trip-images')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        })
      
      if (uploadError) throw uploadError
      
      setUploadProgress(90)
      const { data: { publicUrl } } = supabase.storage.from('trip-images').getPublicUrl(fileName)
      setFormData({ ...formData, image_url: publicUrl })
      setUploadProgress(100)
      
      setTimeout(() => setUploadProgress(0), 1500)
    } catch (error: unknown) {
      alert('Erreur d\'upload: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
      setUploadProgress(0)
    } finally { 
      setUploading(false) 
    }
  }

  const addDestination = () => setDestinations([...destinations, { name: '', description: '' }])
  const removeDestination = (index: number) => setDestinations(destinations.filter((_, i) => i !== index))
  const updateDestination = (index: number, field: 'name' | 'description', value: string) => {
    const newDest = [...destinations]; newDest[index][field] = value; setDestinations(newDest)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.image_url) return alert('Veuillez ajouter une image de couverture')
    setLoading(true)
    try {
      let tripId = tripToEdit?.id
      if (tripToEdit) {
        await supabase.from('trips').update(formData).eq('id', tripToEdit.id)
        await supabase.from('destinations').delete().eq('trip_id', tripToEdit.id)
      } else {
        const { data: trip, error } = await supabase.from('trips').insert(formData).select().single()
        if (error) throw error
        tripId = trip.id
      }
      if (destinations.length > 0 && destinations[0].name !== '') {
        const dests = destinations.map((d, i) => ({ trip_id: tripId, name: d.name, description: d.description, order_index: i }))
        await supabase.from('destinations').insert(dests)
      }
      onSuccess(); onClose()
    } catch (err: unknown) { 
      alert(err instanceof Error ? err.message : 'Erreur inconnue') 
    } finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" />
          
          <motion.div
            initial={{ scale: 1, opacity: 0, y: '100%' }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 1, opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative bg-white w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-[48px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 sm:p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter">{tripToEdit ? 'Modifier' : 'Créer un'} Trajet</h2>
                <p className="text-xs sm:text-base text-gray-500 font-medium mt-1">Édition premium de l'itinéraire</p>
              </div>
              <button onClick={onClose} className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-14">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">
                
                {/* Left Column */}
                <div className="space-y-8 sm:space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.2em]">Image de Couverture</label>
                    <div 
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className={`relative aspect-[16/10] rounded-[32px] sm:rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
                        formData.image_url ? 'border-primary/20 bg-primary/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {uploading ? (
                        <div className="text-center space-y-4">
                          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                          <div className="space-y-1">
                            <p className="text-xs font-black text-gray-900 uppercase">Optimisation...</p>
                            <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
                              <motion.div 
                                className="h-full bg-primary" 
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : formData.image_url ? (
                        <>
                          <img src={formData.image_url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                              <Upload className="w-4 h-4" /> Changer la photo
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6">
                          <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <ImageIcon className="w-7 h-7 text-gray-300" />
                          </div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Cliquez pour ajouter</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Titre du voyage</label>
                      <input required className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl sm:rounded-3xl outline-none transition-all font-black text-lg sm:text-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarif (DH)</label>
                        <input required type="number" className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gray-50 border-2 border-transparent rounded-2xl sm:rounded-3xl outline-none font-black" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capacité (Bus)</label>
                        <input required type="number" className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gray-50 border-2 border-transparent rounded-2xl sm:rounded-3xl outline-none font-black" value={formData.places_total} onChange={e => setFormData({...formData, places_total: parseInt(e.target.value)})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date de départ</label>
                        <input required type="date" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Heure</label>
                        <input required type="time" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black" value={formData.departure_time} onChange={e => setFormData({...formData, departure_time: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Itinéraire</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ordre chronologique</p>
                    </div>
                    <button type="button" onClick={addDestination} className="bg-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20">
                      <Plus className="w-4 h-4" /> Ajouter étape
                    </button>
                  </div>

                  <div className="relative pl-8 sm:pl-10 space-y-8 sm:space-y-10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="absolute left-[11px] top-4 bottom-4 w-1 bg-gradient-to-b from-primary/30 via-primary/30 to-transparent rounded-full" />
                    {destinations.map((dest, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[35px] top-6 w-4 h-4 rounded-full bg-white border-4 border-primary z-10 shadow-sm" />
                        <div className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] border border-gray-100 shadow-sm relative group-hover:border-primary/20 transition-all">
                          <button type="button" onClick={() => removeDestination(idx)} className="absolute -top-2 -right-2 p-2.5 bg-white text-red-400 shadow-lg border border-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="space-y-4">
                            <input placeholder="Nom de l'étape (ex: Oujda Center)..." className="w-full bg-transparent border-none focus:ring-0 p-0 font-black text-lg sm:text-xl text-gray-900 placeholder:text-gray-200" value={dest.name} onChange={e => updateDestination(idx, 'name', e.target.value)} />
                            <textarea placeholder="Petit détail sur cette étape..." rows={2} className="w-full bg-gray-50/50 border-none rounded-xl p-3 text-sm font-medium text-gray-500 resize-none placeholder:text-gray-300" value={dest.description} onChange={e => updateDestination(idx, 'description', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 sm:mt-20 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={onClose} className="order-2 sm:order-1 flex-1 py-5 rounded-2xl text-lg font-black text-gray-400 hover:text-gray-900 transition-colors">Annuler</button>
                <button disabled={loading || uploading} type="submit" className={`order-1 sm:order-2 flex-[2] py-5 rounded-3xl text-lg font-black shadow-xl flex items-center justify-center gap-3 transition-all ${
                  loading || uploading ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-black hover:-translate-y-1'
                }`} >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Check className="w-6 h-6" /> {tripToEdit ? 'Enregistrer les modifications' : 'Publier le trajet'}</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
