import React from 'react';
import VoiceIntroPlayer from './VoiceIntroPlayer';

// Example usage and documentation
export default {
  title: 'Components/VoiceIntroPlayer',
  component: VoiceIntroPlayer,
};

// Basic usage example
export const BasicUsage = () => (
  <div className="p-8 space-y-6">
    <h2 className="text-2xl font-bold">VoiceIntroPlayer Examples</h2>
    
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Player</h3>
      <VoiceIntroPlayer
        text="Hello! This is a basic voice introduction player example."
        buttonText="Play Intro"
      />
    </div>

    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Custom Styled Player</h3>
      <VoiceIntroPlayer
        text="This is a custom styled voice player with different styling."
        buttonText="Listen Now"
        className="bg-purple-50 p-4 rounded-lg"
      />
    </div>

    <div className="space-y-4">
      <h3 className="text-lg font-semibold">With Event Handlers</h3>
      <VoiceIntroPlayer
        text="This player has custom event handlers for play, stop, and error events."
        buttonText="Start Audio"
        onPlayStart={() => console.log('Audio started')}
        onPlayEnd={() => console.log('Audio ended')}
        onError={(error) => console.error('Audio error:', error)}
      />
    </div>

    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Long Text Example</h3>
      <VoiceIntroPlayer
        text="This is a longer text example that demonstrates how the voice player handles more substantial content. It includes multiple sentences and should generate a longer audio file that can be played back with full controls including stop functionality."
        buttonText="Play Long Intro"
      />
    </div>
  </div>
);

// Mobile responsive example
export const MobileResponsive = () => (
  <div className="max-w-sm mx-auto p-4 space-y-4">
    <h3 className="text-lg font-semibold">Mobile View</h3>
    <VoiceIntroPlayer
      text="This demonstrates the mobile-first responsive design of the voice player."
      buttonText="Play"
      className="w-full"
    />
  </div>
);

// Error handling example
export const ErrorHandling = () => (
  <div className="p-8 space-y-4">
    <h3 className="text-lg font-semibold">Error Handling</h3>
    <p className="text-gray-600">
      This example shows how the component handles errors gracefully with fallback options.
    </p>
    <VoiceIntroPlayer
      text="This will demonstrate error handling if ElevenLabs API fails."
      voiceId="invalid-voice-id"
      buttonText="Test Error Handling"
      onError={(error) => alert(`Error occurred: ${error}`)}
    />
  </div>
);