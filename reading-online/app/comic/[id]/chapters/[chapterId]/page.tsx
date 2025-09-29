//app/comic/[id]/chapters/[chapterId]/page.tsx
import Link from 'next/link';
import { ComicResponseDto, ChapterResponseDto } from '@/app/types';
import ComicImage from '@/app/components/ComicImage';
import { notFound } from 'next/navigation';
import NavbarGenres from '@/app/components/NavbarGenres';
import NavbarSearch from '@/app/components/NavbarSearch';
import { FaHome } from 'react-icons/fa';

const BASE_API_URL = 'http://localhost:5244';

// ✅ Giữ nguyên logic fetch chapter từ code cũ
async function fetchChapter(comicId: string, chapterId: string) {
  const url = `${BASE_API_URL}/api/comics/${comicId}/Chapters/${chapterId}`;
  console.log('Fetching chapter from:', url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch chapter');
  }
  return res.json() as Promise<ChapterResponseDto>;
}

// ✅ Fetch comic data riêng để lấy navigation info
async function fetchComicForNavigation(comicId: string) {
  const url = `${BASE_API_URL}/api/Comics/${comicId}`;
  console.log('Fetching comic for navigation from:', url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    // Nếu không fetch được comic, vẫn có thể hiển thị chapter
    console.warn('Could not fetch comic for navigation');
    return null;
  }
  return res.json() as Promise<ComicResponseDto>;
}

export default async function ChapterReaderPage({ 
  params 
}: { 
  params: Promise<{ id: string; chapterId: string }> 
}) {
  try {
    const { id: comicId, chapterId } = await params;
    
    // ✅ Fetch chapter data (chính)
    const chapter = await fetchChapter(comicId, chapterId);
    
    // ✅ Fetch comic data (cho navigation - optional)
    const comic = await fetchComicForNavigation(comicId);
    
    // Navigation logic (chỉ khi có comic data)
    let prevChapter = null;
    let nextChapter = null;
    let currentIndex = -1;
    
    if (comic && comic.chapters) {
      const sortedChapters = comic.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
      currentIndex = sortedChapters.findIndex(c => c.chapterId.toString() === chapterId);
      prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
      nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;
    }
    
    // ✅ Giữ nguyên logic sort images từ code cũ
    const sortedImages = chapter.chapterImages.sort((a, b) => a.imageOrder - b.imageOrder);

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
          <div className="max-w-4xl mx-auto">
            {/* Header Navigation */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <Link 
                    href={`/comic/${comicId}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    ← {comic ? comic.title : 'Quay lại comic'}
                  </Link>
                  <h1 className="text-xl font-bold text-gray-800 mt-1">
                    Chapter {chapter.chapterNumber}
                    {chapter.chapterTitle && `: ${chapter.chapterTitle}`}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(chapter.createAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                
                {/* Chapter Navigation - chỉ hiển thị khi có comic data */}
                {comic && (
                  <div className="flex items-center space-x-2">
                    {prevChapter && (
                      <Link
                        href={`/comic/${comicId}/chapters/${prevChapter.chapterId}`}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
                      >
                        ← Ch. {prevChapter.chapterNumber}
                      </Link>
                    )}
                    
                    <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-semibold">
                      {currentIndex + 1} / {comic.chapters.length}
                    </span>
                    
                    {nextChapter && (
                      <Link
                        href={`/comic/${comicId}/chapters/${nextChapter.chapterId}`}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
                      >
                        Ch. {nextChapter.chapterNumber} →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Giữ nguyên logic hiển thị images từ code cũ */}
            <div className="space-y-2">
              {sortedImages.length > 0 ? (
                sortedImages.map((image, index) => (
                  <div key={image.imageId} className="text-center">
                    <ComicImage
                      src={`${BASE_API_URL}${image.imageUrl}`}
                      alt={`Image ${image.imageOrder}`}
                      className="w-full h-auto rounded-lg shadow-md mx-auto max-w-full"
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chapter này chưa có hình ảnh</p>
                </div>
              )}
            </div>

            {/* Bottom Navigation - chỉ hiển thị khi có navigation data */}
            {comic && (prevChapter || nextChapter) && (
              <div className="bg-white rounded-lg shadow-md p-4 mt-6 sticky bottom-4">
                <div className="flex items-center justify-between">
                  <div>
                    {prevChapter && (
                      <Link
                        href={`/comic/${comicId}/chapters/${prevChapter.chapterId}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Chapter trước
                      </Link>
                    )}
                  </div>
                  
                  <Link
                    href={`/comic/${comicId}`}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                  >
                    Danh sách chapter
                  </Link>
                  
                  <div>
                    {nextChapter && (
                      <Link
                        href={`/comic/${comicId}/chapters/${nextChapter.chapterId}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                      >
                        Chapter tiếp theo
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>  
    );
  } catch (error) {
    console.error('Error in ChapterReaderPage:', error);
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-xl mb-4">Lỗi khi tải chapter</div>
        <p className="text-gray-600">{String(error)}</p>
        <div className="mt-4 space-x-2">
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }
}
