// app/page.tsx
import Link from 'next/link';
import { ComicResponseDto } from '@/app/types';
import ComicImage from '@/app/components/ComicImage';
import { FaHome } from 'react-icons/fa';
import NavbarGenres from './components/NavbarGenres';
import NavbarSearch from './components/NavbarSearch';
import { Suspense } from 'react';
const BASE_API_URL = 'http://localhost:5244';
function ComicSkeleton() {
return(
  <div className='bg-white rounded-lg shadow-md p-4 animate-pulse'>
    <div className="w-full h-48 bg-gray-300 rounded-md mb-2"></div>
      <div className="h-6 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
    </div>
);
}
// Loading skeleton grid
function ComicsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 15 }, (_, i) => (
        <ComicSkeleton key={i} />
      ))}
    </div>
  );
}

async function fetchComics(page: number = 1, pageSize: number = 30, search: string = '') {
  const url = `${BASE_API_URL}/api/Comics/search?searchTerm=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`;
 console.log('Fetching comics from:', url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Fetch comics error:', errorText);
    throw new Error('Failed to fetch comics: ' + errorText);
  }
  const comics = await res.json() as ComicResponseDto[];
  const totalCount = parseInt(res.headers.get('X-Total-Count') || '0', 10);
  return { comics, totalCount };

}
// Pagination component
function SmartPagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      {/* Previous button */}
      {currentPage > 1 && (
        <Link
          href={`/?page=${currentPage - 1}`}
          className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          ← Trước
        </Link>
      )}

      {/* Page numbers */}
      {visiblePages.map((page, index) => (
        <span key={index}>
          {page === '...' ? (
            <span className="px-3 py-2">...</span>
          ) : (
            <Link
              href={`/?page=${page}`}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </Link>
          )}
        </span>
      ))}

      {/* Next button */}
      {currentPage < totalPages && (
        <Link
          href={`/?page=${currentPage + 1}`}
          className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          Tiếp →
        </Link>
      )}
    </div>
  );
}
// Comics grid component with improved styling
function ComicsGrid({ comics }: { comics: ComicResponseDto[] }) {
  if (comics.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-xl mb-4">Không tìm thấy truyện tranh nào</div>
        <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {comics.map((comic) => (
        <div key={comic.comicId} className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <Link href={`/comic/${comic.comicId}`}>
            <div className="relative overflow-hidden rounded-t-lg flex items-center bg-gray-100">
              <ComicImage
                src={`${BASE_API_URL}${comic.comicImageUrl}`}
                alt={comic.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {comic.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {comic.chapters.length} chương
                </span>
                {comic.chapters.length > 0 && (
                  <span className="text-gray-500">
                    Cập nhật
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  try {
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const { comics, totalCount } = await fetchComics(currentPage);
    const totalPages = Math.ceil(totalCount / 30);


    return (
      <div>
        {/* Navbar */}
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

        {/* Content */}
        <div className="w-full flex justify-center">
          <div className="max-w-7xl w-full">
            <Suspense fallback={<ComicsLoadingSkeleton />}>
              <ComicsGrid comics={comics} />
            </Suspense>
            
            {totalPages > 1 && (
              <SmartPagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in HomePage:', error);
    return (
      <div>
        {/* Navbar - hiển thị ngay cả khi có lỗi */}
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
        <div className="w-full flex justify-center p-6">
          <div className="max-w-7xl w-full">
            <div className="text-red-600 text-center bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-xl font-semibold mb-2">⚠️ Có lỗi xảy ra</div>
              <div className="text-red-700">Không thể tải dữ liệu truyện tranh: {String(error)}</div>
              <Link href="/" className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Thử lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
