import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Loader, 
  AlertCircle, 
  RefreshCw,
  Briefcase,
  GraduationCap,
  Award,
  Filter,
  TrendingUp
} from 'lucide-react';
import { generateExperienceVoice, playAudio, stopCurrentAudio } from '../lib/elevenlabs';
import { playClickSound, playVoiceSound } from '../lib/sounds';
import { supabase, Experience as ExperienceType } from '../lib/supabase';
import WorkExperienceTimeline from './experience/WorkExperienceTimeline';
import TrainingCards from './experience/TrainingCards';
import CertificationBadges from './experience/CertificationBadges';

type FilterType = 'all' | 'work' | 'training' | 'certification';

const Experience: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Experience data state
  const [experiences, setExperiences] = useState<ExperienceType[]>([]);
  const [experienceLoading, setExperienceLoading] = useState(true);
  const [experienceError, setExperienceError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Cache
  const EXPERIENCE_CACHE_KEY = 'portfolio_experience_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const experienceText = "Let me walk you through my professional journey. I have over 5 years of experience in full-stack development, working with companies like Mphasis and various startups. I've continuously invested in learning through certifications and training programs, earning credentials from AWS, Oracle, and Google Cloud. My experience spans from junior developer roles to senior positions, where I've led teams and architected scalable solutions.";

  const filters = [
    { id: 'all' as FilterType, label: 'All Experience', icon: <Filter size={16} />, count: 0 },
    { id: 'work' as FilterType, label: 'Work', icon: <Briefcase size={16} />, count: 0 },
    { id: 'training' as FilterType, label: 'Training', icon: <GraduationCap size={16} />, count: 0 },
    { id: 'certification' as FilterType, label: 'Certifications', icon: <Award size={16} />, count: 0 }
  ];

  // Update filter counts
  const updatedFilters = filters.map(filter => ({
    ...filter,
    count: filter.id === 'all' 
      ? experiences.length 
      : experiences.filter(exp => exp.type === filter.id).length
  }));

  // Fetch experiences from Supabase with caching
  const fetchExperiences = async (useCache = true) => {
    try {
      setExperienceLoading(true);
      setExperienceError(null);

      // Check cache first
      if (useCache) {
        const cached = localStorage.getItem(EXPERIENCE_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;
          
          if (!isExpired && data) {
            setExperiences(data);
            setExperienceLoading(false);
            return;
          }
        }
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch experience: ${error.message}`);
      }

      const experienceData = data || [];
      setExperiences(experienceData);

      // Cache the results
      localStorage.setItem(EXPERIENCE_CACHE_KEY, JSON.stringify({
        data: experienceData,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error fetching experience:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch experience';
      setExperienceError(errorMessage);
      
      // Try to use cached data as fallback
      const cached = localStorage.getItem(EXPERIENCE_CACHE_KEY);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          if (data) {
            setExperiences(data);
          }
        } catch (cacheError) {
          console.warn('Failed to parse cached experience:', cacheError);
        }
      }
    } finally {
      setExperienceLoading(false);
    }
  };

  // Load experiences on component mount
  useEffect(() => {
    fetchExperiences();
  }, []);

  // Filter experiences based on active filter
  const filteredExperiences = activeFilter === 'all' 
    ? experiences 
    : experiences.filter(exp => exp.type === activeFilter);

  // Group experiences by type
  const workExperiences = experiences.filter(exp => exp.type === 'work');
  const trainings = experiences.filter(exp => exp.type === 'training');
  const certifications = experiences.filter(exp => exp.type === 'certification');

  // LAZY LOADING: Only generate audio when user clicks play
  const handlePlayAudio = async () => {
    if (isPlaying) return;

    try {
      playVoiceSound();
      setIsLoading(true);
      setAudioError(null);

      if (!audioUrl) {
        const url = await generateExperienceVoice(experienceText);
        if (!url) {
          throw new Error('Failed to generate audio - please check your ElevenLabs configuration');
        }
        setAudioUrl(url);
        
        setIsPlaying(true);
        await playAudio(url);
      } else {
        setIsPlaying(true);
        await playAudio(audioUrl);
      }
    } catch (error) {
      console.error('Failed to load experience audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load audio content';
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

  const retryAudio = () => {
    playClickSound();
    setAudioError(null);
    setAudioUrl(null);
  };

  const retryExperience = () => {
    playClickSound();
    fetchExperiences(false); // Force refresh without cache
  };

  const handleFilterChange = (filter: FilterType) => {
    playClickSound();
    setActiveFilter(filter);
  };

  // Loading skeleton component
  const ExperienceSkeleton: React.FC = () => (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-6 animate-pulse">
          <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0 mt-6"></div>
          <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section id="experience" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-700 text-center">
              Professional Experience
            </h2>
            
            {/* Voice Control Button */}
            <motion.button
              onClick={isPlaying ? handleStopAudio : handlePlayAudio}
              disabled={isLoading}
              className="group relative inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-sky-700 border border-gray-300 hover:border-sky-300 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              aria-label={isPlaying ? "Stop audio" : "Listen to experience overview"}
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
                  <VolumeX size={18} className="text-red-600" />
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
          </div>

          {/* Audio Error Display */}
          {audioError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h3 className="text-amber-800 font-semibold mb-1">Audio Unavailable</h3>
                  <p className="text-amber-700 text-sm mb-3">{audioError}</p>
                  <motion.button
                    onClick={retryAudio}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        Try Again
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Experience Error Display */}
          {experienceError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold mb-2">Failed to Load Experience</h3>
                  <p className="text-red-700 mb-4">{experienceError}</p>
                  <motion.button
                    onClick={retryExperience}
                    disabled={experienceLoading}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {experienceLoading ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Try Again
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filter Tabs */}
          {!experienceLoading && experiences.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 mb-12"
            >
              {updatedFilters.map((filter) => (
                <motion.button
                  key={filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeFilter === filter.id
                      ? 'bg-sky-700 text-white shadow-lg shadow-sky-700/25'
                      : 'bg-white text-gray-800 hover:bg-gray-50 hover:text-sky-700 border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeFilter === filter.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {filter.count}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Content */}
          {experienceLoading ? (
            <ExperienceSkeleton />
          ) : experiences.length > 0 ? (
            <div className="space-y-16">
              {/* Work Experience Section */}
              {(activeFilter === 'all' || activeFilter === 'work') && workExperiences.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {activeFilter === 'all' && (
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-sky-100 rounded-lg">
                        <Briefcase size={24} className="text-sky-700" />
                      </div>
                      <h3 className="text-2xl font-bold text-sky-700">Work Experience</h3>
                      <div className="flex items-center gap-1 text-gray-800">
                        <TrendingUp size={16} />
                        <span className="text-sm">{workExperiences.length} positions</span>
                      </div>
                    </div>
                  )}
                  <WorkExperienceTimeline experiences={workExperiences} />
                </motion.div>
              )}

              {/* Training Section */}
              {(activeFilter === 'all' || activeFilter === 'training') && trainings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {activeFilter === 'all' && (
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <GraduationCap size={24} className="text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-sky-700">Training & Courses</h3>
                      <div className="flex items-center gap-1 text-gray-800">
                        <TrendingUp size={16} />
                        <span className="text-sm">{trainings.length} courses</span>
                      </div>
                    </div>
                  )}
                  <TrainingCards trainings={trainings} />
                </motion.div>
              )}

              {/* Certifications Section */}
              {(activeFilter === 'all' || activeFilter === 'certification') && certifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  {activeFilter === 'all' && (
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Award size={24} className="text-purple-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-sky-700">Certifications</h3>
                      <div className="flex items-center gap-1 text-gray-800">
                        <TrendingUp size={16} />
                        <span className="text-sm">{certifications.length} credentials</span>
                      </div>
                    </div>
                  )}
                  <CertificationBadges certifications={certifications} />
                </motion.div>
              )}

              {/* No results for filter */}
              {filteredExperiences.length === 0 && activeFilter !== 'all' && (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Filter size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">No {activeFilter} found</h3>
                    <p className="text-gray-800 mb-6">Try selecting a different filter to view other experience types.</p>
                    <motion.button
                      onClick={() => handleFilterChange('all')}
                      className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View All Experience
                    </motion.button>
                  </motion.div>
                </div>
              )}
            </div>
          ) : (
            // No Experience Found
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">No Experience Found</h3>
                <p className="text-gray-800 mb-6">Experience data is not available at the moment.</p>
                <motion.button
                  onClick={retryExperience}
                  className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw size={16} />
                  Reload Experience
                </motion.button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;