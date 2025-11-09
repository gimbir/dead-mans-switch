import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Footer Component
 *
 * Application footer with copyright and links
 * Features:
 * - Theme-aware styling
 * - Multi-language support
 * - Responsive design
 */
export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-theme-secondary border-t border-theme-primary'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
          {/* Logo and Copyright */}
          <div className='flex items-center space-x-2'>
            <Shield
              className='h-6 w-6 text-brand-primary'
              aria-hidden='true'
            />
            <div className='text-sm text-theme-secondary'>
              <p className='font-semibold text-theme-primary'>{t('common.appName')}</p>
              <p>{t('footer.copyright', { year: currentYear })}</p>
            </div>
          </div>

          {/* Links */}
          <div className='flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-theme-secondary'>
            <a
              href='#'
              className='hover:text-brand-primary transition-colors'
            >
              {t('footer.privacyPolicy')}
            </a>
            <a
              href='#'
              className='hover:text-brand-primary transition-colors'
            >
              {t('footer.termsOfService')}
            </a>
            <a
              href='#'
              className='hover:text-brand-primary transition-colors'
            >
              {t('footer.documentation')}
            </a>
            <a
              href='#'
              className='hover:text-brand-primary transition-colors'
            >
              {t('footer.contact')}
            </a>
          </div>
        </div>

        {/* Description */}
        <div className='mt-4 text-center text-xs text-theme-tertiary'>
          <p>{t('footer.description')}</p>
        </div>
      </div>
    </footer>
  );
};
