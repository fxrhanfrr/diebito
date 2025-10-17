'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/lib/types';
import { 
  Stethoscope, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign, 
  GraduationCap, 
  Award,
  Star,
  Calendar,
  CheckCircle,
  Upload
} from 'lucide-react';

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: number;
  education: string;
  certifications: string[];
  consultationFee: number;
  availability: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };
  bio: string;
  languages: string[];
  isVerified: boolean;
  rating: number;
  totalConsultations: number;
  profilePicture?: string;
  degreeUrl?: string;
  licenseNumber?: string;
}

export default function DoctorSetup() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    experience: '',
    education: '',
    consultationFee: '',
    bio: '',
    licenseNumber: '',
    degreeUrl: '',
    profilePicture: '',
    languages: [] as string[],
    certifications: [] as string[],
    availability: {
      monday: { start: '09:00', end: '17:00', isAvailable: true },
      tuesday: { start: '09:00', end: '17:00', isAvailable: true },
      wednesday: { start: '09:00', end: '17:00', isAvailable: true },
      thursday: { start: '09:00', end: '17:00', isAvailable: true },
      friday: { start: '09:00', end: '17:00', isAvailable: true },
      saturday: { start: '09:00', end: '13:00', isAvailable: false },
      sunday: { start: '09:00', end: '13:00', isAvailable: false },
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState<DoctorProfile | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  
  const { user, profile } = useEnhancedAuth();
  const router = useRouter();

  const specialtyOptions = [
    'Endocrinology',
    'Diabetes Specialist',
    'Internal Medicine',
    'Family Medicine',
    'Nutritionist',
    'Cardiologist',
    'Nephrologist',
    'Ophthalmologist',
    'Podiatrist',
    'Mental Health Specialist'
  ];

  const languageOptions = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Chinese',
    'Japanese',
    'Arabic',
    'Hindi'
  ];

  const certificationOptions = [
    'American Board of Internal Medicine',
    'American Board of Endocrinology',
    'Certified Diabetes Educator',
    'American Board of Family Medicine',
    'American Board of Nutrition',
    'American Heart Association',
    'American Diabetes Association',
    'International Diabetes Federation'
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    if (!user || profile?.role !== 'doctor') {
      router.push('/auth/login');
      return;
    }
    
    checkExistingProfile();
  }, [user, profile, router]);

  const checkExistingProfile = async () => {
    if (!user) return;
    
    try {
      const profileDoc = await getDoc(doc(db, 'doctorProfiles', user.uid));
      if (profileDoc.exists()) {
        const profileData = { id: profileDoc.id, ...profileDoc.data() } as DoctorProfile;
        setExistingProfile(profileData);
        // Load existing data into form
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          specialty: profileData.specialty || '',
          experience: profileData.experience?.toString() || '',
          education: profileData.education || '',
          consultationFee: profileData.consultationFee?.toString() || '',
          bio: profileData.bio || '',
          licenseNumber: profileData.licenseNumber || '',
          degreeUrl: profileData.degreeUrl || '',
          profilePicture: profileData.profilePicture || '',
          languages: profileData.languages || [],
          certifications: profileData.certifications || [],
          availability: profileData.availability || formData.availability
        });
      }
    } catch (error) {
      console.error('Error checking existing profile:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field: 'languages' | 'certifications', value: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value],
      });
    } else {
      setFormData({
        ...formData,
        [field]: formData[field].filter(item => item !== value),
      });
    }
  };

  const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day as keyof typeof formData.availability],
          [field]: value,
        },
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const profileData = {
        name: formData.name,
        email: user.email,
        phone: formData.phone,
        specialty: formData.specialty,
        experience: parseInt(formData.experience),
        education: formData.education,
        consultationFee: parseFloat(formData.consultationFee),
        bio: formData.bio,
        licenseNumber: formData.licenseNumber,
        degreeUrl: formData.degreeUrl,
        profilePicture: formData.profilePicture,
        languages: formData.languages,
        certifications: formData.certifications,
        availability: formData.availability,
        isVerified: true, // Mark verified so patients can discover doctors immediately
        rating: 0,
        totalConsultations: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'doctorProfiles', user.uid), profileData, { merge: true });
      
      // Update user profile with doctor info
      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        phone: formData.phone,
        specialty: formData.specialty,
        consultationFee: parseFloat(formData.consultationFee),
        isDoctorProfileComplete: true
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to create doctor profile');
    }
    
    setLoading(false);
  };

  if (!user || profile?.role !== 'doctor') {
    return null;
  }

  if (checkingProfile) {
    return (
      <div className="form-container bg-gradient-primary">
        <Card className="form-card">
          <CardContent className="pt-6 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your doctor profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="form-container bg-gradient-success">
        <Card className="form-card">
          <CardContent className="pt-6 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Created!</h2>
            <p className="text-gray-600 mb-4">
              Your doctor profile has been submitted for admin verification. You'll be notified once it's approved.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user already has a profile, show profile management
  if (existingProfile) {
    return (
      <div className="page-container bg-gradient-primary">
        <div className="page-content">
          <div className="page-header text-center">
            <h1 className="page-title">Doctor Profile Dashboard</h1>
            <p className="page-subtitle">Manage your professional profile and availability</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="form-label">Name</Label>
                      <div className="text-lg font-semibold">{existingProfile.name}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="form-label">Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge className={existingProfile.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {existingProfile.isVerified ? 'Verified' : 'Pending Verification'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="form-label">Specialty</Label>
                      <div className="text-gray-700">{existingProfile.specialty}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="form-label">Experience</Label>
                      <div className="text-gray-700">{existingProfile.experience} years</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="form-label">Bio</Label>
                    <div className="text-gray-700">{existingProfile.bio}</div>
                  </div>

                  <div className="space-y-2">
                    <Label className="form-label">Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {existingProfile.languages.map((language) => (
                        <Badge key={language} variant="outline" className="text-xs">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="form-label">Certifications</Label>
                    <div className="flex flex-wrap gap-2">
                      {existingProfile.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="form-label">Consultation Fee</Label>
                      <div className="text-lg font-semibold text-green-600">₹{existingProfile.consultationFee}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="form-label">Rating</Label>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{existingProfile.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-600">({existingProfile.totalConsultations} consultations)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={() => router.push('/consultations')} 
                      className="flex-1"
                    >
                      Manage Consultations
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/dashboard')}
                      className="flex-1"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="availability" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Weekly Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {days.map((day) => (
                      <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={existingProfile.availability[day as keyof typeof existingProfile.availability].isAvailable}
                            disabled
                          />
                          <span className="capitalize font-medium">{day}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {existingProfile.availability[day as keyof typeof existingProfile.availability].isAvailable
                            ? `${existingProfile.availability[day as keyof typeof existingProfile.availability].start} - ${existingProfile.availability[day as keyof typeof existingProfile.availability].end}`
                            : 'Not Available'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{existingProfile.totalConsultations}</div>
                    <div className="text-sm text-gray-600">Total Consultations</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{existingProfile.rating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">₹{existingProfile.consultationFee}</div>
                    <div className="text-sm text-gray-600">Consultation Fee</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gradient-primary">
      <div className="page-content">
        <div className="page-header text-center">
          <h1 className="page-title">Doctor Profile Setup</h1>
          <p className="page-subtitle">Create your professional profile to start receiving consultation requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Dr. John Smith"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Medical Specialty *</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialtyOptions.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="5"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Medical Education *</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="MD, Harvard Medical School"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell patients about your experience, approach to diabetes care, and what makes you unique..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee (₹) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="consultationFee"
                      name="consultationFee"
                      type="number"
                      step="0.01"
                      value={formData.consultationFee}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="120.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Medical License Number *</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="MD123456"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Languages Spoken *</Label>
                <p className="text-sm text-gray-600">Select all languages you can communicate in with patients</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {languageOptions.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${language}`}
                        checked={formData.languages.includes(language)}
                        onCheckedChange={(checked) => handleArrayChange('languages', language, checked as boolean)}
                      />
                      <Label htmlFor={`lang-${language}`} className="text-sm">
                        {language}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Professional Certifications</Label>
                <p className="text-sm text-gray-600">Select all relevant certifications you hold</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {certificationOptions.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${cert}`}
                        checked={formData.certifications.includes(cert)}
                        onCheckedChange={(checked) => handleArrayChange('certifications', cert, checked as boolean)}
                      />
                      <Label htmlFor={`cert-${cert}`} className="text-sm">
                        {cert}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Weekly Availability *</Label>
                <p className="text-sm text-gray-600">Set your available hours for each day of the week</p>
                <div className="space-y-3">
                  {days.map((day) => (
                    <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-20">
                        <Checkbox
                          id={`${day}-available`}
                          checked={formData.availability[day as keyof typeof formData.availability].isAvailable}
                          onCheckedChange={(checked) => handleAvailabilityChange(day, 'isAvailable', checked as boolean)}
                        />
                        <Label htmlFor={`${day}-available`} className="ml-2 capitalize">
                          {day}
                        </Label>
                      </div>
                      {formData.availability[day as keyof typeof formData.availability].isAvailable && (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <Input
                              type="time"
                              value={formData.availability[day as keyof typeof formData.availability].start}
                              onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                              className="w-32"
                            />
                          </div>
                          <span>to</span>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <Input
                              type="time"
                              value={formData.availability[day as keyof typeof formData.availability].end}
                              onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="degreeUrl">Medical Degree URL (Optional)</Label>
                <Input
                  id="degreeUrl"
                  name="degreeUrl"
                  value={formData.degreeUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/degree.pdf"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture URL (Optional)</Label>
                <Input
                  id="profilePicture"
                  name="profilePicture"
                  value={formData.profilePicture}
                  onChange={handleInputChange}
                  placeholder="https://example.com/profile.jpg"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Profile...' : 'Create Doctor Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
