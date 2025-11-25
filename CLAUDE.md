# CLAUDE.md - AI Assistant Guide for ArcheForge Landing

## Project Overview

**ArcheForge Landing** is a high-fidelity React landing page with immersive video backgrounds, advanced animations, and interactive 3D effects. Built with modern web technologies, it showcases the ArcheForge brand, team members, divisions, and brand philosophy.

- **Tech Stack**: React 19 + TypeScript + Vite 6.2 + Tailwind CSS v4 + Framer Motion 12
- **Project Type**: Single-page application (SPA) with scroll-based navigation
- **Dev Server**: Runs on port 4000 (configured in vite.config.ts)
- **Repository**: Pu11en/arche-forge

## Codebase Structure

```
/home/user/arche-forge/
├── components/              # All React UI components
│   ├── BackgroundVideo.tsx  # Cloudinary-hosted background video
│   ├── IntroOverlay.tsx     # Intro animation with fade effect
│   ├── HeroSection.tsx      # Main hero with rotating TM phrases
│   ├── HeroHeaderBlock.tsx  # Parallax "Archetypal Partners" section
│   ├── PartnerShrineGrid.tsx # 8 team members with 3D hover effects
│   ├── DivisionGrid3x3.tsx  # 7 ArcheForge divisions grid
│   ├── LinkStrip.tsx        # Navigation strip with brand links
│   ├── ForgeDoctrineBlock.tsx # Vertical doctrine text display
│   ├── SteelFooter.tsx      # Footer with branding
│   ├── ContentSection.tsx   # Content wrapper component
│   ├── FeaturesSection.tsx  # Feature highlights
│   └── ui/
│       └── signature-gallery.tsx # Team signature images gallery
├── lib/
│   └── utils.ts             # cn() utility for className composition
├── public/
│   └── signatures/          # 8 PNG signature images (~580KB each)
├── App.tsx                  # Main application component
├── index.tsx                # React entry point
├── index.html               # HTML entry point with font imports
├── index.css                # Global styles and Tailwind imports
├── constants.ts             # Static data arrays (PARTNERS, DIVISIONS, etc.)
├── vite.config.ts           # Vite configuration (port 4000)
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

### Key Files

| File | Purpose | Notes |
|------|---------|-------|
| **App.tsx** | Main component orchestrating page flow | Manages scroll lock/unlock logic |
| **constants.ts** | Static data for grids (87 TM phrases, 8 partners, 7 divisions, 8 links) | Single source of truth for content |
| **index.html** | Loads Google Fonts (Cinzel, Inter, Koulen) | Custom font declarations |
| **lib/utils.ts** | `cn()` function combining clsx + tailwind-merge | Used throughout for className composition |

## Architecture & Patterns

### Component Architecture

1. **Functional Components with TypeScript**
   - All components use `React.FC<Props>` pattern
   - Props are typed with interfaces
   - Example:
     ```typescript
     interface Partner {
       name: string;
       role: string;
       tone: string;
     }
     ```

2. **Data-Driven UI**
   - Content is stored in `constants.ts` as static arrays
   - Components map over data arrays to render UI
   - Makes content updates easy without touching component logic
   - Example: `PARTNERS.map((partner, index) => <PartnerCard key={index} {...partner} />)`

3. **Animation-First Design**
   - Framer Motion is used extensively for:
     - Scroll-triggered animations (`useScroll`, `useTransform`)
     - Entrance animations (`whileInView`, `initial`, `animate`)
     - 3D hover effects (`whileHover`, `transformStyle: "preserve-3d"`)
     - Staggered animations (`delay: index * 0.1`)

4. **No Traditional Routing**
   - React Router DOM is imported but NOT actively used
   - Page is a single-page scroll experience
   - Navigation is handled by scroll position, not URL routes

5. **Scroll Management**
   - App.tsx manages body scroll lock on initial load
   - IntroOverlay fades out automatically after video plays
   - "Enter The Forge" button in HeroSection unlocks scroll and triggers smooth scroll to content
   - Uses native window scrolling (no custom scroll containers)

### State Management

- **Local State Only**: Uses `useState()` hooks within components
- **No Global State**: No Redux, Context API, or other state management libraries
- **Refs for DOM Access**: `useRef()` for element references (animations, scroll targets)
- **Scroll State**: Managed in App.tsx with `scrollLocked` state

### Framer Motion Patterns

**Parallax Effects** (HeroHeaderBlock.tsx):
```typescript
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"]
});
const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
```

**Entrance Animations** (PartnerShrineGrid.tsx):
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, delay: index * 0.1 }}
  viewport={{ once: true }}
/>
```

**3D Hover Effects** (PartnerShrineGrid.tsx):
```typescript
<motion.div
  whileHover={{
    scale: 1.05,
    rotateY: 5,
    rotateX: -5,
    transition: { type: "spring", stiffness: 300 }
  }}
  style={{ transformStyle: "preserve-3d" }}
/>
```

## Styling Conventions

### Design System

**Brand Colors**:
- **Primary Orange**: `#f97322` (rgb(249, 115, 22))
  - Used for: accents, hover states, highlights, glows
  - Classes: `text-orange-500`, `bg-orange-500/10`, `border-orange-500/50`
  - Glow: `shadow-[0_0_20px_rgba(249,115,22,0.7)]`
  - Text shadow: `textShadow: '0 0 30px rgba(249, 115, 22, 0.4)'`

- **Backgrounds**: Black (#000000), near-black (#050505, #101010, #09090b)
- **Text Colors**:
  - Primary: `text-white`
  - Secondary: `text-zinc-400`, `text-zinc-500`, `text-zinc-600`
  - Accent: `text-orange-500`

- **Borders**: `border-zinc-800`, `border-zinc-900`, `border-orange-500/50`

### Typography

**Font Families** (loaded from Google Fonts in index.html):
1. **Cinzel** (serif, 400/700) - Headings, section titles
   - Class: `font-cinzel`
   - Used for: "ARCHETYPAL PARTNERS", major headings

2. **Inter** (sans-serif, 300/400/600) - Body text, descriptions
   - Default font for body
   - Used for: paragraphs, buttons, cards

3. **Koulen** (decorative, 400) - Rotating TM phrases
   - Class: `font-koulen`
   - Used for: Large trademark phrase display in hero

### Responsive Design

**Tailwind Breakpoints**:
```
sm:  640px  (tablets)
md:  768px  (small laptops)
lg:  1024px (large screens)
```

**Common Patterns**:
```typescript
// Typography scaling
className="text-3xl md:text-5xl lg:text-6xl"

// Grid responsiveness
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Padding/spacing
className="px-4 md:px-8 lg:px-16"

// Visibility
className="hidden md:block"
```

### Utility Function

**`cn()` from lib/utils.ts**:
```typescript
import { cn } from '@/lib/utils';

// Combines and merges Tailwind classes intelligently
className={cn(
  "base-class",
  condition && "conditional-class",
  propClassName
)}
```

**IMPORTANT**: Always use `cn()` for dynamic className composition to avoid style conflicts.

## Component Guidelines

### Creating New Components

1. **File Naming**: PascalCase (e.g., `MyComponent.tsx`)
2. **Location**: Place in `/components` directory
3. **TypeScript**: Always define prop interfaces
4. **Exports**: Use default exports for components

**Template**:
```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  className?: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className={cn("base-styles", className)}
    >
      <h2 className="font-cinzel text-2xl md:text-4xl text-white">
        {title}
      </h2>
    </motion.div>
  );
};

export default MyComponent;
```

### Data Updates

**To add/modify content**:
1. Open `constants.ts`
2. Update the relevant array (PARTNERS, DIVISIONS, TRADEMARK_PHRASES, LINKS)
3. Ensure data structure matches the interface in the component

**Example** (adding a new partner):
```typescript
// constants.ts
export const PARTNERS: Partner[] = [
  // ... existing partners
  {
    name: "New Partner",
    role: "Role Title",
    tone: "Descriptive tone statement",
    signatureUrl: "/signatures/newpartner.png"
  }
];
```

### Animation Guidelines

1. **Viewport Animations**: Always use `viewport={{ once: true }}` to prevent re-triggering
2. **Stagger Delays**: Use `index * 0.1` for sequential item animations
3. **Duration**: Standard is 0.7s for entrance animations
4. **Springs**: Use for interactive hover effects with `stiffness: 300`
5. **Parallax**: Keep transform ranges subtle (0-100px for y-axis)

### Accessibility

**Required Practices**:
- Add `aria-label` to interactive elements
- Use semantic HTML (`<section>`, `<nav>`, `<footer>`, `<article>`)
- Include `alt` text for images
- Ensure sufficient color contrast (white on black meets WCAG AA)
- Use `loading="lazy"` for images below the fold

## Development Workflow

### Starting Development

```bash
# Install dependencies (first time only)
npm install

# Start dev server (runs on port 4000)
npm run dev

# Access at http://localhost:4000
```

### Building for Production

```bash
# Create optimized build
npm run build

# Preview production build locally
npm run preview
```

**Output**: `dist/` directory with optimized static files

### Environment Variables

Create `.env.local` in root (not committed to git):
```
GEMINI_API_KEY=your_api_key_here
```

Accessed in code via Vite's `define` option:
```typescript
process.env.GEMINI_API_KEY
process.env.API_KEY
```

### Hot Module Replacement (HMR)

- Vite provides instant HMR
- Changes to components update immediately without page reload
- CSS changes apply instantly
- State is preserved during updates

### Common Tasks

**Add a new component**:
1. Create `components/MyComponent.tsx`
2. Import in `App.tsx` or parent component
3. Add to the component tree with appropriate animations

**Update content**:
1. Modify arrays in `constants.ts`
2. HMR will update automatically

**Change brand colors**:
1. Update hex values in Tailwind classes
2. Search for `#f97322` or `249, 115, 22` across files
3. Update both className props and inline styles (for shadows/glows)

**Add new assets**:
- Images: Place in `/public/` directory
- Reference as `/filename.png` (Vite serves from public root)
- For signatures: Place in `/public/signatures/`

## Git & Deployment

### Branch Strategy

**Current Branch**: `claude/claude-md-mier6khjg15pgaht-015zzvUJjy8xiMjCTByZL48K`

**CRITICAL Git Rules**:
- Branch names MUST start with `claude/` and end with matching session ID
- Push failures with 403 indicate branch naming violation
- Always use: `git push -u origin <branch-name>`
- Retry failed network operations up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Commit Guidelines

**Format**:
```
<type>: <short description>

<optional detailed description>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `style`: Styling changes (visual, not code style)
- `refactor`: Code restructuring
- `docs`: Documentation changes
- `chore`: Build/config changes

**Examples**:
```bash
git commit -m "feat: Add new partner card to shrine grid"
git commit -m "style: Update brand colors to orange theme"
git commit -m "fix: Resolve scroll lock issue on mobile"
```

### Recent Development Focus

Based on recent commits:
1. Brand color migration to orange (`#f97322`)
2. Enlarging LinkStrip for better visibility
3. Port configuration (4000)
4. High-fidelity animations and accessibility improvements
5. Native window scrolling implementation
6. Tailwind v4 migration
7. Hero parallax effects integration

### Deployment

**Build Output**: `dist/` directory
**Target Platforms**: Vercel, Netlify, or static hosting
**AI Studio Link**: https://ai.studio/apps/drive/1PHXTV-QHE9DA2_9P9Smh_EBs4m07xqw2

**Pre-deployment Checklist**:
- [ ] Run `npm run build` successfully
- [ ] Test with `npm run preview`
- [ ] Verify all videos load from Cloudinary CDN
- [ ] Check responsive design on multiple screen sizes
- [ ] Test scroll lock/unlock behavior
- [ ] Verify all animations play correctly

## Best Practices for AI Assistants

### Code Modification Guidelines

1. **Always Read Before Editing**
   - Use Read tool on files before making changes
   - Understand existing patterns and conventions
   - Preserve exact indentation (tabs/spaces)

2. **Preserve Design Patterns**
   - Keep data in `constants.ts`, not hardcoded in components
   - Use `cn()` for className composition
   - Follow existing Framer Motion animation patterns
   - Maintain TypeScript type safety

3. **Responsive Design**
   - Always add responsive variants (sm:, md:, lg:)
   - Test text scaling at different breakpoints
   - Ensure grids adapt to mobile (single column)

4. **Performance**
   - Keep images optimized and use lazy loading
   - Use Cloudinary CDN for large media files
   - Don't import unused dependencies
   - Avoid inline styles when Tailwind classes exist

5. **Accessibility**
   - Add ARIA labels to interactive elements
   - Use semantic HTML elements
   - Ensure keyboard navigation works
   - Maintain color contrast ratios

### When Making Changes

**DO**:
- ✅ Use existing component patterns as reference
- ✅ Update `constants.ts` for content changes
- ✅ Add responsive variants to new elements
- ✅ Include Framer Motion animations for new sections
- ✅ Test scroll behavior after layout changes
- ✅ Preserve the orange brand color scheme
- ✅ Use TypeScript interfaces for new props

**DON'T**:
- ❌ Hardcode content directly in components
- ❌ Remove or modify the scroll lock mechanism
- ❌ Change font families without updating index.html
- ❌ Add routing (this is intentionally a single-page app)
- ❌ Skip responsive variants
- ❌ Use arbitrary color values (stick to brand palette)
- ❌ Remove Framer Motion animations from existing components

### Debugging Common Issues

**Scroll not working**:
- Check `scrollLocked` state in App.tsx
- Verify `unlockScroll()` is called on button click
- Ensure `overflow-hidden` is removed from body

**Animations not playing**:
- Verify Framer Motion import
- Check `viewport={{ once: true }}` is present
- Ensure `whileInView` is used, not just `animate`

**Styles not applying**:
- Use `cn()` instead of string concatenation
- Check Tailwind class name spelling
- Verify `index.css` imports Tailwind directives

**Build errors**:
- Check TypeScript errors: `npm run build`
- Verify all imports have correct paths
- Ensure `@/` path alias is used correctly

**Videos not loading**:
- Check Cloudinary URL is correct
- Verify network connectivity
- Ensure `autoPlay`, `loop`, `muted`, `playsInline` props are set

### File Organization Rules

**Component files should**:
- Export one primary component (default export)
- Keep under 300 lines (split large components)
- Include prop interfaces at the top
- Group related components in subdirectories (like `ui/`)

**When to create new files**:
- Component exceeds 300 lines → Split into smaller components
- Reusable utility function → Add to `lib/utils.ts`
- New static data → Add to `constants.ts`
- New types used across files → Consider creating `types.ts`

## Technical Specifications

### Dependencies

**Production**:
- react: ^19.2.0
- react-dom: ^19.2.0
- react-router-dom: ^7.9.6 (imported but not used for routing)
- framer-motion: ^12.23.24
- lucide-react: ^0.554.0 (icon library)
- clsx: ^2.1.1
- tailwind-merge: ^3.4.0

**Development**:
- typescript: ~5.8.2
- vite: ^6.2.0
- @vitejs/plugin-react: ^5.0.0
- tailwindcss: ^4.1.17
- @tailwindcss/postcss: ^4.1.17
- autoprefixer: ^10.4.22

### Browser Support

Modern browsers supporting:
- ES2022 features
- CSS Grid and Flexbox
- CSS Custom Properties
- Video autoplay (with mute fallback)
- 3D transforms (for hover effects)

### Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Video load: Progressive (Cloudinary CDN)
- Images: Lazy loaded below fold
- Bundle size: Optimized with Vite code splitting

## Asset Management

### Cloudinary Video URLs

**Background Video**:
```
https://res.cloudinary.com/djg0pqts6/video/upload/f_auto,q_auto/v1/archeforge/1103_2_yfa7mp
```

**Intro Video**:
```
https://res.cloudinary.com/djg0pqts6/video/upload/f_auto,q_auto/v1/archeforge/1114_2_z4csev
```

**Format**: MP4, H.264 codec
**Optimization**: Auto format and quality via Cloudinary

### Local Images

**Signatures** (`/public/signatures/`):
- 8 PNG files (~580-590KB each)
- Named after team members (lowercase)
- Referenced as `/signatures/filename.png`

### Adding New Assets

**For videos**:
1. Upload to Cloudinary
2. Get public URL with transformations
3. Update component with new URL

**For images**:
1. Optimize before adding (WebP preferred, PNG fallback)
2. Place in `/public/` or appropriate subdirectory
3. Use lazy loading: `loading="lazy"`
4. Add alt text for accessibility

## Code Statistics

- **Total Lines**: ~836 lines of TypeScript/JSX
- **Component Count**: 13 components (including ui/ subdirectory)
- **TypeScript Coverage**: 100% (all files use .tsx/.ts)
- **Data Arrays**: 4 major arrays in constants.ts (87 TM phrases, 8 partners, 7 divisions, 8 links)

---

## Quick Reference

### Useful Commands

```bash
npm run dev              # Start dev server (port 4000)
npm run build            # Production build
npm run preview          # Preview production build
npm install              # Install dependencies
git status               # Check git status
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push -u origin <branch>  # Push to remote
```

### Key Paths

```
@/                      → /home/user/arche-forge/
@/components           → /home/user/arche-forge/components/
@/lib/utils            → /home/user/arche-forge/lib/utils.ts
/signatures/           → /home/user/arche-forge/public/signatures/
```

### Brand Assets

- **Primary Color**: #f97322 (orange)
- **Fonts**: Cinzel (headings), Inter (body), Koulen (TM phrases)
- **Videos**: Cloudinary CDN (djg0pqts6 account)
- **Icons**: Lucide React library

---

**Last Updated**: 2025-11-25
**Project Version**: 0.0.0
**Maintained by**: ArcheForge Team
