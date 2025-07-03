import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, Building2 } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      title: 'Senior Full-Stack Developer',
      company: 'Mphasis',
      period: '2022 - Present',
      location: 'Bangalore, India',
      description: 'Led development of enterprise-scale applications using React, Java Spring Boot, and AWS. Mentored junior developers and implemented CI/CD pipelines.',
      skills: ['React', 'Java', 'Spring Boot', 'AWS', 'PostgreSQL', 'Docker']
    },
    {
      title: 'Full-Stack Developer',
      company: 'Tech Startup',
      period: '2020 - 2022',
      location: 'Remote',
      description: 'Built scalable web applications from scratch. Worked closely with product team to deliver user-centric solutions.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript']
    },
    {
      title: 'Frontend Developer',
      company: 'Digital Agency',
      period: '2019 - 2020',
      location: 'Mumbai, India',
      description: 'Developed responsive web applications and collaborated with design teams to create pixel-perfect user interfaces.',
      skills: ['JavaScript', 'React', 'CSS3', 'HTML5', 'Figma']
    }
  ];

  return (
    <section id="experience" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-sky-700 text-center mb-12">
            Professional Experience
          </h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-transparent"></div>
            
            <div className="space-y-8">
              {experiences.map((experience, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative flex gap-6"
                >
                  {/* Timeline Node */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="w-4 h-4 rounded-full bg-sky-600 border-4 border-white shadow-lg z-10 relative"
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>

                  {/* Experience Card */}
                  <motion.div
                    className="flex-1 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
                    whileHover={{ y: -2 }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {experience.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sky-600 font-medium mb-2">
                            <Building2 size={16} />
                            <span>{experience.company}</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{experience.period}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{experience.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-4">
                        {experience.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {experience.skills.map((skill, skillIndex) => (
                          <motion.span
                            key={skillIndex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + skillIndex * 0.05 }}
                            viewport={{ once: true }}
                            className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-sm font-medium hover:bg-sky-100 transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;