// app/components/NavbarSearch.tsx
// 'use client';
// import { FormEvent, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { FaSearch, FaUser, FaUserPlus } from 'react-icons/fa';
// import Link from 'next/link';

// export default function NavbarSearch() {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState('');

//   const handleSearch = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     const query = formData.get('search') as string;
//     if (query.trim()) {
//       router.push(`/search?q=${encodeURIComponent(query.trim())}`);
//     }
//   };

//   return (
//     <div className="flex items-center space-x-4">
//       <form onSubmit={handleSearch} className="relative">
//         <input
//           type="text"
//           name="search"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder="Tìm kiếm..."
//           className="border border-gray-300 p-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <button type="submit" className="absolute top-1/2 right-3 transform -translate-y-1/2 text-black-500">
//           <FaSearch />
//         </button>
//       </form>
//       <Link href="/login" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded-md">
//         <FaUser />
//         <span>Đăng nhập</span>
//       </Link>
//       <Link href="/register" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded-md">
//         <FaUserPlus />
//         <span>Đăng ký</span>
//       </Link>
//     </div>
//   );
// }
'use client';
import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaUser, FaUserPlus } from 'react-icons/fa';
import Link from 'next/link';

export default function NavbarSearch() {
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = (formData.get('search') as string)?.trim() || '';
    
    console.log('Search query:', query); // Debug log
    
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      // Clear form
      e.currentTarget.reset();
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          name="search"
          placeholder="Tìm kiếm..."
          className="border border-gray-300 p-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          // ✅ Không dùng value và onChange - để uncontrolled
        />
        <button type="submit" className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
          <FaSearch />
        </button>
      </form>
      <Link href="/login" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded-md">
        <FaUser />
        <span>Đăng nhập</span>
      </Link>
      <Link href="/register" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded-md">
        <FaUserPlus />
        <span>Đăng ký</span>
      </Link>
    </div>
  );
}