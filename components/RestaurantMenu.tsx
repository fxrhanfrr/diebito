'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Minus, ShoppingCart, Clock, Star } from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, MenuItem } from '@/lib/types';

interface RestaurantMenuProps {
  restaurant: Restaurant;
}

export default function RestaurantMenu({ restaurant }: RestaurantMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const menuQuery = query(
          collection(db, 'menuItems'),
          where('restaurantId', '==', restaurant.id),
          where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(menuQuery);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurant.id]);

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(item => item.id === itemId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const getDiabeticFriendlyBadge = (item: MenuItem) => {
    if (item.isDiabeticFriendly) {
      return <Badge className="bg-green-100 text-green-800">Diabetic Friendly</Badge>;
    }
    return <Badge variant="outline" className="text-orange-600">Moderate Sugar</Badge>;
  };

  const getNutritionInfo = (item: MenuItem) => {
    return (
      <div className="text-xs text-gray-500 space-y-1">
        {item.calories && <div>Calories: {item.calories}</div>}
        {item.carbs && <div>Carbs: {item.carbs}g</div>}
        {item.sugar && <div>Sugar: {item.sugar}g</div>}
        {item.protein && <div>Protein: {item.protein}g</div>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading menu...</span>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          View Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{restaurant.name} - Menu</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCart(true)}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({getCartItemCount()})
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {getCartItemCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Restaurant Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{restaurant.name}</h3>
                <p className="text-sm text-gray-600">{restaurant.description}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {restaurant.deliveryTime || '30-45 min'}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {restaurant.rating || '4.5'}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No menu items found matching your search.
              </div>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          {getDiabeticFriendlyBadge(item)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="font-semibold text-lg">${item.price}</span>
                          {item.category && (
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        {getNutritionInfo(item)}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          disabled={!cart[item.id]}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">
                          {cart[item.id] || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToCart(item.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Cart Summary */}
          {getCartItemCount() > 0 && (
            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">Total: ${getCartTotal().toFixed(2)}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({getCartItemCount()} items)
                  </span>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
