import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useScroll } from 'framer-motion';
import { ArrowUpRight, Bus, Train, Navigation, Shield, Zap, Eye, BarChart3, GitCommit, Cpu, Activity, Layout, Layers, Radio, TrendingUp } from 'lucide-react';

// Importation de la page de connexion/inscription depuis le même dossier components
import AuthInterface from './login_et_registe_page';

// Sous-composant pour animer chaque mot légalement avec les hooks React
function AnimatedWord({ word, index, totalWords, scrollYProgress }) {
  const start = index / totalWords;
  const end = Math.min(start + (1.5 / totalWords), 1);
  
  const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);
  const blurValue = useTransform(scrollYProgress, [start, end], [8, 0]);
  const blur = useTransform(blurValue, (v) => `blur(${v}px)`);
  const y = useTransform(scrollYProgress, [start, end], [6, 0]);

  return (
    <motion.span
      style={{ opacity, filter: blur, y }}
      className="inline-block will-change-[filter,opacity,transform]"
    >
      {word}
    </motion.span>
  );
}

// Sous-composant pour l'effet de pliage/empilement des objectifs au scroll
function ObjectiveCard({ objective, index, total, containerProgress }) {
  const step = index / total;
  
  const scale = useTransform(
    containerProgress, 
    [0, Math.max(0.1, step), 1], 
    [1, 1, Math.max(0.85, 1 - (total - index) * 0.03)]
  );
  
  const opacity = useTransform(
    containerProgress, 
    [0, Math.max(0.1, step), Math.min(1, step + 0.3)], 
    [1, 1, 0.95]
  );

  return (
    <motion.div
      style={{ 
        scale, 
        opacity,
        top: `calc(6rem + ${index * 24}px)`
      }}
      className="sticky bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex gap-5 items-start group will-change-transform"
    >
      <div className="p-3 bg-orange-500/10 rounded-xl text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white shrink-0">
        {objective.icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">{objective.title}</h3>
        <p className="text-slate-600 text-xs font-light leading-relaxed">
          {objective.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function PublicTransportInterface() {
  // État pour gérer la redirection vers la page d'authentification
  const [showAuth, setShowAuth] = useState(false);

  // Gestion de l'effet d'écriture au clavier (Typewriter)
  const baseText = "Une infrastructure de transport public interconnectée, propulsée par des technologies de pointe. Suivez vos trajets en temps réel avec une fluidité absolue. ";
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.floor(latest));
  const displayText = useTransform(rounded, (latest) => baseText.slice(0, latest));

  useEffect(() => {
    const controls = animate(count, baseText.length, {
      type: "tween",
      duration: 4,
      ease: "linear",
      repeat: Infinity,
      repeatType: "reverse",
      repeatDelay: 2
    });
    return controls.stop;
  }, [count, baseText.length]);

  // Variantes d'animation pour l'apparition fluide
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  // Configuration du Scroll pour la section 2
  const textRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 85%", "center center"]
  });

  const titleText = "un système intelligent de gestion de la circulation urbaine";
  const words = titleText.split(" ");

  // Configuration du Scroll tracking pour la section 3 (Effet pliage)
  const objectiveSectionRef = useRef(null);
  const { scrollYProgress: objectiveProgress } = useScroll({
    target: objectiveSectionRef,
    offset: ["start start", "end end"]
  });

  // Data préservée à l'identique pour le mappage des objectifs
  const objectivesData = [
    {
      icon: <Radio className="h-5 w-5" />,
      title: "Réseau taxi-be connecté",
      description: "Digitaliser l'ensemble des coopératives de transport de la capitale pour offrir un suivi cartographique précis et unifié, accessible à tous les citoyens depuis leur smartphone."
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "Régulation des flux urbains",
      description: "Réduire drastiquement les embouteillages aux heures de pointe en analysant la vitesse commerciale des taxi-be pour réajuster la densité des véhicules sur les axes saturés."
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Zéro temps d'attente inutile",
      description: "Permettre aux usagers de planifier intelligemment leurs départs grâce aux prédictions d'arrivée algorithmiques, transformant l'expérience d'attente aux arrêts clés."
    },
    {
      icon: <Layout className="h-5 w-5" />,
      title: "Aide à la décision publique",
      description: "Fournir des rapports de données macroscopiques exploitables aux autorités urbaines pour concevoir de futurs plans d'aménagement routier plus efficaces."
    }
  ];

  /* ======================================================= */
  /* C'EST ICI QU'IL FAUT LE METTRE :                       */
  /* ======================================================= */
  if (showAuth) {
    return <AuthInterface onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-orange-500 selection:text-white scroll-smooth">
      
      {/* HEADER / NAVIGATION */}
      <header className="absolute top-2 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-16 bg-transparent">
        <div className="flex items-center gap-1.5 text-2xl font-bold text-white tracking-tight">
          <span className="text-2xl font-semibold tracking-tight">TAXI-BE</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-normal text-white/80">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#about" className="hover:text-white transition-colors flex items-center gap-1">A propos</a>
          <a href="#objectives" className="hover:text-white transition-colors flex items-center gap-1">Objectif</a>
          <a href="#contact" className="hover:text-white transition-colors">Messager Rapide</a>
        </nav>
        
        <button 
          onClick={() => setShowAuth(true)}
          className="flex items-center gap-1 bg-[#FF4500] hover:bg-orange-500 text-white px-5 py-2 rounded-lg text-xs font-medium transition-all shadow-md hover:scale-105 transform"
        >
          Se connecte <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* SECTION HERO */}
      <section id="home" className="relative h-[95vh] flex items-center justify-center overflow-hidden bg-slate-900 rounded-[2.5rem] mx-2 mt-2 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80" 
            alt="Modern Transit System" 
            className="w-full h-full object-cover opacity-85 scale-105 animate-[subtle-zoom_30s_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-slate-900/10 to-slate-950/40" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-20">
          
          <motion.div 
            className="lg:col-span-7 text-white space-y-4"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className="inline-block text-[11px] font-medium tracking-normal text-white/60 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
               Suivez les Taxi-Be à Madagascar
            </span>
            <h1 className="text-4xl md:text-6xl font-normal tracking-tight leading-[1.15] text-white">
              Transport public intelligent <br />
              <span className="text-white/80 font-light">— Rapide, simple, fiable </span>
            </h1>
          </motion.div>

          <motion.div 
            className="lg:col-span-5 bg-black/15 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl text-white flex flex-col justify-between min-h-[340px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#FFB84D] uppercase">
                <Zap className="h-4 w-4 animate-pulse" /> Taxi-be, à votre service
              </div>
              
              <div className="text-sm md:text-base text-white/90 font-light leading-relaxed min-h-[100px]">
                <motion.span>{displayText}</motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                  className="inline-block w-[2px] h-4 bg-[#FFB84D] ml-0.5 relative top-0.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-5 border-t border-white/10 text-[10.5px] text-white/70 leading-normal">
              <div className="flex flex-col gap-1">
                <span className="text-white font-medium flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-orange-500 shrink-0" /> Surveillance
                </span>
                Trafic en temps réel
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white font-medium flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5 text-orange-500 shrink-0" /> Analyse
                </span>
                Flux de circulation
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white font-medium flex items-center gap-1">
                  <GitCommit className="h-3.5 w-3.5 text-orange-500 shrink-0" /> Optimisation
                </span>
                Des itinéraires
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white font-medium flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 text-orange-500 shrink-0" /> Gestion
                </span>
                Trafic urbain intelligent
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white font-medium flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-orange-500 shrink-0" /> Décision
                </span>
                Aide à la mobilité
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION LOGOS PARTENAIRES */}
      <section className="bg-white border-b border-slate-100 py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Integrated with global transit partners</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-black tracking-tighter text-slate-800 italic">METRO_LINK</span>
            <span className="text-xl font-bold tracking-tight text-slate-800">CITY_BUS</span>
            <span className="text-xl font-light tracking-widest text-slate-800">E C O T R A M</span>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">VELOCITY</span>
            <span className="text-xl font-medium text-slate-800">HyperMove</span>
          </div>
        </div>
      </section>

      {/* SECTION 2 VUE D'ENSEMBLE */}
      <section id="about" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <motion.div 
              className="lg:col-span-5 space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.span variants={fadeInUp} className="inline-block text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">
                 C'est quoi TAXI-BE
              </motion.span>
              
              <h2 ref={textRef} className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight flex flex-wrap gap-x-[0.25em] gap-y-1">
                {words.map((word, index) => (
                  <AnimatedWord 
                    key={`word-${index}`}
                    word={word}
                    index={index}
                    totalWords={words.length}
                    scrollYProgress={scrollYProgress}
                  />
                ))}
              </h2>

              <motion.p variants={fadeInUp} className="text-slate-600 text-sm leading-relaxed">
                La plateforme de suivi des transports publics est une solution web et mobile innovante permettant de localiser les bus et taxi-be en temps réel. Elle offre aux usagers la possibilité de consulter les trajets, les arrêts, les itinéraires ainsi que les positions des véhicules afin de réduire le temps d’attente et de faciliter les déplacements quotidiens.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-slate-600 text-sm leading-relaxed">
                Cette plateforme vise également à améliorer l’organisation du transport urbain, la sécurité des passagers et la fluidité de la circulation dans les grandes villes comme Antananarivo.
              </motion.p>
              <motion.button 
                variants={fadeInUp}
                className="group flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg"
              >
                Ride now 
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </motion.button>
            </motion.div>

            <div className="lg:col-span-7 grid grid-cols-12 gap-4">
              <motion.div 
                className="col-span-7 h-[420px] rounded-3xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80" 
                  alt="Modern city tramway" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </motion.div>

              <div className="col-span-5 flex flex-col gap-4 justify-between">
                <motion.div 
                  className="h-[200px] rounded-3xl overflow-hidden relative shadow-lg bg-orange-600"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="absolute inset-0 bg-orange-600/10 z-10 mix-blend-multiply" />
                  <div className="absolute top-4 left-4 z-20 text-white bg-slate-950/20 px-3 py-1 rounded-lg backdrop-blur-sm text-xs font-bold tracking-wider">
                    uthao
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1463780324318-d1a8ddc05a11?auto=format&fit=crop&w=400&q=80" 
                    alt="Orange transit station details" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <motion.div 
                  className="h-[200px] rounded-3xl overflow-hidden shadow-lg"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=400&q=80" 
                    alt="Modern subway rapid transit" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3 : OBJECTIFS */}
      <section 
        ref={objectiveSectionRef} 
        id="objectives"
        className="relative py-20 md:py-28 bg-slate-50 border-t border-slate-200/60"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
              <span className="inline-block text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Notre Vision
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
                Objectifs & <br />
                Vision de Mobilité
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                Que ce soit pour optimiser la gestion urbaine, rassurer les usagers ou fluidifier le réseau de Madagascar, nous déployons des technologies intelligentes adaptées à la réalité locale.
              </p>
              <div className="pt-2">
                <button className="bg-slate-950 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md hover:scale-[1.02]">
                  En savoir plus
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6 relative">
              {objectivesData.map((objective, index) => (
                <ObjectiveCard
                  key={`objective-${index}`}
                  objective={objective}
                  index={index}
                  total={objectivesData.length}
                  containerProgress={objectiveProgress}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4 : QUICK CONTACT */}
      <section 
        id="contact"
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-fixed bg-no-repeat overflow-hidden"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')` 
        }}
      >
        <div className="absolute inset-0 bg-slate-950/80 mix-blend-multiply z-0" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-20 text-white">
          
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2 opacity-90">
              <span className="text-sm font-black tracking-tighter italic text-orange-500">TAXI-BE</span>
              <span className="text-xs text-white/40">|</span>
              <span className="text-xs tracking-widest uppercase font-light text-white/80">à votre service</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Des questions ? <br />
              Contactez notre équipe.
            </h2>
            
            <p className="text-slate-300 text-sm font-light leading-relaxed max-w-md">
              Une idée de partenariat ou besoin d'accompagnement technique pour vos flottes à Madagascar ? Laissez-nous un message rapide, notre équipe vous répond en moins de 24 heures.
            </p>
          </div>

          <div className="lg:col-span-7 bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6 w-full">
            <h3 className="text-lg font-medium tracking-tight text-white/90">Message Rapide</h3>
            
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium tracking-wider uppercase text-slate-400">Nom complet</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Jean Dupont" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium tracking-wider uppercase text-slate-400">Adresse Email</label>
                  <input 
                    type="email" 
                    placeholder="Ex: name@domain.com" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium tracking-wider uppercase text-slate-400">Votre Message</label>
                <textarea 
                  rows="4" 
                  placeholder="Écrivez votre message ici..." 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-xl hover:scale-[1.02] transform"
                >
                  Envoyer le message <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
}