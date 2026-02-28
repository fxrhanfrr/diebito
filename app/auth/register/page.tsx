'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    weight: '',
    role: 'patient' as 'admin' | 'doctor' | 'patient' | 'restaurant_owner',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminCode, setAdminCode] = useState('');

  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate admin security code
    if (formData.role === 'admin') {
      const configuredCode = process.env.NEXT_PUBLIC_ADMIN_SECURITY_CODE;
      if (!configuredCode) {
        setError('Admin registration is not configured. Contact the system administrator.');
        return;
      }
      if (adminCode.trim() !== configuredCode.trim()) {
        setError('Invalid admin security code. Please check and try again.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await signUpWithEmail(formData.email, formData.password, {
        name: formData.name,
        role: formData.role,
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
      });
      // Redirect to dashboard - the dashboard will handle role-based routing
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    }

    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Google signup failed');
    }

    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value as 'admin' | 'doctor' | 'patient' | 'restaurant_owner' });
  };

  return (
    <div className="form-container bg-gradient-primary">
      <Card className="form-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Create Account</CardTitle>
          <p className="text-secondary">Join Diabeto Maestro today</p>
        </CardHeader>
        <CardContent className="space-content">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="restaurant_owner">Restaurant Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Admin Security Code — only shown when Admin role is selected */}
            {formData.role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="adminCode" className="flex items-center gap-1 text-amber-700">
                  <ShieldCheck className="h-4 w-4" />
                  Admin Security Code
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-amber-500" />
                  <Input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="pl-10 border-amber-300 focus:border-amber-500"
                    placeholder="Enter admin security code"
                    required
                  />
                </div>
                <p className="text-xs text-amber-600">Contact your system administrator for the admin security code.</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (optional)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Weight"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
              or
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}