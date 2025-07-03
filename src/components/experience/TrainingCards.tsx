import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Award, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import { Experience } from '../../lib/supabase';

interface TrainingCardsProps {
  trainings: Experience[];
}

const TrainingCards: React.FC<TrainingCardsProps> = ({ trainings }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <PlayCircle size={16} className="text-blue-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Clock size={16} className="text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Scheduled';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trainings.map((training, index) => (
        <motion.div
          key={training.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 overflow-hidden group"
          whileHover={{ y: -4 }}
        >
          {/* Header with Logo */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4 mb-4">
              {training.logo_url && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 p-2">
                  <img
                    src={training.logo_url}
                    alt={`${training.organization} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {training.title}
                </h3>
                <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                  <Award size={16} />
                  <span className="truncate">{training.organization}</span>
                  {training.url && (
                    <a
                      href={training.url}
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

            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(training.status)}`}>
                {getStatusIcon(training.status)}
                <span>{getStatusText(training.status)}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
              {training.description}
            </p>

            {/* Date Information */}
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Started: {formatDate(training.start_date)}</span>
              </div>
              {training.end_date && training.status === 'completed' && (
                <div className="flex items-center gap-1">
                  <CheckCircle size={14} className="text-green-600" />
                  <span>Completed: {formatDate(training.end_date)}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {training.skills && training.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {training.skills.slice(0, 4).map((skill, skillIndex) => (
                  <motion.span
                    key={skillIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + skillIndex * 0.05 }}
                    className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    {skill}
                  </motion.span>
                ))}
                {training.skills.length > 4 && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-medium">
                    +{training.skills.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar for Ongoing Trainings */}
          {training.status === 'ongoing' && (
            <div className="px-6 pb-4">
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }} // You can calculate actual progress
                  transition={{ duration: 1.5, delay: index * 0.1 }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Estimated 65% complete</p>
            </div>
          )}

          {/* Hover Effect */}
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default TrainingCards;