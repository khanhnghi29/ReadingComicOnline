// app/search/page.tsx
import Link from 'next/link';
import { ComicResponseDto } from '@/app/types';
import ComicImage from '@/app/components/ComicImage';

const BASE_API_URL = 'http://localhost:5244';

async function fetchComicsByQuery(query: string, page: number = 1, pageSize: number = 30) {
  const url = `${BASE_API_URL}/api/Comics/search?searchTerm=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`;
  console.log('Fetching search results from:', url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Fetch comics error:', errorText);
    throw new Error('Failed to fetch comics');
  }
  const comics = await res.json() as ComicResponseDto[];
  const totalCount = parseInt(res.headers.get('X-Total-Count') || '0', 10);
  console.log('Fetched comics count:', comics.length, 'Total count:', totalCount); // Debug
  return { comics, totalCount };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
  try {
    const { q, page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const query = q || '';
    console.log('Search query received:', query); // Debug
    const { comics, totalCount } = await fetchComicsByQuery(query, currentPage);
    const totalPages = Math.ceil(totalCount / 30);
    console.log('Rendered comics:', comics); // Debug full comics data

    if (comics.length === 0) {
      return <div className="text-gray-600 text-center mt-10">Không tìm thấy kết quả cho "{query}".</div>;
    }

    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Kết quả tìm kiếm: {query || 'Tất cả'}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {comics.map((comic) => (
            <div key={comic.comicId} className="bg-white rounded-lg shadow-md p-4">
              <Link href={`/comic/${comic.comicId}`}>
                <ComicImage
                  src={`${BASE_API_URL}${comic.comicImageUrl}`}
                  alt={comic.title}
                  className="w-full h-48 object-cover rounded-md mb-2"
                />
                <h3 className="text-lg font-bold text-gray-800">{comic.title}</h3>
                <p className="text-gray-600">Chapters: {comic.chapters.length}</p>
              </Link>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => (
              <Link
                key={i + 1}
                href={`/search?q=${encodeURIComponent(query)}&page=${i + 1}`}
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
    console.error('Error in SearchPage:', error);
    return <div className="text-red-600 text-center">Lỗi khi tải kết quả tìm kiếm: {String(error)}</div>;
  }
}