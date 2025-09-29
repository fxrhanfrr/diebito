'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Heart, Activity, Users, Utensils, Stethoscope, Pill, Star, Clock, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Hero images for sliding effect
  const heroImages = [
    {
      src: "/images/hero-1.jpg", // You'll place your image here
      alt: "Fresh vegetables",
      title: "Fresh Vegetables",
      fallback: "https://images.unsplash.com/photo-1657288089316-c0350003ca49?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      src: "/images/hero-2.jpg", // You'll place your image here
      alt: "Healthy fruits",
      title: "Fresh Fruits",
      fallback: "https://images.unsplash.com/photo-1444459094717-a39f1e3e0903?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      src: "/images/hero-3.jpg", // You'll place your image here
      alt: "Healthy salad",
      title: "Healthy Salads",
      fallback: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      src: "/images/hero-4.jpg", // You'll place your image here
      alt: "Diabetic friendly meals",
      title: "Balanced Meals",
      fallback: "https://images.unsplash.com/photo-1681579289910-b526d01aa292?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ];

  // Testimonials for sliding effect
  const testimonials = [
    {
      name: "Sarah Johnson",
      image: "/images/testimonial-1.jpg", // You'll place your image here
      fallback: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
      quote: "The meal plans have been a game-changer for my blood sugar control. I've never felt better!",
      gradient: "from-blue-50 to-indigo-50"
    },
    {
      name: "Michael Chen",
      image: "/images/testimonial-2.jpg", // You'll place your image here
      fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      quote: "The exercise tracking and consultation features helped me understand my condition better.",
      gradient: "from-indigo-50 to-purple-50"
    },
    {
      name: "Emily Rodriguez",
      image: "/images/testimonial-3.jpg", // You'll place your image here
      fallback: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
      quote: "The food ordering feature makes it so easy to maintain a healthy diet. Highly recommended!",
      gradient: "from-purple-50 to-pink-50"
    }
  ];

  // Auto-slide hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 section lg:py-32">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="hero-title">
                  Delicious,{' '}
                  <span className="text-blue-600">Diabetic-Friendly</span>{' '}
                  Meals Delivered
                </h1>
                <p className="hero-subtitle">
                  Get perfectly portioned, nutritionist-approved meals and personalized recipe suggestions 
                  designed specifically for diabetes management. Fresh, convenient, and blood sugar-friendly.
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">10K+ Happy Customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">30-min Delivery</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="btn-blue btn-lg">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/register">
                    <Button size="lg" className="btn-blue btn-lg">
                      Start Your Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Visual with Single Sliding Image */}
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 card-float">
                  {/* Single Sliding Image */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="aspect-square relative">
                      <img 
                        src={heroImages[currentImageIndex].src}
                        alt={heroImages[currentImageIndex].alt}
                        className="img-hero"
                        onError={(e) => {
                          e.currentTarget.src = heroImages[currentImageIndex].fallback;
                        }}
                      />
                      {/* Image Overlay */}
                      <div className="overlay-dark-soft"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-lg font-bold">{heroImages[currentImageIndex].title}</h3>
                        <p className="text-sm opacity-90">Fresh & Healthy</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Navigation Controls */}
                  <div className="flex justify-center items-center mt-6 space-x-4">
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
                      className="ctrl"
                    >
                      <ChevronLeft className="h-5 w-5 text-blue-600" />
                    </button>
                    
                    <div className="flex space-x-2">
                      {heroImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`pill ${index === currentImageIndex ? 'pill-active' : 'pill-inactive'}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)}
                      className="ctrl"
                    >
                      <ChevronRight className="h-5 w-5 text-blue-600" />
                    </button>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-blue-500 text-white rounded-full p-3 shadow-lg">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-indigo-500 text-white rounded-full p-3 shadow-lg">
                    <Heart className="h-6 w-6" />
                  </div>
                </div>
              </div>
              
              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container-xl">
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
                <Card key={index} className="group card-soft hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className={`inline-flex p-4 rounded-xl ${feature.color} bg-opacity-10 w-fit group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Why Choose Diabeto Maestro?
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our platform is designed by healthcare professionals and diabetes specialists 
                  to provide you with the most effective tools for managing your condition.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert-Approved</h3>
                    <p className="text-gray-600">All meal plans and recommendations are reviewed by certified nutritionists and diabetes specialists.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Care</h3>
                    <p className="text-gray-600">Tailored recommendations based on your specific health profile, preferences, and lifestyle.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Tracking</h3>
                    <p className="text-gray-600">Monitor your blood sugar, meals, exercise, and medications all in one place.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="card-float">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Join 10,000+ Happy Users</h3>
                  <p className="text-gray-600">Start your journey to better diabetes management today</p>
                  <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">4.9/5 average rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Showcase Section */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See What Our Users Are Saying
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real results from real people managing their diabetes with our platform
            </p>
          </div>

          {/* Sliding Testimonials */}
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="testimonial-track"
                style={{ ['--slide-offset' as any]: `-${currentTestimonialIndex * 100}%` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Current testimonial */}
                        <div className={`bg-gradient-to-br ${testimonial.gradient} rounded-2xl p-6 shadow-lg`}>
                          <div className="flex items-center mb-4">
                            <img 
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = testimonial.fallback;
                              }}
                            />
                            <div className="ml-4">
                              <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                        </div>

                        {/* Next testimonial */}
                        <div className={`bg-gradient-to-br ${testimonials[(index + 1) % testimonials.length].gradient} rounded-2xl p-6 shadow-lg`}>
                          <div className="flex items-center mb-4">
                            <img 
                              src={testimonials[(index + 1) % testimonials.length].image}
                              alt={testimonials[(index + 1) % testimonials.length].name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = testimonials[(index + 1) % testimonials.length].fallback;
                              }}
                            />
                            <div className="ml-4">
                              <h4 className="font-semibold text-gray-900">{testimonials[(index + 1) % testimonials.length].name}</h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 italic">"{testimonials[(index + 1) % testimonials.length].quote}"</p>
                        </div>

                        {/* Third testimonial */}
                        <div className={`bg-gradient-to-br ${testimonials[(index + 2) % testimonials.length].gradient} rounded-2xl p-6 shadow-lg`}>
                          <div className="flex items-center mb-4">
                            <img 
                              src={testimonials[(index + 2) % testimonials.length].image}
                              alt={testimonials[(index + 2) % testimonials.length].name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = testimonials[(index + 2) % testimonials.length].fallback;
                              }}
                            />
                            <div className="ml-4">
                              <h4 className="font-semibold text-gray-900">{testimonials[(index + 2) % testimonials.length].name}</h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 italic">"{testimonials[(index + 2) % testimonials.length].quote}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={() => setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="ctrl"
              >
                <ChevronLeft className="h-5 w-5 text-blue-600" />
              </button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonialIndex(index)}
                    className={`pill ${index === currentTestimonialIndex ? 'pill-active' : 'pill-inactive'}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
                className="ctrl"
              >
                <ChevronRight className="h-5 w-5 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Feature Images */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="feature-card group">
              <img 
                src="/images/feature-1.jpg" 
                alt="Healthy diabetic meal"
                className="img-feature"
                onError={(e) => {
                  e.currentTarget.src = "https://plus.unsplash.com/premium_photo-1671485196355-32005a27fd02?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                }}
              />
              <div className="overlay-dark"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Nutritious Meals</h3>
                <p className="text-lg">Carefully crafted for diabetes management</p>
              </div>
            </div>

            <div className="feature-card group">
              <img 
                src="/images/feature-2.jpg" 
                alt="Fresh fruits and vegetables"
                className="img-feature"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=center";
                }}
              />
              <div className="overlay-dark"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Fresh Ingredients</h3>
                <p className="text-lg">Only the finest, freshest produce</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 section">
        <div className="container-xl text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Start Your Health Journey Today
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join thousands of users managing their diabetes with confidence. 
              Get started with our free trial and experience the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {!user ? (
                <Link href="/auth/register">
                  <Button size="lg" className="btn-white-blue btn-lg">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button size="lg" className="btn-white-blue btn-lg">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Cancel Anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}