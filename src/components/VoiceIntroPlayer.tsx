import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Loader, AlertCircle, RefreshCw } from 'lucide-react';

interface VoiceIntroPlayerProps {
  text: string;
  voiceId?: string;
  className?: string;
  buttonText?: string;
  autoCache?: boolean;
  fallbackAudioUrl?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
}

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  audioUrl: string | null;
  hasUserInteracted: boolean;
  usingFallback: boolean;
}

const VoiceIntroPlayer: React.FC<VoiceIntroPlayerProps> = ({
  text,
  voiceId,
  className = '',
  buttonText = 'Play Intro',
  autoCache = true,
  fallbackAudioUrl = '/audio/fallback-intro.mp3',
  onPlayStart,
  onPlayEnd,
  onError
}) => {
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    audioUrl: null,
    hasUserInteracted: false,
    usingFallback: false
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cache key for localStorage
  const cacheKey = `voiceIntroUrl_${btoa(text.substring(0, 50)).replace(/[^a-zA-Z0-9]/g, '')}`;

  // ElevenLabs API configuration
  const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const VOICE_ID = voiceId || import.meta.env.VITE_ELEVENLABS_VOICE_ID;

  // Cleanup function
  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleAudioEnd);
      audioRef.current.removeEventListener('error', handleAudioError);
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  // Check for cached audio on mount
  useEffect(() => {
    if (autoCache) {
      const cachedUrl = localStorage.getItem(cacheKey);
      if (cachedUrl) {
        // Validate cached URL is still valid
        validateAudioUrl(cachedUrl)
          .then(() => {
            setState(prev => ({ 
              ...prev, 
              audioUrl: cachedUrl,
              usingFallback: !cachedUrl.startsWith('blob:')
            }));
          })
          .catch(() => {
            // Remove invalid cached URL
            localStorage.removeItem(cacheKey);
          });
      }
    }
  }, [cacheKey, autoCache]);

  // Enhanced audio URL validation with better error handling
  const validateAudioUrl = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const testAudio = new Audio();
      let resolved = false;
      
      const cleanup = () => {
        testAudio.removeEventListener('canplay', onCanPlay);
        testAudio.removeEventListener('error', onError);
        testAudio.removeEventListener('loadedmetadata', onLoadedMetadata);
        testAudio.src = '';
      };

      const onCanPlay = () => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve();
      };

      const onLoadedMetadata = () => {
        // If we have valid metadata and duration, consider it valid
        if (testAudio.duration > 0 && !resolved) {
          resolved = true;
          cleanup();
          resolve();
        }
      };

      const onError = () => {
        if (resolved) return;
        resolved = true;
        cleanup();
        reject(new Error('Audio validation failed'));
      };

      testAudio.addEventListener('canplay', onCanPlay);
      testAudio.addEventListener('error', onError);
      testAudio.addEventListener('loadedmetadata', onLoadedMetadata);

      // Timeout for validation
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(new Error('Audio validation timeout'));
        }
      }, 5000);

      testAudio.addEventListener('canplay', () => clearTimeout(timeout));
      testAudio.addEventListener('error', () => clearTimeout(timeout));

      // Start loading
      testAudio.preload = 'metadata';
      testAudio.crossOrigin = 'anonymous';
      testAudio.src = url;
      testAudio.load();
    });
  };

  // Generate audio from ElevenLabs API
  const generateAudioFromAPI = async (): Promise<string> => {
    if (!API_KEY || !VOICE_ID) {
      throw new Error('ElevenLabs API credentials not configured');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for audio generation');
    }

    if (text.length > 5000) {
      throw new Error('Text too long for audio generation (max 5000 characters)');
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.9,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
      signal: abortControllerRef.current.signal
    });

    if (!response.ok) {
      let errorMessage = `ElevenLabs API error: ${response.status}`;
      
      if (response.status === 401) {
        errorMessage = 'Invalid ElevenLabs API key';
      } else if (response.status === 429) {
        errorMessage = 'ElevenLabs API rate limit exceeded';
      } else if (response.status >= 500) {
        errorMessage = 'ElevenLabs API server error';
      }

      try {
        const errorText = await response.text();
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage += ` - ${errorJson.detail.message || errorJson.detail}`;
        }
      } catch {
        // Ignore JSON parsing errors
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('audio')) {
      throw new Error('Invalid response format from ElevenLabs API');
    }

    const audioBlob = await response.blob();
    
    if (audioBlob.size === 0) {
      throw new Error('Empty audio file returned from ElevenLabs API');
    }

    if (audioBlob.size < 1024) {
      throw new Error('Audio file too small, likely corrupted');
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Validate the generated audio
    await validateAudioUrl(audioUrl);
    
    return audioUrl;
  };

  // Enhanced fallback audio with multiple strategies
  const useFallbackAudio = async (): Promise<{ url: string; strategy: string }> => {
    const fallbackStrategies = [
      {
        name: 'Custom Fallback',
        url: fallbackAudioUrl,
        description: 'Using provided fallback audio'
      },
      {
        name: 'Default Fallback',
        url: '/audio/fallback-intro.mp3',
        description: 'Using default fallback audio'
      },
      {
        name: 'Alternative Fallback',
        url: '/audio/intro.mp3',
        description: 'Using alternative fallback audio'
      },
      {
        name: 'Generic Fallback',
        url: '/audio/voice-intro.mp3',
        description: 'Using generic fallback audio'
      }
    ];

    for (const strategy of fallbackStrategies) {
      try {
        // Check if fallback file exists
        const response = await fetch(strategy.url, { method: 'HEAD' });
        if (response.ok) {
          // Validate fallback audio
          await validateAudioUrl(strategy.url);
          console.log(`✅ ${strategy.description}: ${strategy.url}`);
          return { url: strategy.url, strategy: strategy.name };
        }
      } catch (error) {
        console.warn(`❌ ${strategy.description} failed:`, error);
        continue;
      }
    }

    // If all fallbacks fail, generate a synthetic audio message
    return generateSyntheticFallback();
  };

  // Generate synthetic fallback using Web Audio API
  const generateSyntheticFallback = async (): Promise<{ url: string; strategy: string }> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      const duration = 2; // 2 seconds
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate a pleasant notification tone
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const frequency1 = 440; // A4
        const frequency2 = 554; // C#5
        const envelope = Math.exp(-t * 2) * Math.sin(Math.PI * t / duration);
        
        data[i] = (
          Math.sin(2 * Math.PI * frequency1 * t) * 0.3 +
          Math.sin(2 * Math.PI * frequency2 * t) * 0.2
        ) * envelope;
      }

      // Convert to blob
      const audioBuffer = buffer;
      const offlineContext = new OfflineAudioContext(1, audioBuffer.length, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert to WAV blob
      const wavBlob = audioBufferToWav(renderedBuffer);
      const syntheticUrl = URL.createObjectURL(wavBlob);
      
      console.log('🎵 Generated synthetic fallback audio');
      return { url: syntheticUrl, strategy: 'Synthetic Audio' };
    } catch (error) {
      throw new Error(`Synthetic fallback generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Convert AudioBuffer to WAV blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const data = buffer.getChannelData(0);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert float32 to int16
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  // Get or generate audio URL with enhanced fallback
  const getAudioUrl = async (): Promise<{ url: string; usingFallback: boolean; strategy?: string }> => {
    // Check cache first
    if (state.audioUrl) {
      return { 
        url: state.audioUrl, 
        usingFallback: state.usingFallback,
        strategy: state.usingFallback ? 'Cached Fallback' : 'Cached API'
      };
    }

    if (autoCache) {
      const cachedUrl = localStorage.getItem(cacheKey);
      if (cachedUrl) {
        try {
          await validateAudioUrl(cachedUrl);
          const isBlob = cachedUrl.startsWith('blob:');
          return { 
            url: cachedUrl, 
            usingFallback: !isBlob,
            strategy: isBlob ? 'Cached API' : 'Cached Fallback'
          };
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }
    }

    // Try ElevenLabs API first
    try {
      const apiUrl = await generateAudioFromAPI();
      
      // Cache the URL
      if (autoCache) {
        try {
          localStorage.setItem(cacheKey, apiUrl);
        } catch (error) {
          console.warn('Failed to cache audio URL:', error);
        }
      }
      
      return { url: apiUrl, usingFallback: false, strategy: 'ElevenLabs API' };
    } catch (apiError) {
      console.warn('ElevenLabs API failed, trying fallback:', apiError);
      
      // Fallback to local audio files or synthetic audio
      try {
        const fallbackResult = await useFallbackAudio();
        
        // Cache fallback URL
        if (autoCache) {
          try {
            localStorage.setItem(cacheKey, fallbackResult.url);
          } catch (error) {
            console.warn('Failed to cache fallback URL:', error);
          }
        }
        
        return { 
          url: fallbackResult.url, 
          usingFallback: true, 
          strategy: fallbackResult.strategy 
        };
      } catch (fallbackError) {
        // Both API and fallback failed
        throw new Error(`Audio generation failed: ${apiError instanceof Error ? apiError.message : 'API error'}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Fallback error'}`);
      }
    }
  };

  // Audio event handlers
  const handleAudioEnd = () => {
    setState(prev => ({ ...prev, isPlaying: false }));
    onPlayEnd?.();
  };

  const handleAudioError = () => {
    const errorMsg = 'Audio playback failed';
    setState(prev => ({ ...prev, isPlaying: false, error: errorMsg }));
    onError?.(errorMsg);
  };

  // Play audio with enhanced error handling
  const playAudio = async (url: string) => {
    return new Promise<void>((resolve, reject) => {
      // Clean up any existing audio
      cleanup();

      const audio = new Audio();
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('ended', () => {
        handleAudioEnd();
        resolve();
      });

      audio.addEventListener('error', (event) => {
        console.error('Audio playback error:', event);
        handleAudioError();
        reject(new Error('Audio playback failed'));
      });

      audio.addEventListener('canplay', () => {
        audio.play().catch((playError) => {
          console.error('Audio play() failed:', playError);
          reject(new Error(`Audio playback failed: ${playError.message}`));
        });
      });

      // Configure audio
      audio.preload = 'metadata';
      audio.crossOrigin = 'anonymous';
      audio.src = url;
      audio.load();
    });
  };

  // Stop audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState(prev => ({ ...prev, isPlaying: false }));
    onPlayEnd?.();
  };

  // Handle play button click
  const handlePlay = async () => {
    // Mark user interaction
    if (!state.hasUserInteracted) {
      setState(prev => ({ ...prev, hasUserInteracted: true }));
    }

    // Stop if currently playing
    if (state.isPlaying) {
      stopAudio();
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const audioResult = await getAudioUrl();
      
      setState(prev => ({ 
        ...prev, 
        audioUrl: audioResult.url, 
        usingFallback: audioResult.usingFallback,
        isLoading: false, 
        isPlaying: true 
      }));

      console.log(`🎵 Playing audio using: ${audioResult.strategy}`);
      onPlayStart?.();
      await playAudio(audioResult.url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load audio';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      onError?.(errorMessage);
    }
  };

  // Handle retry
  const handleRetry = () => {
    // Clear cache and state
    if (autoCache) {
      localStorage.removeItem(cacheKey);
    }
    setState(prev => ({ 
      ...prev, 
      error: null, 
      audioUrl: null,
      usingFallback: false
    }));
  };

  // Don't render until user interaction (prevents autoplay issues)
  if (!state.hasUserInteracted && !state.error) {
    return (
      <motion.button
        onClick={handlePlay}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Play audio introduction: ${buttonText}`}
      >
        <Play size={18} />
        <span>▶️ {buttonText}</span>
      </motion.button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Main Play/Stop Button */}
      <motion.button
        onClick={handlePlay}
        disabled={state.isLoading}
        className={`group relative inline-flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 shadow-lg ${
          state.isPlaying
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
            : state.usingFallback
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={
          state.isLoading 
            ? 'Loading audio...' 
            : state.isPlaying 
              ? 'Stop audio' 
              : `Play audio: ${buttonText}`
        }
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={state.isPlaying ? { opacity: [0.1, 0.3, 0.1] } : {}}
          transition={{ duration: 2, repeat: state.isPlaying ? Infinity : 0 }}
        />

        {/* Icon */}
        <motion.div
          animate={state.isPlaying ? { 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ 
            duration: 2, 
            repeat: state.isPlaying ? Infinity : 0, 
            ease: "linear" 
          }}
          className="relative z-10"
        >
          {state.isLoading ? (
            <Loader size={18} className="animate-spin" />
          ) : state.isPlaying ? (
            <Square size={18} className="fill-current" />
          ) : (
            <Play size={18} />
          )}
        </motion.div>

        {/* Text */}
        <span className="relative z-10">
          {state.isLoading ? 'Generating...' : state.isPlaying ? '🛑 Stop' : `▶️ ${buttonText}`}
        </span>

        {/* Fallback indicator */}
        {state.usingFallback && !state.isPlaying && !state.isLoading && (
          <span className="relative z-10 text-xs opacity-75">
            (Fallback)
          </span>
        )}

        {/* Audio wave animation */}
        {state.isPlaying && (
          <div className="flex items-center gap-1 relative z-10">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-white rounded-full"
                animate={{
                  height: [3, 12, 3],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Loading pulse effect */}
        {state.isLoading && (
          <motion.div
            className="absolute inset-0 bg-white/10 rounded-lg"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Error Display and Retry */}
      {state.error && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-sm shadow-sm">
            <AlertCircle size={16} />
            <span>Audio unavailable</span>
          </div>
          <motion.button
            onClick={handleRetry}
            disabled={state.isLoading}
            className="inline-flex items-center gap-1 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-200 text-gray-600 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Retry audio generation"
          >
            {state.isLoading ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {state.isLoading ? 'Retrying...' : 'Retry'}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default VoiceIntroPlayer;