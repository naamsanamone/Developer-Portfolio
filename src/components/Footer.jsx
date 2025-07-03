import React from 'react';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer = () => {
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