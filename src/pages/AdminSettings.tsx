import { useEffect, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { supabase } from '../lib/supabase'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  Settings,
  ShieldCheck,
  KeyRound,
  Smartphone,
  AtSign,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
  saveSiteSettings,
  useSiteSettings,
} from '../lib/siteSettings'

type Notice = { type: 'success' | 'error'; message: string } | null
type SettingsTab = 'contact' | 'security'

export const AdminSettings = () => {
  const { settings, loading, error } = useSiteSettings()
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>('contact')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => {
    Promise.resolve().then(() => setForm(settings))
  }, [settings])

  const onChange = (field: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(null)
    setSaving(true)
    try {
      await saveSiteSettings(form)
      setNotice({
        type: 'success',
        message: 'Paramètres enregistrés. Le front public utilisera ces nouvelles valeurs.',
      })
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur lors de l’enregistrement des paramètres.',
      })
    } finally {
      setSaving(false)
    }
  }

  const onUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(null)

    if (newPassword.length < 8) {
      setNotice({
        type: 'error',
        message: 'Le mot de passe doit contenir au moins 8 caractères.',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setNotice({
        type: 'error',
        message: 'Les deux mots de passe ne correspondent pas.',
      })
      return
    }

    setSavingPassword(true)
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setNotice({
        type: 'error',
        message: `Impossible de changer le mot de passe: ${updateError.message}`,
      })
      setSavingPassword(false)
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    setNotice({
      type: 'success',
      message: 'Mot de passe administrateur mis à jour.',
    })
    setSavingPassword(false)
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-12">
        <div className="mb-10 lg:mb-16">
          <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">
            Administration
          </span>
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">
            Paramètres site
          </h1>
          <p className="text-gray-400 font-medium mt-4">
            Modifiez les contacts publics affichés sur tout le site.
          </p>
        </div>

        {(notice || error) && (
          <div
            className={`mb-8 rounded-2xl border p-4 flex items-start gap-3 ${
              notice?.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {notice?.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <p className="font-medium text-sm">{notice?.message || error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="w-full flex justify-center lg:hidden">
              <div className="inline-flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'contact'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Coordonnées
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'security'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sécurité
              </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form
                onSubmit={onSave}
                className={`bg-white p-8 sm:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6 ${
                  activeTab === 'contact' ? 'block' : 'hidden'
                } lg:block`}
              >
                <h2 className="text-xl font-black mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" /> Coordonnées publiques
                </h2>

                <label className="block">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    URL Instagram
                  </span>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      required
                      value={form.instagram_url}
                      onChange={(e) => onChange('instagram_url', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary/30 transition-all"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Numéro WhatsApp (international)
                  </span>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.whatsapp_number}
                      onChange={(e) => onChange('whatsapp_number', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary/30 transition-all"
                      placeholder="212701730174"
                    />
                  </div>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                      Téléphone affiché
                    </span>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={form.contact_phone}
                        onChange={(e) => onChange('contact_phone', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary/30 transition-all"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                      Email de contact
                    </span>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={form.contact_email}
                        onChange={(e) => onChange('contact_email', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary/30 transition-all"
                      />
                    </div>
                  </label>
                </div>

                <label className="block">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Ville / localisation
                  </span>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.contact_city}
                      onChange={(e) => onChange('contact_city', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary/30 transition-all"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Enregistrer
                    </>
                  )}
                </button>
              </form>

              <form
                onSubmit={onUpdatePassword}
                className={`bg-white p-8 sm:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6 h-fit ${
                  activeTab === 'security' ? 'block' : 'hidden'
                } lg:block`}
              >
                <h2 className="text-xl font-black mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Sécurité du compte
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  Modifiez le mot de passe de votre session administrateur.
                </p>

                <label className="block">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Nouveau mot de passe
                  </span>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary/30 transition-all"
                      placeholder="Minimum 8 caractères"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Confirmer le mot de passe
                  </span>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary/30 transition-all"
                      placeholder="Répéter le mot de passe"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Mettre à jour le mot de passe
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
