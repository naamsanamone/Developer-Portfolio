import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Volume2, Square, Loader, AlertCircle, RefreshCw, Award, Rocket, Star, BookOpen, Target, Globe } from 'lucide-react';
import { generateAboutVoice, playAudio, stopCurrentAudio } from '../lib/elevenlabs';
import { playClickSound, playVoiceSound } from '../lib/sounds';

const About: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const aboutText = "Let me tell you about myself. I'm a passionate full-stack developer with over 5 years of experience building scalable web applications. I love turning complex problems into simple, beautiful, and intuitive solutions. When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community.";

  // LAZY LOADING: Only generate audio when user clicks play
  const handlePlayAudio = async () => {
    if (isPlaying) {
      handleStopAudio();
      return;
    }

    try {
      playVoiceSound();
      setIsLoading(true);
      setAudioError(null);

      if (!audioUrl) {
        const url = await generateAboutVoice(aboutText);
        if (!url) {
          throw new Error('Failed to generate audio - please check your ElevenLabs API credentials in the .env file');
        }
        setAudioUrl(url);
        
        setIsPlaying(true);
        await playAudio(url);
      } else {
        setIsPlaying(true);
        await playAudio(audioUrl);
      }
    } catch (error) {
      console.error('Failed to load about audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load audio';
      setAudioError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handleStopAudio = () => {
    playClickSound();
    stopCurrentAudio();
    setIsPlaying(false);
  };

  const handleRetry = () => {
    playClickSound();
    setAudioError(null);
    setAudioUrl(null);
  };

  const achievements = [
    {
      icon: <Award size={18} className="text-sky-600" />,
      text: 'AWS Certified Solutions Architect',
      color: 'text-sky-700'
    },
    {
      icon: <Rocket size={18} className="text-sky-600" />,
      text: 'Built 20+ production applications',
      color: 'text-sky-700'
    },
    {
      icon: <Star size={18} className="text-sky-600" />,
      text: 'Open source contributor with 1k+ GitHub stars',
      color: 'text-sky-700'
    },
    {
      icon: <BookOpen size={18} className="text-sky-600" />,
      text: 'Technical writer and mentor',
      color: 'text-sky-700'
    },
    {
      icon: <Target size={18} className="text-sky-600" />,
      text: 'Performance optimization enthusiast',
      color: 'text-sky-700'
    },
    {
      icon: <Globe size={18} className="text-sky-600" />,
      text: 'Remote collaboration expert',
      color: 'text-sky-700'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-700 text-center">
              About Me
            </h2>
            
            {/* Voice Control Button */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handlePlayAudio}
                disabled={isLoading}
                className="group relative inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-sky-700 border border-gray-300 hover:border-sky-300 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                aria-label={isPlaying ? "Stop audio" : "Listen to about section"}
              >
                <motion.div
                  animate={isPlaying ? { 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ 
                    duration: 2, 
                    repeat: isPlaying ? Infinity : 0, 
                    ease: "linear" 
                  }}
                  className="relative z-10"
                >
                  {isLoading ? (
                    <Loader size={18} className="animate-spin text-sky-600" />
                  ) : isPlaying ? (
                    <Square size={18} className="text-red-600 fill-current" />
                  ) : (
                    <Volume2 size={18} className="text-sky-600 group-hover:text-sky-700 transition-colors" />
                  )}
                </motion.div>
                
                <span className="relative z-10 text-sm font-semibold">
                  {isLoading ? 'Generating...' : isPlaying ? 'Stop' : 'Listen'}
                </span>
                
                {isPlaying && (
                  <div className="flex items-center gap-1 relative z-10">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-gradient-to-t from-sky-500 to-sky-600 rounded-full"
                        animate={{
                          height: [3, 10, 3],
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
              </motion.button>

              {audioError && (
                <div className="inline-flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-sm shadow-sm">
                    <AlertCircle size={16} />
                    <span>Audio unavailable</span>
                  </div>
                  <motion.button
                    onClick={handleRetry}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-200 text-gray-600 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    {isLoading ? 'Retrying...' : 'Retry'}
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Error message display */}
          {audioError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-amber-800 font-medium">Voice feature temporarily unavailable</p>
                  <p className="text-amber-700 text-sm mt-1">
                    {audioError.includes('credentials') || audioError.includes('API') 
                      ? 'Please configure your ElevenLabs API credentials to enable voice features.'
                      : 'There was an issue loading the audio. You can still read the content below.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-10 relative overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Left Column - About Text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    I'm a passionate <span className="text-sky-700 font-semibold">full-stack developer</span> with over 5 years of experience 
                    building scalable web applications. I love turning complex problems 
                    into simple, beautiful, and intuitive solutions.
                  </p>
                  
                  <p className="text-lg text-gray-800 leading-relaxed">
                    When I'm not coding, you'll find me exploring <span className="text-sky-700 font-semibold">new technologies</span>, 
                    contributing to open-source projects, or sharing knowledge with the 
                    developer community.
                  </p>
                </div>
              </motion.div>

              {/* Right Column - Interests & Achievements */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-sky-700 mb-6">
                  Interests & Achievements
                </h3>
                
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.05 }}
                      className="flex items-center gap-3 group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
                    >
                      <motion.div
                        className="flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {achievement.icon}
                      </motion.div>
                      <span className={`text-gray-800 group-hover:${achievement.color} transition-colors duration-200 leading-snug`}>
                        {achievement.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full opacity-20 blur-xl"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;