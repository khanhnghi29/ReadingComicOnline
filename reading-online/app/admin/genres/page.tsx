
import { FaPlus, FaEdit } from 'react-icons/fa';
import DeleteButton from '@/components/DeleteButton';
import { parseJwtPayload, requireAuth } from '@/app/lib/serverAuth';
import { addGenre, deleteGenre, fetchGenres, updateGenre } from '@/app/lib/serverActions/genreActions';

export default async function GenresPage() {
  // Server-side authentication check
  const token = await requireAuth('Admin');
  
  // Get current user info
  const payload = parseJwtPayload(token);
  const currentUser = payload ? {
    username: payload.sub,
    role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  } : null;

  // Fetch genres with authentication
  const genres = await fetchGenres();

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
        <h1 className="text-3xl font-bold text-gray-800">Danh sách Genres</h1>
        
        <form action={addGenre} className="flex items-center space-x-2">
          <input
            type="text"
            name="name"
            placeholder="Tên thể loại"
            required
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            <span>Thêm</span>
          </button>
        </form>
      </div>

      {/* Genres Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {genres.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No genres found. Add your first genre to get started.
                  </td>
                </tr>
              ) : (
                genres.map((genre) => (
                  <tr key={genre.genreId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {genre.genreId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {genre.genreName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <form action={updateGenre} className="flex items-center space-x-2">
                          <input type="hidden" name="id" value={genre.genreId} />
                          <input
                            type="text"
                            name="name"
                            defaultValue={genre.genreName}
                            className="border border-gray-300 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            required
                          />
                          <button 
                            type="submit" 
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Update Genre"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                        </form>
                        
                        <form action={deleteGenre} className="inline">
                          <input type="hidden" name="id" value={genre.genreId} />
                          <DeleteButton id={genre.genreId} />
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

      <div className="mt-6 text-center text-sm text-gray-500">
        Total Genres: <strong>{genres.length}</strong>
      </div>
    </div>
  );
}