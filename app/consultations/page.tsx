'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Video, User, Star, Phone, FileText, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { getAllDoctors, getAllDoctorProfiles, createConsultation, getConsultationsByUser, getConsultationsByDoctor } from '@/lib/firestore';
import { User as UserType, Consultation } from '@/lib/types';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  availability: string[];
  imageUrl: string;
  consultationFee: number;
}

interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function Consultations() {
  const [activeTab, setActiveTab] = useState('book');
  const { profile } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'video' as 'video' | 'phone' | 'in-person',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [doctorConsultations, setDoctorConsultations] = useState<Consultation[]>([]);
  const [patientConsultations, setPatientConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    loadDoctors();
    loadConsultations();
  }, [profile]);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm]);

  const loadDoctors = async () => {
    try {
      console.log('Loading doctors...');
      const doctorsData = await getAllDoctorProfiles();
      console.log('Doctors loaded:', doctorsData);
      setDoctors(doctorsData);
      
      // If no doctors found, let's also try to get all doctor profiles without verification filter
      if (doctorsData.length === 0) {
        console.log('No verified doctors found, checking all doctor profiles...');
        // This is just for debugging - we'll remove this later
        try {
          const allDoctors = await getAllDoctors();
          console.log('All doctors (from users collection):', allDoctors);
        } catch (err) {
          console.log('Error getting all doctors:', err);
        }
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadConsultations = async () => {
    if (!profile) return;
    
    try {
      if (profile.role === 'doctor') {
        const consultations = await getConsultationsByDoctor(profile.id);
        setDoctorConsultations(consultations);
      } else if (profile.role === 'patient') {
        const consultations = await getConsultationsByUser(profile.id);
        setPatientConsultations(consultations);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
    }
  };

  const filterDoctors = () => {
    if (!searchTerm) {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doctor.specialty && doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDoctors(filtered);
    }
  };

  const handleBookConsultation = async () => {
    if (!selectedDoctor || !profile || profile.role !== 'patient') return;

    try {
      setLoading(true);
      
      const consultationData = {
        doctorId: selectedDoctor.id,
        patientId: profile.id,
        timeSlot: new Date(`${bookingData.date}T${bookingData.time}`),
        status: 'pending' as const,
        prescriptionLink: ''
      };

      await createConsultation(consultationData);
      
      // Reset form
      setSelectedDoctor(null);
      setBookingData({
        date: '',
        time: '',
        type: 'video',
        notes: ''
      });
      
      // Reload consultations
      await loadConsultations();
      
      alert('Consultation booked successfully!');
    } catch (error) {
      console.error('Error booking consultation:', error);
      alert('Failed to book consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Removed dummy appointments; appointments derive from Firestore consultations.

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const handleConsultationUpdate = (id: string, field: string, value: string) => {
    setDoctorConsultations(prev => 
      prev.map(consultation => 
        consultation.id === id 
          ? { ...consultation, [field]: value }
          : consultation
      )
    );
  };

  const handleStatusChange = (id: string, status: string) => {
    setDoctorConsultations(prev => 
      prev.map(consultation => 
        consultation.id === id 
          ? { ...consultation, status }
          : consultation
      )
    );
  };

  // Show different content based on user role
  if (profile?.role === 'doctor') {
    return (
      <AuthGuard>
        <div className="page-container bg-page">
          <div className="page-content">
            <div className="page-header">
              <h1 className="page-title">My Consultations</h1>
              <p className="page-subtitle">
                Manage your consultations and patient appointments
              </p>
            </div>

            <div className="space-section">
              <h2 className="text-2xl font-bold mb-6">Your Consultations</h2>
              
              {doctorConsultations.length > 0 ? (
                <div className="space-content">
                  {doctorConsultations.map((consultation) => (
                    <Card key={consultation.id}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-100 rounded-full">
                                {getTypeIcon(consultation.type)}
                              </div>
                              <div>
                                <h3 className="font-semibold">{consultation.patientName}</h3>
                                <p className="text-sm text-gray-600">{consultation.patientEmail}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(consultation.date).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {consultation.time}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={getStatusColor(consultation.status)}>
                                {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                              </Badge>
                              {consultation.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleStatusChange(consultation.id, 'completed')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Complete
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStatusChange(consultation.id, 'cancelled')}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {consultation.status === 'pending' && (
                            <div className="space-y-4 pt-4 border-t">
                              <div className="space-y-2">
                                <Label htmlFor={`notes-${consultation.id}`}>Consultation Notes</Label>
                                <Textarea
                                  id={`notes-${consultation.id}`}
                                  value={consultation.notes}
                                  onChange={(e) => handleConsultationUpdate(consultation.id, 'notes', e.target.value)}
                                  placeholder="Add your consultation notes here..."
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`prescription-${consultation.id}`}>Prescription</Label>
                                <Textarea
                                  id={`prescription-${consultation.id}`}
                                  value={consultation.prescription}
                                  onChange={(e) => handleConsultationUpdate(consultation.id, 'prescription', e.target.value)}
                                  placeholder="Add prescription details here..."
                                  rows={2}
                                />
                              </div>
                            </div>
                          )}

                          {consultation.status === 'completed' && (
                            <div className="pt-4 border-t">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">Notes:</span>
                                </div>
                                <p className="text-sm text-gray-600 pl-6">{consultation.notes}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">Prescription:</span>
                                </div>
                                <p className="text-sm text-gray-600 pl-6">{consultation.prescription}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <h3 className="empty-state-title">No Consultations Yet</h3>
                    <p className="empty-state-description">
                      You don't have any consultations scheduled yet. Patients will be able to book appointments with you once your profile is verified.
                    </p>
                  </CardContent>
                </Card>
              )}
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
            <h1 className="page-title">Book Consultation</h1>
            <p className="page-subtitle">
              Book appointments with diabetes specialists and manage your consultations
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            <Button
              variant={activeTab === 'book' ? 'default' : 'outline'}
              onClick={() => setActiveTab('book')}
            >
              Book Consultation
            </Button>
            <Button
              variant={activeTab === 'appointments' ? 'default' : 'outline'}
              onClick={() => setActiveTab('appointments')}
            >
              My Appointments
            </Button>
          </div>

          {activeTab === 'book' && (
            <div className="space-section">
              <h2 className="text-2xl font-bold mb-6">Available Doctors</h2>
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search doctors by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredDoctors.length === 0 ? (
                <Card>
                  <CardContent className="empty-state">
                    <div className="empty-state-icon">👨‍⚕️</div>
                    <h3 className="empty-state-title">No Doctors Available</h3>
                    <p className="empty-state-description">
                      {doctors.length === 0 
                        ? "No verified doctors are currently available. Please check back later or contact support."
                        : "No doctors match your search criteria. Try adjusting your search terms."
                      }
                    </p>
                    {doctors.length === 0 && (
                      <div className="mt-4 text-sm text-gray-600">
                        <p>If you're a doctor, please complete your profile setup to start receiving consultation requests.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid-responsive">
                  {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="card-hover">
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        {doctor.profilePicture ? (
                          <img 
                            src={doctor.profilePicture} 
                            alt={doctor.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-10 w-10 text-blue-600" />
                        )}
                      </div>
                      <CardTitle className="text-lg">{doctor.name}</CardTitle>
                      <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{doctor.rating.toFixed(1)}</span>
                          <span className="text-gray-500">({doctor.totalConsultations} consultations)</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Experience:</p>
                        <p className="text-sm text-gray-600">{doctor.experience} years</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Languages:</p>
                        <div className="flex flex-wrap gap-1">
                          {doctor.languages.slice(0, 3).map((lang: string) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                          {doctor.languages.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{doctor.languages.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          ₹{doctor.consultationFee}
                        </span>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedDoctor(doctor)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
              )}

              {/* Booking Dialog */}
              {selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <Card className="w-full max-w-md mx-4">
                    <CardHeader>
                      <CardTitle>Book Consultation with {selectedDoctor.name}</CardTitle>
                      <CardDescription>
                        Fill in the details to book your consultation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={bookingData.time}
                          onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="type">Consultation Type</Label>
                        <Select
                          value={bookingData.type}
                          onValueChange={(value: 'video' | 'phone' | 'in-person') => 
                            setBookingData(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video Call</SelectItem>
                            <SelectItem value="phone">Phone Call</SelectItem>
                            <SelectItem value="in-person">In-Person</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={bookingData.notes}
                          onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any specific concerns or questions..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedDoctor(null)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleBookConsultation}
                          disabled={loading || !bookingData.date || !bookingData.time}
                          className="flex-1"
                        >
                          {loading ? 'Booking...' : 'Book Consultation'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-section">
              <h2 className="text-2xl font-bold mb-6">My Appointments</h2>
              
              {patientConsultations.length > 0 ? (
                <div className="space-content">
                  {patientConsultations.map((consultation) => (
                    <Card key={consultation.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Dr. {consultation.doctorId}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {consultation.timeSlot.toDate().toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {consultation.timeSlot.toDate().toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(consultation.status)}>
                              {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                            </Badge>
                            {consultation.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  Reschedule
                                </Button>
                                <Button size="sm">
                                  Join Call
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <h3 className="empty-state-title">No Appointments Yet</h3>
                    <p className="empty-state-description">
                      You haven't booked any consultations yet. Start by booking with one of our specialists.
                    </p>
                    <Button onClick={() => setActiveTab('book')}>
                      Book Your First Consultation
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}