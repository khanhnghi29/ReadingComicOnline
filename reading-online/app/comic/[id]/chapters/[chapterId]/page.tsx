// app/comic/[id]/chapters/[chapterId]/page.tsx
// import { ChapterResponseDto } from '@/app/types';
// import ComicImage from '@/app/components/ComicImage';

// const BASE_API_URL = 'http://localhost:5244';

// async function fetchChapter(comicId: string, chapterId: string) {
//   const url = `${BASE_API_URL}/api/comics/${comicId}/Chapters/${chapterId}`;
//   const res = await fetch(url, { cache: 'no-store' });
//   if (!res.ok) throw new Error('Failed to fetch chapter');
//   return res.json() as Promise<ChapterResponseDto>;
// }

// export default async function ChapterDetailPage({ params }: { params: Promise<{ id: string, chapterId: string }> }) {
//   try {
//     const { id, chapterId } = await params;
//     const chapter = await fetchChapter(id, chapterId);
//     return (
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">Chapter {chapter.chapterNumber}: {chapter.chapterTitle}</h1>
//         <div className="space-y-4">
//           {chapter.chapterImages.map((image) => (
//             <ComicImage
//               key={image.imageId}
//               src={`${BASE_API_URL}${image.imageUrl}`}
//               alt={`Image ${image.imageOrder}`}
//               className="w-full object-cover"
//             />
//           ))}
//         </div>
//       </div>
//     );
//   } catch (error) {
//     console.error('Error in ChapterDetailPage:', error);
//     return <div className="text-red-600 text-center">Lỗi khi tải chi tiết chapter: {String(error)}</div>;
//   }
// }
// app/comic/[id]/chapter/[chapterId]/page.tsx - DEBUG VERSION
// 'use client';
// import Link from 'next/link';
// import { ChapterResponseDto } from '@/app/types';
// import ComicImage from '@/app/components/ComicImage';
// import { notFound } from 'next/navigation';

// const BASE_API_URL = 'http://localhost:5244';

// async function fetchChapter(comicId: string, chapterId: string) {
//   const url = `${BASE_API_URL}/api/comics/${comicId}/Chapters/${chapterId}`;
//   console.log('🔥 FETCH URL:', url);
//   console.log('🔥 ComicId:', comicId, 'ChapterId:', chapterId);
  
//   try {
//     const res = await fetch(url, { cache: 'no-store' });
//     console.log('🔥 Response status:', res.status);
//     console.log('🔥 Response ok:', res.ok);
    
//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error('🔥 Error response body:', errorText);
//       if (res.status === 404) {
//         notFound();
//       }
//       throw new Error(`Failed to fetch chapter: ${res.status} - ${errorText}`);
//     }
    
//     const data = await res.json();
//     console.log('🔥 Chapter data received:', JSON.stringify(data, null, 2));
//     console.log('🔥 Chapter images count:', data.chapterImages?.length || 0);
    
//     if (data.chapterImages && data.chapterImages.length > 0) {
//       console.log('🔥 First image URL:', data.chapterImages[0].imageUrl);
//       console.log('🔥 Full image URL:', `${BASE_API_URL}${data.chapterImages[0].imageUrl}`);
//     }
    
//     return data as ChapterResponseDto;
//   } catch (error) {
//     console.error('🔥 Fetch error:', error);
//     throw error;
//   }
// }

// export default async function ChapterReaderPage({ 
//   params 
// }: { 
//   params: Promise<{ id: string; chapterId: string }> 
// }) {
//   try {
//     console.log('🔥 ChapterReaderPage started');
    
//     const resolvedParams = await params;
//     console.log('🔥 Resolved params:', resolvedParams);
    
//     const { id: comicId, chapterId } = resolvedParams;
//     console.log('🔥 Destructured - ComicId:', comicId, 'ChapterId:', chapterId);
    
//     const chapter = await fetchChapter(comicId, chapterId);
//     console.log('🔥 Chapter fetched successfully');
//     console.log('🔥 Chapter object:', {
//       chapterId: chapter.chapterId,
//       chapterNumber: chapter.chapterNumber,
//       chapterTitle: chapter.chapterTitle,
//       imagesCount: chapter.chapterImages?.length || 0
//     });
    
//     const sortedImages = chapter.chapterImages ? 
//       chapter.chapterImages.sort((a, b) => a.imageOrder - b.imageOrder) : 
//       [];
    
//     console.log('🔥 Sorted images:', sortedImages.map(img => ({
//       imageId: img.imageId,
//       imageOrder: img.imageOrder,
//       imageUrl: img.imageUrl
//     })));

//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         {/* Debug Info Panel */}
//         <div className="bg-yellow-100 border border-yellow-400 rounded p-4 mb-6">
//           <h2 className="font-bold text-yellow-800">🐛 DEBUG INFO</h2>
//           <div className="text-sm text-yellow-700 mt-2">
//             <div><strong>Comic ID:</strong> {comicId}</div>
//             <div><strong>Chapter ID:</strong> {chapterId}</div>
//             <div><strong>Chapter Number:</strong> {chapter.chapterNumber}</div>
//             <div><strong>Chapter Title:</strong> {chapter.chapterTitle || 'N/A'}</div>
//             <div><strong>Images Count:</strong> {sortedImages.length}</div>
//             <div><strong>API URL:</strong> {BASE_API_URL}/api/comics/{comicId}/Chapters/{chapterId}</div>
//           </div>
//         </div>

//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//           <Link 
//             href={`/comic/${comicId}`}
//             className="text-blue-600 hover:text-blue-800 font-semibold"
//           >
//             ← Quay lại comic
//           </Link>
//           <h1 className="text-2xl font-bold text-gray-800 mt-2">
//             Chapter {chapter.chapterNumber}
//             {chapter.chapterTitle && `: ${chapter.chapterTitle}`}
//           </h1>
//         </div>

//         {/* Images */}
//         <div className="space-y-4">
//           {sortedImages.length > 0 ? (
//             <>
//               <div className="text-center text-gray-600 mb-4">
//                 Tổng cộng {sortedImages.length} hình ảnh
//               </div>
//               {sortedImages.map((image, index) => {
//                 const fullImageUrl = `${BASE_API_URL}${image.imageUrl}`;
//                 console.log(`🔥 Rendering image ${index + 1}:`, fullImageUrl);
                
//                 return (
//                   <div key={image.imageId} className="text-center border-2 border-dashed border-gray-200 p-4">
//                     {/* Debug info per image */}
//                     <div className="text-xs text-gray-500 mb-2">
//                       Image ID: {image.imageId} | Order: {image.imageOrder} | 
//                       URL: {image.imageUrl}
//                     </div>
                    
//                     <ComicImage
//                       src={fullImageUrl}
//                       alt={`Chapter ${chapter.chapterNumber} - Page ${index + 1}`}
//                       className="w-full h-auto rounded-lg shadow-md mx-auto max-w-full"
//                     />
                    
//                     <div className="text-sm text-gray-500 mt-2">
//                       Trang {index + 1} / {sortedImages.length}
//                     </div>
                    
//                     {/* Test direct img tag */}
//                     <details className="mt-2">
//                       <summary className="text-xs text-blue-600 cursor-pointer">Test direct img tag</summary>
//                       <img 
//                         src={fullImageUrl} 
//                         alt="Direct test"
//                         className="w-32 h-auto mx-auto mt-2 border"
//                         onLoad={() => console.log(`✅ Direct img loaded: ${fullImageUrl}`)}
//                         onError={(e) => console.error(`❌ Direct img failed: ${fullImageUrl}`, e)}
//                       />
//                     </details>
//                   </div>
//                 );
//               })}
//             </>
//           ) : (
//             <div className="text-center py-8 bg-red-50 border border-red-200 rounded">
//               <h3 className="text-red-800 font-bold">❌ KHÔNG CÓ HÌNH ẢNH</h3>
//               <p className="text-red-600 mt-2">
//                 Chapter này có {chapter.chapterImages?.length || 0} hình ảnh trong database
//               </p>
//               <div className="text-sm text-red-500 mt-2">
//                 Raw chapterImages: {JSON.stringify(chapter.chapterImages)}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Raw JSON Data */}
//         <details className="mt-8 bg-gray-100 p-4 rounded">
//           <summary className="cursor-pointer font-bold">🔍 Raw Chapter Data</summary>
//           <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded border">
//             {JSON.stringify(chapter, null, 2)}
//           </pre>
//         </details>
//       </div>
//     );
//   } catch (error) {
//     console.error('🔥 ChapterReaderPage Error:', error);
//     return (
//       <div className="text-center py-8">
//         <div className="text-red-600 text-xl mb-4">❌ LỖI KHI TẢI CHAPTER</div>
//         <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
//           <p className="text-red-800 font-bold">Chi tiết lỗi:</p>
//           <pre className="text-red-600 text-sm mt-2 text-left overflow-auto">
//             {String(error)}
//           </pre>
//         </div>
//         <div className="space-x-2">
//           <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
//             Về trang chủ
//           </Link>
//           <button 
//             onClick={() => window.location.reload()}
//             className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//           >
//             Thử lại
//           </button>
//         </div>
//       </div>
//     );
//   }
// }

// Final version without debug info
// app/comic/[id]/chapter/[chapterId]/page.tsx
import Link from 'next/link';
import { ComicResponseDto, ChapterResponseDto } from '@/app/types';
import ComicImage from '@/app/components/ComicImage';
import { notFound } from 'next/navigation';

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
                <div className="text-sm text-gray-500 mt-2 mb-4">
                  Trang {index + 1} / {sortedImages.length}
                </div>
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
          <button 
            onClick={() => window.history.back()}
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }
}
