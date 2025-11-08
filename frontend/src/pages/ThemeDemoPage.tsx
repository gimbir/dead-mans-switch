import { useTranslation } from 'react-i18next';

/**
 * ThemeDemoPage Component
 *
 * A demo page to showcase all theme colors and utilities
 * Useful for testing light/dark mode color schemes
 */
export const ThemeDemoPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-theme-primary p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-theme-primary mb-2">Theme Color Palette</h1>
          <p className="text-theme-secondary">
            Toggle between light and dark themes to see all color variations
          </p>
        </div>

        {/* Background Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">Background Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-theme-primary border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-2">bg-theme-primary</h3>
              <p className="text-sm text-theme-secondary">Main background color</p>
            </div>
            <div className="p-6 bg-theme-secondary border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-2">bg-theme-secondary</h3>
              <p className="text-sm text-theme-secondary">Secondary background</p>
            </div>
            <div className="p-6 bg-theme-card border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-2">bg-theme-card</h3>
              <p className="text-sm text-theme-secondary">Card backgrounds</p>
            </div>
            <div className="p-6 bg-theme-hover border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-2">bg-theme-hover</h3>
              <p className="text-sm text-theme-secondary">Hover states</p>
            </div>
          </div>
        </section>

        {/* Text Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">Text Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-theme-card border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-2">text-theme-primary</h3>
              <p className="text-theme-primary">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div className="p-6 bg-theme-card border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-2">text-theme-secondary</h3>
              <p className="text-theme-secondary">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div className="p-6 bg-theme-card border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-2">text-theme-tertiary</h3>
              <p className="text-theme-tertiary">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div className="p-6 bg-brand-primary border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-inverse mb-2">text-theme-inverse</h3>
              <p className="text-theme-inverse">The quick brown fox jumps over the lazy dog</p>
            </div>
          </div>
        </section>

        {/* Border Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">Border Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-theme-card border-4 border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-2">border-theme-primary</h3>
              <p className="text-sm text-theme-secondary">Primary borders</p>
            </div>
            <div className="p-6 bg-theme-card border-4 border-theme-secondary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-2">border-theme-secondary</h3>
              <p className="text-sm text-theme-secondary">Secondary borders</p>
            </div>
          </div>
        </section>

        {/* Brand Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">Brand Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-brand-primary rounded-lg">
              <h3 className="font-semibold text-theme-inverse mb-2">bg-brand-primary</h3>
              <p className="text-sm text-theme-inverse">Primary brand color (buttons, links)</p>
            </div>
            <div className="p-6 bg-theme-card border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-brand-primary mb-2">text-brand-primary</h3>
              <p className="text-sm text-theme-secondary">Brand colored text</p>
            </div>
            <div className="p-6 bg-theme-card border-4 border-brand-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-2">border-brand-primary</h3>
              <p className="text-sm text-theme-secondary">Brand colored borders</p>
            </div>
          </div>
        </section>

        {/* Interactive Elements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">Interactive Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Buttons */}
            <div className="p-6 bg-theme-card border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-4">Buttons</h3>
              <div className="space-y-3">
                <button className="w-full bg-brand-primary text-theme-inverse px-4 py-2 rounded-md hover:opacity-90 transition">
                  Primary Button
                </button>
                <button className="w-full bg-theme-secondary text-theme-primary border border-theme-primary px-4 py-2 rounded-md hover:bg-theme-hover transition">
                  Secondary Button
                </button>
                <button className="w-full bg-theme-primary text-brand-primary border border-brand-primary px-4 py-2 rounded-md hover:bg-theme-hover transition">
                  Outline Button
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="p-6 bg-theme-card border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-4">Links</h3>
              <div className="space-y-3">
                <a href="#" className="block text-brand-primary hover:opacity-80">
                  Standard Link
                </a>
                <a href="#" className="block text-theme-secondary hover:text-brand-primary">
                  Secondary Link
                </a>
                <a href="#" className="block text-theme-primary hover:text-brand-primary underline">
                  Underlined Link
                </a>
              </div>
            </div>

            {/* Form Elements */}
            <div className="p-6 bg-theme-card border border-theme-primary rounded-lg">
              <h3 className="font-semibold text-theme-primary mb-4">Form Elements</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Text input"
                  className="w-full px-3 py-2 bg-theme-primary border border-theme-primary rounded-md text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <select className="w-full px-3 py-2 bg-theme-primary border border-theme-primary rounded-md text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary">
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="demo-checkbox"
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-theme-primary rounded"
                  />
                  <label htmlFor="demo-checkbox" className="text-theme-primary">
                    Checkbox
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">Status Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-green-500 text-white rounded-lg">
              <h3 className="font-semibold mb-2">Success</h3>
              <p className="text-sm">Green-500</p>
            </div>
            <div className="p-6 bg-red-500 text-white rounded-lg">
              <h3 className="font-semibold mb-2">Error</h3>
              <p className="text-sm">Red-500</p>
            </div>
            <div className="p-6 bg-amber-500 text-white rounded-lg">
              <h3 className="font-semibold mb-2">Warning</h3>
              <p className="text-sm">Amber-500</p>
            </div>
            <div className="p-6 bg-blue-500 text-white rounded-lg">
              <h3 className="font-semibold mb-2">Info</h3>
              <p className="text-sm">Blue-500</p>
            </div>
          </div>
        </section>

        {/* Cards Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">Card Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 bg-theme-card border border-theme-primary rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-theme-primary mb-2">Card Title</h3>
              <p className="text-theme-secondary mb-4">
                This is a sample card with theme-aware colors. All elements adapt to light and dark modes.
              </p>
              <button className="bg-brand-primary text-theme-inverse px-4 py-2 rounded-md hover:opacity-90 transition">
                Action Button
              </button>
            </div>

            <div className="p-6 bg-theme-secondary border border-theme-secondary rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-theme-primary mb-2">Secondary Card</h3>
              <p className="text-theme-secondary mb-4">
                Using secondary background color for subtle differentiation.
              </p>
              <a href="#" className="text-brand-primary hover:opacity-80">
                Learn more →
              </a>
            </div>

            <div className="p-6 bg-theme-card border-2 border-brand-primary rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-brand-primary mb-2">Highlighted Card</h3>
              <p className="text-theme-secondary mb-4">
                Using brand border color to highlight important content.
              </p>
              <button className="bg-theme-primary text-brand-primary border border-brand-primary px-4 py-2 rounded-md hover:bg-theme-hover transition">
                View Details
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
