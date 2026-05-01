import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export const FloatingWhatsApp = () => {
  const [showNotification, setShowNotification] = useState(false)
  const phoneNumber = "212701730174"
  const message = "Bonjour TripZone, je souhaite avoir plus d'informations sur vos trajets."

  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed bottom-8 right-8 z-[90] flex items-center gap-4">
      {/* Horizontal Notification Bubble */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="bg-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3 relative min-w-[200px]"
          >
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">TripZone Chat</p>
              <p className="text-xs font-bold text-gray-900 whitespace-nowrap">Besoin d'aide ? Discutons !</p>
            </div>
            
            <button 
              onClick={() => setShowNotification(false)}
              className="p-1 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-gray-900 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Little pointer triangle */}
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-r border-t border-gray-100 shadow-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button with WhatsApp SVG */}
      <motion.a
        href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(37,211,102,0.3)] group relative shrink-0"
      >
        <span className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20 group-hover:hidden"></span>
        
        <svg 
          viewBox="0 0 24 24" 
          className="w-8 h-8 fill-white" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.633 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </motion.a>
    </div>
  )
}
