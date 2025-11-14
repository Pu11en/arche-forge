# ArcheForge

ArcheForge - Crafting Digital Excellence. A modern, responsive web application built with React, TypeScript, and Vite.

## 🚀 Features

- ⚡️ Lightning-fast performance with Vite
- 🎨 Beautiful UI with Tailwind CSS and Framer Motion animations
- 📱 Fully responsive mobile design
- ♿️ Accessibility-first approach
- 🎯 TypeScript for type safety
- 🌐 PWA-ready with manifest.json

## 🛠️ Tech Stack

- **Framework:** React 18.2.0
- **Build Tool:** Vite 4.4.5
- **Language:** TypeScript 5.0.2
- **Styling:** Tailwind CSS 3.3.0
- **Animations:** Framer Motion 10.16.4
- **Icons:** Lucide React 0.263.1
- **Utilities:** clsx, tailwind-merge, class-variance-authority

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Pu11en/arche-forge.git

# Navigate to project directory
cd arche-forge

# Install dependencies
npm install
```

## 🏃‍♂️ Development

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🌐 Deployment to Vercel

This project is configured for seamless deployment to Vercel.

### Prerequisites

- A [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/docs/cli) (optional, for CLI deployment)

### Deployment Steps

#### Method 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the Vite framework
6. Click "Deploy"

The project is already configured with `vercel.json`, so no additional configuration is needed.

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Configuration

The project includes a `vercel.json` file with:
- ✅ Correct build command and output directory
- ✅ SPA routing configuration
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Framework detection for Vite

### Environment Variables

If you need to add environment variables:

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Environment Variables"
3. Add your variables (they should be prefixed with `VITE_` to be accessible in the app)

Example:
```
VITE_API_URL=https://api.example.com
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📁 Project Structure

```
arche-forge/
├── public/              # Static assets
│   ├── vite.svg        # Favicon
│   ├── favicon-*.png   # Various favicon sizes
│   ├── apple-touch-icon.png
│   ├── manifest.json   # PWA manifest
│   ├── bull2.png       # Project assets
│   └── hammer.mp3      # Audio assets
├── src/
│   ├── components/     # React components
│   │   └── ui/        # UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── App.tsx        # Main App component
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite configuration
├── vercel.json        # Vercel deployment configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## 🧪 Testing

The project includes comprehensive test files for components:

```bash
# Run tests (if test runner is configured)
npm test
```

Note: Puppeteer is included in `devDependencies` for mobile responsiveness testing during development.

## 🔒 Security

The project includes security headers configured in `vercel.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## 📱 PWA Support

The application is PWA-ready with:
- `manifest.json` for installability
- Multiple icon sizes for different devices
- Proper theme colors and display modes

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👤 Author

**Drew Pullen**

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- Deployed on [Vercel](https://vercel.com/)

---

**Note:** Make sure to run `npm install` after cloning to install all dependencies. The project uses Node.js and npm for package management.