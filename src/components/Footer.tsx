import React, { useEffect, useState } from 'react';
import { Github, Linkedin, Twitter, Mail, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Footer: React.FC = () => {
  const [visitCount, setVisitCount] = useState<number>(0);

  useEffect(() => {
    incrementVisitCount();
  }, []);

  const incrementVisitCount = async () => {
    try {
      // First, try to get the current visit count
      const { data: existingVisit } = await supabase
        .from('visits')
        .select('count')
        .eq('id', 1)
        .single();

      if (existingVisit) {
        // Update existing count
        const newCount = existingVisit.count + 1;
        const { error } = await supabase
          .from('visits')
          .update({ count: newCount, updated_at: new Date().toISOString() })
          .eq('id', 1);

        if (!error) setVisitCount(newCount);
      } else {
        // Create first visit record
        const { error } = await supabase
          .from('visits')
          .insert([{ id: 1, count: 1 }]);

        if (!error) setVisitCount(1);
      }
    } catch (error) {
      console.error('Error updating visit count:', error);
    }
  };

  const socialLinks = [
    {
      name: 'GitHub',
      icon: <Github size={20} />,
      url: 'https://github.com/sanamsai',
      color: 'hover:text-gray-900'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={20} />,
      url: 'https://linkedin.com/in/sanamsai',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      icon: <Twitter size={20} />,
      url: 'https://twitter.com/sanamsai',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Email',
      icon: <Mail size={20} />,
      url: 'mailto:sanam.sai@example.com',
      color: 'hover:text-red-500'
    }
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Social Links */}
          <div className="flex space-x-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-slate-400 ${link.color} transition-colors duration-200`}
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Visit Counter */}
          {visitCount > 0 && (
            <div className="flex items-center gap-2 text-slate-400">
              <Eye size={16} />
              <span className="text-sm">
                {visitCount.toLocaleString()} visit{visitCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <hr className="border-slate-700 my-8" />

        <div className="text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} Sanam Sai. All rights reserved.</p>
          <p className="text-sm mt-2">
            Built with React, TypeScript, Tailwind CSS, and Supabase
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;