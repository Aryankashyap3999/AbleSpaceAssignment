import { CheckCircle, Loader2, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Dispatch, SetStateAction } from 'react';
import type { AxiosError } from 'axios';
import { Separator } from '@radix-ui/react-separator';

interface SignInForm {
  email: string;
  password: string;
}

interface ValidationError {
  message: string;
}

interface SignInCardProps {
  signinForm: SignInForm;
  setSigninForm: Dispatch<SetStateAction<SignInForm>>;
  validationError: ValidationError | null;
  onSigninFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  isSuccess: boolean;
  error: AxiosError<{ message: string }> | null;
}

export const SignInCard = ({
  signinForm,
  setSigninForm,
  validationError,
  onSigninFormSubmit,
  isPending,
  isSuccess,
  error,
}: SignInCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 backdrop-blur">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-sm font-medium">Sign in to access your account</p>
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
            <p className="text-sm font-medium text-blue-900">Signing in...</p>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg mb-5 p-4 flex items-center gap-3">
            <CheckCircle className="size-5 text-green-600 shrink-0" />
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-green-900">Successfully signed in</p>
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
                {error?.response?.data?.message || 'Sign in failed'}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSigninFormSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-3">
              📧 Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={signinForm.email}
              onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })}
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
              value={signinForm.password}
              onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
              disabled={isPending}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isSuccess}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-lg transition duration-200 mt-8 shadow-lg hover:shadow-xl disabled:shadow-none text-base"
          >
            {isPending ? '⏳ Signing in...' : isSuccess ? '✓ Signed in' : 'Sign In'}
          </button>
        </form>

        {/* Separator */}
        <Separator className="my-7 bg-gray-300 h-px" />

        {/* Additional Options */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-700">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/signup')}
              className="text-blue-600 hover:text-blue-700 font-bold transition hover:underline"
            >
              Create one now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
