import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, Building2 } from 'lucide-react';
import { Experience } from '../../lib/supabase';

interface WorkExperienceTimelineProps {
  experiences: Experience[];
}

const WorkExperienceTimeline: React.FC<WorkExperienceTimelineProps> = ({ experiences }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDuration = (startDate: string, endDate?: string) => {
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Present';
    return `${start} – ${end}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-500';
      case 'ongoing':
        return 'bg-blue-500';
      default:
        return 'bg-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'current':
        return 'Current Position';
      case 'ongoing':
        return 'Ongoing';
      default:
        return 'Completed';
    }
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-transparent"></div>
      
      <div className="space-y-8">
        {experiences.map((experience, index) => (
          <motion.div
            key={experience.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="relative flex gap-6"
          >
            {/* Timeline Node */}
            <div className="relative flex-shrink-0">
              <motion.div
                className={`w-4 h-4 rounded-full ${getStatusColor(experience.status)} border-4 border-white shadow-lg z-10 relative`}
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.2 }}
              />
              {experience.status === 'current' && (
                <motion.div
                  className="absolute inset-0 w-4 h-4 rounded-full bg-green-400 opacity-75"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            {/* Experience Card */}
            <motion.div
              className="flex-1 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 overflow-hidden group"
              whileHover={{ y: -2 }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {experience.logo_url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          <img
                            src={experience.logo_url}
                            alt={`${experience.organization} logo`}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {experience.title}
                        </h3>
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <Building2 size={16} />
                          <span>{experience.organization}</span>
                          {experience.url && (
                            <a
                              href={experience.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDuration(experience.start_date, experience.end_date)}</span>
                      </div>
                      {experience.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{experience.location}</span>
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        experience.status === 'current' 
                          ? 'bg-green-100 text-green-700'
                          : experience.status === 'ongoing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {getStatusText(experience.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-700 leading-relaxed mb-4">
                  {experience.description}
                </p>

                {/* Skills */}
                {experience.skills && experience.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {experience.skills.map((skill, skillIndex) => (
                      <motion.span
                        key={skillIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + skillIndex * 0.05 }}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorkExperienceTimeline;