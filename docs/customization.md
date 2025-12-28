# Customization Guide

Make this template your own.

## Quick Customization Checklist

- [ ] Update site name and description
- [ ] Replace logo and favicon
- [ ] Change color scheme
- [ ] Update social links
- [ ] Modify hero section
- [ ] Add your content
- [ ] Update SEO metadata

---

## Branding

### Site Name & Description

**1. Update `src/seo.json`**:

```json
{
  "_global": {
    "siteName": "Your App Name",
    "organization": {
      "name": "Your Company",
      "description": "What your app does in one sentence"
    }
  }
}
```

**2. Update `package.json`**:

```json
{
  "name": "your-app-name",
  "description": "Your app description"
}
```

### Logo

Replace `public/images/logo.webp` with your logo:

**Recommended specs**:
- Format: WebP or SVG
- Dimensions: 200×50px (or similar)
- Transparent background
- Optimized file size (<50KB)

**Usage in code**:

```tsx
// Already used in Navbar.tsx
<img src="/images/logo.webp" alt="Your App" />
```

### Favicon

Replace `public/favicon.ico` with your icon:

**Specs**:
- Format: ICO or PNG
- Size: 32×32px or 64×64px
- Include multiple sizes in ICO file

**Generate favicons**:
- Use [realfavicongenerator.net](https://realfavicongenerator.net/)
- Generate all sizes and place in `public/`

### Colors

**Option 1: Tailwind Utilities** (Quick)

```tsx
// Replace blue with your brand color
<button className="bg-purple-500 hover:bg-purple-600">
  Click Me
</button>
```

**Option 2: CSS Variables** (Global)

Add to `src/index.css`:

```css
:root {
  --primary: #7c3aed;    /* Purple-600 */
  --secondary: #10b981;  /* Green-500 */
  --accent: #f59e0b;     /* Amber-500 */
}
```

Use in components:

```tsx
<button className="bg-(--primary) hover:bg-(--secondary)">
  Click Me
</button>
```

**Option 3: Tailwind Theme** (Advanced)

Create `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          900: '#4c1d95'
        }
      }
    }
  }
};
```

Use:

```tsx
<button className="bg-brand-500 hover:bg-brand-600">
  Click Me
</button>
```

### Fonts

**Change default fonts** in `src/index.css`:

```css
:root {
  --font-inter: 'Your Font', sans-serif;
  --font-mono: 'Your Mono Font', monospace;
  --font-display: 'Your Display Font', sans-serif;
}
```

**Add custom fonts**:

1. Download font files (.woff2)
2. Place in `public/fonts/`
3. Add to `index.css`:

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

4. Use in Tailwind:

```tsx
<h1 className="font-['CustomFont']">Hello</h1>
```

---

## Content Customization

### Hero Section

Edit `src/components/Hero.tsx`:

```tsx
export default function Hero() {
  return (
    <section className="...">
      <h1>Your Headline</h1>
      <p>Your description</p>
      <Link to="/get-started">
        Your CTA Button
      </Link>
    </section>
  );
}
```

**Tips**:
- Keep headline short (5-10 words)
- Description: Clear value proposition
- CTA: Action-oriented ("Get Started", "Try Free", etc.)

### Features Section

Edit `src/components/Features.tsx`:

```tsx
const features = [
  {
    icon: YourIcon,  // From lucide-react
    title: "Feature 1",
    description: "What it does"
  },
  // Add more features...
];
```

### Footer

Edit `src/components/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer className="bg-[#020204] border-t border-white/10">
      {/* Add your footer content */}
      <div className="container mx-auto px-6 py-8">
        <p>© 2024 Your Company</p>
      </div>
    </footer>
  );
}
```

### Social Links

Update in multiple places:

**1. `src/seo.json`**:
```json
{
  "_global": {
    "social": {
      "github": "https://github.com/yourusername",
      "youtube": "https://youtube.com/@yourchannel",
      "twitter": "https://twitter.com/yourhandle"
    }
  }
}
```

**2. `Navbar.tsx`**:
```tsx
<a href="https://twitter.com/yourhandle">
  <FaTwitter className="w-5 h-5" />
</a>
```

---

## Pages

### Add a New Page

**1. Create page component**:

```tsx
// src/pages/pricing.tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#020204] text-white">
      <Navbar />
      <PageHeader title="Pricing" description="Choose your plan" />
      
      <section className="py-16 container mx-auto px-6">
        {/* Your pricing content */}
      </section>
      
      <Footer />
    </main>
  );
}
```

**2. Add route** in `src/Router.tsx`:

```tsx
import { lazy } from 'react';

const Pricing = lazy(() => import('./pages/pricing'));

// Inside <Routes>
<Route path="pricing" element={<Pricing />} />
```

**3. Add SEO** in `src/seo.json`:

```json
{
  "/pricing": {
    "title": "Pricing - Your App",
    "description": "Choose the perfect plan for your needs",
    "keywords": "pricing,plans,cost,subscription"
  }
}
```

**4. Add to navbar** (optional):

```tsx
// src/components/Navbar.tsx
const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Pricing', href: '/pricing' }  // Add this
];
```

### Remove Existing Pages

**1. Delete page file**:

```bash
rm src/pages/about.tsx
```

**2. Remove from Router**:

```tsx
// Delete this line:
const About = lazy(() => import('./pages/about'));

// Delete this route:
<Route path="about" element={<About />} />
```

**3. Remove from `src/seo.json`**:

```json
{
  // Delete "/about": { ... }
}
```

---

## Components

### Create Reusable Components

**Button Component**:

```tsx
// src/components/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export default function Button({ 
  children, 
  variant = 'primary',
  onClick 
}: ButtonProps) {
  const styles = variant === 'primary'
    ? 'bg-blue-500 hover:bg-blue-600'
    : 'bg-gray-700 hover:bg-gray-600';
    
  return (
    <button 
      className={`px-6 py-3 rounded-md text-white ${styles}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

**Usage**:

```tsx
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

### Card Component

```tsx
// src/components/Card.tsx
export default function Card({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`
      p-6 
      bg-white/5 
      rounded-lg 
      border border-white/10 
      hover:border-blue-500/50 
      transition-colors
      ${className}
    `}>
      {children}
    </div>
  );
}
```

---

## Styling Patterns

### Dark Mode (Already Default)

This template uses dark mode by default. To add light mode:

**1. Add theme state**:

```tsx
// src/components/ThemeProvider.tsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<'light' | 'dark'>('dark');

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

**2. Add theme toggle**:

```tsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
```

### Responsive Design

Use Tailwind breakpoints:

```tsx
<div className="
  grid 
  grid-cols-1       // Mobile: 1 column
  md:grid-cols-2    // Tablet: 2 columns
  lg:grid-cols-3    // Desktop: 3 columns
">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

**Breakpoints**:
- `sm:` → 640px
- `md:` → 768px
- `lg:` → 1024px
- `xl:` → 1280px
- `2xl:` → 1536px

---

## Animations

### Framer Motion Presets

**Fade In**:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

**Slide Up**:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

**Scale on Hover**:

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

**Stagger Children**:

```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## Icons

### Lucide React

```bash
# Already installed
import { Heart, Star, Zap } from 'lucide-react';

<Heart className="w-5 h-5 text-red-500" />
```

**Browse icons**: [lucide.dev](https://lucide.dev/)

### React Icons

```bash
# Already installed
import { FaTwitter, FaGithub } from 'react-icons/fa';

<FaTwitter className="w-5 h-5" />
```

**Browse icons**: [react-icons.github.io](https://react-icons.github.io/)

---

## Forms

### Contact Form Example

```tsx
import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send to your API
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    alert('Message sent!');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded"
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded"
      />
      
      <textarea
        placeholder="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded h-32"
      />
      
      <button type="submit" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded">
        Send Message
      </button>
    </form>
  );
}
```

---

## Advanced Customization

### Add Analytics

**Google Analytics**:

```tsx
// main.tsx
import { inject } from '@vercel/analytics';
inject();
```

Or add to `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Add Authentication

**Using Clerk**:

```bash
pnpm add @clerk/clerk-react
```

```tsx
// main.tsx
import { ClerkProvider } from '@clerk/clerk-react';

<ClerkProvider publishableKey="pk_test_...">
  <App />
</ClerkProvider>
```

### Add CMS

**Contentful Example**:

```bash
pnpm add contentful
```

```tsx
// lib/contentful.ts
import { createClient } from 'contentful';

export const client = createClient({
  space: 'your-space-id',
  accessToken: 'your-access-token'
});
```

---

## Next Steps

- **[Architecture Guide](architecture.md)** - Understand the system
- **[SEO Guide](seo-guide.md)** - Optimize for search
- **[Performance Guide](performance.md)** - Make it faster

---

**Need help customizing?** Open an issue on [GitHub](https://github.com/burgil/issues)
