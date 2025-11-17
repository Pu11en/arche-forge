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
        background: 'rgba(0, 0, 0, 0.7)', // Semi-transparent dark strip
        backdropFilter: 'blur(5px)',
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
                className="text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.5))',
                  opacity: 0.9
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) drop-shadow(0 0 16px rgba(255,255,255,0.6))';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 2px 4px rgba(255,255,255,0.5))';
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label={social.ariaLabel}
              >
                <IconComponent
                  size={24}
                  className="transition-transform duration-300"
                  strokeWidth={2}
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