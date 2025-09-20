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
import { Search, Heart, Star, Clock, ShoppingCart, Filter, MapPin, Phone, Truck } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  rating: number;
  deliveryTime: number;
  isDiabeticFriendly: boolean;
  calories: number;
  nutritionInfo: {
    carbs: number;
    protein: number;
    fats: number;
    fiber: number;
  };
  imageUrl: string;
  description: string;
}

export default function FoodOrdering() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDiabeticOnly, setShowDiabeticOnly] = useState(true);
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

  const foodItems: FoodItem[] = [
    {
      id: '1',
      name: 'Grilled Chicken Quinoa Bowl',
      restaurant: 'Healthy Bites',
      price: 14.99,
      category: 'lunch',
      rating: 4.8,
      deliveryTime: 25,
      isDiabeticFriendly: true,
      calories: 420,
      nutritionInfo: { carbs: 35, protein: 35, fats: 12, fiber: 8 },
      imageUrl: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg',
      description: 'Grilled chicken breast with quinoa, mixed vegetables, and avocado'
    },
    {
      id: '2',
      name: 'Mediterranean Salmon Salad',
      restaurant: 'Fresh Garden',
      price: 16.99,
      category: 'dinner',
      rating: 4.9,
      deliveryTime: 30,
      isDiabeticFriendly: true,
      calories: 380,
      nutritionInfo: { carbs: 20, protein: 32, fats: 18, fiber: 6 },
      imageUrl: 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg',
      description: 'Fresh salmon with mixed greens, cherry tomatoes, and olive oil dressing'
    },
    {
      id: '3',
      name: 'Diabetic-Friendly Pancakes',
      restaurant: 'Morning Glory',
      price: 9.99,
      category: 'breakfast',
      rating: 4.6,
      deliveryTime: 20,
      isDiabeticFriendly: true,
      calories: 280,
      nutritionInfo: { carbs: 25, protein: 15, fats: 12, fiber: 8 },
      imageUrl: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
      description: 'Almond flour pancakes with sugar-free syrup and fresh berries'
    },
    {
      id: '4',
      name: 'Protein Power Smoothie',
      restaurant: 'Juice Plus',
      price: 7.99,
      category: 'snacks',
      rating: 4.5,
      deliveryTime: 15,
      isDiabeticFriendly: true,
      calories: 220,
      nutritionInfo: { carbs: 18, protein: 25, fats: 8, fiber: 5 },
      imageUrl: 'https://images.pexels.com/photos/616833/pexels-photo-616833.jpeg',
      description: 'Protein powder, spinach, berries, and almond milk blend'
    },
    {
      id: '5',
      name: 'Turkey and Veggie Wrap',
      restaurant: 'Wrap It Up',
      price: 11.99,
      category: 'lunch',
      rating: 4.4,
      deliveryTime: 22,
      isDiabeticFriendly: true,
      calories: 350,
      nutritionInfo: { carbs: 30, protein: 28, fats: 10, fiber: 12 },
      imageUrl: 'https://images.pexels.com/photos/2215661/pexels-photo-2215661.jpeg',
      description: 'Whole wheat wrap with lean turkey, fresh vegetables, and hummus'
    },
    {
      id: '6',
      name: 'Cauliflower Rice Stir-Fry',
      restaurant: 'Veggie Delight',
      price: 12.99,
      category: 'dinner',
      rating: 4.7,
      deliveryTime: 28,
      isDiabeticFriendly: true,
      calories: 300,
      nutritionInfo: { carbs: 20, protein: 15, fats: 15, fiber: 10 },
      imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      description: 'Cauliflower rice with mixed vegetables and tofu in garlic sauce'
    }
  ];

  const categories = [
    { key: 'all', label: 'All Items' },
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snacks', label: 'Snacks' }
  ];

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesDiabetic = !showDiabeticOnly || item.isDiabeticFriendly;
    
    return matchesSearch && matchesCategory && matchesDiabetic;
  });

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

          {/* Search and Filters */}
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
              <Button
                variant={showDiabeticOnly ? 'default' : 'outline'}
                onClick={() => setShowDiabeticOnly(!showDiabeticOnly)}
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Diabetic-Friendly Only
              </Button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Food Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.isDiabeticFriendly && (
                    <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                      <Heart className="h-3 w-3 mr-1" />
                      Diabetic-Friendly
                    </Badge>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-gray-600">{item.restaurant}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">${item.price}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{item.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{item.deliveryTime} min</span>
                    </div>
                    <div className="text-blue-600 font-medium">
                      {item.calories} cal
                    </div>
                  </div>

                  {/* Nutrition Info */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-xs mb-2">Nutrition Facts</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Carbs: {item.nutritionInfo.carbs}g</div>
                      <div>Protein: {item.nutritionInfo.protein}g</div>
                      <div>Fats: {item.nutritionInfo.fats}g</div>
                      <div>Fiber: {item.nutritionInfo.fiber}g</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No items found</div>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}