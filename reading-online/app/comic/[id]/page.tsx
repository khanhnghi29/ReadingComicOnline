//app/comic/[id]/page.tsx
import Link from 'next/link';
import { ComicResponseDto } from '@/app/types';
import ComicImage from '@/app/components/ComicImage';
import { notFound } from 'next/navigation';
import NavbarGenres from '@/app/components/NavbarGenres';
import NavbarSearch from '@/app/components/NavbarSearch';
import { FaHome } from 'react-icons/fa';
const BASE_API_URL = 'http://localhost:5244';

async function fetchComicDetail(comicId: string){
  const url = `${BASE_API_URL}/api/Comics/${comicId}`;
  console.log('Fetching comic detail from:', url);
  
  const res = await fetch(url, { cache: 'no-store' });
  
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    const errorText = await res.text();
    console.error('Fetch comic detail error:', errorText);
    throw new Error('Failed to fetch comic detail');
  }
  
  return res.json() as Promise<ComicResponseDto>;
}

export default async function ComicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comic = await fetchComicDetail(id);

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
        <div className="flex justify-center">
          <div className="max-w-7xl">
            {/* mx-auto */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Comic Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Comic Image */}
                <div className="md:col-span-1">
                  <ComicImage
                    src={`${BASE_API_URL}${comic.comicImageUrl}`}
                    alt={comic.title}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                
                {/* Comic Info */}
                <div className="md:col-span-2">
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">{comic.title}</h1>
                  
                  {/* Author */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Tác giả:</h3>
                    <p className="text-gray-600">{comic.author.authorName}</p>
                  </div>
                  
                  {/* Genres */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Thể loại:</h3>
                    <div className="flex flex-wrap gap-2">
                      {comic.genres.map((genre) => (
                        <span
                          key={genre.genreId}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {genre.genreName}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Lượt xem:</h4>
                        <p className="text-gray-600">{comic.totalViews.toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Số chapters:</h4>
                        <p className="text-gray-600">{comic.chapters.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price */}
                  {comic.price > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700">Giá:</h4>
                      <p className="text-green-600 font-bold">{comic.price.toLocaleString()} VND</p>
                    </div>
                  )}
                  
                  {/* Description */}
                  {comic.comicDescription && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Mô tả:</h3>
                      <p className="text-gray-600 leading-relaxed">{comic.comicDescription}</p>
                    </div>
                  )}
                  
                  {/* Created Date */}
                  <div className="text-sm text-gray-500">
                    Ngày tạo: {new Date(comic.createAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
              
              {/* Chapters List */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh sách Chapters</h2>
                
                {comic.chapters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {comic.chapters
                      .sort((a, b) => a.chapterNumber - b.chapterNumber) // Sort by chapter number
                      .map((chapter) => (
                        <Link
                          key={chapter.chapterId}
                          href={`/comic/${comic.comicId}/chapters/${chapter.chapterId}`}
                          className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                Chapter {chapter.chapterNumber}
                              </h3>
                              {chapter.chapterTitle && (
                                <p className="text-gray-600 text-sm mt-1">
                                  {chapter.chapterTitle}
                                </p>
                              )}
                              <p className="text-gray-500 text-xs mt-2">
                                {new Date(chapter.createAt).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                            <div className="text-blue-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Chưa có chapter nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } 
  catch (error) {
    console.error('Error in ComicDetailPage:', error);
    return (
      <div className="w-full flex justify-center">
      <div className="text-center py-8">
        <div className="text-red-600 text-xl mb-4">Lỗi khi tải thông tin comic</div>
        <p className="text-gray-600">{String(error)}</p>
        <Link href="/" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Về trang chủ
        </Link>
      </div>
      </div>
    );
  }
}
