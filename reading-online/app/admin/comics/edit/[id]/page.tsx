
'use client';
import { useTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthorDto, GenreDto, ComicResponseDto } from '@/app/types';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import { 
  updateComicAction, 
  fetchComic, 
  fetchAuthors, 
  fetchGenres
} from './action';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { use } from 'react';
import Image from 'next/image';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditComicPage({ params }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comic, setComic] = useState<ComicResponseDto | null>(null);
  const [authors, setAuthors] = useState<AuthorDto[]>([]);
  const [genres, setGenres] = useState<GenreDto[]>([]);
  
  // Unwrap params
  const { id } = use(params);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all data with authentication
        const [fetchedComic, fetchedAuthors, fetchedGenres] = await Promise.all([
          fetchComic(id),
          fetchAuthors(),
          fetchGenres()
        ]);
        
        setComic(fetchedComic);
        setAuthors(fetchedAuthors);
        setGenres(fetchedGenres);
      } catch (err) {
        console.error('Error loading data:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        
        // If authentication error, redirect to login
        if (errorMessage.includes('Authentication') || errorMessage.includes('unauthorized')) {
          Swal.fire({
            title: 'Authentication Required',
            text: 'Please login as Admin to access this page',
            icon: 'warning',
            confirmButtonText: 'Go to Login',
          }).then(() => {
            router.push('/login');
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [id, router]);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await updateComicAction(formData);
        
        if (response.success) {
          await Swal.fire({
            title: 'Thành công!',
            text: 'Comic đã được cập nhật.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          router.push('/admin/comics');
          router.refresh();
        }
      } catch (err) {
        console.error('Error updating comic:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        
        await Swal.fire({
          title: 'Lỗi!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !comic) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <strong>Lỗi:</strong> {error}
          </div>
          <Link
            href="/admin/comics"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Quay lại danh sách Comics
          </Link>
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="max-w-2xl mx-auto text-center text-gray-600">
        Comic not found
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Sửa Comic: {comic.title}
        </h1>
        <Link
          href="/admin/comics"
          className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Quay lại
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Current Image Preview */}
      {comic.comicImageUrl && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-gray-700 font-semibold mb-2">
            Current Image:
          </label>
          <div className="relative w-48 h-64">
            <Image
              src={comic.comicImageUrl}
              alt={comic.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(new FormData(e.target as HTMLFormElement));
        }}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        <input type="hidden" name="id" value={comic.comicId} />

        {/* Title */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            defaultValue={comic.title}
            required
            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={comic.comicDescription}
            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Comic Image */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Update Comic Image
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="border border-gray-300 p-2 w-full rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to keep current image
          </p>
        </div>

        {/* Author */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Author <span className="text-red-500">*</span>
          </label>
          <select
            name="authorId"
            defaultValue={comic.authorId}
            required
            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn tác giả</option>
            {authors.map((author) => (
              <option key={author.authorId} value={author.authorId}>
                {author.authorName}
              </option>
            ))}
          </select>
        </div>

        {/* Genres */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Genres <span className="text-gray-500 text-sm">(chọn nhiều)</span>
          </label>
          <select
            name="genreIds"
            multiple
            defaultValue={comic.genres.map((g) => g.genreId.toString())}
            className="border border-gray-300 p-2 w-full rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {genres.map((genre) => (
              <option key={genre.genreId} value={genre.genreId}>
                {genre.genreName}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Hold Ctrl/Cmd to select multiple genres
          </p>
        </div>

        {/* Price */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Price (VND)
          </label>
          <input
            type="number"
            name="price"
            defaultValue={comic.price}
            min="0"
            step="0.01"
            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={isPending || isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <FaEdit />
            <span>{isPending ? 'Đang cập nhật...' : 'Cập nhật Comic'}</span>
          </button>

          <Link
            href="/admin/comics"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
        </div>
      </form>

      {/* Comic Info */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Comic Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>ID:</strong> {comic.comicId}</p>
          <p><strong>Total Views:</strong> {comic.totalViews?.toLocaleString() || 0}</p>
          <p><strong>Created:</strong> {comic.createAt ? new Date(comic.createAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
// 'use client';
// import { useTransition, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { AuthorDto, GenreDto, ComicResponseDto } from '@/app/types';
// import { FaEdit } from 'react-icons/fa';
// import { updateComicAction } from './action';
// import Swal from 'sweetalert2';
// import { use } from 'react';

// interface Props {
//   params: Promise<{ id: string }>;
// }

// async function fetchComic(id: string) {
//   const res = await fetch('http://localhost:5244/api/Comics/' + id, { cache: 'no-store' });
//   console.log('Fetch comic status:', res.status);
//   if (!res.ok) {
//     const errorText = await res.text();
//     console.error('Fetch comic error:', errorText);
//     throw new Error('Failed to fetch comic');
//   }
//   return res.json() as Promise<ComicResponseDto>;
// }

// async function fetchAuthors() {
//   const res = await fetch('http://localhost:5244/api/Authors', { cache: 'no-store' });
//   console.log('Fetch authors status:', res.status);
//   if (!res.ok) {
//     const errorText = await res.text();
//     console.error('Fetch authors error:', errorText);
//     throw new Error('Failed to fetch authors');
//   }
//   return res.json() as Promise<AuthorDto[]>;
// }

// async function fetchGenres() {
//   const res = await fetch('http://localhost:5244/api/Genres', { cache: 'no-store' });
//   console.log('Fetch genres status:', res.status);
//   if (!res.ok) {
//     const errorText = await res.text();
//     console.error('Fetch genres error:', errorText);
//     throw new Error('Failed to fetch genres');
//   }
//   return res.json() as Promise<GenreDto[]>;
// }

// export default function EditComicPage({ params }: Props) {
//   const router = useRouter();
//   const [isPending, startTransition] = useTransition();
//   const [error, setError] = useState<string | null>(null);
//   const [comic, setComic] = useState<ComicResponseDto | null>(null);
//   const [authors, setAuthors] = useState<AuthorDto[]>([]);
//   const [genres, setGenres] = useState<GenreDto[]>([]);
//   // Unwrap params với React.use()
//   const { id } = use(params);

//   useEffect(() => {
//     async function loadData() {
//       try {
//         const fetchedComic = await fetchComic(id);
//         const fetchedAuthors = await fetchAuthors();
//         const fetchedGenres = await fetchGenres();
//         setComic(fetchedComic);
//         setAuthors(fetchedAuthors);
//         setGenres(fetchedGenres);
//       } catch (err) {
//         setError(String(err));
//       }
//     }
//     loadData();
//   }, [id]);

//   const handleSubmit = (formData: FormData) => {
//     startTransition(async () => {
//      try {
//       const response = await updateComicAction(formData);
//       if (response.success) {
//         await Swal.fire({
//           title: 'Thành công!',
//           text: 'Comic đã được cập nhật.',
//           icon: 'success',
//           confirmButtonText: 'OK',
//         });
//         router.push('/admin/comics');
//         router.refresh();
//       }
//     } catch (err) {
//       setError(String(err));
//       await Swal.fire({
//         title: 'Lỗi!',
//         text: String(err),
//         icon: 'error',
//         confirmButtonText: 'OK',
//       });
//     }
//     });
//   };

//   if (error) {
//     return <div className="text-red-600 text-center">Lỗi: {error}</div>;
//   }

//   if (!comic) {
//     return <div className="text-gray-600 text-center">Đang tải...</div>;
//   }

//   return (
//     <div className="max-w-2xl mx-auto">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Sửa Comic: {comic.title}</h1>
//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           handleSubmit(new FormData(e.target as HTMLFormElement));
//         }}
//         className="space-y-6 bg-white p-6 rounded-lg shadow-md"
//       >
//         <input type="hidden" name="id" value={comic.comicId} />
//         <div>
//           <label className="block text-gray-700 font-semibold">Title:</label>
//           <input
//             type="text"
//             name="title"
//             defaultValue={comic.title}
//             required
//             className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-semibold">Description:</label>
//           <textarea
//             name="description"
//             defaultValue={comic.comicDescription}
//             className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             rows={4}
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-semibold">Comic Image (hiện tại: {comic.comicImageUrl}):</label>
//           <input type="file" name="image" accept="image/*" className="border border-gray-300 p-2 w-full rounded-md" />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-semibold">Author:</label>
//           <select
//             name="authorId"
//             defaultValue={comic.authorId}
//             required
//             className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Chọn tác giả</option>
//             {authors.map((author) => (
//               <option key={author.authorId} value={author.authorId}>
//                 {author.authorName}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block text-gray-700 font-semibold">Genres:</label>
//           <select
//             name="genreIds"
//             multiple
//             defaultValue={comic.genres.map((g) => g.genreId.toString())}
//             className="border border-gray-300 p-2 w-full rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             {genres.map((genre) => (
//               <option key={genre.genreId} value={genre.genreId}>
//                 {genre.genreName}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block text-gray-700 font-semibold">Price:</label>
//           <input
//             type="number"
//             name="price"
//             defaultValue={comic.price}
//             min="0"
//             step="0.01"
//             className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={isPending}
//           className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
//         >
//           <FaEdit />
//           <span>{isPending ? 'Đang cập nhật...' : 'Cập nhật Comic'}</span>
//         </button>
//       </form>
//     </div>
//   );
// }