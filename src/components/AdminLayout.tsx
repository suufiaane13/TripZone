import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, Map, Users, Settings, ExternalLink, LogOut, Menu, X
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }


  const navItems = [
    { label: 'Accueil', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Trajets', path: '/admin/trips', icon: Map },
    { label: 'Réservations', path: '/admin/reservations', icon: Users },
    { label: 'Paramètres', path: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-[95%] max-w-7xl">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[32px] px-4 sm:px-8 h-20 flex items-center justify-between relative z-50">
          <Link to="/admin/dashboard" className="flex items-center group shrink-0">
            <img src="/logo.png" alt="TripZone Logo" className="h-12 md:h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
          </Link>

          <div className="hidden lg:flex gap-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-xs font-black uppercase tracking-widest transition-colors relative group ${
                  location.pathname === item.path ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                    location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/"
              className="w-12 h-12 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center hover:scale-105 hover:text-gray-900 transition-all"
              title="Voir le site"
            >
              <ExternalLink className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:scale-105 transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-12 h-12 flex items-center justify-center bg-gray-900 text-white rounded-2xl active:scale-90 transition-all shadow-lg shadow-gray-900/20"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[105] bg-white/95 backdrop-blur-3xl lg:hidden pt-32 px-6"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-4xl font-black text-gray-900 tracking-tighter hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-8 pt-8 border-t border-gray-100 flex gap-3">
                <Link
                  to="/"
                  className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500"
                  title="Voir le site"
                >
                  <ExternalLink className="w-6 h-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500"
                  title="Déconnexion"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto pt-28 lg:pt-32">
        {children}
      </main>
    </div>
  )
}
