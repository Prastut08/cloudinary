import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#191714] font-['Times_New_Roman',Times,serif] flex items-center justify-center p-4 antialiased selection:bg-[#DED6C9] selection:text-[#191714]">
      <div className="w-full max-w-md bg-[#FFFDF9] border border-[#DED6C9] p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#191714]">
            Content Factory
          </h1>
          <p className="text-base text-[#716B62] font-normal">
            Sign in to your workspace.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#FFF5F5] border border-[#F5C6CB] text-[#721C24] text-xs font-sans flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#721C24]" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-[#DED6C9] bg-[#FFFDF9] hover:bg-[#F2ECDE] text-[#191714] font-medium text-sm transition-all duration-200 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#DED6C9] w-full" />
          <span className="bg-[#FFFDF9] px-3 text-xs text-[#716B62] uppercase font-sans tracking-widest absolute">
            or email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-[#191714] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#DED6C9] text-[#191714] placeholder-[#A0988C] focus:outline-none focus:border-[#191714] transition-all font-sans text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-[#191714] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#DED6C9] text-[#191714] placeholder-[#A0988C] focus:outline-none focus:border-[#191714] transition-all font-sans text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 text-sm font-medium bg-[#191714] text-[#F7F3EA] border border-[#191714] hover:bg-[#2C2723] transition-colors disabled:opacity-50 tracking-wide"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-[#716B62] border-t border-[#DED6C9] pt-5 font-normal">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#191714] hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
