import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import 'flag-icons/css/flag-icons.min.css';

/**
 * LanguageSwitcher Component
 *
 * Allows users to switch between supported languages
 * Currently supports: English (en) and Turkish (tr)
 * Features:
 * - Theme-aware styling with CSS variables
 * - Dropdown menu with click/hover interaction (mobile & desktop friendly)
 * - Visual indication of current language
 * - Flag icons from flag-icons library
 * - Click outside to close
 */
export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flagCode: 'gb' }, // GB for United Kingdom
    { code: 'tr', name: 'Türkçe', flagCode: 'tr' } // TR for Turkey
  ];

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

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

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div
      className='relative'
      ref={dropdownRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-2 lg:px-3 py-2 rounded-lg bg-theme-hover hover:opacity-80 transition-opacity'
        aria-label='Change language'
        aria-expanded={isOpen}
      >
        {/* Flag icon - Always visible */}
        <span className={`fi fi-${currentLanguage.flagCode} text-lg`}></span>
        {/* Language name - Desktop only */}
        <span className='hidden lg:inline text-sm font-medium text-theme-primary'>
          {currentLanguage.name}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-48 bg-theme-card rounded-lg shadow-lg border border-theme-primary z-50 animate-fade-in'>
          <div className='py-2'>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-theme-hover transition-colors flex items-center gap-3 ${
                  i18n.language === lang.code
                    ? 'text-brand-primary font-medium'
                    : 'text-theme-secondary'
                }`}
              >
                <span className={`fi fi-${lang.flagCode} text-base`}></span>
                <span>{lang.name}</span>
                {i18n.language === lang.code && <span className='ml-auto'>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
