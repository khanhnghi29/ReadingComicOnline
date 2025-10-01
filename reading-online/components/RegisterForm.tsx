'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import { UserCreateDto } from '@/app/types';

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useAuthForm<UserCreateDto>({
    userName: '',
    email: '',
    password: '',
  });

  const onSubmit = async (formValues: UserCreateDto) => {
    await register(formValues);
    router.push('/login?message=Registration successful! Please log in.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="userName"
                type="text"
                required
                value={values.userName}
                onChange={handleChange}
                className="relative block w-full px-3 py-2 border border-black placeholder-gray-500 text-black rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <input
                name="email"
                type="email"
                required
                value={values.email}
                onChange={handleChange}
                className="relative block w-full px-3 py-2 border border-black-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={values.password}
                onChange={handleChange}
                className="relative block w-full px-3 py-2 pr-10 border border-black-300 placeholder-gray-500 text-black rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-black">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};