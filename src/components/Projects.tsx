import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Github, 
  Calendar, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Loader, 
  Play, 
  RefreshCw,
  Filter,
  Star,
  Code,
  Server,
  Layers,
  Brain,
  GitBranch,
  TrendingUp
} from 'lucide-react';
import { supabase, Project } from '../lib/supabase';
import { generateProjectsVoice, generateProjectDescription, playAudio, stopCurrentAudio } from '../lib/elevenlabs';
import { playClickSound, playVoiceSound } from '../lib/sounds';

type CategoryFilter = 'All' | 'Fullstack' | 'Frontend' | 'Backend' | 'AI' | 'Open Source';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionAudioUrl, setSectionAudioUrl] = useState<string | null>(null);
  const [isPlayingSection, setIsPlayingSection] = useState(false);
  const [isLoadingSection, setIsLoadingSection] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [projectAudios, setProjectAudios] = useState<Record<number, string>>({});
  const [playingProject, setPlayingProject] = useState<number | null>(null);
  const [loadingProject, setLoadingProject] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Cache
  const PROJECTS_CACHE_KEY = 'portfolio_projects_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const projectsText = "Take a look at my featured projects. Each project showcases different aspects of my technical skills, from e-commerce platforms to AI-powered applications. I've built everything from task management systems to weather dashboards, always focusing on user experience and performance.";

  // Category configuration with icons and colors
  const categoryConfig = [
    { 
      id: 'All' as CategoryFilter, 
      label: 'All Projects', 
      icon: <Filter size={16} />,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-700'
    },
    { 
      id: 'Fullstack' as CategoryFilter, 
      label: 'Full-Stack', 
      icon: <Layers size={16} />,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-700'
    },
    { 
      id: 'Frontend' as CategoryFilter, 
      label: 'Frontend', 
      icon: <Code size={16} />,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-700'
    },
    { 
      id: 'Backend' as CategoryFilter, 
      label: 'Backend', 
      icon: <Server size={16} />,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-700'
    },
    { 
      id: 'AI' as CategoryFilter, 
      label: 'AI/ML', 
      icon: <Brain size={16} />,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-700'
    },
    { 
      id: 'Open Source' as CategoryFilter, 
      label: 'Open Source', 
      icon: <GitBranch size={16} />,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-700'
    }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (useCache) {
        const cached = localStorage.getItem(PROJECTS_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;
          
          if (!isExpired && data) {
            setProjects(data);
            setLoading(false);
            return;
          }
        }
      }
      
      const { data: connectionTest, error: connectionError } = await supabase
        .from('projects')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }
      
      const projectsData = data || [];
      setProjects(projectsData);

      // Cache the results
      localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify({
        data: projectsData,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error('Error fetching projects:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching projects');
      }

      // Try to use cached data as fallback
      const cached = localStorage.getItem(PROJECTS_CACHE_KEY);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          if (data) {
            setProjects(data);
          }
        } catch (cacheError) {
          console.warn('Failed to parse cached projects:', cacheError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on category and featured status
  const filteredProjects = projects.filter(project => {
    const categoryMatch = activeCategory === 'All' || project.category === activeCategory;
    const featuredMatch = !showFeaturedOnly || project.featured;
    return categoryMatch && featuredMatch;
  });

  // Get category counts
  const getCategoryCount = (category: CategoryFilter): number => {
    if (category === 'All') {
      return showFeaturedOnly ? projects.filter(p => p.featured).length : projects.length;
    }
    const categoryProjects = projects.filter(p => p.category === category);
    return showFeaturedOnly ? categoryProjects.filter(p => p.featured).length : categoryProjects.length;
  };

  // Handle category change
  const handleCategoryChange = (category: CategoryFilter) => {
    playClickSound();
    setActiveCategory(category);
  };

  // Handle featured toggle
  const handleFeaturedToggle = () => {
    playClickSound();
    setShowFeaturedOnly(!showFeaturedOnly);
  };

  // LAZY LOADING: Only generate audio when user clicks play
  const handlePlaySectionAudio = async () => {
    if (isPlayingSection) return;

    try {
      playVoiceSound();
      setIsLoadingSection(true);
      setAudioError(null);

      if (!sectionAudioUrl) {
        const url = await generateProjectsVoice(projectsText);
        if (!url) {
          throw new Error('Failed to generate audio - please check your ElevenLabs configuration');
        }
        setSectionAudioUrl(url);
        
        setIsPlayingSection(true);
        await playAudio(url);
      } else {
        setIsPlayingSection(true);
        await playAudio(sectionAudioUrl);
      }
    } catch (error) {
      console.error('Failed to load projects audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load audio content';
      setAudioError(errorMessage);
    } finally {
      setIsLoadingSection(false);
      setIsPlayingSection(false);
    }
  };

  const handleStopSectionAudio = () => {
    playClickSound();
    stopCurrentAudio();
    setIsPlayingSection(false);
  };

  const handlePlayProjectAudio = async (project: Project) => {
    if (playingProject === project.id) {
      stopCurrentAudio();
      setPlayingProject(null);
      return;
    }

    try {
      setLoadingProject(project.id);
      
      let audioUrl = projectAudios[project.id];
      
      if (!audioUrl) {
        audioUrl = await generateProjectDescription(project.title, project.description);
        if (audioUrl) {
          setProjectAudios(prev => ({ ...prev, [project.id]: audioUrl }));
        }
      }
      
      if (audioUrl) {
        setPlayingProject(project.id);
        await playAudio(audioUrl);
      }
    } catch (error) {
      console.error('Project audio playback failed:', error);
    } finally {
      setLoadingProject(null);
      setPlayingProject(null);
    }
  };

  const retryAudio = () => {
    playClickSound();
    setAudioError(null);
    setSectionAudioUrl(null);
  };

  const retryProjects = () => {
    playClickSound();
    fetchProjects(false); // Force refresh without cache
  };

  const ProjectSkeleton = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-700 text-center">
              Featured Projects
            </h2>
            
            {/* Voice Control Button */}
            <motion.button
              onClick={isPlayingSection ? handleStopSectionAudio : handlePlaySectionAudio}
              disabled={isLoadingSection}
              className="group relative inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-sky-700 border border-gray-300 hover:border-sky-300 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              aria-label={isPlayingSection ? "Stop audio" : "Listen to projects overview"}
            >
              <motion.div
                animate={isPlayingSection ? { 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ 
                  duration: 2, 
                  repeat: isPlayingSection ? Infinity : 0, 
                  ease: "linear" 
                }}
                className="relative z-10"
              >
                {isLoadingSection ? (
                  <Loader size={18} className="animate-spin text-sky-600" />
                ) : isPlayingSection ? (
                  <VolumeX size={18} className="text-red-600" />
                ) : (
                  <Volume2 size={18} className="text-sky-600 group-hover:text-sky-700 transition-colors" />
                )}
              </motion.div>
              
              <span className="relative z-10 text-sm font-semibold">
                {isLoadingSection ? 'Generating...' : isPlayingSection ? 'Stop' : 'Listen'}
              </span>
              
              {isPlayingSection && (
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

          {/* Category Filters and Featured Toggle */}
          {!loading && projects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 mb-12"
            >
              {/* Featured Toggle */}
              <div className="flex justify-center">
                <motion.button
                  onClick={handleFeaturedToggle}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition-all duration-300 ${
                    showFeaturedOnly
                      ? 'bg-sky-700 text-white border-sky-700 shadow-lg shadow-sky-700/25'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Star size={16} className={showFeaturedOnly ? 'fill-current' : ''} />
                  <span>Featured Only</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    showFeaturedOnly
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {projects.filter(p => p.featured).length}
                  </span>
                </motion.button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap justify-center gap-3">
                {categoryConfig.map((category) => {
                  const count = getCategoryCount(category.id);
                  const isActive = activeCategory === category.id;
                  
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition-all duration-300 ${
                        isActive
                          ? `bg-sky-700 text-white border-sky-700 shadow-lg shadow-sky-700/25`
                          : `bg-white text-gray-800 border-gray-300 hover:${category.bgColor} hover:${category.borderColor} hover:${category.color}`
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={count === 0}
                    >
                      {category.icon}
                      <span>{category.label}</span>
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
              </div>
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
                    disabled={isLoadingSection}
                    className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoadingSection ? (
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

          {/* Projects Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold mb-2">Connection Error</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={retryProjects}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Grid */}
          {loading ? (
            // Show skeleton loaders
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProjectSkeleton key={index} />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            // Show actual projects with animation
            <motion.div 
              layout
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group relative"
                  >
                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-3 left-3 z-10">
                        <motion.div
                          className="inline-flex items-center gap-1 bg-sky-700 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Star size={12} className="fill-current" />
                          <span>Featured</span>
                        </motion.div>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <motion.div
                        className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-sky-700 border border-sky-700 px-2 py-1 rounded-full text-xs font-semibold shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        {categoryConfig.find(cat => cat.id === project.category)?.icon}
                        <span>{project.category}</span>
                      </motion.div>
                    </div>

                    <div className="relative overflow-hidden">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Project Audio Button */}
                      <motion.button
                        onClick={() => handlePlayProjectAudio(project)}
                        disabled={loadingProject === project.id}
                        className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-gray-700 hover:text-sky-600 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border border-white/20"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={
                          playingProject === project.id 
                            ? `Stop ${project.title} description` 
                            : `Listen to ${project.title} description`
                        }
                      >
                        {loadingProject === project.id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : playingProject === project.id ? (
                          <VolumeX size={16} className="text-red-600" />
                        ) : (
                          <Play size={16} />
                        )}
                      </motion.button>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-800 mb-2">
                        <Calendar size={14} />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      
                      <h3 className="text-xl font-bold text-sky-700 mb-3 group-hover:text-sky-600 transition-colors">
                        {project.title}
                      </h3>
                      
                      <p className="text-gray-800 mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      
                      {/* Enhanced Tech Stack Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech_stack.map((tech, techIndex) => (
                          <motion.span
                            key={techIndex}
                            className="text-xs bg-white text-sky-700 border border-sky-700 px-2 py-1 rounded-full font-medium hover:bg-sky-50 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + techIndex * 0.05 }}
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                      
                      <div className="flex gap-3">
                        {project.live_url && (
                          <motion.a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ExternalLink size={16} />
                            Live Demo
                          </motion.a>
                        )}
                        
                        {project.github_url && (
                          <motion.a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Github size={16} />
                            Code
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            // No projects found for current filter
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
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {activeCategory === 'All' 
                    ? (showFeaturedOnly ? 'No Featured Projects' : 'No Projects Found')
                    : `No ${activeCategory} Projects${showFeaturedOnly ? ' (Featured)' : ''}`
                  }
                </h3>
                <p className="text-gray-800 mb-6">
                  {showFeaturedOnly 
                    ? 'Try disabling the featured filter or selecting a different category.'
                    : 'Try selecting a different category or check back soon for new projects!'
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {showFeaturedOnly && (
                    <motion.button
                      onClick={handleFeaturedToggle}
                      className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Show All Projects
                    </motion.button>
                  )}
                  {activeCategory !== 'All' && (
                    <motion.button
                      onClick={() => handleCategoryChange('All')}
                      className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View All Categories
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {!loading && projects.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-800">No projects found. Check back soon!</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;