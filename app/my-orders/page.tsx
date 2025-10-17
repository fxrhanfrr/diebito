'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/lib/types';
import { Clock, MapPin, Phone, Package, CheckCircle, XCircle } from 'lucide-react';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [foodsMap, setFoodsMap] = useState<Map<string, any>>(new Map());
  const [restaurantsMap, setRestaurantsMap] = useState<Map<string, any>>(new Map());
  const { user } = useAuth();

  const fetchRelatedData = async (orders: Order[]) => {
    try {
      // Collect all unique food IDs and restaurant IDs
      const foodIds = new Set<string>();
      const restaurantIds = new Set<string>();
      
      orders.forEach(order => {
        order.items?.forEach(item => foodIds.add(item.foodId));
        if (order.restaurantId) restaurantIds.add(order.restaurantId);
      });

      // Fetch foods data
      if (foodIds.size > 0) {
        const foodsQuery = query(collection(db, 'foods'));
        const foodsSnapshot = await getDocs(foodsQuery);
        const newFoodsMap = new Map<string, any>();
        foodsSnapshot.docs.forEach(doc => {
          newFoodsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        setFoodsMap(newFoodsMap);
      }

      // Fetch restaurants data
      if (restaurantIds.size > 0) {
        const restaurantsQuery = query(collection(db, 'restaurants'));
        const restaurantsSnapshot = await getDocs(restaurantsQuery);
        const newRestaurantsMap = new Map<string, any>();
        restaurantsSnapshot.docs.forEach(doc => {
          newRestaurantsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        setRestaurantsMap(newRestaurantsMap);
      }
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt
        };
      }) as Order[];
      
      // Sort by creation date (newest first)
      ordersData.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
      
      setOrders(ordersData);
      // Fetch related data (foods and restaurants)
      fetchRelatedData(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'preparing':
        return <Clock className="h-4 w-4" />;
      case 'ready':
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order is waiting for restaurant confirmation';
      case 'confirmed':
        return 'Order confirmed! Restaurant is preparing your food';
      case 'preparing':
        return 'Your food is being prepared by the restaurant';
      case 'ready':
        return 'Your order is ready for pickup/delivery';
      case 'delivered':
        return 'Order delivered successfully!';
      case 'cancelled':
        return 'This order has been cancelled';
      default:
        return 'Order status unknown';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      console.log('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };



  if (loading) {
    return (
      <AuthGuard>
        <div className="page-container bg-page">
          <div className="page-content">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading your orders...</span>
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
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">Track your food orders and delivery status</p>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="empty-state">
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-title">No orders yet</div>
                <p className="empty-state-description">
                  You haven't placed any orders yet. Start ordering healthy meals from our restaurants!
                </p>
                <Button onClick={() => window.location.href = '/food-ordering'}>
                  Browse Restaurants
                </Button>
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
                        <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1 border`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize font-medium">{order.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Status Message */}
                    <div className={`p-4 rounded-lg border ${getStatusColor(order.status)}`}>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="font-medium">{getStatusMessage(order.status)}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-2">Order Items:</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => {
                          const food = foodsMap.get(item.foodId);
                          return (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium">{item.qty}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">
                                    {food ? food.name : `Item ID: ${item.foodId}`}
                                  </span>
                                  {food && (
                                    <div className="text-xs text-gray-500">
                                      ₹{food.price} each
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-medium">Qty: {item.qty}</span>
                                {food && (
                                  <div className="text-xs text-gray-500">
                                    Total: ₹{(food.price * item.qty).toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Delivery Address:</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          {order.deliveryInfo || 'Address not provided'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Contact:</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          {order.contactName || 'Name not provided'}
                          {order.contactPhone && ` • ${order.contactPhone}`}
                        </p>
                      </div>
                    </div>

                    {/* Restaurant Info */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Restaurant:</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {restaurantsMap.get(order.restaurantId)?.name || `Restaurant ID: ${order.restaurantId}`}
                      </p>
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
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
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
