'use client';
import { useCallback, useRef } from 'react';
import { useDesktopStore } from '@/stores/desktopStore';

// Programmatic Web Audio API sounds — no files needed!
export function useSound() {
  const { soundEnabled } = useDesktopStore();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) => {
      if (!soundEnabled) return;
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(frequency * 0.8, ctx.currentTime + duration);
        gainNode.gain.setValueAtTime(gain, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Audio context errors silently
      }
    },
    [soundEnabled, getCtx]
  );

  const sounds = {
    click: () => playTone(800, 0.05, 'square', 0.08),
    windowOpen: () => {
      playTone(440, 0.1, 'sine', 0.1);
      setTimeout(() => playTone(660, 0.15, 'sine', 0.1), 80);
    },
    windowClose: () => {
      playTone(660, 0.1, 'sine', 0.1);
      setTimeout(() => playTone(440, 0.15, 'sine', 0.1), 80);
    },
    coinDrop: () => {
      playTone(1200, 0.05, 'square', 0.12);
      setTimeout(() => playTone(900, 0.1, 'sine', 0.1), 50);
      setTimeout(() => playTone(600, 0.2, 'sine', 0.08), 120);
    },
    capsuleOpen: () => {
      playTone(523, 0.1, 'sine', 0.1);
      setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 100);
      setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 200);
      setTimeout(() => playTone(1047, 0.3, 'sine', 0.15), 300);
    },
    success: () => {
      const notes = [523, 659, 784, 1047];
      notes.forEach((note, i) => {
        setTimeout(() => playTone(note, 0.2, 'sine', 0.12), i * 100);
      });
    },
    error: () => {
      playTone(200, 0.15, 'square', 0.12);
      setTimeout(() => playTone(150, 0.2, 'square', 0.1), 150);
    },
    unlock: () => {
      playTone(440, 0.1, 'sine', 0.1);
      setTimeout(() => playTone(554, 0.1, 'sine', 0.1), 100);
      setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 200);
      setTimeout(() => playTone(880, 0.3, 'sine', 0.15), 300);
    },
    startup: () => {
      const melody = [261, 329, 392, 523, 659, 784];
      melody.forEach((note, i) => {
        setTimeout(() => playTone(note, 0.3, 'sine', 0.1), i * 120);
      });
    },
    cassette: () => {
      playTone(300, 0.05, 'square', 0.08);
      setTimeout(() => playTone(250, 0.1, 'square', 0.06), 60);
    },
    clunk: () => {
      // Simulate heavy mechanical locking door sound
      playTone(180, 0.1, 'triangle', 0.3);
      setTimeout(() => playTone(120, 0.15, 'triangle', 0.25), 40);
      setTimeout(() => playTone(90, 0.2, 'sine', 0.2), 80);
    },
    star: () => {
      const notes = [784, 988, 1175, 1319, 1568];
      notes.forEach((note, i) => {
        setTimeout(() => playTone(note, 0.15, 'sine', 0.08), i * 80);
      });
    },
    playTapeHiss: () => {
      if (!soundEnabled) return { stop: () => {} };
      try {
        const ctx = getCtx();
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 0.6;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.015; // low-fidelity quiet background hiss

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        return {
          stop: () => {
            try {
              whiteNoise.stop();
            } catch {}
          }
        };
      } catch {
        return { stop: () => {} };
      }
    },
  };

  return sounds;
}
