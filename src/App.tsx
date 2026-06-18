import React, { useEffect, useState } from 'react';
import { Leaf, Pickaxe, Hammer, GraduationCap, Flame, Building, Users } from 'lucide-react';
import { useGameStore, calculateCost } from './store/useGameStore';
import { BUILDINGS, BuildingType, JOBS, JobType } from './gameData';

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  if (num % 1 !== 0) return num.toFixed(2);
  return num.toString();
}

export default function App() {
  const store = useGameStore();
  const [activeTab, setActiveTab] = useState<'bonfire' | 'village'>('bonfire');

  // Core Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const delta = Math.min(now - lastTime, 1000); // cap max instant delta to 1 second during active tab to prevent huge spikes if frame drops, offline catchup handled elsewhere or directly in tick.
      // Actually because we pass deltaSeconds directly, if we switch tabs and delay is bigger, we just pass the larger delta.
      const deltaSeconds = (now - lastTime) / 1000;
      
      // if offline time is big, React batches it.
      store.tick(deltaSeconds);
      
      lastTime = now;
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Initial offline catchup
    const now = Date.now();
    const offlineSeconds = (now - store.lastTick) / 1000;
    if (offlineSeconds > 5) {
       console.log(`Offline progress catching up: ${offlineSeconds.toFixed(1)}s`);
       // We pass the big chunk once to let the system simulate it
       store.tick(offlineSeconds);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, []); // single init

  // Derived metrics for UI
  const usedKittens = Object.values(store.village.jobs).reduce((a, b) => a + b, 0);
  const freeKittens = store.village.kittens - usedKittens;
  
  // Per-second calculations for display
  const catnipRate = store.buildings.catnipField * (BUILDINGS.catnipField.effects.catnipPerSec || 0) + store.village.jobs.farmer * (JOBS.farmer.effects.catnipPerSec || 0) - (store.village.kittens * 4.25);
  const woodRate = store.village.jobs.woodcutter * (JOBS.woodcutter.effects.woodPerSec || 0);
  const scienceRate = store.village.jobs.scholar * (JOBS.scholar.effects.sciencePerSec || 0);

  return (
    <div className="flex flex-col min-h-screen font-mono text-sm sm:text-base border-t-4 border-gray-600 bg-gray-900 text-gray-300">
      
      {/* HEADER SECTION */}
      <header className="p-4 border-b border-gray-800 shrink-0 w-full flex justify-between items-center">
         <div>
            <h1 className="text-xl font-bold tracking-widest text-gray-100 flex items-center gap-2">
              <Flame size={20} className="text-orange-500" />
              KITTENS GAME
            </h1>
         </div>
         <div className="flex gap-4">
            <button onClick={store.resetGame} className="text-xs text-gray-600 hover:text-red-500 hover:underline transition-colors">
               Wipe Save
            </button>
         </div>
      </header>

      {/* THREE COLUMN LAYOUT OR TWO COLUMN responsive */}
      <div className="flex flex-1 flex-col md:flex-row max-h-[calc(100vh-64px)] overflow-hidden">
        
        {/* LEFT COLUMN: RESOURCES (Always visible on desktop) */}
        <aside className="w-full md:w-64 border-r border-gray-800 p-4 flex flex-col gap-6 md:overflow-y-auto shrink-0 z-10 bg-gray-900 border-b md:border-b-0">
           <div className="flex flex-col gap-2">
             <button 
                onClick={store.gatherCatnip}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-200 p-3 rounded font-bold border border-gray-700 flex justify-center items-center select-none transition-transform active:scale-[0.98]"
              >
               Gather Catnip
             </button>
             
             {store.unlocks.wood && (
                <button 
                  onClick={store.refineWood}
                  disabled={store.resources.catnip.amount < 100}
                  className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 p-2 rounded border border-gray-700 select-none text-xs"
                >
                 Refine catnip to wood (100)
               </button>
             )}
           </div>

           <div>
              <h2 className="text-xs uppercase tracking-widest font-bold mb-3 text-gray-500">Resources</h2>
              <table className="w-full text-left text-sm">
                <tbody>
                  <tr className={catnipRate < 0 ? 'text-red-400' : ''}>
                    <td className="py-1">Catnip</td>
                    <td className="text-right py-1">
                      {formatNumber(store.resources.catnip.amount)} 
                      <span className="text-xs text-gray-500 ml-1">/ {formatNumber(store.resources.catnip.max)}</span>
                    </td>
                    <td className="w-12 text-right text-xs text-gray-500 ml-2">
                       {catnipRate > 0 ? '+' : ''}{catnipRate.toFixed(2)}/s
                    </td>
                  </tr>
                  {store.unlocks.wood && (
                    <tr>
                      <td className="py-1">Wood</td>
                      <td className="text-right py-1">
                        {formatNumber(store.resources.wood.amount)}
                        <span className="text-xs text-gray-500 ml-1">/ {formatNumber(store.resources.wood.max)}</span>
                      </td>
                      <td className="w-12 text-right text-xs text-gray-500 ml-2">
                         {woodRate > 0 ? '+' : ''}{woodRate.toFixed(2)}/s
                      </td>
                    </tr>
                  )}
                  {store.unlocks.minerals && (
                    <tr>
                      <td className="py-1">Minerals</td>
                      <td className="text-right py-1">
                        {formatNumber(store.resources.minerals.amount)}
                        <span className="text-xs text-gray-500 ml-1">/ {formatNumber(store.resources.minerals.max)}</span>
                      </td>
                      <td className="w-12 text-right text-xs text-gray-500 ml-2"></td>
                    </tr>
                  )}
                  {store.unlocks.science && (
                    <tr>
                      <td className="py-1 text-blue-300">Science</td>
                      <td className="text-right py-1 text-blue-300">
                        {formatNumber(store.resources.science.amount)}
                        <span className="text-xs text-blue-900 ml-1">/ {formatNumber(store.resources.science.max)}</span>
                      </td>
                      <td className="w-12 text-right text-xs text-blue-500 ml-2">
                         {scienceRate > 0 ? '+' : ''}{scienceRate.toFixed(2)}/s
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {store.unlocks.village && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                   <h2 className="text-xs uppercase tracking-widest font-bold mb-3 text-gray-500">Population</h2>
                   <div className="flex justify-between text-sm">
                      <span>Kittens</span>
                      <span>{store.village.kittens} / {store.village.maxKittens}</span>
                   </div>
                   <div className="text-xs text-gray-500 mt-1">
                      {freeKittens > 0 ? `${freeKittens} free kittens` : 'All assigned'}
                   </div>
                </div>
              )}
           </div>
        </aside>

        {/* RIGHT COLUMN: TABS & ACTION AREA */}
        <main className="flex-1 flex flex-col md:overflow-y-auto">
           {/* TABS NAV */}
           <nav className="flex p-2 gap-2 border-b border-gray-800 bg-gray-900 sticky top-0 z-10 w-full overflow-x-auto">
             <button
                onClick={() => setActiveTab('bonfire')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'bonfire' ? 'bg-gray-800 text-white rounded' : 'text-gray-500 hover:text-gray-300'}`}
             >
                Bonfire
             </button>
             {store.unlocks.village && (
                <button
                  onClick={() => setActiveTab('village')}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'village' ? 'bg-gray-800 text-white rounded' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Users size={14} />
                  Small Village
                </button>
             )}
           </nav>

           {/* TAB CONTENT: BONFIRE (Buildings) */}
           {activeTab === 'bonfire' && (
              <div className="p-4 md:p-8 max-w-3xl flex flex-col gap-4">
                 <h2 className="text-lg font-medium text-gray-400 mb-2 border-b border-gray-800 pb-2">Buildings</h2>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {(Object.entries(BUILDINGS) as [BuildingType, typeof BUILDINGS[BuildingType]][]).map(([id, b]) => {
                      // Logic to hide buildings if prerequisites aren't met
                      if (id === 'pasture' && !store.unlocks.wood) return null;
                      if (id === 'library' && !store.unlocks.wood) return null;
                      if (id === 'barn' && store.buildings.wood == null && !store.unlocks.wood) return null; // wait till wood exists
                      if (id === 'mine' && store.resources.wood.amount < 50 && store.buildings.library === 0) return null; // reveal later

                      const count = store.buildings[id];
                      
                      // Check affordability
                      let canAfford = true;
                      const costsNode = Object.entries(b.baseCost).map(([res, cost]) => {
                         const currentCost = calculateCost(cost as number, b.costRatio, count);
                         const isAffordable = store.resources[res as ResourceType]?.amount >= currentCost;
                         if (!isAffordable) canAfford = false;
                         return (
                           <span key={res} className={`text-xs block ${isAffordable ? 'text-gray-400' : 'text-red-500'}`}>
                              {res}: {formatNumber(currentCost)}
                           </span>
                         );
                      });

                      return (
                        <div key={id} className={`border p-3 rounded flex flex-col justify-between ${canAfford ? 'border-gray-600 bg-gray-800/30' : 'border-gray-800 bg-gray-900'}`}>
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-gray-200">{b.name} <span className="ml-2 text-gray-500">{count}</span></h3>
                                <p className="text-xs text-gray-500 max-w-[200px] mt-1 line-clamp-2">{b.desc}</p>
                              </div>
                              <button 
                                onClick={() => store.buyBuilding(id)}
                                disabled={!canAfford}
                                className={`px-3 py-1 text-xs border rounded-sm transition-colors ${canAfford ? 'bg-gray-700 hover:bg-gray-600 border-gray-500 text-white cursor-pointer active:scale-95' : 'bg-transparent border-gray-800 text-gray-600 cursor-not-allowed'}`}
                              >
                                Build
                              </button>
                           </div>
                           <div className="mt-2 pt-2 border-t border-gray-800 flex gap-2">
                             <div>
                               <span className="text-[10px] uppercase text-gray-600 block leading-none mb-1">Cost</span>
                               {costsNode}
                             </div>
                           </div>
                        </div>
                      )
                   })}
                 </div>
              </div>
           )}

           {/* TAB CONTENT: VILLAGE (Jobs) */}
           {activeTab === 'village' && (
              <div className="p-4 md:p-8 max-w-2xl flex flex-col gap-4">
                 <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
                    <h2 className="text-lg font-medium text-gray-400">Job Assignments</h2>
                    <div className="text-sm">
                       Free Kittens: <span className={freeKittens > 0 ? "text-green-400 font-bold" : "text-gray-500"}>{freeKittens}</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                   <table className="w-full text-left bg-gray-800/20 rounded">
                      <thead>
                        <tr className="border-b border-gray-800 text-xs uppercase text-gray-500">
                           <th className="font-normal p-3 w-1/3">Job</th>
                           <th className="font-normal p-3">Allocated</th>
                           <th className="font-normal p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Object.entries(JOBS) as [JobType, typeof JOBS[JobType]][]).map(([id, job]) => {
                           // hide miner if mining isn't unlocked
                           if (id === 'miner' && !store.unlocks.minerals) return null;
                           // hide scholar if library not built
                           if (id === 'scholar' && store.buildings.library === 0) return null;

                           const count = store.village.jobs[id];
                           return (
                             <tr key={id} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                                <td className="p-3">
                                   <div className="font-medium text-gray-300">{job.name}</div>
                                   <div className="text-[10px] text-gray-500 mt-1 max-w-[150px]">{job.desc}</div>
                                </td>
                                <td className="p-3">
                                   <span className="font-bold text-gray-200">{count}</span>
                                </td>
                                <td className="p-3 text-right">
                                   <div className="flex justify-end gap-1">
                                      <button 
                                        onClick={() => store.assignJob(id, -1)}
                                        disabled={count === 0}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-red-900/50 text-gray-400 disabled:opacity-30 disabled:hover:bg-gray-800 border border-gray-700 rounded active:scale-95 transition-all text-lg font-bold"
                                      >
                                        -
                                      </button>
                                      <button 
                                        onClick={() => store.assignJob(id, 1)}
                                        disabled={freeKittens === 0}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-green-900/50 text-gray-400 disabled:opacity-30 disabled:hover:bg-gray-800 border border-gray-700 rounded active:scale-95 transition-all text-lg font-bold"
                                      >
                                        +
                                      </button>
                                   </div>
                                </td>
                             </tr>
                           )
                        })}
                      </tbody>
                   </table>
                 </div>
              </div>
           )}

        </main>
      </div>

    </div>
  );
}
