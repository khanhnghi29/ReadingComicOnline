
// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
//               app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
// app/page.tsx
import Link from 'next/link';
import { ComicResponseDto } from '@/app/types';
import ComicImage from '@/app/components/ComicImage';

const BASE_API_URL = 'http://localhost:5244';

async function fetchComics(page: number = 1, pageSize: number = 30, search: string = '') {
  const url = `${BASE_API_URL}/api/Comics/search?searchTerm=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`;
  console.log('Fetching comics from:', url);
  const res = await fetch(url, { cache: 'no-store' });
  console.log('Fetch comics status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Fetch comics error:', errorText);
    throw new Error('Failed to fetch comics: ' + errorText);
  }
  const comics = await res.json() as ComicResponseDto[];
  const totalCount = parseInt(res.headers.get('X-Total-Count') || '0', 10);
  return { comics, totalCount };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  try {
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const { comics, totalCount } = await fetchComics(currentPage);
    const totalPages = Math.ceil(totalCount / 30);

    return (
      <div>
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
                href={`/?page=${i + 1}`}
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
    console.error('Error in HomePage:', error);
    return <div className="text-red-600 text-center">Lỗi khi tải dữ liệu comics: {String(error)}</div>;
  }

}
// export default function Home() {