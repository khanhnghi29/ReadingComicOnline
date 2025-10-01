
'use client';
import { FormEvent, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaUser, FaUserPlus, FaChevronDown, FaSignOutAlt, FaCog } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function NavbarSearch() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    // Optional: Show toast notification
    console.log('User logged out');
  };

  const getUserRoleDisplay = (roleId: number): string => {
    switch (roleId) {
      case 1: return 'Reader';
      case 2: return 'Admin';
      default: return 'User';
    }
  };

  const getRoleColor = (roleId: number): string => {
    switch (roleId) {
      case 1: return 'text-green-600';
      case 2: return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          name="search"
          placeholder="Tìm kiếm..."
          className="border border-gray-300 p-2 pr-10 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        <button 
          type="submit" 
          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors"
        >
          <FaSearch />
        </button>
      </form>

      {/* Authentication Section */}
      {isAuthenticated && user ? (
        // Authenticated User Dropdown
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded-md transition-colors text-white"
          >
            <FaUser className="text-sm" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{user.userName}</span>
              <span className={`text-xs ${getRoleColor(user.roleId)}`}>
                {getUserRoleDisplay(user.roleId)}
              </span>
            </div>
            <FaChevronDown 
              className={`text-xs transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : 'rotate-0'
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.userName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                    user.roleId === 2 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {getUserRoleDisplay(user.roleId)}
                  </span>
                </div>

                {/* Navigation Links */}
                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUser className="mr-3 text-gray-400" />
                  Dashboard
                </Link>

                {/* Admin Only Link */}
                {user.roleId === 2 && (
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaCog className="mr-3 text-gray-400" />
                    Admin Panel
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors border-t border-gray-100"
                >
                  <FaSignOutAlt className="mr-3 text-red-500" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Unauthenticated User Links
        <>
          <Link 
            href="/login" 
            className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded-md transition-colors text-white"
          >
            <FaUser />
            <span>Đăng nhập</span>
          </Link>
          <Link 
            href="/register" 
            className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded-md transition-colors text-white"
          >
            <FaUserPlus />
            <span>Đăng ký</span>
          </Link>
        </>
      )}
    </div>
  );
}
// 'use client';
// import { FormEvent } from 'react';
// import { useRouter } from 'next/navigation';
// import { FaSearch, FaUser, FaUserPlus } from 'react-icons/fa';
// import Link from 'next/link';

// export default function NavbarSearch() {
//   const router = useRouter();

//   const handleSearch = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     const query = (formData.get('search') as string)?.trim() || '';
    
//     console.log('Search query:', query); // Debug log
    
//     if (query) {
//       router.push(`/search?q=${encodeURIComponent(query)}`);
//       // Clear form
//       e.currentTarget.reset();
//     }
//   };

//   return (
//     <div className="flex items-center space-x-4">
//       <form onSubmit={handleSearch} className="relative">
//         <input
//           type="text"
//           name="search"
//           placeholder="Tìm kiếm..."
//           className="border border-gray-300 p-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           // ✅ Không dùng value và onChange - để uncontrolled
//         />
//         <button type="submit" className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
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