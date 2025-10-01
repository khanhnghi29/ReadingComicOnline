// app/genres/[genreId]/page.tsx
import Link from 'next/link';
import { ComicResponseDto, GenreDto } from '@/app/types';
import ComicImage from '@/app/components/ComicImage';
import NavbarGenres from '@/app/components/NavbarGenres';
import NavbarSearch from '@/app/components/NavbarSearch';
import { FaHome } from 'react-icons/fa';
const BASE_API_URL = 'http://localhost:5244';

async function fetchComicsByGenre(genreId: string, page: number = 1, pageSize: number = 30) {
  const url = `${BASE_API_URL}/api/Comics/genre/${genreId}?page=${page}&pageSize=${pageSize}`;
  console.log('Fetching comics by genre from:', url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Fetch comics error:', errorText);
    throw new Error('Failed to fetch comics');
  }
  const comics = await res.json() as ComicResponseDto[];
  const totalCount = parseInt(res.headers.get('X-Total-Count') || '0', 10);
  return { comics, totalCount };
}

async function fetchGenreName(genreId: string) {
  const res = await fetch(`${BASE_API_URL}/api/Genres/${genreId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch genre');
  const genre = await res.json() as GenreDto;
  return genre.genreName;
}

export default async function GenrePage({ params, searchParams }: { params: Promise<{ genreId: string }>, searchParams: Promise<{ page?: string }> }) {
  try {
    const { genreId } = await params;
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const { comics, totalCount } = await fetchComicsByGenre(genreId, currentPage);
    const genreName = await fetchGenreName(genreId);
    const totalPages = Math.ceil(totalCount / 30);

    return (
      <div>
        <nav className="bg-blue-800 text-white shadow-lg sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold">Kata</Link>
              <Link href="/" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded-md">
                <FaHome />
                <span>Trang chủ</span>
              </Link>
              <NavbarGenres />
            </div>
            <NavbarSearch />
          </div>
        </nav>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Thể loại: {genreName}</h1>
        <div className="w-full flex justify-center">
        <div className="max-w-7xl w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {comics.map((comic) => (
            <div key={comic.comicId} className="bg-white rounded-lg shadow-md p-4">
              <Link href={`/comic/${comic.comicId}`}>
                <ComicImage
                  src={`${BASE_API_URL}${comic.comicImageUrl}`}
                  alt={comic.title}
                  className="w-full h-48 object-cover rounded-md mb-2"
                />
                <h3 className="text-lg font-bold text-black-800">{comic.title}</h3>
                <p className="text-black-600">Chapters: {comic.chapters.length}</p>
              </Link>
            </div>
          ))}
        </div>
        </div>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => (
              <Link
                key={i + 1}
                href={`/genres/${genreId}?page=${i + 1}`}
                className={`px-4 py-2 rounded-md ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in GenrePage:', error);
    return <div className="text-red-600 text-center">Lỗi khi tải comics theo thể loại: {String(error)}</div>;
  }
}