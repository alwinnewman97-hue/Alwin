/**
 * Procedural minimalist synthesizer using Web Audio API for a vintage tactile clicking feel.
 * Runs completely client-side with zero external assets, perfect for robust offline PWAs.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playClickSound(soundType: 'click' | 'success' | 'build' | 'research' | 'wood' | 'error' = 'click') {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (soundType === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } 
    else if (soundType === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.08);
      osc.frequency.setValueAtTime(659, now + 0.16);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.24);
    } 
    else if (soundType === 'build') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(250, now + 0.12);
      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } 
    else if (soundType === 'research') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2); // C6
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
    else if (soundType === 'wood') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.1);
      gainNode.gain.setValueAtTime(0.09, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
    else if (soundType === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.setValueAtTime(100, now + 0.1);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (err) {
    // browser blocked or unsupported context
  }
}

/**
 * Triggers standard lightweight device vibration patterns on supported mobile environments
 */
export function triggerHaptic(type: 'click' | 'success' | 'build' | 'research' | 'wood' | 'error') {
  try {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      if (type === 'build') {
        navigator.vibrate(22); // Single punchy tactile click for building construction
      } else if (type === 'research') {
        navigator.vibrate([15, 30, 20]); // double pulse pattern for smart dimensional breakthrough
      } else if (type === 'success') {
        navigator.vibrate([15, 45, 15]); // joyous rapid double tap for progress milestones
      } else if (type === 'wood') {
        navigator.vibrate(10); // Extra short micro-tap for physical manual gathering clicks
      } else if (type === 'click') {
        navigator.vibrate(8); // Soft micro-vibration for general menu elements
      } else if (type === 'error') {
        navigator.vibrate([40, 50, 40]); // Dual buzz alert pattern for failed constraints
      }
    }
  } catch (err) {
    // Unsupported or blocked context
  }
}
