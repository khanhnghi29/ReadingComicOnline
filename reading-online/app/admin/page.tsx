'use client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { FaHome, FaUser, FaTag, FaChartBar, FaEye, FaPlus, FaCog } from 'react-icons/fa';

export default function AdminDashboard() {
  const { user } = useAuth();


  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.userName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your manga reader platform from this admin dashboard.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <FaCog className="mr-1" />
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaHome className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Comics</p>
              <p className="text-2xl font-semibold text-gray-900">247</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaUser className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Authors</p>
              <p className="text-2xl font-semibold text-gray-900">28</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaTag className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Genres</p>
              <p className="text-2xl font-semibold text-gray-900">25</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaEye className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Views</p>
              <p className="text-2xl font-semibold text-gray-900">12.5K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Management Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Content Management</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              href="/admin/comics"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <FaHome className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Comics</p>
                  <p className="text-sm text-gray-500">Add, edit, and organize manga series</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </Link>

            <Link
              href="/admin/authors"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <FaUser className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Authors</p>
                  <p className="text-sm text-gray-500">Add and manage comic authors</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </Link>

            <Link
              href="/admin/genres"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <FaTag className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Genres</p>
                  <p className="text-sm text-gray-500">Organize comic categories and tags</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaPlus className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New comic "One Piece" added
                  </p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <FaUser className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Author "Eiichiro Oda" updated
                  </p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FaTag className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Genre "Shonen" created
                  </p>
                  <p className="text-sm text-gray-500">3 days ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaChartBar className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Monthly report generated
                  </p>
                  <p className="text-sm text-gray-500">1 week ago</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/admin/activity"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all activity →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">99.9%</div>
              <div className="text-sm text-gray-500">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">1.2TB</div>
              <div className="text-sm text-gray-500">Storage Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">15ms</div>
              <div className="text-sm text-gray-500">Response Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/comics"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Add New Comic
          </Link>
          <Link
            href="/admin/authors"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Add New Author
          </Link>
          <Link
            href="/admin/genres"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Add New Genre
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <FaChartBar className="mr-2 h-4 w-4" />
            View Reports
          </Link>
        </div>
      </div>
    </div>
  );
}