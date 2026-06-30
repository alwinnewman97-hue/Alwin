import React from 'react';
import { GameState, JobType } from '../types';
import { JOBS } from '../gameData';
import { calculateJobStrengths } from '../store/useGameStore';
import { playClickSound } from '../utils/audio';
import { 
  Smile, 
  Frown, 
  Plus, 
  Minus, 
  Users, 
  Briefcase, 
  Sparkles
} from 'lucide-react';

interface TownTabProps {
  store: GameState;
}

export default function TownTab({ store }: TownTabProps) {
  const kittens = Array.isArray(store.village?.kittens) ? store.village.kittens : [];
  const maxKittens = store.village?.maxKittens || 0;
  const isCompact = store.density === 'compact';

  const jobCounts: Record<JobType | 'unemployed', number> = {
    farmer: 0,
    woodcutter: 0,
    scholar: 0,
    miner: 0,
    priest: 0,
    darkMatterScientist: 0,
    fluidEngineer: 0,
    unemployed: 0
  };

  kittens.forEach((k) => {
    if (k && k.job && jobCounts[k.job] !== undefined) {
      jobCounts[k.job]++;
    }
  });

  const freeKittens = jobCounts.unemployed;
  const jobStrengths = calculateJobStrengths(kittens);

  const handleAssignJob = (kittenId: string, job: JobType | 'unemployed') => {
    store.assignJob(kittenId, job);
    if (store.soundEnabled) playClickSound('click');
  };

  const handleAssignMultiple = (job: JobType, countToAssign: number) => {
    const idleKittens = kittens.filter(k => k.job === 'unemployed').slice(0, countToAssign);
    if (idleKittens.length > 0) {
      store.assignJobsMultiple(idleKittens.map(k => k.id), job);
      if (store.soundEnabled) playClickSound('click');
    }
  };

  const handleUnassignMultiple = (job: JobType, countToUnassign: number) => {
    const assignedKittens = kittens.filter(k => k.job === job).slice(0, countToUnassign);
    if (assignedKittens.length > 0) {
      store.assignJobsMultiple(assignedKittens.map(k => k.id), 'unemployed');
      if (store.soundEnabled) playClickSound('click');
    }
  };

  const handleUnassignAll = () => {
    store.unassignAll();
    if (store.soundEnabled) playClickSound('success');
  };

  const handleAutoAssign = (job: JobType) => {
    store.autoAssignAll(job);
    if (store.soundEnabled) playClickSound('click');
  };

  const handleSmartAssign = () => {
    const idleKittens = kittens.filter(k => k.job === 'unemployed');
    if (idleKittens.length === 0) return;

    // 1. Define active job keys and whether they are unlocked
    const availableJobs: { job: JobType; score: number }[] = [];

    // Catnip / Farmer check
    const catnipAmt = store.resources.catnip.amount;
    const catnipMax = store.resources.catnip.max || 1000;
    const catnipRatio = catnipAmt / catnipMax;
    // If food is low, or we have very few kittens and need to secure food
    let farmerScore = 0;
    if (catnipRatio < 0.2 || catnipAmt < 300) {
      farmerScore = 2.5 * (1 - catnipRatio);
    } else {
      farmerScore = 0.15 * (1 - catnipRatio);
    }
    availableJobs.push({ job: 'farmer', score: farmerScore });

    // Wood / Woodcutter
    const woodRatio = store.resources.wood.amount / (store.resources.wood.max || 1000);
    availableJobs.push({ job: 'woodcutter', score: 1.2 * (1 - woodRatio) });

    // Minerals / Miner
    if (store.unlocks.minerals) {
      const mineralsRatio = store.resources.minerals.amount / (store.resources.minerals.max || 1000);
      availableJobs.push({ job: 'miner', score: 1.4 * (1 - mineralsRatio) });
    }

    // Science / Scholar
    if (store.buildings.library > 0) {
      const scienceRatio = store.resources.science.amount / (store.resources.science.max || 1000);
      availableJobs.push({ job: 'scholar', score: 1.0 * (1 - scienceRatio) });
    }

    // Culture / Priest
    if (store.unlocks.culture && store.buildings.amphitheatre > 0) {
      const cultureRatio = store.resources.culture.amount / (store.resources.culture.max || 100000);
      availableJobs.push({ job: 'priest', score: 0.8 * (1 - cultureRatio) });
    }

    // Dark Matter / Scientist
    if (store.unlocks.darkMatter) {
      const dmRatio = store.resources.darkMatter.amount / (store.resources.darkMatter.max || 1000);
      availableJobs.push({ job: 'darkMatterScientist', score: 1.6 * (1 - dmRatio) });
    }

    // Fluid / Engineer
    if (store.unlocks.fluid) {
      const fluidRatio = store.resources.portalFluid.amount / (store.resources.portalFluid.max || 1000);
      availableJobs.push({ job: 'fluidEngineer', score: 1.8 * (1 - fluidRatio) });
    }

    // 2. Sum of all scores
    const totalScore = availableJobs.reduce((sum, j) => sum + j.score, 0);

    if (totalScore <= 0) {
      // Fallback: distribute evenly among basic unlocked jobs
      const count = availableJobs.length;
      idleKittens.forEach((k, idx) => {
        const jobToAssign = availableJobs[idx % count].job;
        store.assignJob(k.id, jobToAssign);
      });
      if (store.soundEnabled) playClickSound('success');
      return;
    }

    // 3. Allocate clones
    let assignedCount = 0;
    const assignments: Record<JobType, string[]> = {
      farmer: [],
      woodcutter: [],
      scholar: [],
      miner: [],
      priest: [],
      darkMatterScientist: [],
      fluidEngineer: []
    };

    // Calculate ideal share
    const jobsWithShares = availableJobs.map(j => {
      const idealShare = (j.score / totalScore) * idleKittens.length;
      return {
        job: j.job,
        idealShare,
        floorShare: Math.floor(idealShare)
      };
    });

    // First pass: assign the floor count
    jobsWithShares.forEach(js => {
      const toAssign = js.floorShare;
      for (let i = 0; i < toAssign; i++) {
        if (assignedCount < idleKittens.length) {
          assignments[js.job].push(idleKittens[assignedCount].id);
          assignedCount++;
        }
      }
    });

    // Second pass: distribute the remaining fraction to jobs with highest decimals
    const remainders = jobsWithShares
      .map(js => ({ job: js.job, rem: js.idealShare - js.floorShare }))
      .sort((a, b) => b.rem - a.rem);

    for (let i = 0; i < remainders.length; i++) {
      if (assignedCount >= idleKittens.length) break;
      assignments[remainders[i].job].push(idleKittens[assignedCount].id);
      assignedCount++;
    }

    // 4. Batch assign in store
    Object.entries(assignments).forEach(([job, ids]) => {
      if (ids.length > 0) {
        store.assignJobsMultiple(ids, job as JobType);
      }
    });

    if (store.soundEnabled) playClickSound('success');
  };

  return (
    <div className="flex flex-col flex-1 pb-10">
      
      {/* COMPACT TOWN HUD */}
      <div className={`flex justify-between items-center border-b theme-border transition-all duration-300 ${
        isCompact ? 'pb-3 mx-2 mt-2 gap-2' : 'pb-6 mx-2 sm:mx-6 mt-4'
      }`}>
        <span className={`uppercase font-bold theme-text-muted tracking-widest leading-none ${
          isCompact ? 'text-[9px]' : 'text-[10px]'
        }`}>Clone Command Centre</span>
        <div className={`flex flex-wrap items-center gap-y-2 text-sm select-none transition-all ${
          isCompact ? 'gap-x-4 text-xs' : 'gap-x-6'
        }`}>
          <div className="flex items-center gap-2 font-mono theme-text-main leading-none">
            <Users size={isCompact ? 12 : 14} className="theme-text-muted" />
            <span>{kittens.length}<span className="theme-text-muted opacity-50">/{maxKittens}</span></span>
          </div>

          <div className="flex items-center gap-2 theme-text-muted font-mono leading-none">
            <span>Moraly: {store.village.happiness}%</span>
          </div>

          <div className={`font-mono leading-none ${freeKittens > 0 ? 'text-cyan-400 font-bold' : 'theme-text-muted opacity-50'}`}>
            Idle: {freeKittens}
          </div>
        </div>
      </div>

      {/* QUICK LABOUR ACTIONS */}
      <div className={`flex flex-wrap items-center select-none transition-all duration-300 ${
        isCompact ? 'gap-2 mx-2 mt-4 mb-4' : 'gap-3 mx-2 sm:mx-6 mt-6 mb-8'
      }`}>
        {kittens.length < maxKittens && (
          <button
            onClick={() => {
              store.forceAddKitten();
              if (store.soundEnabled) playClickSound('success');
            }}
            className={`uppercase tracking-widest font-bold theme-text-main theme-bg-hover hover:theme-bg-panel rounded-full transition-all active:scale-95 cursor-pointer ${
              isCompact ? 'text-[9px] px-4 py-2' : 'text-[10px] px-6 py-3'
            }`}
          >
            Clone Alternate
          </button>
        )}

        {kittens.length > 0 && freeKittens < kittens.length && (
          <button
            onClick={handleUnassignAll}
            className={`uppercase tracking-widest font-bold theme-text-muted border theme-border hover:theme-text-main rounded-full transition-colors cursor-pointer ${
              isCompact ? 'text-[9px] px-4 py-2' : 'text-[10px] px-6 py-3'
            }`}
          >
            Recall All
          </button>
        )}

        {kittens.length > 0 && (
          <button
            onClick={handleSmartAssign}
            disabled={freeKittens === 0}
            className={`uppercase tracking-widest font-bold flex items-center gap-2 rounded-full transition-all cursor-pointer ${
              freeKittens > 0 
                ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.08)] active:scale-95' 
                : 'text-slate-600 border border-slate-800 opacity-40 cursor-not-allowed'
            } ${
              isCompact ? 'text-[9px] px-4 py-2' : 'text-[10px] px-6 py-3'
            }`}
          >
            <Sparkles size={isCompact ? 11 : 13} className={freeKittens > 0 ? "animate-pulse" : ""} />
            Smart Assign
          </button>
        )}
      </div>

      {/* JOBS SECTION */}
      <div className={`grid grid-cols-1 md:grid-cols-2 transition-all duration-300 ${
        isCompact ? 'gap-3' : 'gap-4 lg:gap-6'
      }`}>
        {(Object.entries(JOBS) as [JobType, typeof JOBS[JobType]][]).map(([id, job]) => {
          if (id === 'miner' && !store.unlocks.minerals) return null;
          if (id === 'scholar' && store.buildings.library === 0) return null;
          if (id === 'priest' && (!store.unlocks.culture || store.buildings.amphitheatre === 0)) return null;
          if (id === 'darkMatterScientist' && !store.unlocks.darkMatter) return null;
          if (id === 'fluidEngineer' && !store.unlocks.fluid) return null;

          const count = jobCounts[id];

          return (
            <div 
              key={id}
              className={`flex flex-col justify-between transition-all duration-300 border theme-border hover:theme-border theme-bg-card/50 backdrop-blur-md ${
                isCompact ? 'p-3.5 gap-2.5' : 'p-5 lg:p-6 gap-4'
              }`}
            >
              <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-3 w-full`}>
                <div className={`flex items-center min-w-0 transition-all ${isCompact ? 'gap-2.5' : 'gap-4'}`}>
                  <span className={`shrink-0 transition-all ${isCompact ? 'text-xl' : 'text-2xl'}`}>
                    {id === 'farmer' ? '🌱' : id === 'woodcutter' ? '⚡' : id === 'scholar' ? '🔬' : id === 'miner' ? '⛏️' : id === 'darkMatterScientist' ? '🌑' : id === 'fluidEngineer' ? '🧪' : '🔊'}
                  </span>
                  <div className={`min-w-0 flex flex-col ${isCompact ? 'gap-0.5' : 'gap-1.5'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium tracking-wide theme-text-main leading-none transition-all ${
                        isCompact ? 'text-sm' : 'text-lg'
                      }`}>{job.name}</span>
                      {count > 0 && (
                        <span className={`font-mono font-bold theme-accent-bg leading-none rounded-sm ${
                          isCompact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
                        }`}>
                          {count}
                        </span>
                      )}
                    </div>
                    <span className={`text-emerald-500 font-mono leading-none ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>{job.effectsDesc}</span>
                    {count > 0 && jobStrengths[id as JobType] > count && (
                      <span className="text-[10px] text-emerald-400 font-mono leading-none mt-1">
                        ✨ Output multiplier: {(jobStrengths[id as JobType]).toFixed(2)}x (Clone levels + traits)
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct quick action assigners */}
                <div className="flex items-center gap-1.5 shrink-0 self-start xl:self-center">
                  <button 
                    onClick={() => handleUnassignMultiple(id, store.buyMultiplier === 'max' ? 99999 : (store.buyMultiplier || 1))}
                    disabled={count === 0}
                    className={`flex items-center justify-center bg-transparent border theme-border theme-text-main hover:theme-bg-hover disabled:opacity-20 rounded-full active:scale-95 transition-all cursor-pointer ${
                      isCompact ? 'w-8 h-8' : 'w-10 h-10'
                    }`}
                  >
                    <Minus size={isCompact ? 12 : 14} />
                  </button>

                  <button 
                    onClick={() => handleAutoAssign(id)}
                    className={`flex items-center justify-center uppercase font-bold theme-text-muted hover:theme-text-main transition-colors cursor-pointer ${
                      isCompact ? 'px-2 h-8 text-[9px]' : 'px-3 h-10 text-[10px]'
                    }`}
                  >
                    All
                  </button>

                  <button 
                    onClick={() => handleAssignMultiple(id, store.buyMultiplier === 'max' ? 99999 : (store.buyMultiplier || 1))}
                    disabled={freeKittens === 0}
                    className={`flex items-center justify-center bg-transparent border theme-border theme-text-main hover:theme-bg-hover disabled:opacity-20 rounded-full active:scale-95 transition-all cursor-pointer ${
                      isCompact ? 'w-8 h-8' : 'w-10 h-10'
                    }`}
                  >
                    <Plus size={isCompact ? 12 : 14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INDIVIDUAL KITTENS POPULATION MATRIX */}
      {kittens.length > 0 && (
        <div className="mt-12 mx-2 sm:mx-6 select-none animate-fadeIn">
          <span className="text-[10px] uppercase font-bold theme-text-muted tracking-widest leading-none block mb-6">Portal Clone Directory</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
            {kittens.map((kitten) => (
              <div 
                key={kitten.id}
                className="p-4 border theme-border hover:theme-border-active transition-colors theme-bg-card flex flex-col justify-between gap-4"
              >
                <div className="min-w-0">
                  <span className="font-bold text-sm tracking-wide theme-text-main block truncate leading-tight mb-1.5">
                    {kitten.name} {kitten.surname}
                  </span>
                  <span className="text-[10px] theme-text-muted font-mono block uppercase">
                    GEN {kitten.level} • {kitten.trait || 'Normal'}
                  </span>
                </div>

                {/* Job Dropdown Selection */}
                <select
                  value={kitten.job}
                  onChange={(e) => handleAssignJob(kitten.id, e.target.value as any)}
                  className="theme-bg-app border theme-border theme-text-main text-[11px] px-3 py-2 shrink-0 focus:outline-none focus:theme-border cursor-pointer font-sans"
                >
                  <option value="unemployed">💤 Idle</option>
                  <option value="farmer">🌱 Mega-Seed Cultivator</option>
                  <option value="woodcutter">⚡ Plutonium Harvester</option>
                  {store.buildings.library > 0 && (
                    <option value="scholar">🔬 Lab Assistant</option>
                  )}
                  {store.unlocks.minerals && (
                    <option value="miner">⛏️ Crystal Digger</option>
                  )}
                  {store.unlocks.culture && store.buildings.amphitheatre > 0 && (
                    <option value="priest">🔊 Schwifty Chanter</option>
                  )}
                  {store.unlocks.darkMatter && (
                    <option value="darkMatterScientist">🌑 Dark Matter Scientist</option>
                  )}
                  {store.unlocks.fluid && (
                    <option value="fluidEngineer">🧪 Fluid Engineer</option>
                  )}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
