'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Trash2
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your Diabeto Maestro platform</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
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