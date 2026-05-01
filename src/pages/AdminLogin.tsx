import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft, ChevronRight } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950 px-4">
      {/* Background with cinematic image and blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1539635278303-d4002c07dee3?q=80&w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-30 scale-110"
          alt="Moroccan Landscape"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-950/80 to-primary/20" />
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] relative z-10"
      >
        {/* Logo and Back Link */}
        <div className="flex justify-between items-center mb-8 px-2">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour
          </Link>
          <div className="text-right">
            <img src="/logo.png" alt="TripZone Logo" className="h-10 md:h-12 w-auto object-contain brightness-0 invert" />
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[48px] p-8 sm:p-12 border border-white/10 shadow-2xl">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Espace Admin</h1>
            <p className="text-white/40 font-medium">Authentification sécurisée requise.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 p-4 bg-red-500/10 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold border border-red-500/20"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  required
                  type="email"
                  className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-[24px] outline-none transition-all font-bold text-white placeholder:text-white/10"
                  placeholder="nom@tripzone.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  required
                  type="password"
                  className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-[24px] outline-none transition-all font-bold text-white placeholder:text-white/10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-[24px] text-lg font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>Accéder au Dashboard <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-12 text-white/20 text-[10px] font-bold uppercase tracking-widest">
          Système de gestion TripZone © 2026
        </p>
      </motion.div>
    </div>
  )
}
