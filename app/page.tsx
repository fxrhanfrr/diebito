'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Heart, Activity, Users, Utensils, Stethoscope, Pill } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: Utensils,
      title: 'E-Diets',
      description: 'Personalized diet plans based on your health profile and preferences',
      color: 'text-green-600',
    },
    {
      icon: Stethoscope,
      title: 'Consultations',
      description: 'Book appointments with specialists and access video consultations',
      color: 'text-blue-600',
    },
    {
      icon: Activity,
      title: 'Exercise Tracking',
      description: 'Custom workout plans and progress monitoring for diabetic patients',
      color: 'text-red-600',
    },
    {
      icon: Pill,
      title: 'Medicine Management',
      description: 'Track medications, find nearby pharmacies, and order medicines online',
      color: 'text-purple-600',
    },
    {
      icon: Heart,
      title: 'Food Ordering',
      description: 'Order diabetic-friendly meals from partnered restaurants',
      color: 'text-pink-600',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with other diabetic patients and share experiences',
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Diabetes Care Companion
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Manage your diabetes with personalized diet plans, exercise routines, 
              medical consultations, and food ordering - all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/register">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Diabetes Management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your diabetes effectively in one comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className={`inline-flex p-3 rounded-lg ${feature.color} bg-opacity-10 w-fit`}>
                      <IconComponent className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Start Your Health Journey Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users managing their diabetes with confidence
          </p>
          {!user && (
            <Link href="/auth/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Create Free Account
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}