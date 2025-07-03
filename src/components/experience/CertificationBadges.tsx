import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Award, Shield, Star, CheckCircle } from 'lucide-react';
import { Experience } from '../../lib/supabase';

interface CertificationBadgesProps {
  certifications: Experience[];
}

const CertificationBadges: React.FC<CertificationBadgesProps> = ({ certifications }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getCertificationIcon = (organization: string) => {
    const orgLower = organization.toLowerCase();
    if (orgLower.includes('aws') || orgLower.includes('amazon')) {
      return <Shield size={20} className="text-orange-600" />;
    } else if (orgLower.includes('google')) {
      return <Star size={20} className="text-blue-600" />;
    } else if (orgLower.includes('oracle')) {
      return <Award size={20} className="text-red-600" />;
    } else if (orgLower.includes('kubernetes') || orgLower.includes('cncf')) {
      return <CheckCircle size={20} className="text-blue-600" />;
    }
    return <Award size={20} className="text-purple-600" />;
  };

  const getCertificationColor = (organization: string) => {
    const orgLower = organization.toLowerCase();
    if (orgLower.includes('aws') || orgLower.includes('amazon')) {
      return {
        bg: 'from-orange-500 to-orange-600',
        border: 'border-orange-200',
        text: 'text-orange-700',
        bgLight: 'bg-orange-50'
      };
    } else if (orgLower.includes('google')) {
      return {
        bg: 'from-blue-500 to-blue-600',
        border: 'border-blue-200',
        text: 'text-blue-700',
        bgLight: 'bg-blue-50'
      };
    } else if (orgLower.includes('oracle')) {
      return {
        bg: 'from-red-500 to-red-600',
        border: 'border-red-200',
        text: 'text-red-700',
        bgLight: 'bg-red-50'
      };
    } else if (orgLower.includes('kubernetes') || orgLower.includes('cncf')) {
      return {
        bg: 'from-blue-500 to-indigo-600',
        border: 'border-blue-200',
        text: 'text-blue-700',
        bgLight: 'bg-blue-50'
      };
    }
    return {
      bg: 'from-purple-500 to-purple-600',
      border: 'border-purple-200',
      text: 'text-purple-700',
      bgLight: 'bg-purple-50'
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {certifications.map((cert, index) => {
        const colors = getCertificationColor(cert.organization);
        
        return (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border ${colors.border} overflow-hidden group`}
            whileHover={{ y: -2, scale: 1.02 }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className={`w-full h-full bg-gradient-to-br ${colors.bg}`}></div>
            </div>

            {/* Header with Gradient */}
            <div className={`relative bg-gradient-to-r ${colors.bg} p-6 text-white`}>
              <div className="flex items-start gap-4">
                {cert.logo_url && (
                  <div className="w-16 h-16 rounded-lg bg-white/20 backdrop-blur-sm p-3 flex-shrink-0">
                    <img
                      src={cert.logo_url}
                      alt={`${cert.organization} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getCertificationIcon(cert.organization)}
                    <span className="text-sm font-medium opacity-90">
                      {cert.organization}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">
                    {cert.title}
                  </h3>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-2 right-2 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-2 left-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Description */}
              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                {cert.description}
              </p>

              {/* Meta Information */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={14} />
                  <span>Issued: {formatDate(cert.start_date)}</span>
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 ${colors.bgLight} ${colors.text} rounded-full text-xs font-medium`}>
                  <CheckCircle size={12} />
                  <span>Verified</span>
                </div>
              </div>

              {/* Skills */}
              {cert.skills && cert.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {cert.skills.map((skill, skillIndex) => (
                    <motion.span
                      key={skillIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + skillIndex * 0.05 }}
                      className={`px-2 py-1 ${colors.bgLight} ${colors.text} rounded text-xs font-medium hover:scale-105 transition-transform`}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Action Button */}
              {cert.url && (
                <motion.a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${colors.bg} text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink size={16} />
                  <span>View Credential</span>
                </motion.a>
              )}
            </div>

            {/* Achievement Badge */}
            <div className="absolute top-4 right-4">
              <motion.div
                className={`w-8 h-8 bg-gradient-to-r ${colors.bg} rounded-full flex items-center justify-center text-white shadow-lg`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Award size={16} />
              </motion.div>
            </div>

            {/* Hover Effect */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.bg} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CertificationBadges;