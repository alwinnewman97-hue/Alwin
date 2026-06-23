import React, { useState } from 'react';
import { GameState } from '../types';
import { ACHIEVEMENTS, Achievement } from '../utils/achievements';
import { Award, Lock, Sparkles, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AchievementsTabProps {
  store: GameState;
}

export default function AchievementsTab({ store }: AchievementsTabProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'resources' | 'citadel' | 'citizens' | 'quantum'>('all');
  
  const achievementsRecord = store.achievements || {};
  const unlockedCount = ACHIEVEMENTS.filter((ach) => achievementsRecord[ach.id]).length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = ACHIEVEMENTS.filter((ach) => {
    if (activeFilter === 'all') return true;
    return ach.category === activeFilter;
  });

  // Category label helper
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'resources':
        return { label: 'Resources', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'citadel':
        return { label: 'Citadel', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
      case 'citizens':
        return { label: 'Citizens', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'quantum':
        return { label: 'Quantum', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default:
        return { label: 'General', badge: 'bg-neutral-500/10 theme-text-muted border-neutral-500/20' };
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in">
      
      {/* HEADER BAR AND TITLE */}
      <div className="border-b border-white/[0.04] pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black theme-text-main tracking-wide flex items-center gap-2">
            <Award className="text-[#39ff14] animate-pulse" size={24} />
            <span>Dimensions & Milestones</span>
          </h2>
          <span className="text-[10px] uppercase font-bold theme-text-muted tracking-widest block mt-0.5 font-sans leading-none">
            Citadel Registry Achievements
          </span>
        </div>

        {/* GLOWING REWARD STATISTICS METERS */}
        <div className="theme-bg-panel border border-neutral-900 rounded-2xl p-4 flex items-center gap-5 md:max-w-xs w-full backdrop-blur-sm shadow-sm">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="theme-text-sec"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#39ff14] transition-all duration-1000 ease-out"
                strokeWidth="2.5"
                dasharray={`${completionPercentage}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-xs font-black theme-text-main">
              {completionPercentage}%
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xs uppercase tracking-wider theme-text-muted font-extrabold">Registry Completion</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-[#39ff14] tracking-tight">{unlockedCount}</span>
              <span className="text-xs theme-text-muted font-bold">/</span>
              <span className="text-sm theme-text-muted font-bold">{totalCount}</span>
              <span className="text-xs theme-text-muted font-medium ml-1">Unlocked</span>
            </div>
          </div>
        </div>
      </div>

      {/* HORIZONTAL FILTERS SELECTION RAIL */}
      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none items-center gap-1.5 py-1">
        <span className="text-2xs uppercase tracking-wider theme-text-muted font-black mr-2 flex items-center gap-1 shrink-0 font-sans">
          <Filter size={10} /> Filter:
        </span>
        
        {([
          { id: 'all', label: 'All Milestones 🏆' },
          { id: 'resources', label: 'Resources 🟢' },
          { id: 'citadel', label: 'Citadel 🌀' },
          { id: 'citizens', label: 'Citizens 👦' },
          { id: 'quantum', label: 'Quantum 🧪' }
        ] as const).map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-xl border cursor-pointer select-none transition-all duration-200 shrink-0 ${
                isActive
                  ? 'theme-accent-bg border-transparent font-black shadow-md'
                  : 'theme-bg-panel theme-border theme-text-muted hover:theme-text-main'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* ACHIEVEMENTS CARDS BENTO GRID */}
      {filteredAchievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/[0.04] rounded-2xl theme-bg-panel">
          <AlertCircle className="theme-text-muted mb-2" size={32} />
          <p className="text-sm theme-text-muted font-semibold font-sans">No achievements found in this branch.</p>
          <button 
            onClick={() => setActiveFilter('all')}
            className="text-xs text-[#39ff14] mt-2 underline cursor-pointer"
          >
            Show All Milestones
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {filteredAchievements.map((ach) => {
            const isUnlocked = Boolean(achievementsRecord[ach.id]);
            const catTheme = getCategoryTheme(ach.category);
            
            return (
              <motion.div
                key={ach.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-5 rounded-2xl border transition-all duration-350 flex flex-col justify-between gap-5 relative overflow-hidden theme-bg-panel backdrop-blur-sm ${
                  isUnlocked
                    ? 'border-[#39ff14]/30 shadow-[0_0_20px_rgba(57,255,20,0.03)] opacity-100 hover:border-[#39ff14]/60'
                    : 'border-white/[0.03] opacity-55'
                }`}
              >
                {/* Background Subtle Portal Swirl Deco for Unlocked badging */}
                {isUnlocked && (
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-[#39ff14]/[0.02] filter blur-xl pointer-events-none" />
                )}

                <div className="flex flex-col gap-3 relative z-10">
                  {/* Card Upper Info Line */}
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${catTheme.badge}`}>
                      {catTheme.label}
                    </span>
                    
                    {isUnlocked ? (
                      <span className="text-[10px] text-[#39ff14] font-bold flex items-center gap-1 font-mono">
                        <CheckCircle2 size={11} /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] theme-text-muted font-semibold flex items-center gap-0.5 font-mono">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>

                  {/* Title and Icon Area */}
                  <div className="flex items-center gap-3">
                    <span 
                      className={`text-3xl shrink-0 p-2.5 rounded-xl border flex items-center justify-center transition-all theme-bg-panel ${
                        isUnlocked 
                          ? 'border-[#39ff14]/20 scale-100' 
                          : 'border-white/[0.04] scale-95 grayscale'
                      }`}
                    >
                      {ach.badgeEmoji}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <h4 className={`font-extrabold text-sm sm:text-base tracking-wide leading-tight truncate ${
                        isUnlocked ? 'theme-text-main' : 'theme-text-muted'
                      }`}>
                        {ach.name}
                      </h4>
                      <p className="text-2xs theme-text-muted font-mono mt-0.5 truncate uppercase">
                        {isUnlocked ? `ID: ${ach.id}` : 'Classified'}
                      </p>
                    </div>
                  </div>

                  {/* Description Details */}
                  <p className={`text-xs leading-relaxed font-sans ${isUnlocked ? 'theme-text-sec' : 'theme-text-muted'}`}>
                    {ach.desc}
                  </p>
                </div>

                {/* Lower Card Section (Quote OR conditions check) */}
                <div className={`mt-2 pt-3.5 border-t border-white/[0.03] flex flex-col gap-1.5 relative z-10 ${isUnlocked ? 'hidden sm:flex' : ''}`}>
                  {isUnlocked ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-bold text-[#39ff14] tracking-widest font-sans flex items-center gap-1 leading-none">
                        <Sparkles size={8} /> Rick says:
                      </span>
                      <p className="text-2xs font-serif theme-text-muted italic tracking-wide leading-relaxed">
                        &ldquo;{ach.quote}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-bold theme-text-muted tracking-widest font-sans leading-none">
                        Requirements
                      </span>
                      <p className="text-xs theme-text-muted font-medium font-mono leading-relaxed">
                        {ach.conditionDesc}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
