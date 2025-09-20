'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Activity, 
  Utensils, 
  TrendingUp, 
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Heart,
  Stethoscope
} from 'lucide-react';
import { 
  getConsultationsByDoctor, 
  getUser, 
  getDietsByUser, 
  getUserProgress,
  updateConsultationStatus,
  createDiet
} from '@/lib/firestore';
import { Consultation, User as UserType, Diet, Progress as ProgressType } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';

interface PatientWithData extends UserType {
  consultations: Consultation[];
  diets: Diet[];
  progress: ProgressType[];
  lastConsultation?: Consultation;
  totalConsultations: number;
  completedConsultations: number;
  averageProgress: number;
}

export default function PatientsPage() {
  const { user } = useUser();
  const [patients, setPatients] = useState<PatientWithData[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientWithData | null>(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isDietDialogOpen, setIsDietDialogOpen] = useState(false);
  const [newDietData, setNewDietData] = useState({
    meals: [''],
    nutritionStats: {
      calories: 0,
      carbs: 0,
      protein: 0,
      sugar: 0
    }
  });

  useEffect(() => {
    if (user?.role === 'doctor') {
      loadPatients();
    }
  }, [user]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, filterStatus]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      // Get all consultations for this doctor
      const consultations = await getConsultationsByDoctor(user!.id);
      
      // Get unique patient IDs
      const patientIds = [...new Set(consultations.map(c => c.patientId))];
      
      // Load patient data for each patient
      const patientsData: PatientWithData[] = [];
      
      for (const patientId of patientIds) {
        try {
          const patient = await getUser(patientId);
          if (patient && patient.role === 'patient') {
            const patientConsultations = consultations.filter(c => c.patientId === patientId);
            const patientDiets = await getDietsByUser(patientId);
            const patientProgress = await getUserProgress(patientId);
            
            const lastConsultation = patientConsultations
              .sort((a, b) => b.timeSlot.toMillis() - a.timeSlot.toMillis())[0];
            
            const completedConsultations = patientConsultations.filter(c => c.status === 'completed').length;
            
            // Calculate average progress (simplified - based on completed exercises)
            const completedExercises = patientProgress.filter(p => p.status === 'completed').length;
            const totalExercises = patientProgress.length;
            const averageProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
            
            patientsData.push({
              ...patient,
              consultations: patientConsultations,
              diets: patientDiets,
              progress: patientProgress,
              lastConsultation,
              totalConsultations: patientConsultations.length,
              completedConsultations,
              averageProgress
            });
          }
        } catch (error) {
          console.error(`Error loading patient ${patientId}:`, error);
        }
      }
      
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(patient => {
        switch (filterStatus) {
          case 'active':
            return patient.completedConsultations > 0;
          case 'new':
            return patient.completedConsultations === 0;
          case 'high-progress':
            return patient.averageProgress >= 70;
          case 'low-progress':
            return patient.averageProgress < 30;
          default:
            return true;
        }
      });
    }

    setFilteredPatients(filtered);
  };

  const handleStatusChange = async (consultationId: string, newStatus: Consultation['status']) => {
    try {
      await updateConsultationStatus(consultationId, newStatus);
      await loadPatients(); // Reload data
    } catch (error) {
      console.error('Error updating consultation status:', error);
    }
  };

  const handleCreateDiet = async () => {
    if (!selectedPatient) return;

    try {
      await createDiet({
        userId: selectedPatient.id,
        meals: newDietData.meals.filter(meal => meal.trim() !== ''),
        nutritionStats: newDietData.nutritionStats
      });
      
      setIsDietDialogOpen(false);
      setNewDietData({
        meals: [''],
        nutritionStats: {
          calories: 0,
          carbs: 0,
          protein: 0,
          sugar: 0
        }
      });
      await loadPatients(); // Reload data
    } catch (error) {
      console.error('Error creating diet:', error);
    }
  };

  const addMealField = () => {
    setNewDietData(prev => ({
      ...prev,
      meals: [...prev.meals, '']
    }));
  };

  const updateMeal = (index: number, value: string) => {
    setNewDietData(prev => ({
      ...prev,
      meals: prev.meals.map((meal, i) => i === index ? value : meal)
    }));
  };

  const removeMeal = (index: number) => {
    setNewDietData(prev => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index)
    }));
  };

  if (user?.role !== 'doctor') {
    return (
      <AuthGuard>
        <div className="page-container bg-page">
          <div className="page-content">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">This page is only accessible to doctors.</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="page-container bg-page">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">My Patients</h1>
            <p className="page-subtitle">
              Manage and track your patients' health progress
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="active">Active Patients</SelectItem>
                  <SelectItem value="new">New Patients</SelectItem>
                  <SelectItem value="high-progress">High Progress</SelectItem>
                  <SelectItem value="low-progress">Low Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Patients</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.filter(p => p.completedConsultations > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.reduce((sum, p) => sum + p.totalConsultations, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.length > 0 
                        ? Math.round(patients.reduce((sum, p) => sum + p.averageProgress, 0) / patients.length)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patients Table */}
          <Card>
            <CardHeader>
              <CardTitle>Patient List</CardTitle>
              <CardDescription>
                {filteredPatients.length} of {patients.length} patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading patients...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                  <p className="text-gray-600">No patients match your current filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Diabetes Type</TableHead>
                        <TableHead>Consultations</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Last Visit</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{patient.name}</p>
                                <p className="text-sm text-gray-500">Age: {patient.age || 'N/A'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-900">{patient.email}</p>
                              {patient.weight && (
                                <p className="text-sm text-gray-500">Weight: {patient.weight}kg</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {patient.diabetesType || 'Not specified'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-medium text-gray-900">{patient.totalConsultations}</p>
                              <p className="text-sm text-gray-500">
                                {patient.completedConsultations} completed
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-20">
                              <Progress value={patient.averageProgress} className="h-2" />
                              <p className="text-sm text-gray-500 mt-1">
                                {Math.round(patient.averageProgress)}%
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {patient.lastConsultation ? (
                              <div>
                                <p className="text-sm text-gray-900">
                                  {patient.lastConsultation.timeSlot.toDate().toLocaleDateString()}
                                </p>
                                <Badge 
                                  variant={patient.lastConsultation.status === 'completed' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {patient.lastConsultation.status}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-gray-500">No visits</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setIsPatientDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setIsDietDialogOpen(true);
                                }}
                              >
                                <Utensils className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Detail Dialog */}
          <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Patient Details</DialogTitle>
                <DialogDescription>
                  Complete information and history for {selectedPatient?.name}
                </DialogDescription>
              </DialogHeader>
              
              {selectedPatient && (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="consultations">Consultations</TabsTrigger>
                    <TabsTrigger value="diets">Diets</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Name</Label>
                            <p className="text-lg font-semibold">{selectedPatient.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Email</Label>
                            <p className="text-sm">{selectedPatient.email}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Age</Label>
                              <p className="text-sm">{selectedPatient.age || 'Not specified'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Weight</Label>
                              <p className="text-sm">{selectedPatient.weight ? `${selectedPatient.weight} kg` : 'Not specified'}</p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Diabetes Type</Label>
                            <Badge variant="outline" className="mt-1">
                              {selectedPatient.diabetesType || 'Not specified'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2" />
                            Health Statistics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Consultations</span>
                            <span className="text-lg font-bold text-blue-600">{selectedPatient.totalConsultations}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Completed Consultations</span>
                            <span className="text-lg font-bold text-green-600">{selectedPatient.completedConsultations}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Diet Plans</span>
                            <span className="text-lg font-bold text-purple-600">{selectedPatient.diets.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Exercise Progress</span>
                            <span className="text-lg font-bold text-orange-600">{Math.round(selectedPatient.averageProgress)}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="consultations" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Consultation History</h3>
                    </div>
                    
                    {selectedPatient.consultations.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No consultations found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedPatient.consultations.map((consultation) => (
                          <Card key={consultation.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    {consultation.timeSlot.toDate().toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Status: {consultation.status}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Select
                                    value={consultation.status}
                                    onValueChange={(value: Consultation['status']) => 
                                      handleStatusChange(consultation.id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="diets" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Diet Plans</h3>
                      <Button onClick={() => setIsDietDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Diet Plan
                      </Button>
                    </div>
                    
                    {selectedPatient.diets.length === 0 ? (
                      <div className="text-center py-8">
                        <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No diet plans found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedPatient.diets.map((diet) => (
                          <Card key={diet.id}>
                            <CardHeader>
                              <CardTitle className="text-lg">Diet Plan</CardTitle>
                              <CardDescription>
                                Created: {diet.createdAt.toDate().toLocaleDateString()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">Meals</Label>
                                  <ul className="list-disc list-inside space-y-1 mt-2">
                                    {diet.meals.map((meal, index) => (
                                      <li key={index} className="text-sm text-gray-600">{meal}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">Calories</Label>
                                    <p className="text-lg font-semibold">{diet.nutritionStats.calories}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">Carbs</Label>
                                    <p className="text-lg font-semibold">{diet.nutritionStats.carbs}g</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">Protein</Label>
                                    <p className="text-lg font-semibold">{diet.nutritionStats.protein}g</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">Sugar</Label>
                                    <p className="text-lg font-semibold">{diet.nutritionStats.sugar}g</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="progress" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Exercise Progress</h3>
                    </div>
                    
                    {selectedPatient.progress.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No progress data found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold">Overall Progress</h4>
                              <span className="text-2xl font-bold text-blue-600">
                                {Math.round(selectedPatient.averageProgress)}%
                              </span>
                            </div>
                            <Progress value={selectedPatient.averageProgress} className="h-3" />
                          </CardContent>
                        </Card>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Completed</p>
                                  <p className="text-2xl font-bold text-green-600">
                                    {selectedPatient.progress.filter(p => p.status === 'completed').length}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center">
                                <AlertCircle className="h-8 w-8 text-orange-600 mr-3" />
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Skipped</p>
                                  <p className="text-2xl font-bold text-orange-600">
                                    {selectedPatient.progress.filter(p => p.status === 'skipped').length}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>

          {/* Create Diet Dialog */}
          <Dialog open={isDietDialogOpen} onOpenChange={setIsDietDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Diet Plan</DialogTitle>
                <DialogDescription>
                  Create a new diet plan for {selectedPatient?.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Meals</Label>
                  <div className="space-y-2 mt-2">
                    {newDietData.meals.map((meal, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={meal}
                          onChange={(e) => updateMeal(index, e.target.value)}
                          placeholder="Enter meal description"
                          className="flex-1"
                        />
                        {newDietData.meals.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMeal(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={addMealField} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Meal
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Nutrition Stats (per day)</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label className="text-xs text-gray-600">Calories</Label>
                      <Input
                        type="number"
                        value={newDietData.nutritionStats.calories}
                        onChange={(e) => setNewDietData(prev => ({
                          ...prev,
                          nutritionStats: { ...prev.nutritionStats, calories: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Carbs (g)</Label>
                      <Input
                        type="number"
                        value={newDietData.nutritionStats.carbs}
                        onChange={(e) => setNewDietData(prev => ({
                          ...prev,
                          nutritionStats: { ...prev.nutritionStats, carbs: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Protein (g)</Label>
                      <Input
                        type="number"
                        value={newDietData.nutritionStats.protein}
                        onChange={(e) => setNewDietData(prev => ({
                          ...prev,
                          nutritionStats: { ...prev.nutritionStats, protein: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Sugar (g)</Label>
                      <Input
                        type="number"
                        value={newDietData.nutritionStats.sugar}
                        onChange={(e) => setNewDietData(prev => ({
                          ...prev,
                          nutritionStats: { ...prev.nutritionStats, sugar: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDietDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDiet}>
                    Create Diet Plan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AuthGuard>
  );
}
