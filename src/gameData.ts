export type ResourceType = 'catnip' | 'wood' | 'minerals' | 'science';

export type BuildingType = 'catnipField' | 'pasture' | 'hut' | 'library' | 'barn' | 'mine';

export type JobType = 'farmer' | 'woodcutter' | 'scholar' | 'miner';

export interface GameState {
  // Resources
  resources: Record<ResourceType, { amount: number; max: number }>;
  
  // Buildings
  buildings: Record<BuildingType, number>;
  
  // Village / Kittens
  village: {
    kittens: number;
    maxKittens: number;
    jobs: Record<JobType, number>;
  };
  
  // Progression tracking
  unlocks: {
    wood: boolean;
    minerals: boolean;
    science: boolean;
    village: boolean;
  };
  
  // Timestamp
  lastTick: number;

  // Actions
  tick: (deltaSeconds: number) => void;
  gatherCatnip: () => void;
  refineWood: () => void;
  buyBuilding: (type: BuildingType) => void;
  addKitten: () => void;
  assignJob: (type: JobType, amount: 1 | -1) => void;
  resetGame: () => void; // for debug / hard reset
}

// Data definitions
export interface BuildingDef {
  name: string;
  desc: string;
  baseCost: Partial<Record<ResourceType, number>>;
  costRatio: number;
  effects: Partial<{
    catnipPerSec: number;
    maxCatnip: number;
    maxWood: number;
    maxMinerals: number;
    maxKittens: number;
    maxScience: number;
  }>;
}

export interface JobDef {
  name: string;
  desc: string;
  effects: Partial<{
    catnipPerSec: number;
    woodPerSec: number;
    sciencePerSec: number;
    mineralsPerSec: number;
  }>;
}

export const BUILDINGS: Record<BuildingType, BuildingDef> = {
  catnipField: {
    name: 'Catnip field',
    desc: 'Produces 0.63 catnip per second.',
    baseCost: { catnip: 10 },
    costRatio: 1.12,
    effects: { catnipPerSec: 0.63 }
  },
  pasture: {
    name: 'Pasture',
    desc: 'Increases max catnip by 5000.',
    baseCost: { catnip: 100, wood: 10 },
    costRatio: 1.15,
    effects: { maxCatnip: 5000 }
  },
  hut: {
    name: 'Hut',
    desc: 'Provides housing for 2 kittens.',
    baseCost: { wood: 5 },
    costRatio: 2.5,
    effects: { maxKittens: 2 }
  },
  barn: {
    name: 'Barn',
    desc: 'Increases max storage for wood and minerals.',
    baseCost: { wood: 50 },
    costRatio: 1.75,
    effects: { maxWood: 200, maxMinerals: 250 }
  },
  library: {
    name: 'Library',
    desc: 'Increases max science by 250.',
    baseCost: { wood: 25 },
    costRatio: 1.15,
    effects: { maxScience: 250 }
  },
  mine: {
    name: 'Mine',
    desc: 'Allows gathering of minerals.',
    baseCost: { wood: 100 },
    costRatio: 1.15, // standard incremental
    // No direct passive production, but enables the miner job
    effects: {}
  }
};

export const JOBS: Record<JobType, JobDef> = {
  farmer: {
    name: 'Farmer',
    desc: 'Farm catnip. Produces 5 catnip/sec.',
    effects: { catnipPerSec: 5 }
  },
  woodcutter: {
    name: 'Woodcutter',
    desc: 'Chops wood. Produces 0.09 wood/sec.',
    effects: { woodPerSec: 0.09 }
  },
  scholar: {
    name: 'Scholar',
    desc: 'Researches abstract ideas. Produces 0.18 science/sec.',
    effects: { sciencePerSec: 0.18 }
  },
  miner: {
    name: 'Miner',
    desc: 'Mines minerals deep below. Produces 0.1 minerals/sec.',
    effects: { mineralsPerSec: 0.1 }
  }
};
