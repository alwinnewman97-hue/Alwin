import React from 'react';
import { GameState } from '../types';
import { Settings, Zap, RotateCcw } from 'lucide-react';

interface SettingsTabProps {
  store: GameState;
}

export default function SettingsTab({ store }: SettingsTabProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto p-6 animate-fade-in">
      <h2 className="text-2xl font-black text-white flex items-center gap-3">
        <Settings className="text-[#39ff14]" />
        Multiversal Settings
      </h2>
      
      <div className="bg-neutral-950/30 p-6 rounded-2xl border border-white/[0.04]">
        <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">
          Core Timeline Management
        </h3>
        <div className="flex justify-between items-center bg-neutral-900/50 p-4 rounded-xl">
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <Zap className="text-yellow-400" size={16} />
              Portal Flux Points
            </div>
            <div className="text-neutral-400 text-sm">Global production multiplier: +{store.portalFlux * 10}%</div>
          </div>
          <div className="text-3xl font-black text-[#39ff14]">{store.portalFlux}</div>
        </div>
        
        <button
          onClick={store.multiversalReset}
          className="w-full mt-6 flex items-center justify-center gap-3 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 p-4 rounded-xl font-bold uppercase tracking-wide transition-all"
        >
          <RotateCcw size={18} />
          Multiversal Reset
        </button>
      </div>
    </div>
  );
}
