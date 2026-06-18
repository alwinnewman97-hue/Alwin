import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BuildingType, BUILDINGS, GameState, JobType, JOBS, ResourceType } from '../gameData';

const BASE_RESOURCES = {
  catnip: { amount: 0, max: 5000 },
  wood: { amount: 0, max: 200 },
  minerals: { amount: 0, max: 0 },
  science: { amount: 0, max: 0 },
};

const BASE_BUILDINGS: Record<BuildingType, number> = {
  catnipField: 0,
  pasture: 0,
  hut: 0,
  barn: 0,
  library: 0,
  mine: 0
};

const BASE_JOBS: Record<JobType, number> = {
  farmer: 0,
  woodcutter: 0,
  scholar: 0,
  miner: 0
};

// Pure function for calculating price.
export const calculateCost = (baseCost: number, ratio: number, amount: number) => {
  return baseCost * Math.pow(ratio, amount);
};

// Initial state template
const initialState = {
  resources: BASE_RESOURCES,
  buildings: BASE_BUILDINGS,
  village: {
    kittens: 0,
    maxKittens: 0,
    jobs: BASE_JOBS,
  },
  unlocks: {
    wood: false,
    minerals: false,
    science: false,
    village: false,
  },
  lastTick: Date.now(),
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      tick: (deltaSeconds: number) => {
        const state = get();
        // Prevent massive offline skips from causing NaN or extreme over-allocations
        // We clamp deltaSeconds to 10 days max to prevent weird integer overflows, though JS is ok.
        const effectiveDelta = Math.min(deltaSeconds, 864000); 

        // 1. Calculate limits from buildings
        let maxCatnip = 5000 + (state.buildings.pasture * (BUILDINGS.pasture.effects.maxCatnip || 0));
        let maxWood = 200 + (state.buildings.barn * (BUILDINGS.barn.effects.maxWood || 0));
        let maxMinerals = (state.buildings.barn * (BUILDINGS.barn.effects.maxMinerals || 0));
        let maxScience = (state.buildings.library * (BUILDINGS.library.effects.maxScience || 0));
        let maxKittens = (state.buildings.hut * (BUILDINGS.hut.effects.maxKittens || 0));

        // 2. Calculate rates per second
        let catnipRate = state.buildings.catnipField * (BUILDINGS.catnipField.effects.catnipPerSec || 0)
                       + state.village.jobs.farmer * (JOBS.farmer.effects.catnipPerSec || 0);
        
        // Kitten food consumption (4.25 catnip / sec per kitten)
        const kittenEatsRate = state.village.kittens * 4.25;
        
        let woodRate = state.village.jobs.woodcutter * (JOBS.woodcutter.effects.woodPerSec || 0);
        let scienceRate = state.village.jobs.scholar * (JOBS.scholar.effects.sciencePerSec || 0);
        let mineralsRate = state.village.jobs.miner * (JOBS.miner.effects.mineralsPerSec || 0);

        // 3. Apply rates logic (incorporating offline logic chunking approx)
        let catnipAmt = state.resources.catnip.amount;
        let woodAmt = state.resources.wood.amount;
        let scienceAmt = state.resources.science.amount;
        let mineralsAmt = state.resources.minerals.amount;
        
        // Compute new catnip after production & consumption
        catnipAmt += (catnipRate - kittenEatsRate) * effectiveDelta;
        
        let starvingPenalty = 1;
        if (catnipAmt < 0) {
          // If we run out of food, kittens stop producing (offline penalty simple approximation)
          catnipAmt = 0;
          starvingPenalty = 0; // stop other yields if starving
        }

        woodAmt += (woodRate * starvingPenalty) * effectiveDelta;
        scienceAmt += (scienceRate * starvingPenalty) * effectiveDelta;
        mineralsAmt += (mineralsRate * starvingPenalty) * effectiveDelta;

        // 4. Clamp to max
        catnipAmt = Math.min(catnipAmt, maxCatnip);
        woodAmt = Math.min(woodAmt, maxWood);
        scienceAmt = Math.min(scienceAmt, maxScience);
        mineralsAmt = Math.min(mineralsAmt, maxMinerals);

        // 5. Automatic Unlocks logic
        const unlocks = { ...state.unlocks };
        // Unlock wood when you refine or hit 100 catnip? Actually, let's unlock it as soon as we have catnip fields or enough catnip.
        if (!unlocks.wood && (catnipAmt >= 100 || state.buildings.catnipField > 0)) unlocks.wood = true;
        if (!unlocks.village && maxKittens > 0) unlocks.village = true;
        if (!unlocks.science && state.buildings.library > 0) unlocks.science = true;
        if (!unlocks.minerals && state.buildings.mine > 0) unlocks.minerals = true;

        // Auto kitten arrival logic: Every time we tick, there is a small chance to get a kitten if housing is available and we have mostly full catnip
        let kittens = state.village.kittens;
        if (kittens < maxKittens && catnipAmt > (maxCatnip * 0.1)) {
          // approx 1 kitten per 20 seconds
          if (Math.random() < 0.05 * effectiveDelta) {
            kittens++;
          }
        }

        set({
          lastTick: Date.now(),
          unlocks,
          resources: {
            catnip: { amount: catnipAmt, max: maxCatnip },
            wood: { amount: woodAmt, max: maxWood },
            science: { amount: scienceAmt, max: maxScience },
            minerals: { amount: mineralsAmt, max: maxMinerals }
          },
          village: {
            ...state.village,
            kittens,
            maxKittens
          }
        });
      },

      gatherCatnip: () => set((state) => {
        const amt = Math.min(state.resources.catnip.amount + 1, state.resources.catnip.max);
        const unlocks = { ...state.unlocks };
        if (amt >= 100) unlocks.wood = true;
        return {
          resources: { ...state.resources, catnip: { ...state.resources.catnip, amount: amt } },
          unlocks
        };
      }),

      refineWood: () => set((state) => {
        if (state.resources.catnip.amount >= 100) {
          const woodAmt = Math.min(state.resources.wood.amount + 1, state.resources.wood.max);
          // If max limit hit, do we still consume catnip? Real kittens says yes, but let's be nice.
          if (woodAmt <= state.resources.wood.max && state.resources.wood.amount < state.resources.wood.max) {
             return {
               resources: {
                 ...state.resources,
                 catnip: { ...state.resources.catnip, amount: state.resources.catnip.amount - 100 },
                 wood: { ...state.resources.wood, amount: woodAmt }
               }
             };
          }
        }
        return state;
      }),

      buyBuilding: (type: BuildingType) => set((state) => {
        const building = BUILDINGS[type];
        const count = state.buildings[type];
        
        // Calculate costs
        let canAfford = true;
        const newResources = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
        
        for (const [res, baseCost] of Object.entries(building.baseCost)) {
          const resType = res as ResourceType;
          const cost = calculateCost(baseCost, building.costRatio, count);
          if (newResources[resType].amount < cost) {
            canAfford = false;
            break;
          }
        }

        if (canAfford) {
          // Deduct
          for (const [res, baseCost] of Object.entries(building.baseCost)) {
            const resType = res as ResourceType;
            const cost = calculateCost(baseCost, building.costRatio, count);
            newResources[resType].amount -= cost;
          }
          return {
            resources: newResources,
            buildings: {
              ...state.buildings,
              [type]: count + 1
            }
          };
        }
        return state;
      }),

      addKitten: () => set((state) => {
         // Manual fallback method for debug/cheat or forcing arrival if stuck
         if(state.village.kittens < state.village.maxKittens) {
            return {
              village: { ...state.village, kittens: state.village.kittens + 1 }
            }
         }
         return state;
      }),

      assignJob: (type: JobType, amount: 1 | -1) => set((state) => {
        const usedKittens = Object.values(state.village.jobs).reduce((a, b) => a + b, 0);
        const currentJobCount = state.village.jobs[type];
        
        if (amount === 1) {
          // Assigning
          if (usedKittens < state.village.kittens) {
            return {
              village: {
                ...state.village,
                jobs: { ...state.village.jobs, [type]: currentJobCount + 1 }
              }
            };
          }
        } else {
          // Unassigning
          if (currentJobCount > 0) {
             return {
              village: {
                ...state.village,
                jobs: { ...state.village.jobs, [type]: currentJobCount - 1 }
              }
            };
          }
        }
        return state;
      }),
      
      resetGame: () => {
         // Wipes the game and restarts
         set({
           ...initialState,
           lastTick: Date.now()
         });
      }
    }),
    {
      name: 'kittens-incremental-storage', // unique name for local storage
    }
  )
);
