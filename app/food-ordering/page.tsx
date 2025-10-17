'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, Order } from '@/lib/types';
import { Search, MapPin, Phone, Truck, CheckCircle, XCircle, Clock, Package, User } from 'lucide-react';
import RestaurantMenu from '@/components/RestaurantMenu';

export default function FoodOrdering() {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const { profile } = useAuth();

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));
      
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log('Fetching restaurants...');
        const restaurantsQuery = query(
          collection(db, 'restaurants'),
          where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(restaurantsQuery);
        const restaurantsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Restaurant[];
        console.log('Fetched restaurants:', restaurantsData);
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

  // Load orders for restaurant owners
  useEffect(() => {
    const loadOwnerOrders = async () => {
      if (profile?.role !== 'restaurant_owner') return;
      
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

  // Show different content based on user role
  if (profile?.role === 'restaurant_owner') {
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
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-blue-600" />
                          <div>
                            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                            <p className="text-sm text-gray-600">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-2">Order Items:</h4>
                        <div className="space-y-2">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium">{item.qty}</span>
                                </div>
                                <span className="text-sm">Item ID: {item.foodId}</span>
                              </div>
                              <span className="text-sm font-medium">Qty: {item.qty}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Customer:</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-6">
                            {order.contactName || 'Name not provided'}
                            {order.contactPhone && ` • ${order.contactPhone}`}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Delivery Address:</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-6">
                            {order.deliveryInfo || 'Address not provided'}
                          </p>
                        </div>
                      </div>

                      {/* Order Total */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total Amount:</span>
                          <span className="text-xl font-bold text-green-600">
                            ₹{order.total?.toFixed(2) || order.total}
                          </span>
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="flex space-x-2 pt-2">
                        {order.status === 'pending' && (
                          <>
                            <Button 
                              onClick={() => handleOrderStatusUpdate(order.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept Order
                            </Button>
                            <Button 
                              onClick={() => handleOrderStatusUpdate(order.id, 'cancelled')}
                              variant="destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Order
                            </Button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <Button 
                            onClick={() => handleOrderStatusUpdate(order.id, 'preparing')}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button 
                            onClick={() => handleOrderStatusUpdate(order.id, 'ready')}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button 
                            onClick={() => handleOrderStatusUpdate(order.id, 'delivered')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Delivered
                          </Button>
                        )}
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

  // Debug logging
  console.log('Food ordering page - profile:', profile, 'loading:', loading);

  // Temporary bypass for testing - remove AuthGuard to test if that's the issue
  if (!profile) {
    return (
      <div className="page-container bg-page">
        <div className="page-content">
          <div className="text-center py-8">
            <h1 className="text-xl font-semibold">Loading user profile...</h1>
            <p className="text-gray-600">Please wait while we load your profile.</p>
          </div>
        </div>
      </div>
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
            {profile && (
              <p className="text-sm text-gray-600">Welcome, {profile.name} ({profile.role})</p>
            )}
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
                        {restaurant.deliveryRadius}km radius • ₹{restaurant.deliveryFee} delivery
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
                          Min order: ₹{restaurant.minimumOrder}
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