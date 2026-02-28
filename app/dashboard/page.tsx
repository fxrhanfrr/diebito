'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import {
  Calendar,
  Utensils,
  Activity,
  ShoppingCart,
  MessageSquare,
  User,
  TrendingUp,
  Clock,
  Edit,
  Save,
  X,
  Users,
  Stethoscope,
  FileText,
  CheckCircle,
  AlertCircle,
  Droplets,
  Plus,
  Trash2
} from 'lucide-react';
import { getConsultationsByDoctor, getDiets, getUserProgress, getUser } from '@/lib/firestore';
import { Consultation, Diet, Progress as ProgressType, User as UserType } from '@/lib/types';

const diabetesTypes = [
  'Type 1 Diabetes',
  'Type 2 Diabetes',
  'Gestational Diabetes',
  'Prediabetes',
  'Other'
];


interface BloodSugarReading {
  value: number;
  time: string;
  label: 'fasting' | 'post-meal' | 'bedtime' | 'random';
}

export default function Dashboard() {
  const { user, loading, updateUserProfile } = useUser();
  const router = useRouter();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    age: '',
    weight: '',
    diabetesType: '' as string
  });
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('patient');
  const [adminCode, setAdminCode] = useState<string>('');

  // Doctor-specific state
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patientNames, setPatientNames] = useState<{ [key: string]: string }>({});
  const [allDiets, setAllDiets] = useState<Diet[]>([]);
  const [patientProgress, setPatientProgress] = useState<{ [key: string]: ProgressType[] }>({});
  const [loadingDoctorData, setLoadingDoctorData] = useState(false);

  // Blood sugar tracking (patients only) - stored in localStorage
  const [bloodSugarReadings, setBloodSugarReadings] = useState<BloodSugarReading[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bloodSugarReadings');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [newSugarValue, setNewSugarValue] = useState('');
  const [newSugarLabel, setNewSugarLabel] = useState<BloodSugarReading['label']>('fasting');

  const addBloodSugarReading = () => {
    const val = parseFloat(newSugarValue);
    if (isNaN(val) || val <= 0) return;
    const reading: BloodSugarReading = { value: val, time: new Date().toLocaleString(), label: newSugarLabel };
    const updated = [reading, ...bloodSugarReadings].slice(0, 10);
    setBloodSugarReadings(updated);
    localStorage.setItem('bloodSugarReadings', JSON.stringify(updated));
    setNewSugarValue('');
  };

  const removeBloodSugarReading = (index: number) => {
    const updated = bloodSugarReadings.filter((_, i) => i !== index);
    setBloodSugarReadings(updated);
    localStorage.setItem('bloodSugarReadings', JSON.stringify(updated));
  };

  const getBloodSugarStatus = (value: number, label: BloodSugarReading['label']) => {
    if (label === 'fasting') {
      if (value < 70) return { color: 'text-blue-600', bg: 'bg-blue-50', status: 'Low' };
      if (value <= 99) return { color: 'text-green-600', bg: 'bg-green-50', status: 'Normal' };
      if (value <= 125) return { color: 'text-yellow-600', bg: 'bg-yellow-50', status: 'Pre-diabetic' };
      return { color: 'text-red-600', bg: 'bg-red-50', status: 'High' };
    }
    if (value < 70) return { color: 'text-blue-600', bg: 'bg-blue-50', status: 'Low' };
    if (value <= 140) return { color: 'text-green-600', bg: 'bg-green-50', status: 'Normal' };
    if (value <= 199) return { color: 'text-yellow-600', bg: 'bg-yellow-50', status: 'Elevated' };
    return { color: 'text-red-600', bg: 'bg-red-50', status: 'High' };
  };

  useEffect(() => {
    if (user?.role === 'doctor') {
      loadDoctorData();
    }
  }, [user]);

  // Handle role assignment and role-based redirects
  useEffect(() => {
    if (!loading) {
      // Redirect unauthenticated users to login
      if (!user) {
        router.push('/auth/login');
        return;
      }
      // If no role yet, force role selection
      if (!user.role) {
        router.replace('/auth/select-role');
        return;
      }
      // Redirect based on user role for better UX
      if (user.role === 'restaurant_owner') {
        router.push('/restaurant-setup');
        return;
      }
      if (user.role === 'doctor') {
        router.push('/doctor-setup');
        return;
      }
    }
  }, [user, loading, router]);

  const loadDoctorData = async () => {
    if (!user) return;
    setLoadingDoctorData(true);
    try {
      const consultationsData = await getConsultationsByDoctor(user.id);
      setConsultations(consultationsData);

      // Load real patient names
      const uniquePatientIds = consultationsData.reduce((acc, c) => {
        if (!acc.includes(c.patientId)) acc.push(c.patientId);
        return acc;
      }, [] as string[]);
      const names: { [key: string]: string } = {};
      await Promise.all(uniquePatientIds.map(async (id) => {
        const patient = await getUser(id);
        names[id] = patient?.name ?? `Patient (${id.slice(0, 6)}...)`;
      }));
      setPatientNames(names);

      const dietsData = await getDiets();
      setAllDiets(dietsData);

      const progressData: { [key: string]: ProgressType[] } = {};
      for (const patientId of uniquePatientIds) {
        progressData[patientId] = await getUserProgress(patientId);
      }
      setPatientProgress(progressData);
    } catch (error) {
      console.error('Error loading doctor data:', error);
    } finally {
      setLoadingDoctorData(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Router redirect is in progress; render nothing to avoid flash
    return null;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'patient': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'doctor': return 'Doctor';
      case 'patient': return 'Patient';
      case 'restaurant_owner': return 'Restaurant Owner';
      default: return role;
    }
  };

  const getConsultationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConsultationStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const startEditingProfile = () => {
    setEditFormData({
      name: user.name,
      age: user.age.toString(),
      weight: user.weight.toString(),
      diabetesType: user.diabetesType || ''
    });
    setSelectedRole(user.role);
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
    setEditFormData({
      name: '',
      age: '',
      weight: '',
      diabetesType: ''
    });
  };

  const saveProfileChanges = async () => {
    try {
      if (selectedRole === 'admin' && user.role !== 'admin') {
        const configuredCode = process.env.NEXT_PUBLIC_ADMIN_SECURITY_CODE;
        if (!configuredCode) {
          alert('Admin security code is not configured.');
          return;
        }
        if (adminCode.trim() !== configuredCode) {
          alert('Invalid admin security code.');
          return;
        }
      }
      await updateUserProfile({
        name: editFormData.name,
        age: parseInt(editFormData.age),
        weight: parseFloat(editFormData.weight),
        diabetesType: editFormData.diabetesType,
        role: selectedRole as any,
        ...(selectedRole === 'admin' && user.role !== 'admin' ? { adminCode: adminCode.trim() } : {})
      } as any);
      setIsProfileDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const patientFeatures = [
    {
      title: 'Diet Plans',
      description: 'View and manage your personalized diet plans',
      icon: Utensils,
      href: '/diets',
      color: 'bg-green-500'
    },
    {
      title: 'Exercise Tracking',
      description: 'Track your exercise progress and routines',
      icon: Activity,
      href: '/exercises',
      color: 'bg-blue-500'
    },
    {
      title: 'Consultations',
      description: 'Book and manage doctor consultations',
      icon: Calendar,
      href: '/consultations',
      color: 'bg-purple-500'
    },
    {
      title: 'Food Ordering',
      description: 'Order healthy meals and snacks',
      icon: ShoppingCart,
      href: '/food-ordering',
      color: 'bg-orange-500'
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your health and fitness progress',
      icon: TrendingUp,
      href: '/progress',
      color: 'bg-indigo-500'
    },
    {
      title: 'Community',
      description: 'Connect with other patients and share experiences',
      icon: MessageSquare,
      href: '/community',
      color: 'bg-pink-500'
    }
  ];

  const doctorFeatures = [
    {
      title: 'Patient Consultations',
      description: 'Manage patient appointments and consultations',
      icon: Calendar,
      href: '/consultations',
      color: 'bg-blue-500'
    },
    {
      title: 'Patient Management',
      description: 'View and manage patient information',
      icon: User,
      href: '/patients',
      color: 'bg-green-500'
    },
    {
      title: 'Diet Recommendations',
      description: 'Create and assign diet plans to patients',
      icon: Utensils,
      href: '/diets',
      color: 'bg-purple-500'
    },
    {
      title: 'Exercise Plans',
      description: 'Design exercise routines for patients',
      icon: Activity,
      href: '/exercises',
      color: 'bg-orange-500'
    }
  ];

  const adminFeatures = [
    {
      title: 'User Management',
      description: 'Manage all users and their roles',
      icon: User,
      href: '/admin/users',
      color: 'bg-red-500'
    },
    {
      title: 'System Overview',
      description: 'View system statistics and analytics',
      icon: TrendingUp,
      href: '/admin/overview',
      color: 'bg-blue-500'
    },
    {
      title: 'Content Management',
      description: 'Manage posts, exercises, and food items',
      icon: MessageSquare,
      href: '/admin/content',
      color: 'bg-green-500'
    }
  ];

  const features = user.role === 'admin' ? adminFeatures :
    user.role === 'doctor' ? doctorFeatures :
      patientFeatures;

  // Doctor Dashboard Content
  if (user.role === 'doctor') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Doctor Dashboard - Dr. {user.name}
                </h1>
                <p className="mt-2 text-gray-600">
                  Monitor your patients and manage consultations
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={getRoleColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProfileDialogOpen(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats for Doctor */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingDoctorData ? '...' : consultations.reduce((acc, c) => {
                    if (!acc.includes(c.patientId)) acc.push(c.patientId);
                    return acc;
                  }, [] as string[]).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Consultations</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingDoctorData ? '...' : consultations.filter(c => c.status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingDoctorData ? '...' : consultations.filter(c => {
                    const today = new Date();
                    const appointmentDate = c.timeSlot.toDate();
                    return appointmentDate.toDateString() === today.toDateString();
                  }).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Diet Plans</CardTitle>
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingDoctorData ? '...' : allDiets.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Consultations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                Patient Consultations
              </CardTitle>
              <CardDescription>
                Manage your upcoming and recent patient appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDoctorData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading consultations...</p>
                </div>
              ) : consultations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No consultations scheduled yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consultations.slice(0, 5).map((consultation) => (
                        <TableRow key={consultation.id}>
                          <TableCell className="font-medium">
                            {patientNames[consultation.patientId] ?? `Patient (${consultation.patientId.slice(0, 6)}...)`}
                          </TableCell>
                          <TableCell>
                            {consultation.timeSlot.toDate().toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getConsultationStatusColor(consultation.status)}>
                              {getConsultationStatusIcon(consultation.status)}
                              <span className="ml-1">{consultation.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {consultations.length > 5 && (
                    <div className="text-center mt-4">
                      <Button variant="outline">
                        View All Consultations ({consultations.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Diet Plans Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Utensils className="w-5 h-5 mr-2" />
                Patient Diet Plans Overview
              </CardTitle>
              <CardDescription>
                Monitor your patients' diet plans and nutrition progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDoctorData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading diet plans...</p>
                </div>
              ) : allDiets.length === 0 ? (
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No diet plans created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allDiets.slice(0, 6).map((diet) => (
                    <Card key={diet.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Diet Plan</h4>
                        <Badge variant="secondary">{diet.meals.length} meals</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Calories:</span>
                          <span className="font-medium">{diet.nutritionStats.calories}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carbs:</span>
                          <span className="font-medium">{diet.nutritionStats.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein:</span>
                          <span className="font-medium">{diet.nutritionStats.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sugar:</span>
                          <span className="font-medium">{diet.nutritionStats.sugar}g</span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        Created: {diet.createdAt.toDate().toLocaleDateString()}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Progress Tracking */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Patient Progress Overview
              </CardTitle>
              <CardDescription>
                Track your patients' exercise and health progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDoctorData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading progress data...</p>
                </div>
              ) : Object.keys(patientProgress).length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No patient progress data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(patientProgress).slice(0, 3).map(([patientId, progress]) => (
                    <Card key={patientId} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Patient {patientId.slice(0, 8)}...</h4>
                        <Badge variant="outline">
                          {progress.length} activities
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completed:</span>
                          <span className="font-medium">
                            {progress.filter(p => p.status === 'completed').length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Skipped:</span>
                          <span className="font-medium">
                            {progress.filter(p => p.status === 'skipped').length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate:</span>
                          <span className="font-medium">
                            {progress.length > 0
                              ? Math.round((progress.filter(p => p.status === 'completed').length / progress.length) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${feature.color}`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.href}>
                    <Button className="w-full" variant="outline">
                      Open {feature.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Profile Edit Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your personal and health information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-age">Age</Label>
                  <Input
                    id="edit-age"
                    type="number"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Weight (kg)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    value={editFormData.weight}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="Enter your weight in kg"
                    min="20"
                    max="300"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-diabetesType">Diabetes Type</Label>
                <Select
                  value={editFormData.diabetesType}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, diabetesType: value }))}
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

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveProfileChanges}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Regular Dashboard for Patients and Admins
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                Here's what's happening with your diabetes management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getRoleColor(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsProfileDialogOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your personal and health information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                <div className="text-lg font-semibold">{user.name}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Age</Label>
                <div className="text-lg font-semibold">{user.age} years</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Weight</Label>
                <div className="text-lg font-semibold">{user.weight} kg</div>
              </div>

              {user.diabetesType && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Diabetes Type</Label>
                  <div className="text-lg font-semibold">{user.diabetesType}</div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <div className="text-lg font-semibold">{user.email}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                <div className="text-lg font-semibold">
                  {user.createdAt.toDate().toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Age</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.age} years</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weight</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.weight} kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diabetes Type</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{user.diabetesType}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{getRoleLabel(user.role)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Blood Sugar Tracker - Patient only */}
        {user.role === 'patient' && (
          <Card className="mb-8 border-red-100">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <Droplets className="w-5 h-5 mr-2" />
                Blood Sugar Tracker
              </CardTitle>
              <CardDescription>Log and monitor your blood glucose readings (mg/dL)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-5">
                <Input
                  type="number"
                  placeholder="Value (mg/dL)"
                  className="w-40"
                  value={newSugarValue}
                  onChange={(e) => setNewSugarValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBloodSugarReading()}
                />
                <Select value={newSugarLabel} onValueChange={(v) => setNewSugarLabel(v as BloodSugarReading['label'])}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fasting">Fasting</SelectItem>
                    <SelectItem value="post-meal">Post-Meal</SelectItem>
                    <SelectItem value="bedtime">Bedtime</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addBloodSugarReading} className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-4 h-4 mr-1" /> Log Reading
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">Normal fasting: 70–99</span>
                <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full font-medium">Pre-diabetic: 100–125</span>
                <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full font-medium">Diabetic: 126+</span>
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">Normal post-meal: &lt;140</span>
              </div>
              {bloodSugarReadings.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Droplets className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No readings yet. Add your first reading above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bloodSugarReadings.map((r, i) => {
                    const s = getBloodSugarStatus(r.value, r.label);
                    return (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${s.bg}`}>
                        <div className="flex items-center gap-3">
                          <span className={`text-xl font-bold ${s.color}`}>{r.value} <span className="text-sm font-normal">mg/dL</span></span>
                          <div>
                            <Badge variant="outline" className="text-xs capitalize">{r.label.replace('-', ' ')}</Badge>
                            <span className={`ml-2 text-xs font-semibold ${s.color}`}>{s.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{r.time}</span>
                          <button onClick={() => removeBloodSugarReading(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={feature.href}>
                  <Button className="w-full" variant="outline">
                    Open {feature.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500 py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity to show</p>
                <p className="text-sm">Start using the features above to see your activity here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal and health information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="restaurant_owner">Restaurant Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole === 'admin' && user.role !== 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="edit-adminCode">Admin Security Code</Label>
                <Input
                  id="edit-adminCode"
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter admin code"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editFormData.age}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-weight">Weight (kg)</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  value={editFormData.weight}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="Enter your weight in kg"
                  min="20"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-diabetesType">Diabetes Type</Label>
              <Select
                value={editFormData.diabetesType}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, diabetesType: value }))}
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

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveProfileChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}