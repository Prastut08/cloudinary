import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/UI';
import { Image, AlertCircle } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setSubmitting(true);

    try {
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded bg-neutral-900 mx-auto flex items-center justify-center text-white font-semibold text-sm">
            <Image className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-neutral-900 tracking-tight">Create Account</h1>
          <p className="text-xs text-neutral-500">Get started with AI Commerce Content Factory</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-xs text-neutral-500 border-t border-neutral-100 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-neutral-900 underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
