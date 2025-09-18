// components/DeleteButton.tsx
'use client'; // Vẫn Client Component để cho phép onClick nếu cần, nhưng giờ đơn giản
import { FaTrash } from 'react-icons/fa';

interface DeleteButtonProps {
  id: string | number; // Chỉ giữ id để hiển thị trong confirm
}

export default function DeleteButton({ id }: DeleteButtonProps) {
return (
    <button
      type="submit"
      className="inline-flex items-center space-x-1 text-red-600 hover:text-red-800"
      onClick={(e) => {
        if (!confirm(`Xác nhận xóa comic ID ${id}?`)) {
          e.preventDefault();
        }
      }}
    >
      <FaTrash />
      <span>Xóa</span>
    </button>
  );
}