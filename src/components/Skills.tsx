import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Volume2,
  VolumeX,
  Loader,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Award,
  Code2,
  Server,
  Database,
  Cloud,
  Smartphone,
  Brain,
  Settings,
  GitBranch,
  Filter
} from 'lucide-react';
import { generateSkillsVoice, playAudio, stopCurrentAudio } from '../lib/elevenlabs';
import { supabase, Skill } from '../lib/supabase';
import { playClickSound, playVoiceSound } from '../lib/sounds';

type FilterType = 'All' | 'Frontend' | 'Backend' | 'DevOps' | 'Tools';

const Skills: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Skills data state
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const skillsText = "Here are my technical skills and expertise. I specialize in frontend development with React and TypeScript, backend development with Java and Spring Boot, cloud technologies with AWS, and database management with PostgreSQL and MongoDB. I'm also experienced with DevOps tools like Docker and Kubernetes, mobile development, and AI technologies.";

  // Cache key for skills
  const SKILLS_CACHE_KEY = 'portfolio_skills_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Category icons and colors mapping
  const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
    'Frontend': {
      icon: <Code2 size={24} />,
      color: 'text-sky-700',
      bgColor: 'from-sky-500 to-sky-600'
    },
    'Backend': {
      icon: <Server size={24} />,
      color: 'text-sky-700',
      bgColor: 'from-green-500 to-green-600'
    },
    'Database': {
      icon: <Database size={24} />,
      color: 'text-sky-700',
      bgColor: 'from-purple-500 to-purple-600'
    },
    'Cloud': {
      icon: <Cloud size={24} />,
      color: 'text-sky-700',
      bgColor: 'from-orange-500 to-orange-600'
    },
    'DevOps': {
      icon: <Settings size={24} />,
      color: 'text-sky-700',
      bgColor: 'from-red-500 to-red-600'
    },
    'Mobile': {
      icon: <Smartphone size={24} />,
      color: 'text-sky-700',
      bgColor: 'from-pink-500 to-pink-600'
    },
    'AI/ML': {
      icon: <Brain size={24} />,
      color: 'text-sky-700',
      bgColor: 'from-indigo-500 to-indigo-600'
    },
    'Tools': {
      icon: <GitBranch size={24} />,
      color: 'text-sky-700',
      bgColor: 'from-teal-500 to-teal-600'
    }
  };

  // Filter configuration
  const filterConfig = [
    { id: 'All' as FilterType, label: 'All', icon: <Filter size={16} /> },
    { id: 'Frontend' as FilterType, label: 'Frontend', icon: <Code2 size={16} /> },
    { id: 'Backend' as FilterType, label: 'Backend', icon: <Server size={16} /> },
    { id: 'DevOps' as FilterType, label: 'DevOps', icon: <Settings size={16} /> },
    { id: 'Tools' as FilterType, label: 'Tools', icon: <GitBranch size={16} /> }
  ];

  // Fetch skills from Supabase with caching
  const fetchSkills = async (useCache = true) => {
    try {
      setSkillsLoading(true);
      setSkillsError(null);

      // Check cache first
      if (useCache) {
        const cached = localStorage.getItem(SKILLS_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;
          
          if (!isExpired && data) {
            setSkills(data);
            setSkillsLoading(false);
            return;
          }
        }
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('level', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch skills: ${error.message}`);
      }

      const skillsData = data || [];
      setSkills(skillsData);

      // Cache the results
      localStorage.setItem(SKILLS_CACHE_KEY, JSON.stringify({
        data: skillsData,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error fetching skills:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch skills';
      setSkillsError(errorMessage);
      
      // Try to use cached data as fallback
      const cached = localStorage.getItem(SKILLS_CACHE_KEY);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          if (data) {
            setSkills(data);
          }
        } catch (cacheError) {
          console.warn('Failed to parse cached skills:', cacheError);
        }
      }
    } finally {
      setSkillsLoading(false);
    }
  };

  // Load skills on component mount
  useEffect(() => {
    fetchSkills();
  }, []);

  // Filter skills based on active filter
  const filteredSkills = activeFilter === 'All' 
    ? skills 
    : skills.filter(skill => {
        // Map filter types to actual categories in database
        const categoryMap: Record<FilterType, string[]> = {
          'All': [],
          'Frontend': ['Frontend'],
          'Backend': ['Backend'],
          'DevOps': ['DevOps', 'Cloud'],
          'Tools': ['Tools', 'Database', 'Mobile', 'AI/ML']
        };
        
        const allowedCategories = categoryMap[activeFilter] || [];
        return allowedCategories.includes(skill.category);
      });

  // Group filtered skills by category
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Get filter counts
  const getFilterCount = (filter: FilterType): number => {
    if (filter === 'All') return skills.length;
    
    const categoryMap: Record<FilterType, string[]> = {
      'All': [],
      'Frontend': ['Frontend'],
      'Backend': ['Backend'],
      'DevOps': ['DevOps', 'Cloud'],
      'Tools': ['Tools', 'Database', 'Mobile', 'AI/ML']
    };
    
    const allowedCategories = categoryMap[filter] || [];
    return skills.filter(skill => allowedCategories.includes(skill.category)).length;
  };

  // Handle filter change
  const handleFilterChange = (filter: FilterType) => {
    playClickSound();
    setActiveFilter(filter);
  };

  // LAZY LOADING: Only generate audio when user clicks play
  const handlePlayAudio = async () => {
    if (isPlaying) return;

    try {
      playVoiceSound();
      setIsLoading(true);
      setAudioError(null);

      if (!audioUrl) {
        const url = await generateSkillsVoice(skillsText);
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
      console.error('Failed to load skills audio:', error);
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

  const retrySkills = () => {
    playClickSound();
    fetchSkills(false); // Force refresh without cache
  };

  // Skill item component
  const SkillItem: React.FC<{ skill: Skill; index: number; categoryColor: string }> = ({ skill, index, categoryColor }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
        className="flex items-center gap-4 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200"
      >
        {/* Skill Icon */}
        <div className="flex-shrink-0 w-10 h-10 relative">
          {!imageError ? (
            <img
              src={skill.icon_url}
              alt={`${skill.name} icon`}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${categoryColor} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
              {skill.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Skill Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sky-700 group-hover:text-sky-600 transition-colors truncate">
              {skill.name}
            </h4>
            <span className="text-sm font-semibold text-gray-800 ml-2">
              {skill.level}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${categoryColor} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={{ duration: 1.2, delay: index * 0.02 + 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  // Loading skeleton component for individual cards
  const CategoryCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-24 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Category Card Component
  const CategoryCard: React.FC<{ category: string; categorySkills: Skill[]; index: number }> = ({ 
    category, 
    categorySkills, 
    index 
  }) => {
    const config = categoryConfig[category] || {
      icon: <TrendingUp size={24} />,
      color: 'text-sky-700',
      bgColor: 'from-gray-500 to-gray-600'
    };

    const averageLevel = Math.round(
      categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length
    );

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group relative overflow-hidden"
      >
        {/* Category Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.div 
            className={`p-3 rounded-lg bg-gradient-to-r ${config.bgColor} text-white shadow-lg`}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {config.icon}
          </motion.div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${config.color} group-hover:text-sky-600 transition-colors`}>
              {category}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-gray-800">
                <Award size={14} />
                <span className="text-sm font-medium">{categorySkills.length} skills</span>
              </div>
              <div className="flex items-center gap-1 text-gray-800">
                <TrendingUp size={14} />
                <span className="text-sm font-medium">{averageLevel}% avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {categorySkills.map((skill, skillIndex) => (
              <SkillItem 
                key={skill.id} 
                skill={skill} 
                index={skillIndex} 
                categoryColor={config.bgColor}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Decorative Elements */}
        <div className={`absolute top-2 right-2 w-16 h-16 bg-gradient-to-br ${config.bgColor} rounded-full opacity-5 blur-xl`}></div>
      </motion.div>
    );
  };

  return (
    <section id="skills" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <>
            <div className="flex items-center justify-center gap-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-sky-700 text-center">
                Skills & Technologies
              </h2>
              
              {/* Voice Control Button */}
              <motion.button
                onClick={isPlaying ? handleStopAudio : handlePlayAudio}
                disabled={isLoading}
                className="group relative inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-sky-700 border border-gray-300 hover:border-sky-300 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                aria-label={isPlaying ? "Stop audio" : "Listen to skills overview"}
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
                        className="w-1 bg-gradient-to-t from-sky-600 to-sky-700 rounded-full"
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

            {/* Category Filters */}
            {!skillsLoading && skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap justify-center gap-3 mb-12"
              >
                {filterConfig.map((filter) => {
                  const count = getFilterCount(filter.id);
                  const isActive = activeFilter === filter.id;
                  
                  return (
                    <motion.button
                      key={filter.id}
                      onClick={() => handleFilterChange(filter.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-sky-700 text-white border-sky-700 shadow-lg shadow-sky-700/25'
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-sky-100 hover:border-sky-300 hover:text-sky-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={count === 0}
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

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

            {/* Skills Error Display */}
            {skillsError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <h3 className="text-red-800 font-semibold mb-2">Failed to Load Skills</h3>
                    <p className="text-red-700 mb-4">{skillsError}</p>
                    <motion.button
                      onClick={retrySkills}
                      disabled={skillsLoading}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {skillsLoading ? (
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

            {/* Skills Cards Grid */}
            {skillsLoading ? (
              // Loading Skeletons
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <CategoryCardSkeleton key={index} />
                ))}
              </div>
            ) : skills.length > 0 ? (
              // Skills by Category - Each in Separate Cards with Animation
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {Object.entries(groupedSkills).map(([category, categorySkills], index) => (
                    <CategoryCard
                      key={category}
                      category={category}
                      categorySkills={categorySkills}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              // No Skills Found
              <div className="text-center py-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">No Skills Found</h3>
                  <p className="text-gray-800 mb-6">Skills data is not available at the moment.</p>
                  <motion.button
                    onClick={retrySkills}
                    className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RefreshCw size={16} />
                    Reload Skills
                  </motion.button>
                </motion.div>
              </div>
            )}

            {/* No Results for Filter */}
            {!skillsLoading && skills.length > 0 && filteredSkills.length === 0 && activeFilter !== 'All' && (
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">No {activeFilter} Skills Found</h3>
                  <p className="text-gray-800 mb-6">Try selecting a different category to view other skills.</p>
                  <motion.button
                    onClick={() => handleFilterChange('All')}
                    className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View All Skills
                  </motion.button>
                </motion.div>
              </div>
            )}
          </>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;