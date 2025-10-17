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
import { Restaurant, Order } from '@/lib/types';
import { Search, MapPin, Phone, Truck } from 'lucide-react';
import RestaurantMenu from '@/components/RestaurantMenu';

export default function FoodOrdering() {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
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
    // Load orders for this restaurant owner
    useEffect(() => {
      const loadOwnerOrders = async () => {
        try {
          setOrdersLoading(true);
          let restaurantId = profile?.restaurantId || '';
          // Fallback: attempt to use owner UID as restaurant doc id
          if (!restaurantId && profile?.id) {
            restaurantId = profile.id;
          }
          if (!restaurantId) {
            setOrders([]);
            return;
          }

          const ordersQuery = query(
            collection(db, 'orders'),
            where('restaurantId', '==', restaurantId)
          );
          const ordersSnapshot = await getDocs(ordersQuery);
          const data = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];
          setOrders(data);
        } catch (err) {
          console.error('Error loading orders:', err);
          setOrders([]);
        } finally {
          setOrdersLoading(false);
        }
      };

      loadOwnerOrders();
    }, [profile]);

    return (
      <AuthGuard>
        <div className="page-container bg-page">
          <div className="page-content">
            <div className="page-header">
              <h1 className="page-title">Orders for Your Restaurant</h1>
              <p className="page-subtitle">View orders placed by patients for your restaurant</p>
            </div>

            {ordersLoading ? (
              <div className="empty-state">
                <div className="loading-spinner mx-auto"></div>
                <div className="text-muted text-lg">Loading orders...</div>
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="empty-state">
                  <div className="empty-state-icon">🧾</div>
                  <div className="empty-state-title">No orders yet</div>
                  <p className="empty-state-description">Orders placed for your restaurant will appear here.</p>
                  <Button onClick={() => window.location.href = '/restaurant-setup'}>Manage Restaurant</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-section">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 text-sm">
                          <div className="font-semibold">Order #{order.id.slice(0, 8)}</div>
                          <div>Patient: {order.userId.slice(0, 8)}...</div>
                          <div>Total: ${order.total?.toFixed?.(2) || order.total}</div>
                          <div className="text-gray-600">Items: {order.items?.length || 0}</div>
                        </div>
                        <div className="text-right">
                          <Badge>{order.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                        <RestaurantMenu restaurant={restaurant} />
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