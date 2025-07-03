# VoiceIntroPlayer Component

A reusable React component for playing text-to-speech audio using ElevenLabs API with robust fallback support.

## Features

✅ **Dynamic Voice Generation**: Uses ElevenLabs TTS API with configurable voice ID  
✅ **Multi-Strategy Fallback**: Comprehensive fallback system with multiple audio sources  
✅ **Synthetic Audio Generation**: Creates audio using Web Audio API when all else fails  
✅ **Smart Caching**: Caches audio URLs in localStorage to prevent repeated API calls  
✅ **User Gesture Required**: Only plays audio after user interaction (no autoplay)  
✅ **Stop/Pause Functionality**: Red square stop button with immediate pause/reset  
✅ **Responsive Design**: Mobile-first design with Tailwind CSS  
✅ **Accessibility**: Proper ARIA labels and keyboard navigation  
✅ **Error Handling**: Graceful error handling with retry functionality  
✅ **Framer Motion**: Smooth animations and micro-interactions  
✅ **TypeScript**: Full type safety and IntelliSense support  

## Enhanced Fallback System

### 🎯 **Fallback Strategies (in order):**

1. **Custom Fallback**: Uses provided `fallbackAudioUrl` prop
2. **Default Fallback**: `/audio/fallback-intro.mp3`
3. **Alternative Fallback**: `/audio/intro.mp3`
4. **Generic Fallback**: `/audio/voice-intro.mp3`
5. **Synthetic Audio**: Generated using Web Audio API

### 🎵 **Synthetic Audio Generation:**
- Creates pleasant notification tones using Web Audio API
- Converts AudioBuffer to WAV format
- Provides audio feedback even when no files are available
- Completely self-contained fallback solution

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | **Required** | Text to convert to speech |
| `voiceId` | `string` | `env.VITE_ELEVENLABS_VOICE_ID` | ElevenLabs voice ID |
| `className` | `string` | `''` | Additional CSS classes |
| `buttonText` | `string` | `'Play Intro'` | Text displayed on play button |
| `autoCache` | `boolean` | `true` | Enable localStorage caching |
| `fallbackAudioUrl` | `string` | `'/audio/fallback-intro.mp3'` | Custom fallback audio URL |
| `onPlayStart` | `() => void` | `undefined` | Callback when audio starts |
| `onPlayEnd` | `() => void` | `undefined` | Callback when audio ends |
| `onError` | `(error: string) => void` | `undefined` | Callback for errors |

## Usage Examples

### Basic Usage
```tsx
import VoiceIntroPlayer from './components/VoiceIntroPlayer';

<VoiceIntroPlayer
  text="Hello! Welcome to my portfolio."
  buttonText="Play Intro"
/>
```

### With Custom Fallback
```tsx
<VoiceIntroPlayer
  text="This is a custom voice introduction."
  voiceId="your-custom-voice-id"
  fallbackAudioUrl="/audio/custom-fallback.mp3"
  buttonText="Listen Now"
  onPlayStart={() => console.log('Started playing')}
  onPlayEnd={() => console.log('Finished playing')}
  onError={(error) => console.error('Error:', error)}
/>
```

### Custom Styling
```tsx
<VoiceIntroPlayer
  text="Styled voice player example."
  className="bg-blue-50 p-4 rounded-xl shadow-lg"
  buttonText="🎵 Play Audio"
/>
```

## Setup Requirements

### 1. Environment Variables
```env
VITE_ELEVENLABS_API_KEY=sk_your_api_key_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here
```

### 2. Fallback Audio Files (Optional)
Place fallback MP3 files at:
- `/public/audio/fallback-intro.mp3` (primary)
- `/public/audio/intro.mp3` (alternative)
- `/public/audio/voice-intro.mp3` (generic)

### 3. Dependencies
```bash
npm install framer-motion lucide-react
```

## Error Handling

The component handles various error scenarios:

- **401 Unauthorized**: Invalid API key
- **429 Rate Limited**: Too many requests
- **500+ Server Errors**: ElevenLabs API issues
- **Network Timeouts**: Connection problems
- **Invalid Audio**: Corrupted or invalid audio files
- **Missing Files**: Fallback files not found

### Fallback Hierarchy:
1. **ElevenLabs API** → Generate fresh audio
2. **Custom Fallback** → Use provided fallback URL
3. **Default Fallbacks** → Try multiple fallback files
4. **Synthetic Audio** → Generate audio with Web Audio API
5. **Error State** → Show error with retry option

## Visual States

- **🔵 Ready**: Blue play button with "▶️ Play Intro"
- **⚪ Loading**: Spinner with "Generating..." text
- **🔴 Playing**: Red stop button with "🛑 Stop" + audio waves
- **🟡 Fallback**: Amber button indicating fallback audio
- **❌ Error**: Error indicator with retry button

## Caching Strategy

- **Cache Key**: Generated from first 50 characters of text
- **Storage**: localStorage with `voiceIntroUrl_` prefix
- **Validation**: Cached URLs are validated before use
- **Cleanup**: Invalid cached URLs are automatically removed
- **Fallback Caching**: Both API and fallback URLs are cached

## Accessibility Features

- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus indicators
- **State Announcements**: Clear state changes for assistive technology

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Web Audio API**: Required for synthetic audio generation
- **Audio Context**: Uses Web Audio API when available
- **Fallback**: Graceful degradation for older browsers
- **Mobile**: Optimized for iOS and Android

## Performance Considerations

- **Lazy Loading**: Audio only generated on user interaction
- **Efficient Caching**: Prevents unnecessary API calls
- **Memory Management**: Proper cleanup of audio resources
- **Abort Controllers**: Cancellable API requests
- **Synthetic Fallback**: Lightweight audio generation

## Security Features

- **No Autoplay**: Prevents unwanted audio playback
- **CORS Handling**: Proper cross-origin resource sharing
- **Input Validation**: Text length and format validation
- **Error Sanitization**: Safe error message handling
- **Resource Cleanup**: Proper disposal of blob URLs