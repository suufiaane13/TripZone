import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, Map, Users, ExternalLink, LogOut 
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Trajets', path: '/admin/trips', icon: Map },
    { label: 'Réservations', path: '/admin/reservations', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="w-72 bg-white text-gray-900 p-10 hidden lg:flex flex-col border-r border-gray-100 z-20 sticky top-0 h-screen shrink-0">
        <div className="mb-16">
          <img src="/logo.png" alt="TripZone Logo" className="h-14 w-auto object-contain" />
        </div>
        
        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 w-full p-4 rounded-2xl text-xs uppercase tracking-[0.2em] font-black transition-all ${
                location.pathname === item.path 
                ? 'bg-primary/5 text-primary shadow-sm border border-primary/10' 
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </Link>
          ))}

          <div className="pt-10 mt-10 border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 ml-4">Raccourcis</p>
            <Link to="/" className="flex items-center gap-4 w-full p-4 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all text-xs font-black uppercase tracking-widest">
              <ExternalLink className="w-5 h-5" /> Voir le site
            </Link>
          </div>
        </nav>
        
        <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all text-xs font-black uppercase tracking-widest mt-auto">
          <LogOut className="w-5 h-5" /> Déconnexion
        </button>
      </aside>

      {/* Sticky Top Navbar - Mobile Only */}
      <nav className="lg:hidden sticky top-0 w-full bg-white/80 backdrop-blur-xl px-4 h-20 flex items-center justify-between z-[60] border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <img src="/logo.png" alt="TripZone Logo" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-1.5">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`p-2.5 rounded-xl transition-all ${
                location.pathname === item.path 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-400 bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
          <button onClick={handleLogout} className="p-2.5 text-red-500 bg-red-50 rounded-xl">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
