// app/admin/comics/page.tsx
// app/admin/comics/page.tsx
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { ComicResponseDto } from '@/app/types'; // Types mới
import DeleteButton from '@/components/DeleteButton';
import { FaPlus, FaEdit, FaBook } from 'react-icons/fa';

async function fetchComics() {
  try {
    console.log('Đang fetch từ API...');
    const res = await fetch('http://localhost:5244/api/Comics', { cache: 'no-store' });
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error body:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
  //   const data = await res.json();
  //   console.log('Raw data from API:', data);
  //   console.log('Is array?', Array.isArray(data));
    
  //   if (!Array.isArray(data)) {
  //     console.warn('Data is not an array, returning empty array');
  //     return [];
  //   }

  //   // Log check comicId (nên không undefined nữa)
  //   data.forEach((comic: any, index: number) => {
  //     console.log(`Item ${index}: comicId = ${comic.comicId}`); // Dùng camelCase
  //   });
    
  //   return data as ComicResponseDto[];
  // } catch (error) {
  //   console.error('Full fetch error:', error);
  //   return [];
  // }
  const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data as ComicResponseDto[];
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

async function deleteComic(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const res = await fetch(`http://localhost:5244/api/Comics/${id}`, { method: 'DELETE' });
  if (res.ok) {
    revalidatePath('/admin/comics');
  } else {
    throw new Error('Failed to delete comic');
  }
}
export default async function ComicsPage() {
  const comics = await fetchComics();
  
  if (!comics || comics.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Không có dữ liệu comics.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black-800">Danh sách Comics</h1>
        <Link
          href="/admin/comics/add"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <FaPlus />
          <span>Thêm Comic</span>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-black">
          <thead>
            <tr>
              <th className="text-left">ID</th>
              <th className="text-left">Title</th>
              <th className="text-left">Price</th>
              <th className="text-left">Views</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comics.map((comic) => (
              <tr key={comic.comicId.toString()}>
                <td>{comic.comicId}</td>
                <td>{comic.title}</td>
                <td>{comic.price.toFixed(2)}</td>
                <td>{comic.totalViews}</td>
                <td className="space-x-2">
                  <Link
                    href={`/admin/comics/edit/${comic.comicId}`}
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                    <span>Sửa</span>
                  </Link>
                  <form action={deleteComic} className="inline">
                    <input type="hidden" name="id" value={comic.comicId} />
                    <DeleteButton id={comic.comicId} />
                  </form>
                  <Link href={'/admin/comics/' + comic.comicId + '/chapters'} className="inline-flex items-center space-x-1 text-green-600 hover:text-green-800">
                      <FaBook />
                      <span>Chapters ({comic.chapters?.length || 0})</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}