'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Minus, ShoppingCart, Clock, Star } from 'lucide-react';
import { addDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, Food } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

interface RestaurantMenuProps {
  restaurant: Restaurant;
}

export default function RestaurantMenu({ restaurant }: RestaurantMenuProps) {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', phone: '', address: '' });

  // Debug the restaurant object
  console.log('RestaurantMenu received restaurant:', restaurant);

  // Prevent body scroll when checkout dialog is open
  useEffect(() => {
    if (showCheckout) {
      document.body.style.overflow = 'hidden';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.userSelect = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.userSelect = 'auto';
    };
  }, [showCheckout]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        console.log('Fetching menu items for restaurant:', restaurant.id);
        
        // Try a simple query first without where clause to test permissions
        console.log('Testing basic collection access...');
        const basicQuery = collection(db, 'foods');
        const basicSnapshot = await getDocs(basicQuery);
        const allFoods = basicSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Food[];
        console.log('All foods in database:', allFoods);
        console.log('Looking for restaurant ID:', restaurant.id);
        
        // Filter items manually instead of using where clause
        const matchingItems = allFoods.filter(item => item.restaurantId === restaurant.id);
        console.log('Items matching restaurant ID:', matchingItems);
        
        // If no matches, try different ID formats
        if (matchingItems.length === 0) {
          const partialMatches = allFoods.filter(item => 
            item.restaurantId && (
              item.restaurantId.toString() === restaurant.id ||
              restaurant.id.includes(item.restaurantId.toString()) ||
              item.restaurantId.toString().includes(restaurant.id)
            )
          );
          console.log('Partial matches with different ID formats:', partialMatches);
        }
        
        const items = matchingItems as Food[];
        console.log('Final filtered items:', items);
        
        // If no items found for this restaurant, show all items for debugging
        if (items.length === 0) {
          console.log('No items found for this restaurant, showing all items for debugging');
          setMenuItems(allFoods);
        } else {
          setMenuItems(items);
        }
        console.log('Final menu items set:', items.length > 0 ? items : allFoods);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurant.id]);

  // Persist cart per restaurant
  useEffect(() => {
    const key = `cart:${restaurant.id}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, [restaurant.id]);

  useEffect(() => {
    const key = `cart:${restaurant.id}`;
    try {
      localStorage.setItem(key, JSON.stringify(cart));
    } catch {}
  }, [cart, restaurant.id]);

  const categories = Array.from(
    new Set(
      menuItems
        .map((item) => (item.category || 'Uncategorized').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredItems = menuItems
    .filter(item => {
      const desc = (item as any).description || '';
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .filter(item => activeCategory === 'all' ? true : (item.category || 'Uncategorized') === activeCategory);

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

  const getDiabeticFriendlyBadge = (item: any) => {
    if ((item as any).isDiabeticFriendly) {
      return <Badge className="bg-green-100 text-green-800">Diabetic Friendly</Badge>;
    }
    return <Badge variant="outline" className="text-orange-600">Moderate Sugar</Badge>;
  };

  const getNutritionInfo = (item: Food) => {
    return (
      <div className="text-xs text-gray-500 space-y-1">
        {item.nutritionPer100g?.calories !== undefined && <div>Calories: {item.nutritionPer100g.calories}</div>}
        {item.nutritionPer100g?.carbs !== undefined && <div>Carbs: {item.nutritionPer100g.carbs}g</div>}
        {item.nutritionPer100g?.sugar !== undefined && <div>Sugar: {item.nutritionPer100g.sugar}g</div>}
        {item.nutritionPer100g?.protein !== undefined && <div>Protein: {item.nutritionPer100g.protein}g</div>}
      </div>
    );
  };

  const createOrder = async () => {
    if (!user) {
      alert('Please log in to place an order.');
      return;
    }
    if (!checkoutData.name || !checkoutData.phone || !checkoutData.address) return;

    const items = Object.entries(cart).map(([foodId, qty]) => ({ foodId, qty }));
    const totalPrice = getCartTotal();

    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        restaurantId: restaurant.id,
        items,
        total: totalPrice,
        status: 'pending',
        deliveryInfo: checkoutData.address,
        contactName: checkoutData.name,
        contactPhone: checkoutData.phone,
        createdAt: serverTimestamp()
      });
      setCart({});
      setShowCheckout(false);
      alert('Order placed successfully!');
    } catch (e) {
      console.error('Error creating order', e);
      alert('Failed to place order.');
    }
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
    <>
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
                  Min ₹{restaurant.minimumOrder}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {restaurant.rating || '4.5'}
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs + Menu Items */}
          <div className="space-y-4">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
                <TabsList className="w-full overflow-x-auto flex">
                  <TabsTrigger value="all" className="whitespace-nowrap">All</TabsTrigger>
                  {categories.map((cat) => (
                    <TabsTrigger key={cat} value={cat} className="whitespace-nowrap">
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeCategory} className="mt-4 space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="mb-4">
                      <p>No menu items found matching your search.</p>
                      <p className="text-sm mt-2">This restaurant hasn't added any menu items yet.</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                      <h4 className="font-semibold text-yellow-800 mb-2">Sample Menu Items</h4>
                      <p className="text-sm text-yellow-700 mb-3">Here are some sample items for testing:</p>
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between">
                          <span>Grilled Chicken Salad</span>
                          <span className="font-semibold">₹150</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quinoa Bowl</span>
                          <span className="font-semibold">₹120</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Diabetic-Friendly Soup</span>
                          <span className="font-semibold">₹80</span>
                        </div>
                      </div>
                    </div>
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
                            {(item as any).description && (
                              <p className="text-sm text-gray-600 mb-2">{(item as any).description}</p>
                            )}
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="font-semibold text-lg">₹{item.price}</span>
                              {(item.category || 'Uncategorized') && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category || 'Uncategorized'}
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Cart Summary */}
          {getCartItemCount() > 0 && (
            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">Total: ₹{getCartTotal().toFixed(2)}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({getCartItemCount()} items)
                  </span>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCheckout(true)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Checkout Dialog */}
    {showCheckout && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000]"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === e.currentTarget) {
              setShowCheckout(false);
            }
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ 
            position: 'relative',
            zIndex: 10001
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
              <button 
                onClick={() => setShowCheckout(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none p-1 hover:bg-gray-100 rounded-full"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block font-semibold text-gray-700">Full Name</Label>
                <Input 
                  value={checkoutData.name} 
                  onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full h-12 text-lg"
                />
              </div>
              
              <div>
                <Label className="mb-2 block font-semibold text-gray-700">Phone Number</Label>
                <Input 
                  value={checkoutData.phone} 
                  onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="w-full h-12 text-lg"
                />
              </div>
              
              <div>
                <Label className="mb-2 block font-semibold text-gray-700">Delivery Address</Label>
                <Input 
                  value={checkoutData.address} 
                  onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                  placeholder="Enter your delivery address"
                  className="w-full h-12 text-lg"
                />
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xl font-bold text-gray-900">Total: ₹{getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 h-12 text-lg font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createOrder} 
                    disabled={!checkoutData.name || !checkoutData.phone || !checkoutData.address}
                    className="flex-1 h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
