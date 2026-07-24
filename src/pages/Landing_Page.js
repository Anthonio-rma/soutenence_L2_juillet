import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useScroll } from 'framer-motion';
import { ArrowUpRight, Zap, Eye, BarChart3, GitCommit, Cpu, Activity, Layout, Layers, Radio, TrendingUp, Smartphone, Monitor } from 'lucide-react';

import AuthInterface from './login_et_registe_page';

// ─── Animated word (scroll-reveal) ───────────────────────────────────────────
function AnimatedWord({ word, index, totalWords, scrollYProgress }) {
  const start = index / totalWords;
  const end = Math.min(start + (1.5 / totalWords), 1);
  const opacity  = useTransform(scrollYProgress, [start, end], [0.15, 1]);
  const blurVal  = useTransform(scrollYProgress, [start, end], [8, 0]);
  const blur     = useTransform(blurVal, (v) => `blur(${v}px)`);
  const y        = useTransform(scrollYProgress, [start, end], [6, 0]);
  return (
    <motion.span style={{ opacity, filter: blur, y }} className="inline-block will-change-[filter,opacity,transform]">
      {word}
    </motion.span>
  );
}

// ─── Stacking objective card ──────────────────────────────────────────────────
function ObjectiveCard({ objective, index, total, containerProgress }) {
  const step = index / total;
  const scale = useTransform(containerProgress, [0, Math.max(0.1, step), 1], [1, 1, Math.max(0.85, 1 - (total - index) * 0.03)]);
  const opacity = useTransform(containerProgress, [0, Math.max(0.1, step), Math.min(1, step + 0.3)], [1, 1, 0.95]);
  return (
    <motion.div
      style={{ scale, opacity, top: `calc(6rem + ${index * 24}px)` }}
      className="sticky bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex gap-5 items-start group will-change-transform"
    >
      <div className="p-3 bg-orange-500/10 rounded-xl text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white shrink-0">
        {objective.icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">{objective.title}</h3>
        <p className="text-slate-600 text-xs font-light leading-relaxed">{objective.description}</p>
      </div>
    </motion.div>
  );
}

// ─── Penny-style mobile section ───────────────────────────────────────────────
function MobilePennySection() {
  return (
    <div className="w-full py-20 px-6 flex flex-col items-center text-center overflow-hidden bg-slate-50">
      {/* Hero text */}
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight max-w-2xl"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Trouvez, Suivez, et<br />
        Voyagez avec <span style={{ fontStyle: 'italic', color: '#1a1a1a' }}>TAXI-BE</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-5 text-slate-500 text-base max-w-md leading-relaxed"
      >
        Laissez TAXI-BE localiser votre taxi-be le plus proche,<br className="hidden md:block" />
        combiner vos lignes — automatiquement, depuis votre smartphone.
      </motion.p>

      {/* Download buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.28 }}
        className="mt-8 flex items-center gap-3 flex-wrap justify-center"
      >
        {/* Google Play */}
        <a
          href="#"
          className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white pl-3 pr-5 py-2.5 rounded-xl transition-all shadow-md hover:scale-[1.03]"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.18 1.07C2.47 1.45 2 2.18 2 3.04v17.92c0 .86.47 1.59 1.18 1.97l.1.05 10.04-10.04v-.24L3.28 1.02l-.1.05z" fill="#EA4335"/>
            <path d="M16.67 15.29l-3.35-3.35v-.24l3.35-3.35.08.04 3.97 2.26c1.13.64 1.13 1.69 0 2.34l-3.97 2.26-.08.04z" fill="#FBBC04"/>
            <path d="M16.75 15.25L13.32 11.82 3.18 21.96c.37.4.96.44 1.62.08l11.95-6.79" fill="#34A853"/>
            <path d="M16.75 8.75L4.8 1.96C4.14 1.6 3.55 1.64 3.18 2.04L13.32 12.18l3.43-3.43z" fill="#4285F4"/>
          </svg>
          <div className="text-left leading-none">
            <div className="text-[9px] text-white/60 font-normal uppercase tracking-wider">GET IT ON</div>
            <div className="text-sm font-semibold leading-snug">Google Play</div>
          </div>
        </a>

        {/* App Store */}
        <a
          href="#"
          className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white pl-3 pr-5 py-2.5 rounded-xl transition-all shadow-md hover:scale-[1.03]"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <div className="text-left leading-none">
            <div className="text-[9px] text-white/60 font-normal uppercase tracking-wider">Download on the</div>
            <div className="text-sm font-semibold leading-snug">App Store</div>
          </div>
        </a>
      </motion.div>

      {/* Phone mockup */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-14 w-full max-w-lg"
      >
        {/* Floating badge — 10k+ downloads */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="absolute -left-4 md:-left-10 bottom-28 z-20 flex items-center gap-2 bg-white rounded-2xl shadow-xl px-3 py-2"
        >
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">10k+ téléchargements</span>
        </motion.div>

        {/* Floating badge — rating */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="absolute -right-4 md:-right-6 bottom-36 z-20 flex items-center gap-2 bg-white rounded-2xl shadow-xl px-3 py-2"
        >
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-orange-400 border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">R</div>
            <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">M</div>
            <div className="w-6 h-6 rounded-full bg-green-400 border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">S</div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-xs font-bold text-slate-800">4.8</span>
          </div>
        </motion.div>

        {/* The phone itself */}
        <div
          className="relative mx-auto w-[240px] md:w-[280px]"
          style={{ transform: 'perspective(900px) rotateX(4deg)', transformOrigin: 'bottom center' }}
        >
          {/* Phone shell */}
          <div className="relative bg-slate-900 rounded-[2.6rem] border-4 border-slate-700 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.45)] overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-b-2xl z-20" />

            {/* Status bar */}
            <div className="flex justify-between items-center px-5 pt-7 pb-1 z-10 relative">
              <span className="text-white/50 text-[9px] font-medium">9:41</span>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-[6px] border border-white/40 rounded-[2px]">
                  <div className="h-full w-2/3 bg-white/40 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* App content */}
            <div className="bg-slate-950 px-4 pb-5 flex flex-col gap-3">
              {/* Greeting */}
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-white/40 text-[9px]">Bonjour 👋</p>
                  <p className="text-white text-xs font-semibold">Où allons-nous ?</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">J</div>
              </div>

              {/* Search */}
              <div className="bg-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
                <svg className="w-3 h-3 text-orange-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <span className="text-white/30 text-[9px]">Rechercher un arrêt...</span>
              </div>

              {/* Map */}
              <div className="relative rounded-2xl overflow-hidden h-[130px] bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80"
                  alt="Carte"
                  className="w-full h-full object-cover opacity-50"
                />
                {/* Route overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-1 h-[2px] bg-orange-400/70 rounded-full" />
                  ))}
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <span className="text-white text-[8px] font-medium">Ligne 135 · Arrivée dans 4 min</span>
                </div>
              </div>

              {/* Nearby lines */}
              <p className="text-white/30 text-[8px] uppercase tracking-widest -mb-1">Lignes à proximité</p>
              {[
                { line: "135", dest: "Analakely → Mahamasina", time: "4 min", color: "bg-orange-500" },
                { line: "87",  dest: "Isotry → Ambohipo",     time: "9 min", color: "bg-blue-500"   },
                { line: "042", dest: "67ha → Anosizato",      time: "12 min", color: "bg-green-500" },
              ].map((item) => (
                <div key={item.line} className="flex items-center gap-2 bg-slate-800/80 rounded-xl px-3 py-2">
                  <div className={`${item.color} w-6 h-6 rounded-lg flex items-center justify-center shrink-0`}>
                    <span className="text-white text-[7px] font-black">{item.line}</span>
                  </div>
                  <p className="text-white text-[8px] font-medium flex-1 truncate">{item.dest}</p>
                  <span className="text-orange-400 text-[8px] font-semibold shrink-0">{item.time}</span>
                </div>
              ))}

              {/* Activity label */}
              <div className="mt-1 flex items-center gap-1.5 opacity-40">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <span className="text-white text-[9px] font-medium">Activité</span>
              </div>
            </div>

            {/* Bottom nav */}
            <div className="bg-slate-900 border-t border-white/10 flex justify-around py-2 px-2">
              {[
                { label: "Carte",    active: true,  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> },
                { label: "Lignes",   active: false, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> },
                { label: "Profil",   active: false, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-0.5">
                  <div className={item.active ? "text-orange-500" : "text-white/30"}>{item.icon}</div>
                  <span className={`text-[7px] ${item.active ? "text-orange-500" : "text-white/30"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PublicTransportInterface() {
  const [showAuth, setShowAuth]     = useState(false);
  const [mobileView, setMobileView] = useState(false);

  // Typewriter
  const baseText    = "Une infrastructure de transport public interconnectée, propulsée par des technologies de pointe. Suivez vos trajets en temps réel avec une fluidité absolue. ";
  const count       = useMotionValue(0);
  const rounded     = useTransform(count, (latest) => Math.floor(latest));
  const displayText = useTransform(rounded, (latest) => baseText.slice(0, latest));

  useEffect(() => {
    const controls = animate(count, baseText.length, {
      type: "tween", duration: 4, ease: "linear",
      repeat: Infinity, repeatType: "reverse", repeatDelay: 2,
    });
    return controls.stop;
  }, [count, baseText.length]);

  const fadeInUp = {
    hidden:  { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };
  const staggerContainer = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  // Scroll section 2
  const textRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: textRef, offset: ["start 85%", "center center"] });
  const titleText = "un système intelligent de gestion de la circulation urbaine";
  const words = titleText.split(" ");

  // Scroll section 3
  const objectiveSectionRef = useRef(null);
  const { scrollYProgress: objectiveProgress } = useScroll({ target: objectiveSectionRef, offset: ["start start", "end end"] });

  const objectivesData = [
    { icon: <Radio    className="h-5 w-5" />, title: "Réseau taxi-be connecté",    description: "Digitaliser l'ensemble des coopératives de transport de la capitale pour offrir un suivi cartographique précis et unifié, accessible à tous les citoyens depuis leur smartphone." },
    { icon: <Layers   className="h-5 w-5" />, title: "Régulation des flux urbains", description: "Réduire drastiquement les embouteillages aux heures de pointe en analysant la vitesse commerciale des taxi-be pour réajuster la densité des véhicules sur les axes saturés." },
    { icon: <TrendingUp className="h-5 w-5" />, title: "Zéro temps d'attente inutile", description: "Permettre aux usagers de planifier intelligemment leurs départs grâce aux prédictions d'arrivée algorithmiques, transformant l'expérience d'attente aux arrêts clés." },
    { icon: <Layout   className="h-5 w-5" />, title: "Aide à la décision publique",  description: "Fournir des rapports de données macroscopiques exploitables aux autorités urbaines pour concevoir de futurs plans d'aménagement routier plus efficaces." },
  ];

  const partners = [
    { name: "MIRINDRA",   className: "text-xl font-black tracking-tighter text-slate-800 italic" },
    { name: "BE KITANA",  className: "text-xl font-bold tracking-tight text-slate-800" },
    { name: "BUS CLASS",  className: "text-xl font-light tracking-widest text-slate-800" },
    { name: "ONJA",       className: "text-xl font-extrabold tracking-tight text-slate-800" },
    { name: "SOAMIARA",   className: "text-xl font-medium text-slate-800" },
    { name: "VATOFOTSY",  className: "text-xl font-medium text-slate-800" },
    { name: "SOATIANALA", className: "text-xl font-medium text-slate-800" },
    { name: "FIFALIANA",  className: "text-xl font-medium text-slate-800" },
  ];

  if (showAuth) return <AuthInterface onBack={() => setShowAuth(false)} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-orange-500 selection:text-white scroll-smooth">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="absolute top-2 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-16 bg-transparent">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-semibold tracking-tight text-white">TAXI-BE</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-normal text-white/80">
          <a href="#home"       className="hover:text-white transition-colors">Home</a>
          <a href="#about"      className="hover:text-white transition-colors flex items-center gap-1">A propos</a>
          <a href="#objectives" className="hover:text-white transition-colors flex items-center gap-1">Objectif</a>
          <a href="#contact"    className="hover:text-white transition-colors">Messager Rapide</a>
        </nav>
        <button
          onClick={() => setShowAuth(true)}
          className="flex items-center gap-1 bg-[#FF4500] hover:bg-orange-500 text-white px-5 py-2 rounded-lg text-xs font-medium transition-all shadow-md hover:scale-105 transform"
        >
          Se connecte <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section id="home" className="relative h-[95vh] flex items-center justify-center overflow-hidden bg-slate-900 rounded-[2.5rem] mx-2 mt-2 shadow-2xl">
        <div className="absolute inset-0 z-0">
        <img 
          src="./images/bus_02.jpg" 
          alt="Description" 
          className="w-full h-full object-cover opacity-60" 
        />
        {/* Dégradé plus fort pour mieux voir le texte blanc */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-20">
          <motion.div className="lg:col-span-7 text-white space-y-4" initial="hidden" animate="visible" variants={fadeInUp}>
            <span className="inline-block text-[11px] font-medium tracking-normal text-white/60 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              Suivez les Taxi-Be à Madagascar
            </span>
            <h1 className="text-4xl md:text-6xl font-normal tracking-tight leading-[1.15] text-white">
              Transport public intelligent <br />
              <span className="text-white/80 font-light">— Rapide, simple, fiable </span>
            </h1>
          </motion.div>
          <motion.div className="lg:col-span-5 bg-black/15 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl text-white flex flex-col justify-between min-h-[340px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#FFB84D] uppercase">
                <Zap className="h-4 w-4 animate-pulse" /> Taxi-be, à votre service
              </div>
              <div className="text-sm md:text-base text-white/90 font-light leading-relaxed min-h-[100px]">
                <motion.span>{displayText}</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="inline-block w-[2px] h-4 bg-[#FFB84D] ml-0.5 relative top-0.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-5 border-t border-white/10 text-[10.5px] text-white/70 leading-normal">
              <div className="flex flex-col gap-1"><span className="text-white font-medium flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-orange-500 shrink-0" /> Surveillance</span>Trafic en temps réel</div>
              <div className="flex flex-col gap-1"><span className="text-white font-medium flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5 text-orange-500 shrink-0" /> Analyse</span>Flux de circulation</div>
              <div className="flex flex-col gap-1"><span className="text-white font-medium flex items-center gap-1"><GitCommit className="h-3.5 w-3.5 text-orange-500 shrink-0" /> Optimisation</span>Des itinéraires</div>
              <div className="flex flex-col gap-1"><span className="text-white font-medium flex items-center gap-1"><Cpu className="h-3.5 w-3.5 text-orange-500 shrink-0" /> Gestion</span>Trafic urbain intelligent</div>
              <div className="flex flex-col gap-1"><span className="text-white font-medium flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-orange-500 shrink-0" /> Décision</span>Aide à la mobilité</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PARTENAIRES (scroll infini) ─────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100 py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Integrated with global transit partners</p>
          <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
            <motion.div
              className="flex gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 shrink-0 pr-12 md:pr-20"
              animate={{ x: ["-50%", "0%"] }}
              transition={{ ease: "linear", duration: 25, repeat: Infinity }}
            >
              {[...partners, ...partners].map((partner, idx) => (
                <span key={idx} className={partner.className}>{partner.name}</span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 : VUE D'ENSEMBLE ─────────────────────────────────────── */}
      <section id="about" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div className="lg:col-span-5 space-y-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.span variants={fadeInUp} className="inline-block text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">
                C'est quoi TAXI-BE
              </motion.span>
              <h2 ref={textRef} className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight flex flex-wrap gap-x-[0.25em] gap-y-1">
                {words.map((word, index) => (
                  <AnimatedWord key={`word-${index}`} word={word} index={index} totalWords={words.length} scrollYProgress={scrollYProgress} />
                ))}
              </h2>
              <motion.p variants={fadeInUp} className="text-slate-600 text-sm leading-relaxed">
                La plateforme de suivi des transports publics est une solution web et mobile innovante permettant de localiser les bus et taxi-be en temps réel. Elle offre aux usagers la possibilité de consulter les trajets, les arrêts, les itinéraires ainsi que les positions des véhicules afin de réduire le temps d'attente et de faciliter les déplacements quotidiens.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-slate-600 text-sm leading-relaxed">
                Cette plateforme vise également à améliorer l'organisation du transport urbain, la sécurité des passagers et la fluidité de la circulation dans les grandes villes comme Antananarivo.
              </motion.p>
            </motion.div>

            <div className="lg:col-span-7 grid grid-cols-12 gap-4">
              <motion.div className="col-span-7 h-[420px] rounded-3xl overflow-hidden shadow-xl" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <img src="./images/image1.jpg" alt="Modern city tramway" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </motion.div>
              <div className="col-span-5 flex flex-col gap-4 justify-between">
                <motion.div className="h-[200px] rounded-3xl overflow-hidden relative shadow-lg bg-orange-600" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                  <div className="absolute inset-0 bg-orange-600/10 z-10 mix-blend-multiply" />
                  <div className="absolute top-4 left-4 z-20 text-white bg-slate-950/20 px-3 py-1 rounded-lg backdrop-blur-sm text-xs font-bold tracking-wider">uthao</div>
                  <img src="./images/bus_03.jpg" alt="Orange transit station details" className="w-full h-full object-cover" />
                </motion.div>
                <motion.div className="h-[200px] rounded-3xl overflow-hidden shadow-lg" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
                  <img src="./images/bus_05.jpg" alt="Modern subway rapid transit" className="w-full h-full object-cover" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 : OBJECTIFS ──────────────────────────────────────────── */}
      <section ref={objectiveSectionRef} id="objectives" className="relative py-20 md:py-28 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">

          {/* Toggle Bureau / Mobile */}
          <div className="flex flex-col items-center gap-4 mb-14">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Aperçu de la plateforme</p>
            <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl shadow-sm p-1 gap-1">
              <button
                onClick={() => setMobileView(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${!mobileView ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Monitor className="h-3.5 w-3.5" /> Page Bureau
              </button>
              <button
                onClick={() => setMobileView(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${mobileView ? 'bg-orange-500 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Page Mobile
              </button>
            </div>
          </div>

          {/* Mobile section (Penny style) — fond identique à la section Objectifs, pas de carte flottante */}
          {mobileView && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-16">
              <MobilePennySection />
            </motion.div>
          )}

          {/* Objectives grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
              <span className="inline-block text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">Notre Vision</span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
                Objectifs &amp; <br />Vision de Mobilité
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                Que ce soit pour optimiser la gestion urbaine, rassurer les usagers ou fluidifier le réseau de Madagascar, nous déployons des technologies intelligentes adaptées à la réalité locale.
              </p>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-6 relative">
              {objectivesData.map((objective, index) => (
                <ObjectiveCard key={`objective-${index}`} objective={objective} index={index} total={objectivesData.length} containerProgress={objectiveProgress} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 : CONTACT ────────────────────────────────────────────── */}
      <section id="contact" className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-fixed bg-no-repeat overflow-hidden" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')` }}>
        <div className="absolute inset-0 bg-slate-950/80 mix-blend-multiply z-0" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-20 text-white">
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2 opacity-90">
              <span className="text-sm font-black tracking-tighter italic text-orange-500">TAXI-BE</span>
              <span className="text-xs text-white/40">|</span>
              <span className="text-xs tracking-widest uppercase font-light text-white/80">à votre service</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Des questions ? <br />Contactez notre équipe.
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
                  <input type="text" placeholder="Ex: Jean Dupont" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium tracking-wider uppercase text-slate-400">Adresse Email</label>
                  <input type="email" placeholder="Ex: name@domain.com" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium tracking-wider uppercase text-slate-400">Votre Message</label>
                <textarea rows="4" placeholder="Écrivez votre message ici..." className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none" />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-xl hover:scale-[1.02] transform">
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