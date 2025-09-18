
import { redirect } from 'next/navigation';
import { AuthorDto } from '@/app/types';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import DeleteButton from '@/components/DeleteButton';

async function fetchAuthors() {
  const res = await fetch('http://localhost:5244/api/Authors', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch authors');
  return res.json() as Promise<AuthorDto[]>;
}

async function addAuthor(formData: FormData) {
  'use server';
  const data = { authorName: formData.get('name') as string };
  const res = await fetch('http://localhost:5244/api/Authors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.ok) redirect('/admin/authors');
  throw new Error('Failed to add author');
}

async function updateAuthor(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const data = { authorName: formData.get('name') as string };
  const res = await fetch('http://localhost:5244/api/Authors/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.ok) redirect('/admin/authors');
  throw new Error('Failed to update author');
}

async function deleteAuthor(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const res = await fetch('http://localhost:5244/api/Authors/' + id, { method: 'DELETE' });
  if (res.ok) redirect('/admin/authors');
  throw new Error('Failed to delete author');
}

export default async function AuthorsPage() {
  const authors = await fetchAuthors();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Danh sách Authors</h1>
        <form action={addAuthor} className="flex items-center space-x-2">
          <input
            type="text"
            name="name"
            placeholder="Tên tác giả"
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
            {authors.map((author) => (
              <tr key={author.authorId.toString()}>
                <td>{author.authorId}</td>
                <td>{author.authorName}</td>
                <td className="space-x-2">
                  <form action={updateAuthor} className="inline-flex items-center space-x-2">
                    <input type="hidden" name="id" value={author.authorId} />
                    <input
                      type="text"
                      name="name"
                      defaultValue={author.authorName}
                      className="border border-gray-300 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
                  </form>
                  <form action={deleteAuthor} className="inline">
                    <input type="hidden" name="id" value={author.authorId} />
                    <DeleteButton id={author.authorId} />
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
