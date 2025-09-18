import { ReactNode } from 'react';
import Link from 'next/link';
import { FaHome, FaUser, FaTag } from 'react-icons/fa';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <ul className="flex space-x-6 items-center">
            <li>
              <Link href="/admin/comics" className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded-md">
                <FaHome className="text-lg" />
                <span>Comics</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/authors" className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded-md">
                <FaUser className="text-lg" />
                <span>Authors</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/genres" className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded-md">
                <FaTag className="text-lg" />
                <span>Genres</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}