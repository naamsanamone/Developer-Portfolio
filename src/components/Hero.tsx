import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Download, ChevronDown, Volume2, Square, Sparkles, Code, Database, Cloud, Cpu, Terminal, GitBranch, AlertCircle, RefreshCw } from 'lucide-react';
import { generateVoiceIntro, playAudio, testElevenLabsConnection, stopCurrentAudio, isAudioPlaying } from '../lib/elevenlabs';
import { playClickSound, playVoiceSound, playDownloadSound } from '../lib/sounds';

const Hero: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const introText = "Hi, I'm Sanam Sai, a passionate full-stack developer specializing in React, Java, and AWS. Welcome to my portfolio! Let me guide you through my journey and showcase the amazing projects I've built.";

  // Mouse tracking for profile picture with speed detection
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseSpeed = useMotionValue(0);
  
  // Previous mouse position for speed calculation
  const prevMouseX = useRef(0);
  const prevMouseY = useRef(0);
  const lastMoveTime = useRef(Date.now());

  // Dynamic spring configuration based on mouse speed
  const springConfig = useMotionValue({ damping: 25, stiffness: 400 });
  
  // Profile picture transformations with speed-responsive movement
  const profileRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const profileRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);
  const profileScale = useSpring(useTransform(mouseX, [-0.5, 0.5], [1, 1.08]), springConfig);
  
  // Additional movement based on cursor position and speed
  const profileTranslateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const profileTranslateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), springConfig);

  // Tech icons for floating elements
  const techIcons = [Code, Database, Cloud, Cpu, Terminal, GitBranch];

  // Code snippets for background animation
  const codeSnippets = [
    "const developer = 'Sanam Sai';",
    "function buildAmazingApps() {",
    "  return 'React + Java + AWS';",
    "}",
    "class FullStackDev {",
    "  constructor() {",
    "    this.skills = ['React', 'Java'];",
    "  }",
    "}",
    "import { passion } from 'coding';",
    "export default creativity;",
    "npm install awesome-portfolio",
    "git commit -m 'Amazing work'",
    "docker build -t portfolio .",
    "kubectl apply -f deployment.yaml"
  ];

  useEffect(() => {
    // REMOVED: Auto-initialization of audio to prevent credit consumption
    // Only test connection without generating audio
    const testConnection = async () => {
      try {
        const connectionTest = await testElevenLabsConnection();
        setConnectionTested(true);
        
        if (!connectionTest.success) {
          setAudioError(connectionTest.error || 'ElevenLabs connection failed');
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setAudioError('Failed to test ElevenLabs connection');
        setConnectionTested(true);
      }
    };

    testConnection();
  }, []);

  // Handle mouse movement with speed detection for profile picture
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!profileRef.current) return;
      
      const rect = profileRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      
      // Calculate mouse speed
      const currentTime = Date.now();
      const deltaTime = currentTime - lastMoveTime.current;
      const deltaX = e.clientX - prevMouseX.current;
      const deltaY = e.clientY - prevMouseY.current;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const speed = deltaTime > 0 ? distance / deltaTime : 0;
      
      // Normalize speed (0-1 range, with higher values for faster movement)
      const normalizedSpeed = Math.min(speed * 0.1, 1);
      
      // Update spring configuration based on speed
      const dynamicDamping = Math.max(15 - normalizedSpeed * 10, 8);
      const dynamicStiffness = Math.min(300 + normalizedSpeed * 400, 800);
      
      springConfig.set({ 
        damping: dynamicDamping, 
        stiffness: dynamicStiffness 
      });
      
      // Set mouse position and speed
      mouseX.set(x);
      mouseY.set(y);
      mouseSpeed.set(normalizedSpeed);
      
      // Update previous values
      prevMouseX.current = e.clientX;
      prevMouseY.current = e.clientY;
      lastMoveTime.current = currentTime;
    };

    const handleMouseLeave = () => {
      // Reset to center with smooth animation
      mouseX.set(0);
      mouseY.set(0);
      mouseSpeed.set(0);
      
      // Reset spring to default smooth configuration
      springConfig.set({ damping: 25, stiffness: 400 });
    };

    const profileElement = profileRef.current;
    if (profileElement) {
      profileElement.addEventListener('mousemove', handleMouseMove);
      profileElement.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        profileElement.removeEventListener('mousemove', handleMouseMove);
        profileElement.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [mouseX, mouseY, mouseSpeed, springConfig]);

  // ENHANCED: Check playing state periodically
  useEffect(() => {
    const checkPlayingState = () => {
      const actuallyPlaying = isAudioPlaying();
      if (isPlaying !== actuallyPlaying) {
        setIsPlaying(actuallyPlaying);
      }
    };

    const interval = setInterval(checkPlayingState, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // LAZY LOADING: Only generate audio when user clicks play
  const handlePlayAudio = async () => {
    if (isPlaying) {
      // STOP AUDIO - ENHANCED
      handleStopAudio();
      return;
    }

    try {
      playVoiceSound(); // Play voice button sound
      setIsLoading(true);
      setAudioError(null);

      // Generate audio only when user clicks
      if (!audioUrl) {
        const url = await generateVoiceIntro(introText);
        if (!url) {
          throw new Error('Failed to generate audio - please check your ElevenLabs configuration');
        }
        setAudioUrl(url);
        
        // Play the newly generated audio
        setIsPlaying(true);
        await playAudio(url);
        setIsPlaying(false); // Reset when done
      } else {
        // Play existing audio
        setIsPlaying(true);
        await playAudio(audioUrl);
        setIsPlaying(false); // Reset when done
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Audio playback failed';
      setAudioError(errorMessage);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ENHANCED: Stop audio with immediate feedback
  const handleStopAudio = () => {
    playClickSound(); // Play stop sound
    stopCurrentAudio();
    setIsPlaying(false);
  };

  const retryAudio = async () => {
    playClickSound(); // Play retry sound
    setAudioError(null);
    setAudioUrl(null);
    // Don't auto-generate, wait for user to click play
  };

  const scrollToAbout = () => {
    playClickSound(); // Play scroll sound
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDownloadResume = () => {
    playDownloadSound(); // Play download sound
  };

  // Floating particles animation variants
  const particleVariants = {
    animate: {
      y: [0, -20, 0],
      x: [0, 10, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section 
      id="hero" 
      className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden"
    >
      {/* Tech Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Circuit Board Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <defs>
              <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M10,10 L90,10 L90,90 L10,90 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
                <circle cx="10" cy="10" r="2" fill="currentColor"/>
                <circle cx="90" cy="10" r="2" fill="currentColor"/>
                <circle cx="90" cy="90" r="2" fill="currentColor"/>
                <circle cx="10" cy="90" r="2" fill="currentColor"/>
                <path d="M50,10 L50,50 L90,50" fill="none" stroke="currentColor" strokeWidth="1"/>
                <path d="M10,50 L50,50 L50,90" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" className="text-blue-400"/>
          </svg>
        </div>

        {/* Floating Code Snippets */}
        {codeSnippets.map((snippet, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400/20 font-mono text-sm select-none pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, -200],
              opacity: [0, 0.6, 0],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          >
            {snippet}
          </motion.div>
        ))}

        {/* Floating Tech Icons */}
        {techIcons.map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-blue-400/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
          >
            <Icon size={32 + i * 4} />
          </motion.div>
        ))}

        {/* Binary Rain Effect */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`binary-${i}`}
            className="absolute text-green-300/20 font-mono text-xs select-none pointer-events-none"
            style={{
              left: `${i * 5}%`,
              top: '-10%',
            }}
            animate={{
              y: ['0vh', '110vh'],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "linear"
            }}
          >
            {Array.from({ length: 20 }, () => Math.random() > 0.5 ? '1' : '0').join('')}
          </motion.div>
        ))}

        {/* Geometric Tech Shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute opacity-10"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + i * 10}%`,
            }}
            variants={particleVariants}
            animate="animate"
            transition={{ delay: i * 0.7 }}
          >
            <div 
              className={`w-${6 + i} h-${6 + i} bg-gradient-to-r from-cyan-400 to-blue-500 ${
                i % 3 === 0 ? 'rounded-full' : i % 3 === 1 ? 'rounded-lg' : ''
              } blur-sm`} 
            />
          </motion.div>
        ))}

        {/* Animated Grid with Perspective */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(1000px) rotateX(60deg)',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Glowing Orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-xl"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`,
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(147, 51, 234, 0.1)'
              } 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Audio Error Display */}
      {audioError && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-4 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="text-amber-800 font-semibold mb-1">Voice Feature Unavailable</h3>
              <p className="text-amber-700 text-sm mb-3">{audioError}</p>
              <div className="flex gap-2">
                <button
                  onClick={retryAudio}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      Try Again
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setAudioError(null);
                  }}
                  className="text-amber-600 hover:text-amber-700 px-2 py-1 text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Container - Centered with proper spacing */}
      <div className="flex-1 flex items-center justify-center px-6 pt-16 pb-24">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Profile Picture with Speed-Responsive Mouse Cursor Animation */}
            <motion.div
              ref={profileRef}
              initial={{ scale: 0.5, rotateY: -180, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
              className="relative inline-block cursor-pointer"
              style={{
                rotateX: profileRotateX,
                rotateY: profileRotateY,
                scale: profileScale,
                x: profileTranslateX,
                y: profileTranslateY,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Floating ring around profile */}
              <motion.div
                className="absolute inset-0 w-44 h-44 md:w-52 md:h-52 mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ transform: 'translateZ(20px)' }}
              >
                <div className="w-full h-full rounded-full border-2 border-dashed border-cyan-300/40" />
              </motion.div>

              {/* Tech orbit rings */}
              <motion.div
                className="absolute inset-0 w-48 h-48 md:w-56 md:h-56 mx-auto"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                style={{ transform: 'translateZ(10px)' }}
              >
                <div className="w-full h-full rounded-full border border-blue-400/20" />
                {techIcons.slice(0, 4).map((Icon, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-cyan-400/60"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-${24 + 4}px) rotate(-${i * 90}deg)`,
                    }}
                  >
                    <Icon size={16} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Profile picture container with speed-responsive mouse tracking */}
              <div 
                className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl mx-auto relative backdrop-blur-sm"
                style={{
                  transform: 'translateZ(50px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Updated to use 4K quality image - replace with your 4K image filename */}
                <img
                  src="/images/profile-4k.jpg"
                  alt="Sanam Sai - Profile Picture"
                  className="w-full h-full object-cover object-center scale-110"
                  style={{ 
                    objectPosition: 'center 35%',
                    transform: 'scale(1.2) translateY(5%)'
                  }}
                  onError={(e) => {
                    // Fallback to original image if 4K version not found
                    const target = e.target as HTMLImageElement;
                    target.src = "/1000035984.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/20 to-transparent"></div>
                
                {/* Dynamic sparkle effect that responds to mouse speed */}
                <motion.div 
                  className="absolute top-2 right-2 text-cyan-400/70"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: useTransform(mouseSpeed, [0, 1], [2, 0.5]).get(),
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles size={16} />
                </motion.div>
              </div>
            </motion.div>

            {/* Name and Title */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                className="text-4xl md:text-6xl font-bold relative"
              >
                <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  Sanam Sai
                </span>
                
                {/* Text shadow effect */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-cyan-400/30 bg-clip-text text-transparent blur-sm"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Sanam Sai
                </motion.span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                className="text-lg md:text-xl text-cyan-100 font-medium"
              >
                Full-Stack Developer | React • Java • AWS
              </motion.p>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.a
                href="/resume.pdf"
                download
                onClick={handleDownloadResume}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg relative overflow-hidden"
                whileTap={{ scale: 0.95 }}
              >
                <Download size={20} />
                Download Résumé
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.a>

              {/* ENHANCED Voice Intro Button with PROPER STOP FUNCTIONALITY - LAZY LOADING */}
              {connectionTested && !audioError && (
                <motion.button
                  onClick={handlePlayAudio}
                  disabled={isLoading}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white border border-white/20 hover:border-white/30 px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 backdrop-blur-sm shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  aria-label={isPlaying ? "Stop voice introduction" : "Play voice introduction"}
                >
                  {/* Animated background glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={isPlaying ? { opacity: [0.2, 0.4, 0.2] } : {}}
                    transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                  />
                  
                  {/* Icon with enhanced animation - PROPER STOP ICON */}
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
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                      <Square size={20} className="text-red-400 fill-current" />
                    ) : (
                      <Volume2 size={20} className="text-cyan-300 group-hover:text-white transition-colors" />
                    )}
                  </motion.div>
                  
                  {/* Text with better styling */}
                  <span className="relative z-10 text-cyan-100 group-hover:text-white transition-colors">
                    {isLoading ? 'Generating Audio...' : isPlaying ? 'Stop Audio' : 'Voice Introduction'}
                  </span>
                  
                  {/* Enhanced audio wave animation */}
                  {isPlaying && (
                    <div className="flex items-center gap-1 relative z-10">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-gradient-to-t from-cyan-400 to-blue-400 rounded-full"
                          animate={{
                            height: [4, 16, 4],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pulse effect when loading */}
                  {isLoading && (
                    <motion.div
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator - Fixed at bottom with proper spacing */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-6">
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          onClick={scrollToAbout}
          className="text-cyan-300/60 hover:text-cyan-300 transition-colors z-10"
          aria-label="Scroll to About section"
        >
          <motion.div
            animate={{ 
              y: [0, 15, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2.5,
              ease: "easeInOut"
            }}
            className="flex flex-col items-center gap-2"
          >
            <ChevronDown size={32} />
            <motion.div
              className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-transparent rounded-full"
              animate={{ scaleY: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;