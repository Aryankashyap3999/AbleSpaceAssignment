import { CheckCircle, Loader2, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Dispatch, SetStateAction } from 'react';
import type { AxiosError } from 'axios';
import { Separator } from '@radix-ui/react-separator';

interface SignUpForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

interface ValidationError {
  message: string;
}

interface SignUpCardProps {
  signupForm: SignUpForm;
  setSignupForm: Dispatch<SetStateAction<SignUpForm>>;
  validationError: ValidationError | null;
  onSignupFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  isSuccess: boolean;
  error: AxiosError<{ message: string }> | null;
}

export const SignUpCard = ({
  signupForm,
  setSignupForm,
  validationError,
  onSignupFormSubmit,
  isPending,
  isSuccess,
  error,
}: SignUpCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 backdrop-blur">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 mb-2">
            Get Started
          </h1>
          <p className="text-gray-600 text-sm font-medium">Create your account to begin managing tasks</p>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg mb-5 p-4 flex items-start gap-3">
            <TriangleAlert className="size-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">{validationError?.message}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isPending && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg mb-5 p-4 flex items-center gap-3">
            <Loader2 className="size-5 text-blue-600 animate-spin shrink-0" />
            <p className="text-sm font-medium text-blue-900">Creating account...</p>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg mb-5 p-4 flex items-center gap-3">
            <CheckCircle className="size-5 text-green-600 shrink-0" />
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-green-900">Successfully signed up</p>
              <Loader2 className="size-4 text-green-600 animate-spin" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg mb-5 p-4 flex items-start gap-3">
            <TriangleAlert className="size-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">
                {error?.response?.data?.message || 'Signup failed'}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSignupFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-3">
              👤 Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={signupForm.name}
              onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
              disabled={isPending}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-bold text-gray-800 mb-3">
              @️ Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="johndoe"
              value={signupForm.username}
              onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
              disabled={isPending}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">Letters and numbers only, minimum 3 characters</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-3">
              📧 Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
              disabled={isPending}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-800 mb-3">
              🔐 Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
              disabled={isPending}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-800 mb-3">
              🔒 Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={signupForm.confirmPassword}
              onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
              disabled={isPending}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isSuccess}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-lg transition duration-200 mt-8 shadow-lg hover:shadow-xl disabled:shadow-none text-base"
          >
            {isPending ? '⏳ Creating account...' : isSuccess ? '✓ Created' : 'Create Account'}
          </button>
        </form>

        {/* Separator */}
        <Separator className="my-6 bg-gray-200 h-px" />

        {/* Separator */}
        <Separator className="my-7 bg-gray-300 h-px" />

        {/* Additional Options */}
        <div className="text-center">
          <p className="text-sm text-gray-700">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 font-bold transition hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
