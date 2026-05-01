import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  loading?: boolean
}

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                {title}
              </h3>
              
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  disabled={loading}
                  onClick={onConfirm}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Suppression...' : 'Oui, supprimer'}
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
