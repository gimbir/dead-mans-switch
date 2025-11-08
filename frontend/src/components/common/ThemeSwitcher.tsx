import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * ThemeSwitcher Component
 *
 * Allows users to switch between light, dark, and system themes
 * Features:
 * - Theme-aware styling with CSS variables
 * - Dropdown menu with hover interaction
 * - Visual indication of current theme
 * - Dynamic icon based on active theme
 */
export const ThemeSwitcher = () => {
  const { theme, actualTheme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ] as const;

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const Icon = currentTheme.icon;

  return (
    <div className='relative group'>
      <button
        className='flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-hover transition-colors'
        aria-label='Change theme'
      >
        <Icon
          className={`w-5 h-5 ${
            actualTheme === 'dark' ? 'text-yellow-400' : 'text-theme-secondary'
          }`}
        />
        <span className='text-sm font-medium text-theme-primary'>{currentTheme.label}</span>
      </button>

      {/* Dropdown */}
      <div className='absolute right-0 mt-2 w-40 bg-theme-card rounded-lg shadow-lg border border-theme-primary opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
        <div className='py-2'>
          {themes.map(({ value, label, icon: ThemeIcon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`w-full px-4 py-2 text-left text-sm bg-theme-hover transition-colors flex items-center gap-2 ${
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
    </div>
  );
};
