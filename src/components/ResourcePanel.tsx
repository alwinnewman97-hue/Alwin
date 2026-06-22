import React from 'react';
import { GameState, ResourceType } from '../types';
import { SEASONS_DATA } from '../gameData';
import { 
  Leaf, 
  Zap, 
  Gem, 
  Anchor, 
  FlaskConical, 
  Milestone, 
  Scroll, 
  CloudSun,
  Flame,
  Volume2,
  VolumeX,
  Volume
} from 'lucide-react';
import { playClickSound, triggerHaptic } from '../utils/audio';

interface ResourcePanelProps {
  store: GameState;
  catnipRate: number;
  woodRate: number;
  scienceRate: number;
  mineralsRate: number;
  cultureRate: number;
  ironRate: number;
}

export default function ResourcePanel({
  store,
  catnipRate,
  woodRate,
  scienceRate,
  mineralsRate,
  cultureRate,
  ironRate
}: ResourcePanelProps) {

  const formatNumber = (num: number): string => {
    if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    if (num % 1 !== 0) return num.toFixed(1);
    return num.toString();
  };

  const getResourceIcon = (res: ResourceType) => {
    switch (res) {
      case 'catnip': return <Leaf size={14} className="theme-text-sec" />;
      case 'wood': return <Zap size={14} className="text-amber-400" />;
      case 'minerals': return <Gem size={14} className="theme-text-sec" />;
      case 'iron': return <Anchor size={14} className="theme-text-sec" />;
      case 'science': return <FlaskConical size={14} className="theme-text-sec" />;
      case 'culture': return <Flame size={14} className="theme-text-sec" />;
      case 'parchment': return <Scroll size={14} className="theme-text-sec" />;
      case 'beam': return <Milestone size={14} className="theme-text-sec" />;
      default: return null;
    }
  };

  const handleManualGather = () => {
    triggerHaptic('click');
    if (store.soundEnabled) playClickSound('click');
    store.gatherCatnip(1);
  };

  const handleManualRefine = () => {
    triggerHaptic('wood');
    if (store.soundEnabled) playClickSound('wood');
    store.refineResource('wood', 1);
  };

  // Helper to color the rate
  const getRateColor = (rate: number) => {
    if (rate > 0) return 'text-emerald-500 font-semibold';
    if (rate < 0) return 'text-red-500 font-bold';
    return 'theme-text-muted';
  };

  // Calculate percentages for progress bars
  const getPercent = (amount: number, max: number) => {
    if (max <= 0) return 0;
    return Math.min(100, (amount / max) * 100);
  };

  const resourcesList: { id: ResourceType; label: string; rate: number }[] = [
    { id: 'catnip', label: 'Mega Seeds', rate: catnipRate },
    { id: 'wood', label: 'Plutonium', rate: woodRate },
    { id: 'minerals', label: 'Crystals', rate: mineralsRate },
    { id: 'iron', label: 'Neutrium', rate: ironRate },
    { id: 'science', label: 'Portal Tech', rate: scienceRate },
    { id: 'culture', label: 'Schwifty Vibes', rate: cultureRate },
  ];

  const craftedList: ResourceType[] = ['beam', 'slab', 'plate', 'parchment'];

  const labelMap: Record<string, string> = {
    beam: 'Nano-Beam',
    slab: 'Hyper-Slab',
    plate: 'Neutrium Plate',
    parchment: 'Portal Formula'
  };

  const curSeason = SEASONS_DATA[store.season.current];

  const isCompact = store.density === 'compact';

  return (
    <div className={`flex flex-col xl:flex-row w-full shrink-0 transition-all duration-300 ${
      isCompact ? 'gap-3 xl:gap-4' : 'gap-6'
    }`}>
      
      {/* LEFT CLUSTER: Controls & Actions */}
      <div className={`flex flex-row items-center xl:items-start shrink-0 pb-1.5 xl:pb-0 border-b xl:border-b-0 xl:border-r theme-border border-dashed pr-0 overflow-x-auto scrollbar-none transition-all duration-300 ${
        isCompact ? 'gap-2.5 xl:gap-3.5 xl:pr-3.5' : 'gap-4 xl:gap-6 xl:pr-6'
      }`}>
        
        {/* Season & Day Info */}
        <div className={`flex flex-col shrink-0 py-0.5 font-sans transition-all duration-300 ${
          isCompact ? 'gap-1.5' : 'gap-3'
        }`}>
          <div className="flex items-center gap-1.5">
            <CloudSun size={isCompact ? 14 : 16} className="theme-text-sec shrink-0 text-cyan-400 animate-pulse" />
            <div className="flex flex-col">
              <span className={`font-extrabold theme-text-main capitalize leading-none mb-0.5 ${
                isCompact ? 'text-[11px]' : 'text-xs'
              }`}>
                {curSeason.name}
              </span>
              <span className={`theme-text-sec font-mono ${
                isCompact ? 'text-[9px]' : 'text-[10px]'
              }`}>
                <span className="hidden sm:inline">Coordinate </span>Day {store.season.daysPassed}/{store.season.totalDays}
              </span>
            </div>
          </div>
          
          <div className="flex items-center theme-bg-card rounded-lg border theme-border p-0.5 backdrop-blur-md w-max">
            {([1, 5, 25] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  store.setBuyMultiplier(m);
                  if (store.soundEnabled) playClickSound('click');
                }}
                className={`text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                  isCompact ? 'py-0.5 px-2 text-[9px]' : 'py-1 px-2.5'
                } ${
                  (store.buyMultiplier || 1) === m
                    ? 'theme-text-main bg-white/10 shadow-sm'
                    : 'theme-text-muted hover:theme-text-sec'
                }`}
              >
                {m}X
              </button>
            ))}
          </div>
        </div>

        <div className={`bg-white/5 mx-1 hidden sm:block shrink-0 transition-all duration-300 ${
          isCompact ? 'w-px h-8' : 'w-px h-10'
        }`}></div>

        {/* Manual Actions */}
        <div className="flex items-stretch gap-1.5 shrink-0 py-0.5 h-full font-sans">
          <button
            onClick={handleManualGather}
            className={`theme-bg-card hover:bg-white/5 border theme-border flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm ${
              isCompact 
                ? 'px-2.5 py-1.5 rounded-lg gap-1.0 text-2xs min-w-[62px]' 
                : 'px-4 py-2 rounded-xl gap-1.5 text-xs min-w-[72px]'
            }`}
          >
            <Leaf size={isCompact ? 12 : 14} className="text-emerald-400" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Harvest</span>
          </button>

          {store.unlocks.wood && (
            <button
              onClick={handleManualRefine}
              disabled={(store.resources.catnip?.amount ?? 0) < 100}
              className={`theme-bg-card hover:bg-white/5 border theme-border flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed ${
                isCompact 
                  ? 'px-2.5 py-1.5 rounded-lg gap-1.0 text-2xs min-w-[62px]' 
                  : 'px-4 py-2 rounded-xl gap-1.5 text-xs min-w-[72px]'
              }`}
              title="Refine 100 Mega Seeds into 1 Plutonium"
            >
              <Zap size={isCompact ? 12 : 14} className="text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Refine</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT CLUSTER: The Resource Stream */}
      <div className="flex-1 flex overflow-x-auto scrollbar-none pb-3 xl:pb-0 -mx-5 px-5 sm:mx-0 sm:px-0">
        <div className={`flex items-center w-max font-sans transition-all duration-300 ${
          isCompact ? 'gap-1.5 sm:gap-3 md:gap-4' : 'gap-2 sm:gap-4 md:gap-6'
        }`}>
          
          {resourcesList.map((res) => {
            const unlocked = res.id === 'catnip' || store.unlocks[res.id as keyof typeof store.unlocks];
            if (!unlocked) return null;

            const cur = store.resources[res.id]?.amount ?? 0;
            const limit = store.resources[res.id]?.max ?? 0;
            const showLimit = limit > 0;
            const percent = getPercent(cur, limit);

            return (
              <div key={res.id} className={`flex flex-col shrink-0 transition-all duration-300 ${
                isCompact 
                  ? 'gap-0.5 w-[75px] sm:w-[108px] xl:w-[114px]' 
                  : 'gap-1 w-[80px] sm:w-[124px] xl:w-[130px]'
              }`}>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className={`rounded-lg theme-bg-card border theme-border backdrop-blur-md shrink-0 transition-all duration-300 ${
                    isCompact ? 'p-0.5 sm:p-1' : 'p-1 sm:p-1.5'
                  }`}>
                    {getResourceIcon(res.id)}
                  </div>
                  <div className="flex flex-col col-span-2 min-w-0">
                    <span className={`font-bold uppercase tracking-wider theme-text-sec leading-none truncate max-w-[80px] hidden sm:block ${
                      isCompact ? 'text-[9px]' : 'text-[10px]'
                    }`}>{res.label}</span>
                    <span className={getRateColor(res.rate) + ` mt-0.5 leading-none font-mono ${
                      isCompact ? 'text-[8px] sm:text-[8px]' : 'text-[8px] sm:text-[9px]'
                    }`}>
                      {res.rate >= 0 ? '+' : ''}{res.rate.toFixed(1)}
                      <span className="hidden sm:inline">/s</span>
                    </span>
                  </div>
                </div>
                
                <div className="mt-0.5 sm:mt-1">
                  <div className="flex items-baseline sm:items-end justify-between font-mono mb-0.5 sm:mb-1">
                    <span className={`font-bold theme-text-main leading-none transition-all duration-300 ${
                      isCompact ? 'text-xs sm:text-xs xl:text-sm' : 'text-xs sm:text-sm xl:text-base'
                    }`}>{formatNumber(cur)}</span>
                    {showLimit && <span className={`theme-text-muted leading-none ${
                      isCompact ? 'text-3xs sm:text-[9px]' : 'text-[8px] sm:text-[10px]'
                    }`}>/{formatNumber(limit)}</span>}
                  </div>
                  
                  {showLimit && (
                    <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          percent >= 100 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : percent >= 90 ? 'bg-amber-300/80' : 'theme-bg-main bg-neutral-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Crafted Goods appended nicely */}
          {store.unlocks.workshop && craftedList.map((id) => {
            const unlocked = (store.resources[id]?.amount ?? 0) > 0 || 
              (id === 'beam' && store.researched.woodworking) || 
              (id === 'slab' && store.researched.mining) || 
              (id === 'plate' && store.researched.metalworking) || 
              (id === 'parchment' && store.researched.writing);

            if (!unlocked) return null;
            const cur = store.resources[id]?.amount ?? 0;

            return (
              <div key={id} className={`flex flex-col justify-between border-l border-dashed theme-border h-full shrink-0 transition-all duration-300 ${
                isCompact ? 'py-0.5 px-1.5 sm:px-2' : 'py-1 px-2.5 sm:px-3'
              }`}>
                <span className={`font-bold uppercase tracking-wider text-neutral-500 mt-0.5 hidden sm:block ${
                  isCompact ? 'text-[9px] mb-1' : 'text-[10px] mb-2'
                }`}>{labelMap[id] || id}</span>
                <span className="text-2xs font-bold uppercase text-neutral-500 sm:hidden block leading-none mb-1">{id === 'parchment' ? 'Form.' : labelMap[id] ? labelMap[id].split('-')[1] || labelMap[id].split(' ')[1] || labelMap[id].substring(0, 5) : id}</span>
                <span className={`font-bold theme-text-main font-mono leading-none mt-auto mb-1 transition-all duration-300 ${
                  isCompact ? 'text-xs xl:text-sm' : 'text-sm xl:text-base'
                }`}>
                   {formatNumber(cur)}
                </span>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
