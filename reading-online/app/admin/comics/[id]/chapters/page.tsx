import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { ChapterResponseDto } from '@/app/types';
import DeleteButton from '@/components/DeleteButton';
import { FaPlus, FaBook, FaTrash } from 'react-icons/fa';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchChapters(comicId: string) {
  const res = await fetch('http://localhost:5244/api/Comics/' + comicId + '/Chapters', { cache: 'no-store' });
  console.log('Fetch chapters status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Fetch chapters error:', errorText);
    throw new Error('Failed to fetch chapters: ' + errorText);
  }
  const data = await res.json();
  console.log('Chapters data:', data);
  return data as ChapterResponseDto[];
}

async function deleteChapter(formData: FormData) {
  'use server';
  const chapterId = formData.get('chapterId') as string;
  const comicId = formData.get('comicId') as string;
  const res = await fetch('http://localhost:5244/api/Comics/' + comicId + '/Chapters/' + chapterId, { method: 'DELETE' });
  console.log('Delete chapter status:', res.status);
  if (res.ok) {
    revalidatePath('/admin/comics/' + comicId + '/chapters');
  } else {
    const errorText = await res.text();
    console.error('Delete chapter error:', errorText);
    throw new Error('Failed to delete chapter: ' + errorText);
  }
}

export default async function ChaptersPage({ params }: Props) {
  const { id: comicId } = await params; // Unwrap params với React.use()
  const chapters = await fetchChapters(comicId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Danh sách Chapters cho Comic ID {comicId}</h1>
        <Link href={'/admin/comics/' + comicId + '/chapters/add'} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <FaPlus />
          <span>Thêm Chapter</span>
        </Link>
      </div>
      {chapters.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">Không có chapters cho comic này.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left">ID</th>
                <th className="text-left">Number</th>
                <th className="text-left">Title</th>
                <th className="text-left">Images</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => (
                <tr key={chapter.chapterId.toString()}>
                  <td>{chapter.chapterId}</td>
                  <td>{chapter.chapterNumber}</td>
                  <td>{chapter.chapterTitle || 'Không có tiêu đề'}</td>
                  <td>{chapter.chapterImages.length}</td>
                  <td className="space-x-2">
                    <form action={deleteChapter} className="inline">
                      <input type="hidden" name="chapterId" value={chapter.chapterId} />
                      <input type="hidden" name="comicId" value={comicId} />
                      <DeleteButton id={chapter.chapterId} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}