// app/components/NavbarGenres.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBookOpen } from 'react-icons/fa';
import { GenreDto } from '@/app/types';

const BASE_API_URL = 'http://localhost:5244';

async function fetchGenres() {
  const res = await fetch(`${BASE_API_URL}/api/Genres`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json() as Promise<GenreDto[]>;
}

export default function NavbarGenres() {
  const [genres, setGenres] = useState<GenreDto[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchGenres().then(setGenres).catch((error) => console.error('Error fetching genres:', error));
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsDropdownOpen(true)}
      onMouseLeave={() => setIsDropdownOpen(false)}
    >
      <div className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded-md cursor-pointer">
        <FaBookOpen />
        <span>Thể loại</span>
      </div>
      {isDropdownOpen && (
        <div className="absolute top-full left-0 bg-white text-gray-800 shadow-lg rounded-md mt-1 z-20">
          {genres.length > 0 ? (
            genres.map((genre) => (
              <Link
                key={genre.genreId}
                href={`/genres/${genre.genreId}`}
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                {genre.genreName}
              </Link>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">Đang tải...</div>
          )}
        </div>
      )}
    </div>
  );
}