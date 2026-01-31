'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check for admin claim
      const idTokenResult = await userCredential.user.getIdTokenResult();

      if (idTokenResult.claims.admin !== true) {
        // Sign out if not admin
        await auth.signOut();
        setError('You do not have admin access.');
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push('/admin');
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;

      switch (errorCode) {
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('An error occurred. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-gray-50)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary-600)] rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-gray-900)]">Admin Login</h1>
          <p className="text-[var(--color-gray-500)] mt-2">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-[var(--shadow-3)] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0" />
                <p className="text-sm text-[var(--color-error)]">{error}</p>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@carib.team"
                leftIcon={<Mail className="w-5 h-5" />}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                leftIcon={<Lock className="w-5 h-5" />}
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" fullWidth isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[var(--color-gray-500)] mt-6">
          Carib Admin Dashboard
        </p>
      </motion.div>
    </div>
  );
}
