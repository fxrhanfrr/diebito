'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { Calendar, Clock, Video, User, Star, Phone } from 'lucide-react';

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

  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Endocrinologist',
      rating: 4.9,
      experience: 12,
      availability: ['Mon', 'Wed', 'Fri'],
      imageUrl: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg',
      consultationFee: 120
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Diabetes Specialist',
      rating: 4.8,
      experience: 8,
      availability: ['Tue', 'Thu', 'Sat'],
      imageUrl: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg',
      consultationFee: 100
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Nutritionist',
      rating: 4.7,
      experience: 6,
      availability: ['Mon', 'Tue', 'Thu'],
      imageUrl: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg',
      consultationFee: 80
    }
  ];

  const appointments: Appointment[] = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      date: '2024-01-20',
      time: '10:00 AM',
      type: 'video',
      status: 'upcoming'
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      date: '2024-01-18',
      time: '2:30 PM',
      type: 'phone',
      status: 'completed'
    }
  ];

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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultations</h1>
            <p className="text-gray-600">
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
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Available Doctors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4">
                        <img
                          src={doctor.imageUrl}
                          alt={doctor.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg">{doctor.name}</CardTitle>
                      <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{doctor.rating}</span>
                        </div>
                        <span>{doctor.experience} years exp.</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Available Days:</p>
                        <div className="flex gap-1">
                          {doctor.availability.map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          ${doctor.consultationFee}
                        </span>
                        <Button size="sm">
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">My Appointments</h2>
              
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                              {getTypeIcon(appointment.type)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{appointment.doctorName}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(appointment.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {appointment.time}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                            {appointment.status === 'upcoming' && (
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
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Appointments Yet</h3>
                    <p className="text-gray-600 mb-4">
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