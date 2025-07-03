import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-sky-700 text-center mb-12">
            About Me
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6">
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

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-sky-700 mb-6">
                  Interests & Achievements
                </h3>
                
                <div className="space-y-3">
                  {[
                    'AWS Certified Solutions Architect',
                    'Built 20+ production applications',
                    'Open source contributor with 1k+ GitHub stars',
                    'Technical writer and mentor',
                    'Performance optimization enthusiast',
                    'Remote collaboration expert'
                  ].map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
                    >
                      <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                      <span className="text-gray-800 group-hover:text-sky-700 transition-colors duration-200">
                        {achievement}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;