
import { FaPlus, FaEdit } from 'react-icons/fa';
import DeleteButton from '@/components/DeleteButton';
import { parseJwtPayload, requireAuth } from '@/app/lib/serverAuth';
import { 
  fetchAuthors, 
  addAuthor, 
  updateAuthor, 
  deleteAuthor 
} from '@/app/lib/serverActions/authorActions';

export default async function AuthorsPage() {
  // Server-side authentication check
  const token = await requireAuth('Admin');
  
  // Get current user info
  const payload = parseJwtPayload(token);
  const currentUser = payload ? {
    username: payload.sub,
    role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  } : null;

  // Fetch authors with authentication
  const authors = await fetchAuthors();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Admin Info Header */}
      {currentUser && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Logged in as: <strong>{currentUser.username}</strong> ({currentUser.role})
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black-800">Danh sách Authors</h1>
        
        <form action={addAuthor} className="flex items-center text-black space-x-2">
          <input
            type="text"
            name="name"
            placeholder="Tên tác giả"
            required
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            className="flex items-center space-x-2 bg-blue-600 text-black px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            <span>Thêm</span>
          </button>
        </form>
      </div>

      {/* Authors Table */}
      <div className="bg-white rounded-lg text-black shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-900">
              {authors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-black">
                    No authors found. Add your first author to get started.
                  </td>
                </tr>
              ) : (
                authors.map((author) => (
                  <tr key={author.authorId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {author.authorId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">
                        {author.authorName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <form action={updateAuthor} className="flex items-center space-x-2">
                          <input type="hidden" name="id" value={author.authorId} />
                          <input
                            type="text"
                            name="name"
                            defaultValue={author.authorName}
                            className="border border-black text-black p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            required
                          />
                          <button 
                            type="submit" 
                            className="text-black hover:text-black transition-colors"
                            title="Update Author"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                        </form>
                        
                        <form action={deleteAuthor} className="inline">
                          <input type="hidden" name="id" value={author.authorId} />
                          <DeleteButton id={author.authorId} />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-black">
        Total Authors: <strong>{authors.length}</strong>
      </div>
    </div>
  );
}
