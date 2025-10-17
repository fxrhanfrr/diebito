'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useUser } from '../hooks/useUser';
import { User } from '../lib/types';

const diabetesTypes = [
  'Type 1 Diabetes',
  'Type 2 Diabetes',
  'Gestational Diabetes',
  'Prediabetes',
  'Other'
];

const roles = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'restaurant_owner', label: 'Restaurant Owner' },
  { value: 'admin', label: 'Admin' }
];

export const UserProfileSetup = () => {
  const router = useRouter();
  const { createUserProfile, firebaseUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'patient' as User['role'],
    age: '',
    weight: '',
    diabetesType: ''
  });
  const [adminCode, setAdminCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    setLoading(true);
    try {
      if (formData.role === 'admin') {
        const configuredCode = process.env.NEXT_PUBLIC_ADMIN_SECURITY_CODE;
        if (!configuredCode) {
          alert('Admin security code is not configured.');
          setLoading(false);
          return;
        }
        if (adminCode.trim() !== configuredCode) {
          alert('Invalid admin security code.');
          setLoading(false);
          return;
        }
      }
      const profileData: any = {
        name: formData.name,
        email: firebaseUser.email!,
        role: formData.role,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
      };

      // Only include diabetesType if it's a patient
      if (formData.role === 'patient' && formData.diabetesType) {
        profileData.diabetesType = formData.diabetesType;
      }

      if (formData.role === 'admin') {
        profileData.adminCode = adminCode.trim();
      }

      await createUserProfile(profileData);

      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const baseValid = formData.name && formData.age && formData.weight;
    
    // Diabetes type is only required for patients
    if (formData.role === 'patient') {
      return baseValid && formData.diabetesType;
    }
    
    // Admin requires security code
    if (formData.role === 'admin') {
      return baseValid && !!adminCode.trim();
    }
    
    return baseValid;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Please provide some additional information to complete your profile setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value as User['role'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter your age"
                min="1"
                max="120"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Enter your weight in kg"
                min="20"
                max="300"
                step="0.1"
                required
              />
            </div>

            {formData.role === 'patient' && (
              <div className="space-y-2">
                <Label htmlFor="diabetesType">Diabetes Type *</Label>
                <Select
                  value={formData.diabetesType}
                  onValueChange={(value) => handleInputChange('diabetesType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select diabetes type" />
                  </SelectTrigger>
                  <SelectContent>
                    {diabetesTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="adminCode">Admin Security Code</Label>
                <Input
                  id="adminCode"
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter admin code"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isFormValid()}
            >
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
