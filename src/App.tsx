import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home } from './pages/Home'
import { PublicTrips } from './pages/PublicTrips'
import { TripDetails } from './pages/TripDetails'
import { AdminLogin } from './pages/AdminLogin'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminTrips } from './pages/AdminTrips'
import { AdminTripForm } from './pages/AdminTripForm'
import { AdminReservations } from './pages/AdminReservations'
import { AdminProfile } from './pages/AdminProfile'
import { AdminSettings } from './pages/AdminSettings'
import { About } from './pages/About'
import { ProtectedRoute } from './components/ProtectedRoute'
import { FloatingWhatsApp } from './components/FloatingWhatsApp'
import { ScrollToTop } from './components/ScrollToTop'
import { Phone, MapPin, X, Menu } from 'lucide-react'
import { getWhatsAppLink, useSiteSettings } from './lib/siteSettings'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNameHovered, setIsNameHovered] = useState(false)
  const location = useLocation()
  const { settings } = useSiteSettings()

  // Fonction pour forcer le retour en haut si on clique sur la page actuelle
  const handleLinkClick = (path: string) => {
    setIsMenuOpen(false)
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }


  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />

      {/* Public Navigation */}
      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*" element={
          <>
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-[95%] max-w-7xl">
              <div className="bg-white/70 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[32px] px-8 h-20 flex items-center justify-between relative z-50">
                <Link
                  to="/"
                  onClick={() => handleLinkClick('/')}
                  className="flex items-center group"
                >
                  <img src="/logo.png" alt="TripZone Logo" className="h-12 md:h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-10 items-center">
                  <Link
                    to="/trajets"
                    onClick={() => handleLinkClick('/trajets')}
                    className={`text-xs font-black uppercase tracking-widest transition-colors relative group ${location.pathname === '/trajets' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
                      }`}
                  >
                    Trajets
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${location.pathname === '/trajets' ? 'w-full' : 'w-0 group-hover:w-full'
                      }`} />
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => handleLinkClick('/about')}
                    className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors relative group"
                  >
                    À Propos
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                  </Link>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => handleLinkClick('/admin/dashboard')}
                    className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:scale-110 hover:shadow-xl hover:shadow-gray-900/20 active:scale-95 transition-all group"
                    title="Espace Admin"
                  >
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden w-12 h-12 flex items-center justify-center bg-gray-900 text-white rounded-2xl active:scale-90 transition-all shadow-lg shadow-gray-900/20"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed inset-0 z-[105] bg-white/95 backdrop-blur-3xl md:hidden pt-32 px-6"
                >
                  <div className="flex flex-col gap-6">
                    <Link
                      to="/trajets"
                      onClick={() => handleLinkClick('/trajets')}
                      className="text-4xl font-black text-gray-900 tracking-tighter hover:text-primary transition-colors"
                    >
                      Nos Trajets
                    </Link>
                    <Link to="/about" onClick={() => handleLinkClick('/about')} className="text-4xl font-black text-gray-900 tracking-tighter hover:text-primary transition-colors">À Propos</Link>
                    <Link to="/admin/dashboard" onClick={() => handleLinkClick('/admin/dashboard')} className="text-4xl font-black text-gray-900 tracking-tighter hover:text-primary transition-colors">Espace Admin</Link>

                    <div className="mt-12 pt-12 border-t border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Suivez-nous</p>
                      <div className="flex gap-4">
                        <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        } />
      </Routes>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trajets" element={<PublicTrips />} />
          <Route path="/about" element={<About />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trips"
            element={
              <ProtectedRoute>
                <AdminTrips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trips/new"
            element={
              <ProtectedRoute>
                <AdminTripForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trips/:tripId/edit"
            element={
              <ProtectedRoute>
                <AdminTripForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reservations"
            element={
              <ProtectedRoute>
                <AdminReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<FloatingWhatsApp />} />
        </Routes>
      </main>

      {/* Public Footer */}
      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*" element={
          <footer className="bg-gray-950 text-white pt-24 pb-12 mt-20 lg:mt-32 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24 relative z-10">
                <div className="col-span-1 md:col-span-2">
                  <Link to="/" className="mb-8 block w-fit">
                    <motion.img
                      src="/logo.png"
                      alt="TripZone Logo"
                      className="h-20 w-auto object-contain brightness-0 invert"
                      whileHover={{
                        scale: 1.1,
                        rotate: [-1, 1, -1, 0],
                        filter: "brightness(0) invert(1) drop-shadow(0 0 15px rgba(255,255,255,0.3))"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    />
                  </Link>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-md">
                    La première plateforme premium de réservation de voyages touristiques dans la région de l'Oriental. Explorez le Maroc avec style.
                  </p>
                  <div className="flex gap-6 mt-10">
                    <a href={`tel:${settings.contact_phone}`} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#0087FF] transition-all group shadow-lg hover:shadow-[#0087FF]/20">
                      <Phone className="w-5 h-5 text-white" />
                    </a>
                    <a href={getWhatsAppLink(settings.whatsapp_number)} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#25D366] transition-all group">
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.633 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                    <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#E4405F] transition-all group">
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-8">Navigation</h4>
                  <ul className="space-y-4 text-gray-400 text-sm font-medium">
                    <li><Link to="/" className="hover:text-primary transition-colors">Accueil</Link></li>
                    <li><Link to="/about" className="hover:text-primary transition-colors">À Propos</Link></li>
                    <li><Link to="/trajets" className="hover:text-primary transition-colors">Trajets</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-8">Contact</h4>
                  <ul className="space-y-4 text-gray-400 text-sm font-medium">
                    <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {settings.contact_city}</li>
                    <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> {settings.contact_phone}</li>
                  </ul>
                </div>
              </div>

              <div className="mt-24 pt-8 border-t border-white/5 flex flex-col items-center gap-4 text-gray-500 text-[10px] sm:text-xs font-medium text-center pb-10 md:pb-0">
                <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1">
                  <span>Développé avec</span>
                  <motion.span
                    animate={{
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="inline-block text-sm"
                  >
                    ❤️
                  </motion.span>
                  <span>par</span>
                  <motion.a
                    href="https://instagram.com/suuf.iaane"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setIsNameHovered(true)}
                    onMouseLeave={() => setIsNameHovered(false)}
                    animate={{
                      color: isNameHovered ? '#E4405F' : ['#ffffff', '#ef4444', '#ffffff'],
                      scale: isNameHovered ? 1.1 : [1, 1.05, 1],
                    }}
                    transition={{
                      duration: isNameHovered ? 0.2 : 3,
                      repeat: isNameHovered ? 0 : Infinity,
                      ease: "linear"
                    }}
                    className="font-bold text-white px-1 transition-colors"
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={isNameHovered ? 'handle' : 'name'}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isNameHovered ? '@suuf.iaane' : 'HAJJI Soufiane'}
                      </motion.span>
                    </AnimatePresence>
                  </motion.a>
                  <span>pour l'Oriental.</span>
                </div>
                <p>© 2026 TripZone. Tous droits réservés.</p>
              </div>
            </div>
          </footer>
        } />
      </Routes>
    </div>
  )
}

export default App

