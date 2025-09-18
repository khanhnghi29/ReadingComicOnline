// ### 3. Add Chapter (app/admin/comics/[id]/chapters/add/page.tsx)
// Nghiệp vụ: Tạo chapter mới cho comic với chapter number, title, và nhiều images.
// ```typescript
// // app/admin/comics/[id]/chapters/add/page.tsx
'use client';
import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';
import { addChapterAction } from './action';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AddChapterPage({ params }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { id: comicId } = use(params);

  const handleSubmit = (formData: FormData) => {
    const images = formData.getAll('chapterImages') as File[];
    console.log('Client chapterImages:', images.map((img) => ({ name: img.name, size: img.size })));
    let totalSize = 0;
    images.forEach((image) => {
      totalSize += image.size;
    });
    if (totalSize > 35 * 1024 * 1024) { // 10 MB
      setError('Kích thước file quá lớn (tổng > 35 MB). Vui lòng chọn ít ảnh hơn.');
      return;
    }
    if (images.length === 0 || images.every((img) => img.size === 0)) {
      setError('Vui lòng chọn ít nhất một ảnh hợp lệ.');
      return;
    }

    formData.append('comicId', comicId);
    startTransition(async () => {
      try {
        const response = await addChapterAction(formData);
        if (response.success) {
          alert('Success: Chapter added!');
          router.push(`/admin/comics/${comicId}/chapters`);
          router.refresh();
        }
      } catch (err: any) {
        console.error('Submit error:', err);
        if (err.message.includes('Body exceeded')) {
          setError('Kích thước file quá lớn (vượt quá giới hạn server). Vui lòng chọn ít ảnh hơn.');
        } else {
          setError(err.message || 'Lỗi không xác định khi thêm chapter.');
        }
        alert('Error: ' + (err.message || String(err)));
      }
    });
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-red-600 text-center mb-4">Lỗi: {error}</div>
        <button onClick={() => setError(null)} className="bg-blue-600 text-white px-4 py-2 rounded-md">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Thêm Chapter cho Comic ID {comicId}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(new FormData(e.target as HTMLFormElement));
        }}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        <div>
          <label className="block text-gray-700 font-semibold">Chapter Number (bắt buộc):</label>
          <input
            type="number"
            name="chapterNumber"
            required
            min="1"
            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Chapter Title:</label>
          <input
            type="text"
            name="chapterTitle"
            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Chapter Images (bắt buộc, chọn 1 hoặc nhiều, giới hạn 35 MB tổng):</label>
          <input
            type="file"
            name="chapterImages"
            accept="image/*"
            multiple
            required
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 55) {
                setError('Chỉ được chọn tối đa 55 file.');
                e.target.value = '';
              }
            }}
            className="border border-gray-300 p-2 w-full rounded-md"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          <FaPlus />
          <span>{isPending ? 'Đang thêm...' : 'Thêm Chapter'}</span>
        </button>
      </form>
    </div>
  );
}