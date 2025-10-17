'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/hooks/useUser';
import AuthGuard from '@/components/AuthGuard';

const roleOptions = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'restaurant_owner', label: 'Restaurant Owner' },
  { value: 'admin', label: 'Admin' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, updateUserProfile } = useUser();

  const [selectedRole, setSelectedRole] = useState<string>('patient');
  const [adminCode, setAdminCode] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const requiresAdminCode = useMemo(() => selectedRole === 'admin', [selectedRole]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    try {
      if (requiresAdminCode) {
        const codeFromEnv = process.env.NEXT_PUBLIC_ADMIN_SECURITY_CODE;
        if (!codeFromEnv) {
          setError('Admin security code is not configured.');
          return;
        }
        if (adminCode.trim() !== codeFromEnv) {
          setError('Invalid admin security code.');
          return;
        }
      }

      setSaving(true);
      await updateUserProfile({ 
        role: selectedRole as any,
        ...(requiresAdminCode ? { adminCode: adminCode.trim() } : {})
      } as any);
      setSuccess('Settings updated successfully.');
    } catch (err) {
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>Update your profile preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <div className="text-sm text-gray-700">{user?.role || '—'}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Change Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {requiresAdminCode && (
                <div className="space-y-2">
                  <Label htmlFor="adminCode">Admin Security Code</Label>
                  <Input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter admin security code"
                  />
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              {success && (
                <div className="text-sm text-green-600">{success}</div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}


