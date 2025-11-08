import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

/**
 * LanguageSwitcher Component
 *
 * Allows users to switch between supported languages
 * Currently supports: English (en) and Turkish (tr)
 * Features:
 * - Theme-aware styling with CSS variables
 * - Dropdown menu with hover interaction
 * - Visual indication of current language
 */
export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-hover transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5 text-theme-secondary" />
        <span className="text-sm font-medium text-theme-primary">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-48 bg-theme-card rounded-lg shadow-lg border border-theme-primary opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-4 py-2 text-left text-sm bg-theme-hover transition-colors flex items-center gap-2 ${
                i18n.language === lang.code
                  ? 'text-brand-primary font-medium'
                  : 'text-theme-secondary'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {i18n.language === lang.code && (
                <span className="ml-auto">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
