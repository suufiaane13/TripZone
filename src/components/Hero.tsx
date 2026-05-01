import { motion } from 'framer-motion'
import { ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react'

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 w-fit px-4 py-2 rounded-full mb-8">
              <span className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-orange-400 fill-orange-400" />)}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">N°1 dans l'Oriental</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.85] tracking-tighter mb-10">
              Voyagez <br />
              <span className="text-primary italic">autrement.</span>
            </h1>
            
            <p className="text-xl text-gray-500 font-medium mb-12 max-w-xl leading-relaxed">
              TripZone réinvente le voyage touristique dans l'Oriental. Découvrez des lieux secrets avec un confort premium et une organisation sans faille.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              <a href="#trips" className="group bg-gray-900 text-white px-10 py-6 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-black hover:-translate-y-1 transition-all shadow-2xl shadow-gray-900/20">
                Explorer 
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </a>
              <div className="flex items-center gap-6 px-4 border-l-2 border-gray-100">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <img key={i} className="w-12 h-12 rounded-full border-4 border-white shadow-sm object-cover" src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" />
                  ))}
                </div>
                <div>
                  <p className="text-gray-900 font-black text-sm">Plus de 1k+</p>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Aventures vécues</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-tight">Sécurité <br />Garantie</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-tight">Réservation <br />Instantanée</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-[4/5] rounded-[48px] lg:rounded-[64px] overflow-hidden shadow-2xl border-[8px] lg:border-[12px] border-white">
              <img 
                src="https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=2070&auto=format&fit=crop" 
                className="w-full h-full object-cover"
                alt="Sahara Adventure"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
            </div>

            {/* Decorative Dots */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[radial-gradient(#e5e7eb_2px,transparent_2px)] [background-size:16px_16px] -z-10" />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <div className="w-6 h-10 border-2 border-gray-200 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-gray-300 rounded-full" />
        </div>
      </motion.div>
    </section>
  )
}
