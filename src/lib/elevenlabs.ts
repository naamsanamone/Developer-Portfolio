/**
 * ElevenLabs Text-to-Speech API integration
 * Comprehensive voice features for portfolio sections with robust error handling
 * FIXED: Proper stop functionality with immediate audio termination
 */

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface GenerateAudioOptions {
  model_id?: string;
  voice_settings?: VoiceSettings;
  cache?: boolean;
}

// Global audio player instance for controlling playback - ENHANCED
let currentAudioPlayer: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;
let isCurrentlyPlaying = false;

// Debug logging function
function debugLog(message: string, data?: any) {
  console.log(`[ElevenLabs Debug] ${message}`, data || '');
}

// Validate API credentials
function validateCredentials(): { isValid: boolean; error?: string } {
  if (!API_KEY || !VOICE_ID) {
    return {
      isValid: false,
      error: 'ElevenLabs API credentials not found. Please check your .env file.'
    };
  }

  // Validate API key format
  if (!API_KEY.startsWith('sk_') || API_KEY.length < 30) {
    return {
      isValid: false,
      error: 'Invalid ElevenLabs API key format. Should start with "sk_" and be at least 30 characters.'
    };
  }

  // Validate Voice ID format (should be alphanumeric, around 20 characters)
  if (!/^[a-zA-Z0-9]{15,25}$/.test(VOICE_ID)) {
    return {
      isValid: false,
      error: 'Invalid ElevenLabs Voice ID format. Should be alphanumeric and 15-25 characters.'
    };
  }

  return { isValid: true };
}

// ENHANCED: Stop any currently playing audio with immediate termination
export function stopCurrentAudio(): void {
  debugLog('Stopping current audio playback');
  
  if (currentAudioPlayer) {
    try {
      // Immediately pause and reset
      currentAudioPlayer.pause();
      currentAudioPlayer.currentTime = 0;
      
      // Remove all event listeners to prevent callbacks
      currentAudioPlayer.removeEventListener('ended', () => {});
      currentAudioPlayer.removeEventListener('error', () => {});
      currentAudioPlayer.removeEventListener('canplay', () => {});
      currentAudioPlayer.removeEventListener('loadeddata', () => {});
      
      // Clear the source to fully stop loading
      currentAudioPlayer.src = '';
      currentAudioPlayer.load();
      
      debugLog('Audio player stopped and reset');
    } catch (error) {
      debugLog('Error stopping audio player', error);
    }
    
    currentAudioPlayer = null;
  }
  
  // Reset global state
  isCurrentlyPlaying = false;
  currentAudioUrl = null;
  
  debugLog('Audio playback state reset');
}

// ENHANCED: Check if audio is currently playing
export function isAudioPlaying(): boolean {
  return isCurrentlyPlaying && currentAudioPlayer && !currentAudioPlayer.paused;
}

// ENHANCED: Get current audio status
export function getCurrentAudioStatus(): { isPlaying: boolean; currentTime: number; duration: number } {
  if (!currentAudioPlayer) {
    return { isPlaying: false, currentTime: 0, duration: 0 };
  }
  
  return {
    isPlaying: isCurrentlyPlaying && !currentAudioPlayer.paused,
    currentTime: currentAudioPlayer.currentTime || 0,
    duration: currentAudioPlayer.duration || 0
  };
}

export async function generateAudio(
  text: string, 
  options: GenerateAudioOptions = {}
): Promise<string | null> {
  debugLog('Starting audio generation', { textLength: text.length, options });

  // Validate credentials first
  const credentialCheck = validateCredentials();
  if (!credentialCheck.isValid) {
    console.warn(credentialCheck.error);
    return null;
  }

  // Validate input text
  if (!text || text.trim().length === 0) {
    console.warn('Empty text provided for audio generation');
    return null;
  }

  if (text.length > 5000) {
    console.warn('Text too long for audio generation (max 5000 characters)');
    return null;
  }

  const {
    model_id = 'eleven_turbo_v2_5', // Use faster turbo model for speed
    voice_settings = {
      stability: 0.5,
      similarity_boost: 0.8, // Higher similarity for better voice consistency
      style: 0.5,
      use_speaker_boost: true
    },
    cache = true
  } = options;

  // Check cache if enabled
  if (cache) {
    const cacheKey = `voice_${btoa(text.substring(0, 50)).replace(/[^a-zA-Z0-9]/g, '')}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached && cached.startsWith('blob:')) {
        debugLog('Using cached audio', { cacheKey });
        // Validate cached URL is still valid
        try {
          await validateAudioUrl(cached);
          return cached;
        } catch (validationError) {
          debugLog('Cached audio invalid, removing from cache', validationError);
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (cacheError) {
      debugLog('Cache access error', cacheError);
    }
  }

  try {
    debugLog('Making API request to ElevenLabs');
    
    const requestBody = {
      text: text.trim(),
      model_id,
      voice_settings,
    };

    debugLog('Request body', requestBody);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    debugLog('API response status', response.status);

    if (!response.ok) {
      let errorMessage = `ElevenLabs API error: ${response.status}`;
      try {
        const errorText = await response.text();
        debugLog('API error response', errorText);
        
        // Try to parse error as JSON for better error messages
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.detail) {
            errorMessage += ` - ${errorJson.detail.message || errorJson.detail}`;
          }
        } catch {
          errorMessage += ` - ${errorText}`;
        }
      } catch (textError) {
        debugLog('Could not read error response', textError);
      }
      
      throw new Error(errorMessage);
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    debugLog('Response content type', contentType);
    
    if (!contentType || !contentType.includes('audio')) {
      const responseText = await response.text();
      debugLog('Non-audio response content', responseText);
      throw new Error(`Invalid response format - expected audio, got: ${contentType}`);
    }

    const audioBlob = await response.blob();
    debugLog('Audio blob created', { size: audioBlob.size, type: audioBlob.type });
    
    // Validate audio blob
    if (audioBlob.size === 0) {
      throw new Error('Empty audio file returned from ElevenLabs API');
    }
    
    if (audioBlob.size < 1024) {
      throw new Error('Audio file too small, likely corrupted or invalid');
    }

    if (!audioBlob.type.includes('audio') && !audioBlob.type.includes('mpeg')) {
      debugLog('Warning: Unexpected blob type', audioBlob.type);
    }
    
    const audioUrl = URL.createObjectURL(audioBlob);
    debugLog('Audio URL created', audioUrl);
    
    // Validate the generated audio URL
    try {
      await validateAudioUrl(audioUrl);
      debugLog('Audio URL validation successful');
    } catch (validationError) {
      debugLog('Audio URL validation failed', validationError);
      URL.revokeObjectURL(audioUrl);
      throw new Error(`Generated audio is not playable: ${validationError}`);
    }
    
    // Cache the audio URL if enabled
    if (cache) {
      try {
        const cacheKey = `voice_${btoa(text.substring(0, 50)).replace(/[^a-zA-Z0-9]/g, '')}`;
        localStorage.setItem(cacheKey, audioUrl);
        debugLog('Audio cached successfully', { cacheKey });
      } catch (cacheError) {
        debugLog('Failed to cache audio', cacheError);
      }
    }
    
    return audioUrl;
  } catch (error) {
    debugLog('Audio generation failed', error);
    console.error('Error generating audio:', error);
    return null;
  }
}

// Enhanced audio URL validation with faster timeout
function validateAudioUrl(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    debugLog('Validating audio URL', audioUrl);
    
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
      debugLog('Audio validation successful - can play');
      cleanup();
      resolve();
    };

    const onLoadedMetadata = () => {
      debugLog('Audio metadata loaded', { 
        duration: testAudio.duration, 
        readyState: testAudio.readyState 
      });
      
      // If we have valid metadata and duration, consider it valid
      if (testAudio.duration > 0 && !resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    };

    const onError = (event: any) => {
      if (resolved) return;
      resolved = true;
      debugLog('Audio validation failed', event);
      cleanup();
      reject(new Error('Audio validation failed: Invalid or corrupted audio file'));
    };

    testAudio.addEventListener('canplay', onCanPlay);
    testAudio.addEventListener('error', onError);
    testAudio.addEventListener('loadedmetadata', onLoadedMetadata);

    // Reduced timeout for faster loading
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error('Audio validation timeout - file may be corrupted'));
      }
    }, 5000); // Reduced from 8000ms to 5000ms

    testAudio.addEventListener('canplay', () => clearTimeout(timeout));
    testAudio.addEventListener('error', () => clearTimeout(timeout));
    testAudio.addEventListener('loadedmetadata', () => clearTimeout(timeout));

    // Start loading
    testAudio.preload = 'metadata';
    testAudio.src = audioUrl;
    testAudio.load();
  });
}

// Predefined section content for voice generation
export const sectionContent = {
  hero: "Hi, I'm Sanam Sai, a passionate full-stack developer specializing in React, Java, and AWS. Welcome to my portfolio! Let me guide you through my journey and showcase the amazing projects I've built.",
  
  about: "Let me tell you about myself. I'm a passionate full-stack developer with over 5 years of experience building scalable web applications. I love turning complex problems into simple, beautiful, and intuitive solutions. When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community.",
  
  skills: "Here are my technical skills and expertise. I specialize in frontend development with React and TypeScript, backend development with Java and Spring Boot, cloud technologies with AWS, and database management with PostgreSQL and MongoDB. I'm also experienced with DevOps tools like Docker and Kubernetes, mobile development, and AI technologies.",
  
  projects: "Take a look at my featured projects. Each project showcases different aspects of my technical skills, from e-commerce platforms to AI-powered applications. I've built everything from task management systems to weather dashboards, always focusing on user experience and performance.",
  
  contact: "Ready to work together? I'd love to hear about your project ideas and discuss how we can bring them to life. Feel free to reach out through the contact form, and I'll get back to you as soon as possible. Let's build something amazing together!",
  
  experience: "Let me walk you through my professional journey. I have over 5 years of experience in full-stack development, working with companies like Mphasis and various startups. I've continuously invested in learning through certifications and training programs, earning credentials from AWS, Oracle, and Google Cloud. My experience spans from junior developer roles to senior positions, where I've led teams and architected scalable solutions."
};

// LAZY LOADING FUNCTIONS - Only generate audio when user clicks play
export const generateVoiceIntro = (text: string = sectionContent.hero) => 
  generateAudio(text, {
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.7,
      similarity_boost: 0.9,
      style: 0.6,
      use_speaker_boost: true
    }
  });

export const generateAboutVoice = (text: string = sectionContent.about) => 
  generateAudio(text, {
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.8,
      similarity_boost: 0.9,
      style: 0.4,
      use_speaker_boost: true
    }
  });

export const generateSkillsVoice = (text: string = sectionContent.skills) => 
  generateAudio(text, {
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.7,
      similarity_boost: 0.9,
      style: 0.5,
      use_speaker_boost: true
    }
  });

export const generateProjectsVoice = (text: string = sectionContent.projects) => 
  generateAudio(text, {
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.7,
      similarity_boost: 0.9,
      style: 0.5,
      use_speaker_boost: true
    }
  });

export const generateContactVoice = (text: string = sectionContent.contact) => 
  generateAudio(text, {
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.8,
      similarity_boost: 0.9,
      style: 0.3,
      use_speaker_boost: true
    }
  });

export const generateExperienceVoice = (text: string = sectionContent.experience) => 
  generateAudio(text, {
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.8,
      similarity_boost: 0.9,
      style: 0.4,
      use_speaker_boost: true
    }
  });

// Project-specific voice generation
export const generateProjectDescription = (projectTitle: string, description: string) => {
  const text = `${projectTitle}: ${description}`;
  return generateAudio(text, {
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.7,
      similarity_boost: 0.9,
      style: 0.4,
      use_speaker_boost: true
    },
    cache: true
  });
};

// Utility functions
export function shouldAutoplayAudio(): boolean {
  // DISABLED: Never autoplay to prevent credit consumption
  return false;
}

export function createAudioPlayer(audioUrl: string): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.crossOrigin = 'anonymous';
  audio.src = audioUrl;
  return audio;
}

// ENHANCED: Play audio with proper stop functionality and state management
export function playAudio(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    debugLog('Starting audio playback', audioUrl);
    
    if (!audioUrl || !audioUrl.startsWith('blob:')) {
      reject(new Error('Invalid audio URL provided'));
      return;
    }

    // Stop any currently playing audio FIRST
    stopCurrentAudio();

    const audio = createAudioPlayer(audioUrl);
    currentAudioPlayer = audio; // Set as current player
    currentAudioUrl = audioUrl; // Store current URL
    isCurrentlyPlaying = true; // Set playing state
    
    let playbackStarted = false;
    
    const cleanup = () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('loadeddata', onLoadedData);
      
      // Only clear global state if this is still the current player
      if (currentAudioPlayer === audio) {
        currentAudioPlayer = null;
        currentAudioUrl = null;
        isCurrentlyPlaying = false;
      }
    };

    const onEnded = () => {
      debugLog('Audio playback ended');
      isCurrentlyPlaying = false;
      cleanup();
      resolve();
    };

    const onError = (event: any) => {
      debugLog('Audio playback error', event);
      isCurrentlyPlaying = false;
      cleanup();
      reject(new Error('Audio playback failed - the audio file is corrupted or in an unsupported format'));
    };

    const onCanPlay = () => {
      if (playbackStarted) return;
      playbackStarted = true;
      
      debugLog('Audio can play, starting playback');
      audio.play().catch((playError) => {
        debugLog('Audio play() failed', playError);
        isCurrentlyPlaying = false;
        cleanup();
        reject(new Error(`Audio playback failed: ${playError.message}`));
      });
    };

    const onLoadedData = () => {
      debugLog('Audio data loaded', {
        duration: audio.duration,
        readyState: audio.readyState
      });
    };
    
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('loadeddata', onLoadedData);
    
    // Reduced timeout for faster loading
    const loadTimeout = setTimeout(() => {
      if (!playbackStarted) {
        isCurrentlyPlaying = false;
        cleanup();
        reject(new Error('Audio loading timeout - check your internet connection'));
      }
    }, 10000); // Reduced from 15000ms to 10000ms
    
    audio.addEventListener('canplay', () => clearTimeout(loadTimeout));
    audio.addEventListener('error', () => clearTimeout(loadTimeout));
    
    // Additional error handling for network issues
    audio.addEventListener('stalled', () => {
      debugLog('Audio loading stalled');
    });

    audio.addEventListener('suspend', () => {
      debugLog('Audio loading suspended');
    });

    audio.addEventListener('waiting', () => {
      debugLog('Audio waiting for data');
    });
    
    // Start loading the audio
    debugLog('Loading audio');
    audio.load();
  });
}

// Voice control hook for components
export interface VoiceControlState {
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  audioUrl: string | null;
}

// Test ElevenLabs connection - LIGHTWEIGHT VERSION
export async function testElevenLabsConnection(): Promise<{ success: boolean; error?: string }> {
  const credentialCheck = validateCredentials();
  if (!credentialCheck.isValid) {
    return { success: false, error: credentialCheck.error };
  }

  // Just validate credentials format, don't make API calls
  // This prevents unnecessary API usage during connection testing
  return { success: true };
}

// Clear audio cache
export function clearAudioCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('voice_')) {
        const audioUrl = localStorage.getItem(key);
        if (audioUrl && audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }
        localStorage.removeItem(key);
      }
    });
    debugLog('Audio cache cleared');
  } catch (error) {
    debugLog('Failed to clear audio cache', error);
  }
}