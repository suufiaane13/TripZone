import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Check,
} from 'lucide-react'
import { AdminLayout } from '../components/AdminLayout'
import { supabase } from '../lib/supabase'

type FormDestination = { name: string; description: string }

export const AdminTripForm = () => {
  const { tripId } = useParams()
  const isEditMode = Boolean(tripId)
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loadingInitial, setLoadingInitial] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 45,
    departure_time: '08:00',
    images: [] as string[],
    places_total: 20,
  })
  const [destinations, setDestinations] = useState<FormDestination[]>([{ name: '', description: '' }])

  useEffect(() => {
    const loadTripIfNeeded = async () => {
      if (!isEditMode || !tripId) return
      
      // Async start to satisfy lint
      await Promise.resolve()
      
      setLoadingInitial(true)
      setError(null)

      const { data, error: tripError } = await supabase
        .from('trips')
        .select('*, destinations(*)')
        .eq('id', tripId)
        .single()

      if (tripError || !data) {
        setError(tripError?.message || 'Trajet introuvable.')
        setLoadingInitial(false)
        return
      }

      setFormData({
        title: data.title || '',
        description: data.description || '',
        price: data.price || 45,
        departure_time: data.departure_time || '08:00',
        images: data.images || [],
        places_total: data.places_total || 20,
      })

      const sortedDestinations = [...(data.destinations || [])].sort(
        (a, b) => a.order_index - b.order_index
      )
      setDestinations(
        sortedDestinations.length > 0
          ? sortedDestinations.map((d) => ({ name: d.name || '', description: d.description || '' }))
          : [{ name: '', description: '' }]
      )

      setLoadingInitial(false)
    }

    loadTripIfNeeded()
  }, [isEditMode, tripId])

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Compression échouée'))
          }, 'image/jpeg', 0.8)
        }
      }
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(10)
    setError(null)

    try {
      const compressedBlob = await compressImage(file)
      setUploadProgress(40)

      const fileName = `${Math.random()}.jpg`
      const { error: uploadError } = await supabase.storage.from('trip-images').upload(fileName, compressedBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      })
      if (uploadError) throw uploadError

      setUploadProgress(90)
      const {
        data: { publicUrl },
      } = supabase.storage.from('trip-images').getPublicUrl(fileName)
      setFormData((prev) => ({ ...prev, images: [...prev.images, publicUrl].slice(0, 5) }))
      setUploadProgress(100)
      setTimeout(() => setUploadProgress(0), 1000)
    } catch (uploadErr: unknown) {
      setError(`Erreur d'upload: ${uploadErr instanceof Error ? uploadErr.message : 'Erreur inconnue'}`)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }
  
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addDestination = () =>
    setDestinations((prev) => [...prev, { name: '', description: '' }])

  const removeDestination = (index: number) =>
    setDestinations((prev) => prev.filter((_, i) => i !== index))

  const updateDestination = (
    index: number,
    field: 'name' | 'description',
    value: string
  ) => {
    setDestinations((prev) => {
      const next = [...prev]
      next[index][field] = value
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.images.length === 0) {
      setError('Veuillez ajouter au moins une image.')
      return
    }

    setSaving(true)
    try {
      let savedTripId = tripId

      if (isEditMode && tripId) {
        const { error: updateError } = await supabase.from('trips').update(formData).eq('id', tripId)
        if (updateError) throw updateError

        const { error: deleteDestError } = await supabase.from('destinations').delete().eq('trip_id', tripId)
        if (deleteDestError) throw deleteDestError
      } else {
        const { data: insertedTrip, error: insertError } = await supabase
          .from('trips')
          .insert(formData)
          .select()
          .single()
        if (insertError) throw insertError
        savedTripId = insertedTrip.id
      }

      const cleanDestinations = destinations.filter((d) => d.name.trim() !== '')
      if (cleanDestinations.length > 0 && savedTripId) {
        const payload = cleanDestinations.map((d, i) => ({
          trip_id: savedTripId,
          name: d.name,
          description: d.description,
          order_index: i,
        }))
        const { error: destinationError } = await supabase.from('destinations').insert(payload)
        if (destinationError) throw destinationError
      }

      navigate('/admin/trips')
    } catch (submitErr: unknown) {
      setError(submitErr instanceof Error ? submitErr.message : 'Erreur lors de l’enregistrement du trajet.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-12">
        <div className="mb-8 lg:mb-12">
          <Link
            to="/admin/trips"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux trajets
          </Link>
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">
            {isEditMode ? 'Modifier trajet' : 'Nouveau trajet'}
          </h1>
          <p className="text-gray-400 font-medium mt-4">
            Formulaire pleine page, optimisé pour une saisie rapide sur mobile et PC.
          </p>
        </div>

        {loadingInitial ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8 space-y-6">
                <h2 className="text-xl font-black text-gray-900">Informations du trajet</h2>

                <div>
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                    Photos du trajet ({formData.images.length}/5)
                  </label>
                  
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                        <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-2 left-2 bg-primary/90 backdrop-blur-md text-white text-[8px] font-black uppercase px-2 py-1 rounded-md">
                            Couverture
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {formData.images.length < 5 && (
                      <button
                        type="button"
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        disabled={uploading}
                        className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                          uploading 
                            ? 'border-gray-100 bg-gray-50' 
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-primary/20'
                        }`}
                      >
                        {uploading ? (
                          <div className="text-center space-y-1">
                            <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                            <p className="text-[8px] font-black text-gray-900 uppercase">{uploadProgress}%</p>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 text-gray-300 mb-1" />
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Ajouter</p>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Titre</label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="mt-2 w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-black text-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="mt-2 w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix (DH)</label>
                      <input
                        required
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, price: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="mt-2 w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-black"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Places</label>
                      <input
                        required
                        type="number"
                        value={formData.places_total}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, places_total: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="mt-2 w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Heure de départ</label>
                      <input
                        required
                        type="time"
                        value={formData.departure_time}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, departure_time: e.target.value }))
                        }
                        className="mt-2 w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-black"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-gray-900">Itinéraire</h2>
                  <button
                    type="button"
                    onClick={addDestination}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Étape
                  </button>
                </div>

                <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                  {destinations.map((dest, idx) => (
                    <div key={idx} className="rounded-2xl border border-gray-100 p-4 bg-gray-50/40 relative">
                      {destinations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDestination(idx)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white border border-gray-100 text-red-400 hover:text-red-500 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="space-y-3">
                        <input
                          placeholder={`Étape ${idx + 1} - nom`}
                          value={dest.name}
                          onChange={(e) => updateDestination(idx, 'name', e.target.value)}
                          className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 font-black text-sm"
                        />
                        <textarea
                          rows={2}
                          placeholder="Description de l'étape"
                          value={dest.description}
                          onChange={(e) => updateDestination(idx, 'description', e.target.value)}
                          className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 font-medium text-sm resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Link
                to="/admin/trips"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest text-center"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving || uploading}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${
                  saving || uploading
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-gray-900 text-white hover:bg-black transition-colors'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {isEditMode ? 'Enregistrer' : 'Publier le trajet'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  )
}
