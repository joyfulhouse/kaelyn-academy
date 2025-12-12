'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import Cookies from 'js-cookie';

type SoundType = 'correct' | 'incorrect' | 'click' | 'celebrate' | 'whoosh' | 'pop';

interface AudioContextValue {
  speak: (text: string) => Promise<void>;
  playSound: (sound: SoundType) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  muted: boolean;
  setMuted: (muted: boolean) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

const MUTE_COOKIE_KEY = 'kaelyn-academy-audio-muted';

// Sound synthesis parameters for Web Audio API
const SOUND_PARAMS: Record<SoundType, { freq: number; duration: number; type: OscillatorType; volume: number }> = {
  correct: { freq: 880, duration: 0.15, type: 'sine', volume: 0.3 },
  incorrect: { freq: 220, duration: 0.2, type: 'triangle', volume: 0.2 },
  click: { freq: 600, duration: 0.05, type: 'square', volume: 0.1 },
  celebrate: { freq: 523, duration: 0.3, type: 'sine', volume: 0.3 },
  whoosh: { freq: 400, duration: 0.15, type: 'sawtooth', volume: 0.15 },
  pop: { freq: 1000, duration: 0.08, type: 'sine', volume: 0.2 },
};

// Child-friendly TTS settings
const TTS_RATE = 0.85; // Slightly slower than normal
const TTS_PITCH = 1.1; // Slightly higher pitch

// Initialize muted state from cookie (runs once on module load)
function getInitialMutedState(): boolean {
  if (typeof window === 'undefined') return false;
  return Cookies.get(MUTE_COOKIE_KEY) === 'true';
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState(getInitialMutedState);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<globalThis.AudioContext | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Web Audio Context lazily (must be after user interaction)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
    Cookies.set(MUTE_COOKIE_KEY, String(value), { expires: 365 });
    if (value) {
      window.speechSynthesis?.cancel();
    }
  }, []);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      if (muted || typeof window === 'undefined' || !window.speechSynthesis) {
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = TTS_RATE;
        utterance.pitch = TTS_PITCH;
        utterance.volume = 1;

        // Try to find a friendly voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.name.includes('Samantha') || // macOS
            v.name.includes('Karen') || // macOS
            v.name.includes('Google US English') || // Chrome
            v.lang.startsWith('en-')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      });
    },
    [muted]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const playSound = useCallback(
    (sound: SoundType) => {
      if (muted) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      // Resume context if suspended (autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const params = SOUND_PARAMS[sound];
      if (!params) return;

      try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = params.type;
        oscillator.frequency.setValueAtTime(params.freq, ctx.currentTime);

        // For celebrate, add a rising pitch
        if (sound === 'celebrate') {
          oscillator.frequency.exponentialRampToValueAtTime(
            params.freq * 1.5,
            ctx.currentTime + params.duration
          );
        }

        // For whoosh, sweep the frequency
        if (sound === 'whoosh') {
          oscillator.frequency.exponentialRampToValueAtTime(
            params.freq * 0.5,
            ctx.currentTime + params.duration
          );
        }

        gainNode.gain.setValueAtTime(params.volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + params.duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + params.duration);
      } catch {
        // Ignore audio errors
      }
    },
    [muted, getAudioContext]
  );

  return (
    <AudioContext.Provider
      value={{
        speak,
        playSound,
        stopSpeaking,
        isSpeaking,
        muted,
        setMuted,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}
