import '../styles/globals.css';
import Navbar from '../components/Navbar';
import CategoryBar from '../components/CategoryBar';
import { AppProvider } from '../context/AppContext';
import { Suspense } from 'react';

export const metadata = {
  title: 'Amazon Clone',
  description: 'Amazon-style ecommerce SPA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900">
        <AppProvider>
          <Suspense fallback={<div className="h-16 bg-[#131921]"></div>}>
            <Navbar />
          </Suspense>
          <Suspense fallback={<div className="h-10 bg-[#232f3e]"></div>}>
            <CategoryBar />
          </Suspense>
          <main className="min-h-screen">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}