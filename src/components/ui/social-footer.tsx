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
      className={`fixed bottom-0 left-0 right-0 ${className}`}
      style={{
        width: '100%',
        height: '70px',
        background: 'rgba(50, 50, 50, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        zIndex: 1
      }}
      role="contentinfo"
      aria-label="Social media links"
    >
      {socialLinks.map((social) => {
        const IconComponent = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              opacity: 0.7,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
            aria-label={social.ariaLabel}
          >
            <IconComponent
              size={24}
              style={{
                filter: 'brightness(0) invert(1)'
              }}
              strokeWidth={1.5}
            />
          </a>
        );
      })}
    </footer>
  );
};

export { SocialFooter };