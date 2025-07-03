import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle, AlertCircle, Volume2, VolumeX, Loader, RefreshCw, Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { supabase, Contact as ContactType } from '../lib/supabase';
import { generateContactVoice, playAudio, stopCurrentAudio } from '../lib/elevenlabs';
import { playClickSound, playVoiceSound, playSuccessSound, playErrorSound } from '../lib/sounds';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface ToastState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'success', message: '' });
  const [sectionAudioUrl, setSectionAudioUrl] = useState<string | null>(null);
  const [isPlayingSection, setIsPlayingSection] = useState(false);
  const [isLoadingSection, setIsLoadingSection] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const contactText = "Ready to work together? I'd love to hear about your project ideas and discuss how we can bring them to life. Feel free to reach out through the contact form, and I'll get back to you as soon as possible. Let's build something amazing together!";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>();

  // Social links
  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: <Linkedin size={20} />,
      url: 'https://linkedin.com/in/sanamsai',
      color: 'text-sky-700 hover:text-sky-600'
    },
    {
      name: 'GitHub',
      icon: <Github size={20} />,
      url: 'https://github.com/sanamsai',
      color: 'text-sky-700 hover:text-sky-600'
    },
    {
      name: 'Email',
      icon: <Mail size={20} />,
      url: 'mailto:sanam.sai@example.com',
      color: 'text-sky-700 hover:text-sky-600'
    },
    {
      name: 'Twitter',
      icon: <Twitter size={20} />,
      url: 'https://twitter.com/sanamsai',
      color: 'text-sky-700 hover:text-sky-600'
    }
  ];

  // LAZY LOADING: Only generate audio when user clicks play
  const handlePlaySectionAudio = async () => {
    if (isPlayingSection) return;

    try {
      playVoiceSound();
      setIsLoadingSection(true);
      setAudioError(null);

      if (!sectionAudioUrl) {
        const url = await generateContactVoice(contactText);
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
      console.error('Failed to load contact audio:', error);
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

  const retryAudio = () => {
    playClickSound();
    setAudioError(null);
    setSectionAudioUrl(null);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    if (type === 'success') {
      playSuccessSound();
    } else {
      playErrorSound();
    }
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 5000);
  };

  const onSubmit = async (data: FormData) => {
    playClickSound();
    setIsSubmitting(true);
    
    try {
      const contactData: ContactType = {
        name: data.name,
        email: data.email,
        message: data.message
      };

      const { error } = await supabase
        .from('contacts')
        .insert([contactData]);

      if (error) throw error;

      showToast('success', 'Thank you for your message! I\'ll get back to you soon.');
      reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showToast('error', 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-700 text-center">
              Contact Me
            </h2>
            
            {/* Voice Control Button */}
            <motion.button
              onClick={isPlayingSection ? handleStopSectionAudio : handlePlaySectionAudio}
              disabled={isLoadingSection}
              className="group relative inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-sky-700 border border-gray-300 hover:border-sky-300 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              aria-label={isPlayingSection ? "Stop audio" : "Listen to contact section"}
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

          {/* Contact Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              Ready to work together? I'd love to hear about your <span className="text-sky-700 font-semibold">project ideas</span> and discuss how we can bring them to life.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Name is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-700 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Please enter a valid email'
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-700 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <label htmlFor="message" className="block text-sm font-medium text-gray-800 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  {...register('message', { required: 'Message is required' })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-700 focus:border-transparent transition-colors resize-vertical ${
                    errors.message ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Tell me about your project or just say hello!"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="w-full bg-sky-700 hover:bg-sky-600 disabled:bg-sky-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-8 pt-8 border-t border-gray-200"
            >
              <p className="text-center text-gray-800 mb-4">Or connect with me on:</p>
              <div className="flex justify-center space-x-6">
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${link.color} transition-colors duration-200`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={link.name}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Toast Notification */}
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md z-50 ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p>{toast.message}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Contact;