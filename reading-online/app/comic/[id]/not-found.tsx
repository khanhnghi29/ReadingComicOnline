// app/comic/[id]/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Comic không tìm thấy</h2>
        <p className="text-gray-600">
          Comic bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.
        </p>
      </div>
      
      <div className="space-x-4">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Về trang chủ
        </Link>
        
        <Link
          href="/search"
          className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Tìm kiếm
        </Link>
      </div>
    </div>
  );
}