import { ReactNode } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthDebug from './components/AuthDebug';
import TokenSync from '@/components/TokenSync';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Manga Reader',
  description: 'Đọc truyện tranh online miễn phí',
};
export default function RootLayout({ 
  children 
}: Readonly<{ 
  children: ReactNode 
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <TokenSync /> {/* Sync localStorage token to cookies */}
          {/* Main layout container */}
          <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Main Content - flex-1 để chiếm toàn bộ không gian còn lại */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer - luôn ở bottom */}
            <footer className="bg-gray-800 text-white py-4 mt-auto">
              <div className="max-w-7xl mx-auto px-4 flex justify-center space-x-6">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  GitHub
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </footer>
          </div>
          {/* Debug component - chỉ hiển thị trong development */}
          <AuthDebug />
        </AuthProvider>
      </body>
    </html>
  );
}
