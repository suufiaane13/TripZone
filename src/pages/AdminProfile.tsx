import { useEffect, useMemo, useState } from 'react'
import {
  UserCircle,
  Mail,
  ShieldCheck,
  KeyRound,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react'
import { AdminLayout } from '../components/AdminLayout'
import { supabase } from '../lib/supabase'

type Notice = {
  type: 'success' | 'error'
  message: string
} | null

export const AdminProfile = () => {
  const [loadingUser, setLoadingUser] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [lastSignInAt, setLastSignInAt] = useState('')

  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const createdAtLabel = useMemo(
    () => (createdAt ? new Date(createdAt).toLocaleString('fr-FR') : '—'),
    [createdAt]
  )

  const lastSignInLabel = useMemo(
    () => (lastSignInAt ? new Date(lastSignInAt).toLocaleString('fr-FR') : '—'),
    [lastSignInAt]
  )

  const fetchUser = async () => {
    setLoadingUser(true)
    setNotice(null)
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      setNotice({
        type: 'error',
        message: "Impossible de charger le profil administrateur.",
      })
      setLoadingUser(false)
      return
    }

    const user = data.user
    setUserId(user.id)
    setEmail(user.email || '')
    setDisplayName(String(user.user_metadata?.full_name || ''))
    setCreatedAt(user.created_at || '')
    setLastSignInAt(user.last_sign_in_at || '')
    setLoadingUser(false)
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setNotice(null)

    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName.trim() },
    })

    if (error) {
      setNotice({
        type: 'error',
        message: `Mise à jour du profil impossible: ${error.message}`,
      })
      setSavingProfile(false)
      return
    }

    setNotice({
      type: 'success',
      message: 'Profil administrateur mis à jour avec succès.',
    })
    setSavingProfile(false)
    fetchUser()
  }

  const handleSavePassword = async (e: React.FormEvent) => {
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
        message: 'Les mots de passe ne correspondent pas.',
      })
      return
    }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setNotice({
        type: 'error',
        message: `Impossible de changer le mot de passe: ${error.message}`,
      })
      setSavingPassword(false)
      return
    }

    setNotice({
      type: 'success',
      message: 'Mot de passe modifié avec succès.',
    })
    setNewPassword('')
    setConfirmPassword('')
    setSavingPassword(false)
  }

  const copyUserId = async () => {
    if (!userId) return
    await navigator.clipboard.writeText(userId)
    setNotice({
      type: 'success',
      message: "Identifiant administrateur copié dans le presse-papiers.",
    })
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-12">
        <div className="mb-10 lg:mb-16">
          <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">
            Administration
          </span>
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">
            Profil Admin
          </h1>
          <p className="text-gray-400 font-medium mt-4">
            Gérez vos informations de compte et la sécurité de votre session.
          </p>
        </div>

        {notice && (
          <div
            className={`mb-8 rounded-2xl border p-4 flex items-start gap-3 ${
              notice.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <p className="font-medium text-sm">{notice.message}</p>
          </div>
        )}

        {loadingUser ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black mb-8 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-primary" /> Informations compte
              </h2>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Email
                  </p>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> {email || '—'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    ID administrateur
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs text-gray-700 break-all">{userId || '—'}</p>
                    <button
                      type="button"
                      onClick={copyUserId}
                      className="shrink-0 p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-primary transition-colors"
                      title="Copier l'identifiant"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Compte créé
                    </p>
                    <p className="font-bold text-gray-900 text-sm">{createdAtLabel}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Dernière connexion
                    </p>
                    <p className="font-bold text-gray-900 text-sm">{lastSignInLabel}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Nom affiché
                  </span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary/30 transition-all"
                    placeholder="Nom de l'administrateur"
                  />
                </label>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Enregistrer le profil
                    </>
                  )}
                </button>
              </form>
            </section>

            <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black mb-8 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Sécurité du compte
              </h2>

              <form onSubmit={handleSavePassword} className="space-y-5">
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
                      placeholder="Répéter le nouveau mot de passe"
                    />
                  </div>
                </label>

                <p className="text-xs text-gray-500 font-medium">
                  Utilisez un mot de passe unique avec lettres, chiffres et caractères spéciaux.
                </p>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full bg-primary text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
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
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
