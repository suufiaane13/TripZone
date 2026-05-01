import { MapPin, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              Trip<span className="text-primary">Zone</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">Accueil</Link>
            <a href="/#trips" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">Trajets</a>
            <a href="#" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">À propos</a>
            <button className="bg-secondary hover:bg-secondary/90 text-white px-5 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-secondary/20">
              Réserver maintenant
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link to="/" className="block px-3 py-2 text-base font-bold text-gray-900">Accueil</Link>
            <a href="/#trips" className="block px-3 py-2 text-base font-bold text-gray-600">Trajets</a>
            <a href="#" className="block px-3 py-2 text-base font-bold text-gray-600">À propos</a>
            <div className="pt-4 px-3">
              <button className="w-full bg-secondary text-white px-5 py-3 rounded-xl text-base font-bold">
                Réserver maintenant
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
