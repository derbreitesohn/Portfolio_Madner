// lib/sounds.ts
let audioContext: AudioContext | null = null;

export function unlockAudio() {
  if (typeof window === "undefined") return;

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }

  if (audioContext?.state === "suspended") {
    audioContext.resume();
  }
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "square",
  volume: number = 0.08
) {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

export const SFX = {
  keypress: () => playTone(440, 0.04, "square", 0.05),
  boot: () => {
    playTone(220, 0.1, "sawtooth", 0.1);
    setTimeout(() => playTone(330, 0.1, "sawtooth", 0.1), 120);
    setTimeout(() => playTone(440, 0.2, "sawtooth", 0.1), 240);
  },
  glitch: () => playTone(80, 0.08, "sawtooth", 0.12),
  select: () => {
    playTone(660, 0.08, "square", 0.08);
    setTimeout(() => playTone(880, 0.12, "square", 0.08), 90);
  },
  hover: () => playTone(550, 0.05, "sine", 0.04),
  startup: () => {
    [200, 250, 300, 400, 500, 650].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, "sawtooth", 0.09), i * 80);
    });
  },
};