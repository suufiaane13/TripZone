import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Heart, Award } from 'lucide-react'

export const About = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1539635278303-d4002c07dee3?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
          alt="TripZone Oriental"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
        
        <div className="relative z-10 text-center px-6">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-black uppercase tracking-[0.4em] text-xs mb-4 block"
          >
            Découvrez notre histoire
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none"
          >
            L'excellence du voyage <br />
            <span className="text-primary italic">dans l'Oriental.</span>
          </motion.h1>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-8">
              Plus qu'un transport, <br />
              <span className="text-primary">une expérience humaine.</span>
            </h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed mb-8">
              Fondée avec la passion de faire découvrir les trésors cachés de la région de l'Oriental, TripZone est devenue la référence du transport touristique premium à Oujda et ses environs.
            </p>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">
              Notre mission est simple : offrir à chaque voyageur un confort absolu, une sécurité sans faille et des souvenirs impérissables à travers les paysages majestueux du Maroc.
            </p>
            
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div>
                <p className="text-4xl font-black text-gray-900 mb-1">10k+</p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Voyageurs satisfaits</p>
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 mb-1">50+</p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Destinations</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video lg:aspect-square rounded-[64px] bg-gray-50 flex items-center justify-center p-12 lg:p-20 shadow-2xl border-[12px] border-white">
              <img 
                src="/logo.png" 
                className="w-full h-auto object-contain transition-transform duration-700 hover:scale-105"
                alt="TripZone Logo"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-primary p-10 rounded-[40px] text-white shadow-2xl hidden md:block">
              <Award className="w-12 h-12 mb-4" />
              <p className="font-black text-xl leading-tight">Certifié Qualité <br />Tourisme</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Nos piliers</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Ce qui nous rend uniques</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                icon: <ShieldCheck className="w-8 h-8" />, 
                title: "Sécurité Totale", 
                desc: "Tous nos véhicules sont entretenus selon les normes les plus strictes et nos chauffeurs sont des professionnels certifiés." 
              },
              { 
                icon: <Zap className="w-8 h-8" />, 
                title: "Confort Premium", 
                desc: "Voyagez dans des bus modernes, climatisés et équipés pour que chaque kilomètre soit un plaisir." 
              },
              { 
                icon: <Heart className="w-8 h-8" />, 
                title: "Passion Locale", 
                desc: "Nous connaissons l'Oriental par cœur. Nous vous emmenons là où les autres ne vont pas." 
              }
            ].map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 container mx-auto px-6">
        <div className="bg-gray-900 rounded-[64px] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-primary/5 pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 relative z-10">
            Prêt à commencer <br />
            <span className="text-primary italic">l'aventure avec nous ?</span>
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
            <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              Explorer les trajets
            </button>
            <button className="bg-white/10 text-white backdrop-blur-md px-10 py-5 rounded-2xl font-black text-lg border border-white/10 hover:bg-white/20 transition-all">
              Nous contacter
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
