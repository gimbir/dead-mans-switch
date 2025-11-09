import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Clock, Lock, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@stores/authStore';
import { ROUTES } from '@constants/index';
import { Header } from '@/components/layout/Header';

export const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className='min-h-screen bg-theme-primary'>
      <Header />
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-theme-primary'>
        <div className='absolute inset-0 opacity-5 bg-grid-pattern'></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32'>
          <div className='text-center'>
            {/* Badge */}
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-8 border border-brand-primary/30'>
              <Shield className='w-4 h-4' />
              <span>{t('home.badge')}</span>
            </div>

            {/* Main Heading */}
            <h1 className='text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-theme-primary mb-6'>
              {t('home.hero.title')}
            </h1>
            <p className='text-xl sm:text-2xl text-theme-secondary mb-4 max-w-3xl mx-auto'>
              {t('home.hero.subtitle')}
            </p>
            <p className='text-lg text-theme-tertiary mb-10 max-w-2xl mx-auto'>
              {t('home.hero.description')}
            </p>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Link
                to={ROUTES.REGISTER}
                className='inline-flex items-center gap-2 px-8 py-4 bg-brand-primary hover:opacity-90 text-theme-inverse font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg group'
              >
                {t('home.cta.getStarted')}
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </Link>
              <a
                href='#how-it-works'
                className='inline-flex items-center gap-2 px-8 py-4 bg-theme-card hover:bg-theme-hover text-theme-primary font-semibold rounded-lg shadow border-2 border-theme-primary transition-all duration-200 text-lg'
              >
                {t('home.cta.learnMore')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-24 bg-theme-secondary'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl sm:text-5xl font-bold text-theme-primary mb-4'>
              {t('home.features.title')}
            </h2>
            <p className='text-xl text-theme-secondary max-w-2xl mx-auto'>
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {/* Feature 1 */}
            <div className='group p-8 rounded-2xl bg-theme-card border border-theme-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
              <div className='w-14 h-14 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                <Clock className='w-7 h-7 text-white' />
              </div>
              <h3 className='text-xl font-bold text-theme-primary mb-3'>
                {t('home.features.items.automated.title')}
              </h3>
              <p className='text-theme-secondary'>
                {t('home.features.items.automated.description')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className='group p-8 rounded-2xl bg-theme-card border border-theme-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
              <div className='w-14 h-14 rounded-xl bg-purple-600 dark:bg-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                <Lock className='w-7 h-7 text-white' />
              </div>
              <h3 className='text-xl font-bold text-theme-primary mb-3'>
                {t('home.features.items.encrypted.title')}
              </h3>
              <p className='text-theme-secondary'>
                {t('home.features.items.encrypted.description')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className='group p-8 rounded-2xl bg-theme-card border border-theme-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
              <div className='w-14 h-14 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                <CheckCircle className='w-7 h-7 text-white' />
              </div>
              <h3 className='text-xl font-bold text-theme-primary mb-3'>
                {t('home.features.items.flexible.title')}
              </h3>
              <p className='text-theme-secondary'>
                {t('home.features.items.flexible.description')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className='group p-8 rounded-2xl bg-theme-card border border-theme-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
              <div className='w-14 h-14 rounded-xl bg-pink-600 dark:bg-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                <Heart className='w-7 h-7 text-white' />
              </div>
              <h3 className='text-xl font-bold text-theme-primary mb-3'>
                {t('home.features.items.peace.title')}
              </h3>
              <p className='text-theme-secondary'>{t('home.features.items.peace.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id='how-it-works'
        className='py-24 bg-theme-tertiary'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl sm:text-5xl font-bold text-theme-primary mb-4'>
              {t('home.howItWorks.title')}
            </h2>
            <p className='text-xl text-theme-secondary max-w-2xl mx-auto'>
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12'>
            {/* Step 1 */}
            <div className='relative'>
              <div className='flex flex-col items-center text-center'>
                <div className='w-20 h-20 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg'>
                  1
                </div>
                <h3 className='text-2xl font-bold text-theme-primary mb-4'>
                  {t('home.howItWorks.steps.create.title')}
                </h3>
                <p className='text-theme-secondary text-lg'>
                  {t('home.howItWorks.steps.create.description')}
                </p>
              </div>
              {/* Arrow */}
              <div className='hidden md:block absolute top-10 left-full w-full'>
                <ArrowRight className='w-8 h-8 text-indigo-300 dark:text-indigo-700 -ml-4' />
              </div>
            </div>

            {/* Step 2 */}
            <div className='relative'>
              <div className='flex flex-col items-center text-center'>
                <div className='w-20 h-20 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg'>
                  2
                </div>
                <h3 className='text-2xl font-bold text-theme-primary mb-4'>
                  {t('home.howItWorks.steps.checkin.title')}
                </h3>
                <p className='text-theme-secondary text-lg'>
                  {t('home.howItWorks.steps.checkin.description')}
                </p>
              </div>
              {/* Arrow */}
              <div className='hidden md:block absolute top-10 left-full w-full'>
                <ArrowRight className='w-8 h-8 text-purple-300 dark:text-purple-700 -ml-4' />
              </div>
            </div>

            {/* Step 3 */}
            <div className='relative'>
              <div className='flex flex-col items-center text-center'>
                <div className='w-20 h-20 rounded-full bg-pink-600 dark:bg-pink-500 flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg'>
                  3
                </div>
                <h3 className='text-2xl font-bold text-theme-primary mb-4'>
                  {t('home.howItWorks.steps.relax.title')}
                </h3>
                <p className='text-theme-secondary text-lg'>
                  {t('home.howItWorks.steps.relax.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className='py-24 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl sm:text-5xl font-bold text-white mb-6'>
            {t('home.finalCta.title')}
          </h2>
          <p className='text-xl text-indigo-100 mb-10 max-w-2xl mx-auto'>
            {t('home.finalCta.subtitle')}
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              to={ROUTES.REGISTER}
              className='inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-indigo-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg group'
            >
              {t('home.finalCta.button')}
              <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
