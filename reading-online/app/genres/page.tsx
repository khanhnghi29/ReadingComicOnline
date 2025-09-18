// app/genres/[genreId]/page.tsx
// app/genres/page.tsx
import Link from 'next/link';
import { GenreDto } from '@/app/types';

const BASE_API_URL = 'http://localhost:5244';

async function fetchGenres() {
  const res = await fetch(`${BASE_API_URL}/api/Genres`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json() as Promise<GenreDto[]>;
}

export default async function GenresPage() {
  try {
    const genres = await fetchGenres();
    return (
      <div>
        <h1 className="text-3xl font-bold text-black-800 mb-6">Danh sách thể loại</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <Link
              key={genre.genreId}
              href={`/genres/${genre.genreId}`}
              className="bg-white rounded-lg shadow-md p-4 hover:bg-gray-100 text-center"
            >
              <h2 className="text-lg font-semibold text-black-800">{genre.genreName}</h2>
            </Link>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in GenresPage:', error);
    return <div className="text-red-600 text-center">Lỗi khi tải danh sách thể loại: {String(error)}</div>;
  }
}