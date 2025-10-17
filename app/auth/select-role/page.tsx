'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Role = 'admin' | 'doctor' | 'patient' | 'restaurant_owner';

export default function SelectRole() {
  const { user, loading, isAuthenticated } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/auth/login');
      } else if (user?.role) {
        router.replace('/dashboard');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const submit = async () => {
    if (!user) return;
    setError('');
    if (!selectedRole) {
      setError('Please select a role.');
      return;
    }
    if (selectedRole === 'admin' && adminCode !== '993322') {
      setError('Invalid admin security code.');
      return;
    }
    setSubmitting(true);
    try {
      // First-time role assignment only; rules prevent later changes
      await updateDoc(doc(db, 'users', user.id), {
        role: selectedRole,
        ...(selectedRole === 'admin' ? { adminCode } : {}),
      });
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Failed to set role');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isAuthenticated || user?.role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Select Your Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant={selectedRole === 'patient' ? 'default' : 'outline'} onClick={() => setSelectedRole('patient')}>Patient</Button>
            <Button variant={selectedRole === 'doctor' ? 'default' : 'outline'} onClick={() => setSelectedRole('doctor')}>Doctor</Button>
            <Button variant={selectedRole === 'restaurant_owner' ? 'default' : 'outline'} onClick={() => setSelectedRole('restaurant_owner')}>Restaurant</Button>
            <Button variant={selectedRole === 'admin' ? 'default' : 'outline'} onClick={() => setSelectedRole('admin')}>Admin</Button>
          </div>

          {selectedRole === 'admin' && (
            <div className="space-y-2">
              <Label htmlFor="admin-code">Admin Security Code</Label>
              <Input id="admin-code" placeholder="Enter admin code" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} />
            </div>
          )}

          <Button className="w-full" onClick={submit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


