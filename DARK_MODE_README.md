# 🌙 Dark Mode Implementation Guide

## Overview
Financial App telah diimplementasikan dengan fitur dark mode yang lengkap menggunakan React Context, Tailwind CSS, dan localStorage untuk persistensi preferensi pengguna.

## ✨ Fitur Dark Mode

### 🎯 **Fitur Utama**
- **Toggle Otomatis**: Tombol sun/moon di header untuk beralih antara light dan dark mode
- **Persistensi**: Preferensi tersimpan di localStorage
- **System Preference**: Otomatis mengikuti preferensi sistem (light/dark)
- **Smooth Transitions**: Animasi halus saat beralih mode
- **Responsive**: Mendukung semua ukuran layar

### 🎨 **Komponen yang Mendukung Dark Mode**
- ✅ Header dengan backdrop blur
- ✅ Sidebar dengan glass morphism
- ✅ Footer dengan gradient gelap
- ✅ Page wrapper dengan background patterns
- ✅ Stats cards dengan tema yang sesuai
- ✅ Breadcrumb navigation
- ✅ Semua UI components (buttons, inputs, tables)

## 🚀 Cara Penggunaan

### 1. **Toggle Manual**
```tsx
import { useDarkMode } from '@/lib/dark-mode';

function MyComponent() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <button onClick={toggleDarkMode}>
      {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
```

### 2. **Programmatic Control**
```tsx
import { useDarkMode } from '@/lib/dark-mode';

function MyComponent() {
  const { setDarkMode } = useDarkMode();
  
  // Set ke dark mode
  const enableDarkMode = () => setDarkMode(true);
  
  // Set ke light mode
  const enableLightMode = () => setDarkMode(false);
  
  return (
    <div>
      <button onClick={enableDarkMode}>Enable Dark</button>
      <button onClick={enableLightMode}>Enable Light</button>
    </div>
  );
}
```

### 3. **Conditional Styling**
```tsx
function MyComponent() {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className={`
      p-4 rounded-lg transition-colors duration-200
      ${isDarkMode 
        ? 'bg-gray-800 text-white border-gray-700' 
        : 'bg-white text-gray-900 border-gray-200'
      }
    `}>
      Content
    </div>
  );
}
```

## 🎨 **Color Schemes**

### **Light Mode Colors**
```css
--background: 0 0% 100%          /* White */
--foreground: 222.2 84% 4.9%     /* Dark Gray */
--card: 0 0% 100%                /* White */
--border: 214.3 31.8% 91.4%      /* Light Gray */
--muted: 210 40% 96%             /* Very Light Gray */
```

### **Dark Mode Colors**
```css
--background: 222.2 84% 4.9%     /* Dark Gray */
--foreground: 210 40% 98%        /* Light Gray */
--card: 222.2 84% 4.9%           /* Dark Gray */
--border: 217.2 32.6% 17.5%      /* Medium Gray */
--muted: 217.2 32.6% 17.5%      /* Medium Gray */
```

## 🔧 **Implementation Details**

### **1. Dark Mode Context**
```tsx
// lib/dark-mode.tsx
export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check localStorage
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setIsDarkMode(savedMode === 'true');
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(systemPrefersDark);
    }
  }, []);
  
  useEffect(() => {
    // Apply to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);
}
```

### **2. Tailwind CSS Configuration**
```ts
// tailwind.config.ts
export default {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... more colors
      },
      animation: {
        'blob': 'blob 7s infinite',
        'blob-dark': 'blobDark 7s infinite',
      }
    }
  }
}
```

### **3. CSS Variables**
```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... light mode colors */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode colors */
}
```

## 📱 **Responsive Design**

### **Mobile-First Approach**
- **Mobile**: Bottom navigation dengan dark mode support
- **Tablet**: Adaptive layouts dengan proper contrast
- **Desktop**: Full sidebar dengan glass morphism effects

### **Breakpoints**
```css
/* Mobile */
@media (max-width: 768px) {
  .mobile-dark-nav {
    @apply bg-gray-900/95 dark:bg-black/95;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  .tablet-dark-card {
    @apply bg-gray-800/90 dark:bg-gray-900/90;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .desktop-dark-sidebar {
    @apply bg-white/90 dark:bg-gray-900/90;
  }
}
```

## 🎭 **Animation & Transitions**

### **Smooth Mode Switching**
```css
/* globals.css */
* {
  transition: background-color 0.2s ease-in-out, 
              border-color 0.2s ease-in-out, 
              color 0.2s ease-in-out;
}
```

### **Custom Animations**
```css
@keyframes blobDark {
  0% { transform: translate(0px, 0px) scale(1); opacity: 0.3; }
  33% { transform: translate(30px, -50px) scale(1.1); opacity: 0.4; }
  66% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.3; }
  100% { transform: translate(0px, 0px) scale(1); opacity: 0.3; }
}
```

## 🧪 **Testing Dark Mode**

### **1. Manual Testing**
- Klik tombol sun/moon di header
- Refresh halaman untuk test persistensi
- Test di berbagai ukuran layar

### **2. System Preference Testing**
- Ubah preferensi sistem (light/dark)
- Refresh aplikasi
- Verifikasi mode berubah otomatis

### **3. Component Testing**
```tsx
// Test component dengan dark mode
import { render, screen } from '@testing-library/react';
import { DarkModeProvider } from '@/lib/dark-mode';

test('component supports dark mode', () => {
  render(
    <DarkModeProvider>
      <MyComponent />
    </DarkModeProvider>
  );
  
  // Test light mode
  expect(screen.getByTestId('component')).toHaveClass('bg-white');
  
  // Toggle to dark mode
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByTestId('component')).toHaveClass('bg-gray-800');
});
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Dark Mode Tidak Berfungsi**
```bash
# Check localStorage
localStorage.getItem('darkMode')

# Check CSS classes
document.documentElement.classList.contains('dark')
```

#### **2. Transisi Tidak Smooth**
```css
/* Pastikan transition ada di CSS */
* {
  transition: all 0.2s ease-in-out;
}
```

#### **3. Warna Tidak Berubah**
```tsx
// Pastikan menggunakan Tailwind dark: classes
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```

### **Debug Mode**
```tsx
// Tambahkan debug info
function DebugDarkMode() {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="fixed top-4 right-4 p-2 bg-red-500 text-white text-xs">
      Dark Mode: {isDarkMode ? 'ON' : 'OFF'}
    </div>
  );
}
```

## 📚 **Best Practices**

### **1. Consistent Color Usage**
```tsx
// ✅ Good - Gunakan semantic color names
className="bg-background text-foreground border-border"

// ❌ Bad - Hard-coded colors
className="bg-white text-black border-gray-300"
```

### **2. Smooth Transitions**
```tsx
// ✅ Good - Transisi halus
className="transition-colors duration-200"

// ❌ Bad - Transisi kasar
className="transition-all duration-50"
```

### **3. Accessible Contrast**
```tsx
// ✅ Good - Contrast yang baik
className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"

// ❌ Bad - Contrast rendah
className="text-gray-400 dark:text-gray-500"
```

## 🚀 **Future Enhancements**

### **Planned Features**
- [ ] **Auto-switch**: Berdasarkan waktu (sunset/sunrise)
- [ ] **Custom themes**: Multiple color schemes
- [ ] **Animation presets**: Different transition styles
- [ ] **Accessibility**: High contrast mode
- [ ] **Performance**: Lazy loading untuk dark mode assets

### **Customization Options**
```tsx
// Future: Custom theme support
const customTheme = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#45B7D1'
};

const { setCustomTheme } = useDarkMode();
setCustomTheme(customTheme);
```

## 📖 **References**

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [React Context API](https://react.dev/reference/react/createContext)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**🎉 Dark mode telah berhasil diimplementasikan!** 

Aplikasi sekarang mendukung light dan dark mode dengan transisi yang halus, persistensi preferensi pengguna, dan desain yang konsisten di semua komponen.
