import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * MainLayout Component
 *
 * Main layout wrapper with header and footer
 */
export const MainLayout = ({
  children,
  showHeader = true,
  showFooter = true,
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-grow">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};
