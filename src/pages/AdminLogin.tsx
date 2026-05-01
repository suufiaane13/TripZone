import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft, ChevronRight, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError("Identifiants invalides. Veuillez réessayer.")
      setLoading(false)
    } else {
      navigate('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-dvh min-h-screen flex flex-col lg:flex-row bg-nature-50">
      {/* Panneau marque — plein écran en tête sur mobile, colonne gauche sur desktop */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-[#143d32] to-[#0D2119] px-6 py-8 sm:px-10 sm:py-10 lg:w-[min(44%,520px)] lg:shrink-0 lg:min-h-0 lg:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/70 transition-colors hover:bg-white/10 hover:text-white active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Retour au site
          </Link>
        </div>

        <div className="relative z-10 mt-8 flex flex-col items-center text-center lg:mt-0 lg:flex-1 lg:justify-center lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto mb-6 lg:mb-8"
          >
            <img
              src="/logo.png"
              alt="TripZone"
              className="mx-auto h-14 w-auto max-w-[200px] object-contain brightness-0 invert sm:h-16 lg:h-20"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="max-w-sm space-y-4"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-secondary">
              Espace réservé
            </p>
            <h1 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              Pilotage des trajets & réservations
            </h1>
            <p className="text-sm leading-relaxed text-white/65">
              Oriental · Maroc — connectez-vous pour gérer vos circuits et les demandes voyageurs.
            </p>
          </motion.div>
        </div>

        <p className="relative z-10 text-center text-[10px] font-bold uppercase tracking-widest text-white/35 lg:text-left">
          TripZone © {new Date().getFullYear()}
        </p>
      </div>

      {/* Formulaire */}
      <div className="relative flex flex-1 flex-col justify-center px-4 pb-10 pt-2 sm:px-8 sm:pb-12 sm:pt-6 lg:px-12 lg:pb-16 lg:pt-16">
        <div className="mx-auto w-full max-w-[440px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="rounded-[28px] border border-gray-100/80 bg-white p-6 shadow-[0_24px_80px_-12px_rgba(27,67,50,0.12)] sm:rounded-[36px] sm:p-8 lg:p-10"
          >
            <div className="mb-8 border-b border-gray-100 pb-8 text-center">
              <div className="mb-3 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-nature-100 px-3 py-1">
                  <Shield className="h-3.5 w-3.5 text-primary" aria-hidden />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Administration
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                Connexion
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-gray-500">
                Utilisez l&apos;e-mail et le mot de passe de votre compte équipe.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                role="alert"
                className="mb-6 flex gap-3 rounded-2xl border border-red-100 bg-red-50/90 p-4 text-sm font-semibold text-red-700"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" aria-hidden />
                <p>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label htmlFor="admin-email" className="ml-1 text-xs font-black uppercase tracking-wider text-gray-400">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-5" aria-hidden />
                  <input
                    id="admin-email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.ma"
                    className="min-h-[52px] w-full rounded-2xl border-2 border-transparent bg-gray-50 py-3.5 pl-14 pr-5 text-base font-semibold text-gray-900 outline-none ring-primary/0 transition-all placeholder:text-gray-400 focus:border-primary/25 focus:bg-white focus:ring-4 focus:ring-primary/10 sm:min-h-14 sm:rounded-[22px] sm:pl-[3.75rem] sm:text-[15px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-password" className="ml-1 text-xs font-black uppercase tracking-wider text-gray-400">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-5" aria-hidden />
                  <input
                    id="admin-password"
                    name="password"
                    autoComplete="current-password"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="min-h-[52px] w-full rounded-2xl border-2 border-transparent bg-gray-50 py-3.5 pl-14 pr-5 text-base font-semibold text-gray-900 outline-none ring-primary/0 transition-all placeholder:text-gray-400 focus:border-primary/25 focus:bg-white focus:ring-4 focus:ring-primary/10 sm:min-h-14 sm:rounded-[22px] sm:pl-[3.75rem] sm:text-[15px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-black text-white shadow-lg shadow-primary/25 transition-all hover:bg-[#163728] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99] disabled:opacity-55 sm:rounded-[22px] sm:text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin shrink-0" aria-hidden />
                    <span>Connexion…</span>
                  </>
                ) : (
                  <>
                    <span>Accéder au tableau de bord</span>
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <p className="mt-8 px-1 text-center text-[11px] font-semibold leading-relaxed text-gray-400 sm:mt-10">
            Besoin d&apos;aide ? Contactez l&apos;administrateur du projet TripZone.
          </p>
        </div>
      </div>
    </div>
  )
}
