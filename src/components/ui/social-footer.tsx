import React from "react";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export interface SocialFooterProps {
  /** Optional className for additional styling */
  className?: string;
}

const SocialFooter: React.FC<SocialFooterProps> = ({
  className = ""
}) => {
  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      url: "https://github.com/archeforge",
      ariaLabel: "Visit our GitHub"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com/archeforge",
      ariaLabel: "Follow us on Twitter"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://linkedin.com/company/archeforge",
      ariaLabel: "Connect with us on LinkedIn"
    },
    {
      name: "Email",
      icon: Mail,
      url: "mailto:hello@archeforge.com",
      ariaLabel: "Send us an email"
    }
  ];

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-30 ${className}`}
      style={{
        height: '70px',
        background: 'linear-gradient(135deg, rgba(128,128,128,0.1) 0%, rgba(192,192,192,0.1) 100%)', // Brushed steel texture at 10% opacity
        backdropFilter: 'blur(1px)',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}
      role="contentinfo"
      aria-label="Social media links"
    >
      <div className="flex items-center justify-center h-full px-4">
        <div className="flex items-center space-x-8">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black transition-all duration-300 hover:text-gray-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 2px 8px rgba(255,255,255,0.4)) drop-shadow(0 0 4px rgba(255,255,255,0.2))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
                }}
                aria-label={social.ariaLabel}
              >
                <IconComponent
                  size={24}
                  className="transition-transform duration-300"
                  strokeWidth={1.5}
                />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

export { SocialFooter };