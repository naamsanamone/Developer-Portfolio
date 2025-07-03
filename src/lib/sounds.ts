/**
 * Sound Effects System for Portfolio
 * Provides click sounds and audio feedback for interactive elements
 */

interface SoundConfig {
  volume: number;
  enabled: boolean;
}

class SoundManager {
  private config: SoundConfig = {
    volume: 0.3,
    enabled: true
  };

  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.initializeAudioContext();
    this.loadSounds();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private async loadSounds() {
    if (!this.audioContext) return;

    const sounds = {
      click: this.generateClickSound(),
      hover: this.generateHoverSound(),
      success: this.generateSuccessSound(),
      error: this.generateErrorSound(),
      voice: this.generateVoiceSound(),
      download: this.generateDownloadSound()
    };

    for (const [name, soundPromise] of Object.entries(sounds)) {
      try {
        const buffer = await soundPromise;
        this.soundCache.set(name, buffer);
      } catch (error) {
        console.warn(`Failed to generate ${name} sound:`, error);
      }
    }
  }

  private async generateClickSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a pleasant click sound (short sine wave with envelope)
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 800;
      const envelope = Math.exp(-t * 30); // Quick decay
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  private async generateHoverSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.05;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a subtle hover sound (higher frequency, shorter)
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 1200;
      const envelope = Math.exp(-t * 50);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.15;
    }

    return buffer;
  }

  private async generateSuccessSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a success sound (ascending notes)
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency1 = 523; // C5
      const frequency2 = 659; // E5
      const frequency3 = 784; // G5
      
      const envelope = Math.exp(-t * 3);
      const note1 = Math.sin(2 * Math.PI * frequency1 * t) * (t < 0.1 ? 1 : 0);
      const note2 = Math.sin(2 * Math.PI * frequency2 * t) * (t >= 0.1 && t < 0.2 ? 1 : 0);
      const note3 = Math.sin(2 * Math.PI * frequency3 * t) * (t >= 0.2 ? 1 : 0);
      
      data[i] = (note1 + note2 + note3) * envelope * 0.2;
    }

    return buffer;
  }

  private async generateErrorSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate an error sound (descending tone)
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 300 - (t * 100); // Descending frequency
      const envelope = Math.exp(-t * 8);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.25;
    }

    return buffer;
  }

  private async generateVoiceSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.15;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a voice-related sound (warm tone)
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 440; // A4
      const envelope = Math.exp(-t * 15);
      const warmth = Math.sin(2 * Math.PI * frequency * 0.5 * t) * 0.3; // Sub-harmonic
      data[i] = (Math.sin(2 * Math.PI * frequency * t) + warmth) * envelope * 0.2;
    }

    return buffer;
  }

  private async generateDownloadSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a download sound (swoosh effect)
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 + (t * 400); // Rising frequency
      const envelope = Math.sin(Math.PI * t / duration); // Bell curve envelope
      const noise = (Math.random() - 0.5) * 0.1; // Subtle noise for swoosh effect
      data[i] = (Math.sin(2 * Math.PI * frequency * t) + noise) * envelope * 0.15;
    }

    return buffer;
  }

  public async playSound(soundName: string, volume?: number): Promise<void> {
    if (!this.config.enabled || !this.audioContext || !this.soundCache.has(soundName)) {
      return;
    }

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = this.soundCache.get(soundName)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set volume
      const finalVolume = (volume ?? this.config.volume) * this.config.volume;
      gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);

      source.start();
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }

  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public getVolume(): number {
    return this.config.volume;
  }
}

// Create singleton instance
export const soundManager = new SoundManager();

// Convenience functions for common sounds
export const playClickSound = () => soundManager.playSound('click');
export const playHoverSound = () => soundManager.playSound('hover', 0.1);
export const playSuccessSound = () => soundManager.playSound('success');
export const playErrorSound = () => soundManager.playSound('error');
export const playVoiceSound = () => soundManager.playSound('voice');
export const playDownloadSound = () => soundManager.playSound('download');

// Sound control functions
export const setSoundVolume = (volume: number) => soundManager.setVolume(volume);
export const setSoundEnabled = (enabled: boolean) => soundManager.setEnabled(enabled);
export const isSoundEnabled = () => soundManager.isEnabled();
export const getSoundVolume = () => soundManager.getVolume();

// React hook for sound effects
export const useSoundEffects = () => {
  return {
    playClick: playClickSound,
    playHover: playHoverSound,
    playSuccess: playSuccessSound,
    playError: playErrorSound,
    playVoice: playVoiceSound,
    playDownload: playDownloadSound,
    setVolume: setSoundVolume,
    setEnabled: setSoundEnabled,
    isEnabled: isSoundEnabled,
    getVolume: getSoundVolume
  };
};