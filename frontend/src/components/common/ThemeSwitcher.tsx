import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * ThemeSwitcher Component
 *
 * Allows users to switch between light, dark, and system themes
 * Features:
 * - Theme-aware styling with CSS variables
 * - Dropdown menu with click/hover interaction (mobile & desktop friendly)
 * - Visual indication of current theme
 * - Dynamic icon based on active theme
 * - Click outside to close
 */
export const ThemeSwitcher = () => {
  const { theme, actualTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ] as const;

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const Icon = currentTheme.icon;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    setIsOpen(false);
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-2 lg:px-3 py-2 rounded-lg bg-theme-hover hover:opacity-80 transition-opacity'
        aria-label='Change theme'
        aria-expanded={isOpen}
      >
        <Icon
          className={`w-5 h-5 ${
            actualTheme === 'dark' ? 'text-yellow-400' : 'text-theme-secondary'
          }`}
        />
        {/* Text visible only on desktop (lg+), icon-only on tablet */}
        <span className='hidden lg:inline text-sm font-medium text-theme-primary'>{currentTheme.label}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-40 bg-theme-card rounded-lg shadow-lg border border-theme-primary z-50 animate-fade-in'>
          <div className='py-2'>
            {themes.map(({ value, label, icon: ThemeIcon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-theme-hover transition-colors flex items-center gap-2 ${
                  theme === value ? 'text-brand-primary font-medium' : 'text-theme-secondary'
                }`}
              >
                <ThemeIcon className='w-4 h-4' />
                <span>{label}</span>
                {theme === value && <span className='ml-auto'>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
