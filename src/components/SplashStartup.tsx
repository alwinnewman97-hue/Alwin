import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Sparkles, 
  Cpu, 
  ChevronRight, 
  Apple, 
  Share, 
  Volume2, 
  VolumeX, 
  Terminal, 
  Radio, 
  Dna,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface SplashStartupProps {
  onEnter: () => void;
  soundEnabled: boolean;
}

export default function SplashStartup({ onEnter, soundEnabled }: SplashStartupProps) {
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [isIosButNotStandalone, setIsIosButNotStandalone] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [portalPower, setPortalPower] = useState(45);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isSoundActive, setIsSoundActive] = useState(soundEnabled);

  const diagnostics = [
    'ALIGNING DIMENSIONAL MEMBRANES... OK',
    'EXTRACTING QUANTUM PORTAL FLUID... 100%',
    'REPLICATING MORTY COGNITIVE RECEPTORS... ACTIVE',
    'CITADEL CLONE REPLICATOR SYNCHRONIZED',
    'ESTABLISHING PARALLEL TIMELINE COHERENCE... SECURE.'
  ];

  useEffect(() => {
    // Increment logs with a staggered professional timing
    const interval = setInterval(() => {
      setDiagnosticIndex((prev) => {
        if (prev < diagnostics.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 550);

    return () => clearInterval(interval);
  }, []);

  // Soft random fluctuation in "portal stability index" to look incredibly active and real
  useEffect(() => {
    const powerInterval = setInterval(() => {
      setPortalPower((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.min(100, Math.max(30, prev + delta));
      });
    }, 1200);
    return () => clearInterval(powerInterval);
  }, []);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIosDevice && !isStandalone) {
      setIsIosButNotStandalone(true);
    }
  }, []);

  const handleStart = () => {
    setIsLaunching(true);
    if (isSoundActive) {
      playClickSound('success');
    }
    // Grant transition time for the portal explosion animation
    setTimeout(() => {
      onEnter();
    }, 1000);
  };

  const toggleSoundOption = () => {
    setIsSoundActive(prev => !prev);
    if (!isSoundActive) {
      playClickSound('click');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-8 select-none overflow-y-auto lg:overflow-hidden min-h-screen theme-bg-app transition-colors duration-700">
      
      {/* GLOWING AMBIENT FIELD */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--text-sec)]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER BAR */}
      <header className="flex items-center justify-between w-full z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 items-center px-3 py-1.5 rounded-full border theme-border theme-bg-card text-[9px] font-mono tracking-widest uppercase shadow-sm">
            <Radio size={11} className="theme-text-sec animate-pulse" />
            <span className="opacity-80">STATION: C-137 // SECURE</span>
          </div>
        </div>

        {/* Dynamic Awwward Bouncing Multi-Soundbar */}
        <button 
          onClick={toggleSoundOption}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border theme-border theme-bg-card hover:bg-[var(--bg-hover)] transition-all cursor-pointer group"
        >
          <span className="text-[9px] font-mono tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
            {isSoundActive ? 'AUDIO ENGAGED' : 'AUDIO OFF'}
          </span>
          <div className="flex items-end gap-[2px] h-3 w-4">
            {isSoundActive ? (
              <>
                <div className="w-[2px] bg-[var(--text-sec)] rounded-full animate-[bounce_0.8s_infinite] h-full" style={{ animationDelay: '0.1s' }} />
                <div className="w-[2px] bg-[var(--text-sec)] rounded-full animate-[bounce_0.5s_infinite] h-[60%]" style={{ animationDelay: '0.3s' }} />
                <div className="w-[2px] bg-[var(--text-sec)] rounded-full animate-[bounce_0.7s_infinite] h-[80%]" style={{ animationDelay: '0.2s' }} />
                <div className="w-[2px] bg-[var(--text-sec)] rounded-full animate-[bounce_0.6s_infinite] h-[40%]" style={{ animationDelay: '0s' }} />
              </>
            ) : (
              <>
                <div className="w-[2px] bg-[var(--text-muted)] rounded-full h-[20%]" />
                <div className="w-[2px] bg-[var(--text-muted)] rounded-full h-[20%]" />
                <div className="w-[2px] bg-[var(--text-muted)] rounded-full h-[20%]" />
                <div className="w-[2px] bg-[var(--text-muted)] rounded-full h-[20%]" />
              </>
            )}
          </div>
        </button>
      </header>

      {/* CORE DISPLAY ZONE */}
      <main className="max-w-4xl w-full mx-auto my-auto flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-12 items-center justify-center z-10 py-3 sm:py-6 shrink-0">
        
        {/* LEFT COLUMN: HERO VISUAL PORTAL */}
        <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center relative select-none">
          
          {/* Swirling Interactive Master Portal (SVG-Crafted Premium Art) */}
          <motion.div 
            className="relative cursor-pointer flex items-center justify-center w-36 h-36 min-[380px]:w-44 min-[380px]:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            animate={isLaunching ? { scale: 3.5, rotate: 180, opacity: 0 } : {}}
            transition={{ duration: 0.9, ease: 'easeIn' }}
          >
            {/* Ambient Backlight Halo */}
            <div className={`absolute inset-4 rounded-full bg-[var(--text-sec)]/10 blur-2xl transition-all duration-700 ${isHovered ? 'scale-125 opacity-100' : 'scale-100 opacity-60'}`} />

            {/* Orbiting Tech Rings */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              {/* Outer dotted orbital */}
              <circle 
                cx="100" cy="100" r="92" 
                fill="none" 
                stroke="var(--border-main)" 
                strokeWidth="1" 
                strokeDasharray="4 8" 
                className="animate-[spin_40s_linear_infinite]"
              />

              {/* Intersecting dimensional paths */}
              <circle 
                cx="100" cy="100" r="80" 
                fill="none" 
                stroke="var(--text-sec)" 
                strokeWidth="0.75" 
                strokeDasharray="20 40 10 90" 
                className="opacity-40 animate-[spin_15s_linear_infinite_reverse]"
              />

              {/* Core swirling fluid lines */}
              <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}>
                {/* Spiral arm 1 */}
                <path 
                  d="M100 20 C140 20, 180 60, 180 100 C180 140, 140 180, 100 180 C60 180, 20 140, 20 100 C20 60, 60 20, 100 20 Z" 
                  fill="none" 
                  stroke="var(--text-sec)" 
                  strokeWidth="2" 
                  strokeDasharray="10 15"
                  className="opacity-70"
                />
                {/* Spiral arm 2 */}
                <path 
                  d="M100 35 C130 35, 165 65, 165 100 C165 135, 130 165, 100 165 C70 165, 35 135, 35 100 C35 65, 70 35, 100 35 Z" 
                  fill="none" 
                  stroke="var(--border-main)" 
                  strokeWidth="1.5" 
                  strokeDasharray="50 20 5 10"
                  className="opacity-80"
                />
              </motion.g>

              {/* Swirling center plasma simulation */}
              <motion.circle 
                cx="100" cy="100" r="55" 
                fill="url(#portalPlasma)" 
                className="shadow-2xl origin-center"
                initial={{ scale: 1, opacity: 0.85 }}
                animate={isHovered ? { scale: 1.08, opacity: 0.95 } : { scale: 1, opacity: 0.85 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              />

              {/* Linear Gradients define beautiful color hues for both modes */}
              <defs>
                <radialGradient id="portalPlasma" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--text-sec)" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="var(--bg-card)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--border-main)" stopOpacity="0.9" />
                </radialGradient>
              </defs>
            </svg>

            {/* Glowing Center Core Element */}
            <motion.div 
              className="absolute w-14 h-14 min-[380px]:w-16 min-[380px]:h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center theme-bg-card border theme-border shadow-lg"
              animate={isHovered ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <Dna className={`${isHovered ? 'theme-text-sec scale-110' : 'theme-text-main'} transition-colors duration-300 animate-pulse hidden sm:block`} size={36} />
              <Dna className={`${isHovered ? 'theme-text-sec scale-110' : 'theme-text-main'} transition-colors duration-300 animate-pulse sm:hidden block`} size={24} />
            </motion.div>

            {/* Energy Particle Anchors */}
            <AnimatePresence>
              {isHovered && [1, 2, 3].map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0.4, 1.2, 0.4], 
                    x: Math.sin(i * 120) * 80, 
                    y: Math.cos(i * 120) * 80 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.4 }}
                  className="absolute w-3.5 h-3.5 rounded-full bg-[var(--text-sec)] opacity-80 blur-[2px]"
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* REALTIME SYSTEM STABILITY STATUS */}
          <div className="mt-3 flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Zap size={11} className="theme-text-sec animate-bounce" /> Portal Stability:
            </span>
            <span className="font-extrabold theme-text-main text-xs">{portalPower}%</span>
          </div>
        </div>

        {/* RIGHT COLUMN: TITLES & LOGS */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center text-center lg:text-left gap-4 sm:gap-6 w-full max-w-md mx-auto">
          
          {/* BRADDED MODERN TYPOGRAPHY HEADER */}
          <div className="flex flex-col gap-1">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative inline-block"
            >
              {/* Decorative side accent lines */}
              <span className="hidden lg:block absolute -left-12 top-4 w-8 h-[1px] bg-[var(--text-sec)] opacity-60" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black uppercase tracking-tight text-[var(--text-main)] select-none">
                Citadel <span className="theme-text-sec">Clone Bay</span>
              </h2>
            </motion.div>
            
            <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] leading-relaxed mt-0.5 sm:mt-1">
              Multiversal Incremental Engine Protocols // C-137 Security Clearances Enabled
            </p>
          </div>

          {/* THE CHRONOMETER TERMINAL CONSOLE */}
          <div className="border theme-border theme-bg-card p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left font-mono text-[10px] leading-relaxed shadow-sm relative overflow-hidden backdrop-blur-md">
            
            {/* Outer Subtle Glass Decoration */}
            <div className="absolute top-0 right-0 p-1 px-2.5 rounded-bl-xl border-l border-b theme-border bg-[var(--bg-app)] text-[8px] opacity-60 tracking-wider">
              QUANTUM_LOG_STREAM
            </div>

            <div className="theme-text-sec border-b theme-border pb-2 mb-2 flex items-center gap-2">
              <div className="flex gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <span className="opacity-80 text-[9px] tracking-wider font-bold">MUTABLE COGNITIVE SYSTEM</span>
            </div>
            
            <div className="space-y-1 min-h-[60px] sm:min-h-[90px]">
              {diagnostics.slice(0, diagnosticIndex + 1).map((line, idx) => {
                const isLatest = idx === diagnosticIndex;
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-center gap-2 ${isLatest ? 'theme-text-sec font-black' : 'text-[var(--text-muted)]'}`}
                  >
                    <span className="opacity-40">&gt;&gt;</span>
                    <span className="truncate">{line}</span>
                    {isLatest && <span className="w-1.5 h-2.5 bg-[var(--text-sec)] animate-pulse inline-block" />}
                  </motion.div>
                );
              })}
              {diagnosticIndex < diagnostics.length - 1 && (
                <div className="text-[var(--text-muted)] animate-pulse flex items-center gap-1">
                  <span className="opacity-40">&gt;&gt;</span>
                  <span>PARSING TIMELINES FOR COHERENCE...</span>
                </div>
              )}
            </div>
          </div>

          {/* LAUNCH PORTAL TRIGGER BAR */}
          <div className="relative group w-full">
            {/* Hover Backdrop Shadow element */}
            <div className="absolute inset-0 bg-[var(--text-sec)]/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <button
              onClick={handleStart}
              disabled={isLaunching}
              className="relative w-full min-h-[48px] sm:min-h-[50px] px-6 rounded-xl text-2xs uppercase font-extrabold tracking-widest text-[var(--accent-text)] bg-[var(--accent-color)] hover:brightness-110 active:scale-[0.98] transition-all transform flex items-center justify-center gap-3.5 cursor-pointer shadow-lg select-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isLaunching ? (
                <>
                  <Dna className="animate-spin" size={14} />
                  <span>WARPING ACROSS TIMELINES...</span>
                </>
              ) : (
                <>
                  <span>LAUNCH PORTAL SIMULATION</span>
                  <ChevronRight size={14} className="stroke-[3] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

        </div>
      </main>

      {/* FOOTER AREA / MOBILE ADVICE */}
      <footer className="w-full max-w-sm mx-auto flex flex-col items-center text-center gap-2 z-10">
        {isIosButNotStandalone ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full theme-bg-card border theme-border p-3 rounded-xl flex items-start gap-3 shadow-md border-dashed"
          >
            <div className="bg-[var(--bg-app)] border theme-border p-1.5 rounded-lg theme-text-sec shrink-0 mt-0.5">
              <Apple size={14} />
            </div>
            <div className="text-left">
              <h4 className="text-[9px] font-sans font-black text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1.5">
                <span>iOS STANDALONE LAUNCHER TIP</span>
                <span className="text-[8px] bg-[var(--text-sec)]/10 text-[var(--text-sec)] border theme-border px-1 py-0.2 rounded font-mono font-bold">RECOMMENDED</span>
              </h4>
              <p className="text-[9px] text-[var(--text-muted)] mt-1 leading-relaxed font-sans">
                Tap Safari's <span className="inline-flex items-center gap-0.5 font-bold text-[var(--text-main)] bg-[var(--bg-app)] px-1 py-0.5 rounded border theme-border"><Share size={9} className="inline" /> share</span> then choose <span className="font-bold text-[var(--text-main)]">"Add to Home Screen"</span> for full screen.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center gap-2 font-mono text-[9px] text-[var(--text-muted)] leading-none">
            <ShieldCheck size={12} className="opacity-60" />
            <span>CENTRAL FINITE CURVE SIMULATION ENGINES VERIFIED</span>
          </div>
        )}
      </footer>

    </div>
  );
}
