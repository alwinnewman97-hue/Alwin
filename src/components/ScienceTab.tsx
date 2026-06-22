import React from 'react';
import { GameState, ScienceType, ResourceType } from '../types';
import { SCIENCES } from '../gameData';
import { playClickSound, triggerHaptic } from '../utils/audio';
import { FlaskConical, Check, Sparkles, BookOpen, GraduationCap, Compass, Microscope } from 'lucide-react';

interface ScienceTabProps {
  store: GameState;
}

export default function ScienceTab({ store }: ScienceTabProps) {
  const isCompact = store.density === 'compact';

  const handleResearch = (type: ScienceType) => {
    store.researchScience(type);
    triggerHaptic('research');
    if (store.soundEnabled) playClickSound('research');
  };

  const resourceLabelMap: Record<string, string> = {
    catnip: 'Mega Seeds',
    wood: 'Plutonium',
    minerals: 'Crystals',
    iron: 'Neutrium',
    science: 'Portal Tech',
    culture: 'Schwifty Vibes',
    beam: 'Nano-Beam',
    slab: 'Hyper-Slab',
    plate: 'Neutrium Plate',
    parchment: 'Portal Formula'
  };

  // Helper icons for research types
  const getScienceIcon = (id: ScienceType) => {
    switch (id) {
      case 'calendar': return <Compass size={18} className="text-[#39ff14]" />;
      case 'agriculture': return <GraduationCap size={18} className="text-emerald-400" />;
      case 'woodworking': return <BookOpen size={18} className="text-amber-400" />;
      case 'mining': return <Microscope size={18} className="text-cyan-400" />;
      case 'metalworking': return <Sparkles size={18} className="text-purple-400" />;
      case 'writing': return <FlaskConical size={18} className="text-emerald-300" />;
      case 'theology': return <Sparkles size={18} className="text-pink-400" />;
      default: return <FlaskConical size={18} className="text-[#39ff14]" />;
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-10">
      
      {/* SCIENCE POOL OVERVIEW */}
      <div className={`flex justify-between items-center border-b border-white/5 transition-all duration-300 ${
        isCompact ? 'pb-3 mx-2 mt-2 gap-2 text-xs' : 'pb-6 mx-2 sm:mx-6 mt-4'
      }`}>
        <div className="flex flex-col gap-1">
          <span className={`uppercase font-bold text-neutral-500 tracking-widest leading-none ${
            isCompact ? 'text-[9px]' : 'text-[10px]'
          }`}>Scientific Registry</span>
          <h3 className={`font-bold text-white tracking-wide transition-all ${
            isCompact ? 'text-sm' : 'text-lg'
          }`}>Dimensional Breakthroughs</h3>
        </div>
        <div className={`rounded-xl border border-emerald-500/10 bg-emerald-500/5 font-mono text-emerald-400 font-bold flex items-center gap-2 transition-all ${
          isCompact ? 'py-1 px-3 text-xs' : 'py-2 px-4 text-sm'
        }`}>
          <FlaskConical size={isCompact ? 12 : 14} className="text-emerald-400 animate-pulse" />
          <span>{Math.floor(store.resources.science.amount).toLocaleString()}</span>
          <span className="text-neutral-500 text-xs font-sans font-bold uppercase">Portal Gen</span>
        </div>
      </div>

      {/* RESEARCH DIRECTORY GRID */}
      <div className={`grid grid-cols-1 md:grid-cols-2 transition-all duration-300 ${
        isCompact ? 'gap-3 mt-4' : 'gap-4 mt-6'
      }`}>
        {(Object.entries(SCIENCES) as [ScienceType, typeof SCIENCES[ScienceType]][]).map(([id, s]) => {
          const isResearched = store.researched[id];
          
          if (id === 'agriculture' && !store.researched.calendar) return null;
          if (id === 'woodworking' && !store.researched.agriculture) return null;
          if (id === 'mining' && !store.researched.woodworking) return null;
          if (id === 'metalworking' && !store.researched.mining) return null;
          if (id === 'writing' && !store.researched.woodworking) return null;
          if (id === 'theology' && !store.researched.writing) return null;

          let canAfford = true;
          const costsList = Object.entries(s.cost).map(([res, costVal]) => {
            const isAffordable = store.resources[res as ResourceType]?.amount >= (costVal as number);
            if (!isAffordable) canAfford = false;
            return (
              <span 
                key={res} 
                className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                  isAffordable 
                    ? 'bg-neutral-900/40 text-[#39ff14] border-emerald-950/40' 
                    : 'bg-red-950/10 text-red-200 border-red-900/20'
                }`}
              >
                <span className="text-neutral-500">{resourceLabelMap[res] || res}:</span>
                <span className="font-bold">{(costVal as number).toLocaleString()}</span>
              </span>
            );
          });

          return (
            <div 
              key={id}
              className={`flex flex-col justify-between transition-all duration-300 border rounded-xl bg-neutral-950/10 backdrop-blur-sm relative ${
                isCompact ? 'p-3.5 gap-2.5' : 'p-5 gap-4'
              } ${
                isResearched 
                  ? 'border-neutral-900/30 opacity-45' 
                  : canAfford 
                    ? 'border-neutral-900 hover:border-neutral-700/65 shadow-sm' 
                    : 'border-white/5 opacity-70'
              }`}
            >
              <div className={`flex flex-col ${isCompact ? 'gap-1' : 'gap-2'}`}>
                {/* Upper line */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-neutral-900 border border-white/5 rounded-lg shrink-0">
                      {getScienceIcon(id)}
                    </span>
                    <h4 className={`font-bold text-white tracking-wide transition-all ${
                      isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                    }`}>
                      {s.name}
                    </h4>
                  </div>
                  
                  {isResearched ? (
                    <span className="px-2 py-0.5 border border-emerald-500/20 text-[#39ff14]/85 text-[8px] uppercase tracking-wider font-bold rounded bg-emerald-500/5">
                      Completed
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  )}
                </div>

                <p className={`text-neutral-400 font-sans leading-relaxed hidden sm:block ${
                  isCompact ? 'text-[11px] leading-snug mt-0.5' : 'text-xs'
                }`}>
                  {s.desc}
                </p>

                {/* Unified Unlocks Row */}
                <div className={`flex items-start gap-1 text-emerald-400 font-mono transition-all ${
                  isCompact ? 'mt-0.5 text-[9px]' : 'mt-1 text-[10px]'
                }`}>
                  <span className="font-bold">Boost:</span>
                  <span className="text-neutral-300">{s.effectsDesc}</span>
                </div>
              </div>

              {!isResearched && (
                <div className={`flex flex-col border-t border-white/[0.03] transition-all duration-300 ${
                  isCompact ? 'gap-2 pt-2' : 'gap-3 pt-3'
                }`}>
                  <div className="flex flex-wrap gap-1">
                    {costsList}
                  </div>

                  <button
                    onClick={() => handleResearch(id)}
                    disabled={!canAfford}
                    className={`w-full uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                      isCompact ? 'py-1.5 text-[10px]' : 'py-2 text-2xs'
                    } ${
                      canAfford 
                        ? 'bg-white text-black hover:bg-neutral-100 font-extrabold shadow-sm' 
                        : 'bg-white/5 border border-white/5 text-white/20 disabled:cursor-not-allowed font-medium'
                    }`}
                  >
                    Initiate Research
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

