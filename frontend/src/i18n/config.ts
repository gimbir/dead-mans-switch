import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import trTranslations from './locales/tr.json';

/**
 * i18n Configuration
 *
 * Supported languages:
 * - English (en) - Default
 * - Turkish (tr)
 */

const resources = {
  en: {
    translation: enTranslations
  },
  tr: {
    translation: trTranslations
  }
};

i18n
  .use(LanguageDetector) // Auto-detect user language
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    debug: false, // Disable debug in production
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      // Order of detection
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

export default i18n;
