import { redirect } from 'next/navigation';
import { GenreDto } from '@/app/types';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import DeleteButton from '@/components/DeleteButton';

async function fetchGenres() {
  const res = await fetch('http://localhost:5244/api/Genres', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json() as Promise<GenreDto[]>;
}

async function addGenre(formData: FormData) {
  'use server';
  const data = { genreName: formData.get('name') as string };
  const res = await fetch('http://localhost:5244/api/Genres', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.ok) redirect('/admin/genres');
  throw new Error('Failed to add genre');
}

async function updateGenre(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const data = { genreName: formData.get('name') as string };
  const res = await fetch(`http://localhost:5244/api/Genres/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.ok) redirect('/admin/genres');
  throw new Error('Failed to update genre');
}

async function deleteGenre(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const res = await fetch(`http://localhost:5244/api/Genres/${id}`, { method: 'DELETE' });
  if (res.ok) redirect('/admin/genres');
  throw new Error('Failed to delete genre');
}

export default async function GenresPage() {
  const genres = await fetchGenres();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Danh sách Genres</h1>
        <form action={addGenre} className="flex items-center space-x-2">
          <input
            type="text"
            name="name"
            placeholder="Tên thể loại"
            required
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <FaPlus />
            <span>Thêm</span>
          </button>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left">ID</th>
              <th className="text-left">Name</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((genre) => (
              <tr key={genre.genreId.toString()}>
                <td>{genre.genreId}</td>
                <td>{genre.genreName}</td>
                <td className="space-x-2">
                  <form action={updateGenre} className="inline-flex items-center space-x-2">
                    <input type="hidden" name="id" value={genre.genreId} />
                    <input
                      type="text"
                      name="name"
                      defaultValue={genre.genreName}
                      className="border border-gray-300 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
                  </form>
                  <form action={deleteGenre} className="inline">
                    <input type="hidden" name="id" value={genre.genreId} />
                    <DeleteButton id={genre.genreId} />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}