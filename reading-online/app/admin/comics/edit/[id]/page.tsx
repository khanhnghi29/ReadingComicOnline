'use client';
import { useTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthorDto, GenreDto, ComicResponseDto } from '@/app/types';
import { FaEdit } from 'react-icons/fa';
import { updateComicAction } from './action';
import Swal from 'sweetalert2';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchComic(id: string) {
  const res = await fetch('http://localhost:5244/api/Comics/' + id, { cache: 'no-store' });
  console.log('Fetch comic status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Fetch comic error:', errorText);
    throw new Error('Failed to fetch comic');
  }
  return res.json() as Promise<ComicResponseDto>;
}

async function fetchAuthors() {
  const res = await fetch('http://localhost:5244/api/Authors', { cache: 'no-store' });
  console.log('Fetch authors status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Fetch authors error:', errorText);
    throw new Error('Failed to fetch authors');
  }
  return res.json() as Promise<AuthorDto[]>;
}

async function fetchGenres() {
  const res = await fetch('http://localhost:5244/api/Genres', { cache: 'no-store' });
  console.log('Fetch genres status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Fetch genres error:', errorText);
    throw new Error('Failed to fetch genres');
  }
  return res.json() as Promise<GenreDto[]>;
}

export default function EditComicPage({ params }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [comic, setComic] = useState<ComicResponseDto | null>(null);
  const [authors, setAuthors] = useState<AuthorDto[]>([]);
  const [genres, setGenres] = useState<GenreDto[]>([]);
  // Unwrap params với React.use()
  const { id } = use(params);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedComic = await fetchComic(id);
        const fetchedAuthors = await fetchAuthors();
        const fetchedGenres = await fetchGenres();
        setComic(fetchedComic);
        setAuthors(fetchedAuthors);
        setGenres(fetchedGenres);
      } catch (err) {
        setError(String(err));
      }
    }
    loadData();
  }, [id]);

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
      setError(String(err));
      await Swal.fire({
        title: 'Lỗi!',
        text: String(err),
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
    });
  };

  if (error) {
    return <div className="text-red-600 text-center">Lỗi: {error}</div>;
  }

  if (!comic) {
    return <div className="text-gray-600 text-center">Đang tải...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Sửa Comic: {comic.title}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(new FormData(e.target as HTMLFormElement));
        }}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        <input type="hidden" name="id" value={comic.comicId} />
        <div>
          <label className="block text-gray-700 font-semibold">Title:</label>
          <input
            type="text"
            name="title"
            defaultValue={comic.title}
            required
            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Description:</label>
          <textarea
            name="description"
            defaultValue={comic.comicDescription}
            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Comic Image (hiện tại: {comic.comicImageUrl}):</label>
          <input type="file" name="image" accept="image/*" className="border border-gray-300 p-2 w-full rounded-md" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Author:</label>
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
        <div>
          <label className="block text-gray-700 font-semibold">Genres:</label>
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
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Price:</label>
          <input
            type="number"
            name="price"
            defaultValue={comic.price}
            min="0"
            step="0.01"
            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          <FaEdit />
          <span>{isPending ? 'Đang cập nhật...' : 'Cập nhật Comic'}</span>
        </button>
      </form>
    </div>
  );
}