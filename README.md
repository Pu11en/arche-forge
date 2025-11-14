# ArcheForge

> A modern, accessible landing page showcasing brand identity with soul

ArcheForge is a React-based landing page that demonstrates a unique brand identity through animated taglines, immersive video backgrounds, and thoughtful accessibility features. The project emphasizes making AI interactions feel more human by mirroring authentic identity.

## ✨ Features

- **Animated Tagline Rotation**: Dynamic display of brand taglines with smooth transitions
- **Video Background**: Immersive video background with intelligent loading
  - Mobile-optimized video delivery
  - Network-aware loading (respects slow connections)
  - User preference controls for video playback
- **Mobile-First Design**: Fully responsive with custom breakpoints
  - iPhone SE (375px)
  - iPhone Pro (414px)
  - iPad (768px)
  - Landscape orientation support
- **Accessibility-First Approach**:
  - Reduced motion support for users with motion sensitivity
  - Proper ARIA labels and keyboard navigation
  - Touch-friendly interactive elements (44x44px minimum)
  - Safe area insets for modern devices with notches
- **Performance Optimizations**:
  - Lazy loading for video content
  - Hardware-accelerated animations
  - Conditional loading based on device and network
  - Intersection observer for efficient resource management

## 🛠 Tech Stack

- **Frontend Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 4.4
- **Styling**: Tailwind CSS 3.3 with custom configurations
- **Animations**: Framer Motion 10.16
- **Icons**: Lucide React 0.263
- **Testing**: Puppeteer 24.27 (for mobile responsiveness testing)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Pu11en/arche-forge.git

# Navigate to the project directory
cd arche-forge

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Create a production build
npm run build

# Preview the production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## 📁 Project Structure

```
arche-forge/
├── public/              # Static assets
│   ├── bull2.png       # Logo/icon
│   └── hammer.mp3      # Audio assets
├── src/
│   ├── components/     # React components
│   │   └── ui/        # UI components
│   │       ├── animated-hero.tsx
│   │       ├── button.tsx
│   │       ├── social-media-icons.tsx
│   │       └── loading-overlay/
│   ├── hooks/         # Custom React hooks
│   │   └── useReducedMotion.ts
│   ├── lib/           # Utility functions
│   │   ├── browser-detection.ts
│   │   ├── cross-browser-styles.ts
│   │   └── utils.ts
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## 🎨 Customization

### Tailwind Configuration

The project uses custom Tailwind breakpoints optimized for mobile devices:

```javascript
screens: {
  'xs': '375px',   // iPhone SE
  'sm': '414px',   // iPhone Pro
  'lg': '768px',   // iPad
  'landscape-xs': { 'raw': '(min-width: 375px) and (orientation: landscape)' },
  'landscape-sm': { 'raw': '(min-width: 414px) and (orientation: landscape)' }
}
```

### Video Sources

Video URLs can be configured in [`src/components/ui/animated-hero.tsx`](src/components/ui/animated-hero.tsx:149):

```typescript
const videoSource = useMemo(() => {
  if (isMobile) {
    return "your-mobile-video-url";
  } else {
    return "your-desktop-video-url";
  }
}, [isMobile]);
```

## 🌐 Deployment

The project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel, and it will automatically deploy on every push to the main branch.

### Vercel Configuration

The project includes a [`vercel.json`](vercel.json) configuration file for optimal deployment settings.

## 🧪 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Optimization

The project includes extensive mobile optimizations:

- Touch interaction resets and configurations
- Safe area inset support for devices with notches
- iOS and Android-specific browser resets
- Network-aware video loading
- Orientation change handling

## ♿ Accessibility

ArcheForge is built with accessibility in mind:

- **Reduced Motion**: Respects `prefers-reduced-motion` media query
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Touch Targets**: Minimum 44x44px touch targets for mobile
- **ARIA Labels**: Proper labeling for screen readers
- **Semantic HTML**: Proper use of HTML5 semantic elements

## 📄 License

This project is private and proprietary.

## 👤 Author

**Drew Pullen**

- GitHub: [@Pu11en](https://github.com/Pu11en)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for authentic AI interactions
- Designed with accessibility and performance in mind

---

**Note**: This is a landing page project focused on brand identity and user experience. The taglines and content reflect a unique brand voice and philosophy.