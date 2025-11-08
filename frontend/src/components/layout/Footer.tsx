import { Shield } from 'lucide-react';

/**
 * Footer Component
 *
 * Application footer with copyright and links
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            <div className="text-sm text-gray-600">
              <p className="font-semibold">Dead Man's Switch</p>
              <p>&copy; {currentYear} All rights reserved.</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:text-indigo-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-indigo-600">
              Terms of Service
            </a>
            <a href="#" className="hover:text-indigo-600">
              Documentation
            </a>
            <a href="#" className="hover:text-indigo-600">
              Contact
            </a>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>
            Secure message delivery system that automatically sends pre-configured messages
            if you fail to check in within a specified timeframe.
          </p>
        </div>
      </div>
    </footer>
  );
};
