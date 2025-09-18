export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Đăng ký</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold">Tên:</label>
          <input type="text" name="name" required className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Email:</label>
          <input type="email" name="email" required className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Mật khẩu:</label>
          <input type="password" name="password" required className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Đăng ký
        </button>
      </form>
    </div>
  );
}