'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant } from '@/lib/types';
import { Search, MapPin, Phone, Truck } from 'lucide-react';

export default function FoodOrdering() {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const restaurantsQuery = query(
          collection(db, 'restaurants'),
          where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(restaurantsQuery);
        const restaurantsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Restaurant[];
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    return matchesSearch;
  });

  // Show different content based on user role
  if (profile?.role === 'restaurant_owner') {
    return (
      <AuthGuard>
        <div className="page-container bg-page">
          <div className="page-content">
            <div className="page-header">
              <h1 className="page-title">Restaurant Management</h1>
              <p className="page-subtitle">
                Manage your restaurant and view orders
              </p>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="loading-spinner mx-auto"></div>
                <div className="text-muted text-lg">Loading restaurants...</div>
              </div>
            ) : restaurants.length > 0 ? (
              <div className="space-section">
                {restaurants.map((restaurant) => (
                  <Card key={restaurant.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                          <p className="text-gray-600">{restaurant.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {restaurant.address}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {restaurant.phone}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {restaurant.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {restaurant.isActive ? 'Active' : 'Pending Approval'}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            <div>Delivery Fee: ${restaurant.deliveryFee}</div>
                            <div>Min Order: ${restaurant.minimumOrder}</div>
                            <div>Radius: {restaurant.deliveryRadius}km</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="empty-state">
                  <div className="empty-state-icon">🏪</div>
                  <div className="empty-state-title">No restaurants found</div>
                  <p className="empty-state-description">
                    You haven't set up any restaurants yet. Create your first restaurant to start serving customers.
                  </p>
                  <Button onClick={() => window.location.href = '/restaurant-setup'}>
                    Set Up Restaurant
                  </Button>
                </CardContent>
              </Card>
            )}
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
            <h1 className="page-title">Diabetic-Friendly Food Delivery</h1>
            <p className="page-subtitle">
              Order healthy, diabetes-approved meals from local restaurants
            </p>
          </div>

          {/* Search */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for food or restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Restaurant View */}
          {restaurants.length > 0 && (
            <div className="page-header">
              <h2 className="text-2xl font-bold mb-4">Available Restaurants</h2>
              <div className="grid-responsive mb-8">
                {filteredRestaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="card-hover">
                    <CardHeader>
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      <p className="text-sm text-gray-600">{restaurant.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {restaurant.address}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {restaurant.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Truck className="h-4 w-4" />
                        {restaurant.deliveryRadius}km radius • ${restaurant.deliveryFee} delivery
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {restaurant.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {restaurant.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{restaurant.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Min order: ${restaurant.minimumOrder}
                        </div>
                        <Button size="sm">
                          View Menu
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}