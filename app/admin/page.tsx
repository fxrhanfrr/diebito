'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AuthGuard from '@/components/AuthGuard';
import { 
  Users, 
  FileText, 
  Utensils, 
  Activity, 
  Stethoscope, 
  Pill,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';
import { getAllDoctorProfilesForAdmin, updateDocument } from '@/lib/firestore';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorProfiles, setDoctorProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'text-blue-600' },
    { label: 'Active Diet Plans', value: '45', icon: Utensils, color: 'text-green-600' },
    { label: 'Consultations Today', value: '23', icon: Stethoscope, color: 'text-purple-600' },
    { label: 'Exercise Sessions', value: '156', icon: Activity, color: 'text-red-600' },
  ];

  // Sample data
  const dietPlans = [
    { id: 1, name: 'Low Carb Plan', users: 145, status: 'Active' },
    { id: 2, name: 'Mediterranean Diet', users: 89, status: 'Active' },
    { id: 3, name: 'Plant-Based Plan', users: 67, status: 'Draft' },
  ];

  const exercises = [
    { id: 1, name: 'Morning Walk', difficulty: 'Easy', duration: '30 min' },
    { id: 2, name: 'Yoga Session', difficulty: 'Medium', duration: '45 min' },
    { id: 3, name: 'Strength Training', difficulty: 'Hard', duration: '60 min' },
  ];

  useEffect(() => {
    loadDoctorProfiles();
  }, []);

  const loadDoctorProfiles = async () => {
    try {
      setLoading(true);
      // Get all doctor profiles (both verified and unverified)
      const allProfiles = await getAllDoctorProfilesForAdmin();
      setDoctorProfiles(allProfiles);
    } catch (error) {
      console.error('Error loading doctor profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (doctorId: string, isVerified: boolean) => {
    try {
      setLoading(true);
      await updateDocument('doctorProfiles', doctorId, { isVerified });
      await loadDoctorProfiles(); // Reload the list
    } catch (error) {
      console.error('Error updating doctor verification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your Diabeto Maestro platform</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="doctors">Doctors</TabsTrigger>
              <TabsTrigger value="diets">Diet Plans</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
              <TabsTrigger value="consultations">Consultations</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                          </div>
                          <IconComponent className={`h-8 w-8 ${stat.color}`} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent User Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">New user registered</p>
                            <p className="text-xs text-gray-600">2 minutes ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Diet Plan
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Exercise Program
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Publish Blog Post
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Manage User Roles
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="diets">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Diet Plans Management</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Diet Plan
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {dietPlans.map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="text-sm text-gray-600">{plan.users} active users</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              plan.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {plan.status}
                            </span>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="exercises">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Exercise Programs</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Exercise
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {exercises.map((exercise) => (
                        <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">{exercise.name}</h3>
                            <p className="text-sm text-gray-600">
                              {exercise.difficulty} • {exercise.duration}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">User management interface coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="doctors">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Doctor Verification</h2>
                  <Button onClick={loadDoctorProfiles} disabled={loading}>
                    {loading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>

                {loading ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="loading-spinner mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading doctor profiles...</p>
                    </CardContent>
                  </Card>
                ) : doctorProfiles.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-4">👨‍⚕️</div>
                      <h3 className="text-xl font-semibold mb-2">No Doctor Profiles</h3>
                      <p className="text-gray-600">No doctor profiles have been submitted yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {doctorProfiles.map((doctor) => (
                      <Card key={doctor.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                  {doctor.profilePicture ? (
                                    <img 
                                      src={doctor.profilePicture} 
                                      alt={doctor.name}
                                      className="w-16 h-16 rounded-full object-cover"
                                    />
                                  ) : (
                                    <Stethoscope className="h-8 w-8 text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-xl font-semibold">{doctor.name}</h3>
                                  <p className="text-gray-600">{doctor.specialty}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={doctor.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                      {doctor.isVerified ? 'Verified' : 'Pending Verification'}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      <span className="text-sm">{doctor.rating.toFixed(1)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{doctor.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{doctor.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{doctor.education}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm"><strong>Experience:</strong> {doctor.experience} years</p>
                                  <p className="text-sm"><strong>Consultation Fee:</strong> ₹{doctor.consultationFee}</p>
                                  <p className="text-sm"><strong>License:</strong> {doctor.licenseNumber}</p>
                                </div>
                              </div>

                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2"><strong>Bio:</strong></p>
                                <p className="text-sm">{doctor.bio}</p>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-4">
                                <div>
                                  <p className="text-sm font-medium mb-1">Languages:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {doctor.languages?.map((lang: string) => (
                                      <Badge key={lang} variant="outline" className="text-xs">
                                        {lang}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <div>
                                  <p className="text-sm font-medium mb-1">Certifications:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {doctor.certifications?.map((cert: string) => (
                                      <Badge key={cert} variant="outline" className="text-xs">
                                        {cert}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              {!doctor.isVerified ? (
                                <>
                                  <Button 
                                    onClick={() => handleVerifyDoctor(doctor.id, true)}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={loading}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    onClick={() => handleVerifyDoctor(doctor.id, false)}
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    disabled={loading}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  onClick={() => handleVerifyDoctor(doctor.id, false)}
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  disabled={loading}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Revoke Verification
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="consultations">
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Consultation management interface coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Content Title</Label>
                        <Input id="title" placeholder="Enter title" />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" placeholder="e.g., Blog, Video, Article" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea 
                        id="content" 
                        placeholder="Enter content here..." 
                        className="min-h-[200px]"
                      />
                    </div>
                    <Button>Publish Content</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}