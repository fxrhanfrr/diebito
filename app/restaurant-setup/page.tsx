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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, Food } from '@/lib/types';
import { addSampleMenuItems } from '@/lib/sampleData';
import { Building2, MapPin, Phone, Mail, Clock, DollarSign, Truck, Plus, Edit, Trash2, Utensils, Save, X, GripVertical, Tag } from 'lucide-react';

export default function RestaurantSetup() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    specialties: [] as string[],
    deliveryRadius: '',
    deliveryFee: '',
    minimumOrder: '',
    operatingHours: {
      monday: { open: '09:00', close: '22:00', isOpen: true },
      tuesday: { open: '09:00', close: '22:00', isOpen: true },
      wednesday: { open: '09:00', close: '22:00', isOpen: true },
      thursday: { open: '09:00', close: '22:00', isOpen: true },
      friday: { open: '09:00', close: '22:00', isOpen: true },
      saturday: { open: '09:00', close: '22:00', isOpen: true },
      sunday: { open: '09:00', close: '22:00', isOpen: true },
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingRestaurant, setExistingRestaurant] = useState<Restaurant | null>(null);
  const [checkingRestaurant, setCheckingRestaurant] = useState(true);
  const [menuItems, setMenuItems] = useState<Food[]>([]);
  const [categories, setCategories] = useState<string[]>(['breakfast', 'lunch', 'dinner', 'snack']);
  const [newCategory, setNewCategory] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    category: 'breakfast' as string,
    nutritionPer100g: {
      calories: 0,
      carbs: 0,
      protein: 0,
      sugar: 0,
      fat: 0
    },
    price: 0,
    imageUrl: '',
    description: ''
  });
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const { user, profile } = useAuth();
  const router = useRouter();

  const specialtyOptions = [
    'Diabetic-friendly',
    'Low-carb',
    'Organic',
    'Gluten-free',
    'Vegetarian',
    'Vegan',
    'Keto',
    'Mediterranean',
    'Heart-healthy',
    'Low-sodium',
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    if (!user || profile?.role !== 'restaurant_owner') {
      router.push('/auth/login');
      return;
    }
    
    // Check if user already has a restaurant
    checkExistingRestaurant();
  }, [user, profile, router]);

  const checkExistingRestaurant = async () => {
    if (!user) return;
    
    try {
      // Prefer deterministic lookup by owner UID (one restaurant per user)
      const restaurantDoc = await getDoc(doc(db, 'restaurants', user.uid));
      if (restaurantDoc.exists()) {
        const restaurant = { id: restaurantDoc.id, ...restaurantDoc.data() } as Restaurant;
        setExistingRestaurant(restaurant);
        // Load menu items for this restaurant (avoid state race)
        await loadMenuItems(restaurant.id);
        return;
      }

      // Fallback: legacy query by ownerId
      const restaurantsQuery = query(
        collection(db, 'restaurants'),
        where('ownerId', '==', user.uid)
      );
      const querySnapshot = await getDocs(restaurantsQuery);
      if (!querySnapshot.empty) {
        const first = querySnapshot.docs[0];
        const restaurant = { id: first.id, ...first.data() } as Restaurant;
        setExistingRestaurant(restaurant);
        await loadMenuItems(restaurant.id);
      }
    } catch (error) {
      console.error('Error checking existing restaurant:', error);
    } finally {
      setCheckingRestaurant(false);
    }
  };

  // Ensure menu items load when restaurant state becomes available
  useEffect(() => {
    if (existingRestaurant?.id) {
      loadMenuItems(existingRestaurant.id);
    }
  }, [existingRestaurant?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty],
      });
    } else {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter(s => s !== specialty),
      });
    }
  };

  const handleOperatingHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      operatingHours: {
        ...formData.operatingHours,
        [day]: {
          ...formData.operatingHours[day as keyof typeof formData.operatingHours],
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
      // Prevent duplicate creation (one restaurant per user)
      const existingDoc = await getDoc(doc(db, 'restaurants', user.uid));
      if (existingDoc.exists()) {
        setError('You already have a restaurant linked to this account.');
        setLoading(false);
        return;
      }

      // Create restaurant document
      const restaurantData: Omit<Restaurant, 'id'> = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        ownerId: user.uid,
        isActive: true,
        specialties: formData.specialties,
        deliveryRadius: parseFloat(formData.deliveryRadius),
        deliveryFee: parseFloat(formData.deliveryFee),
        minimumOrder: parseFloat(formData.minimumOrder),
        operatingHours: formData.operatingHours,
        createdAt: serverTimestamp() as any,
      };

      // Use deterministic doc id tied to owner (often permitted by rules)
      const restaurantId = user.uid;
      await setDoc(doc(db, 'restaurants', restaurantId), restaurantData, { merge: true });
      
      // Update user profile with restaurant ID
      await setDoc(doc(db, 'users', user.uid), {
        restaurantId,
      }, { merge: true });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to create restaurant');
    }
    
    setLoading(false);
  };

  const loadMenuItems = async (restaurantIdParam?: string) => {
    const restaurantId = restaurantIdParam || existingRestaurant?.id;
    if (!restaurantId) return;

    try {
      console.log('Loading menu items for restaurant ID:', restaurantId);
      const q = query(
        collection(db, 'foods'),
        where('restaurantId', '==', restaurantId)
      );
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Food[];
      console.log('Loaded menu items:', items);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const handleAddMenuItem = async () => {
    if (!existingRestaurant || !newMenuItem.name.trim()) return;

    try {
      const foodData = {
        ...newMenuItem,
        restaurantId: existingRestaurant.id,
        ownerId: user!.uid,
        isActive: true,
        createdAt: serverTimestamp() as any,
      };

      console.log('Creating menu item with data:', foodData);
      console.log('Restaurant ID:', existingRestaurant.id);
      
      const docRef = await addDoc(collection(db, 'foods'), foodData);
      console.log('Menu item created with ID:', docRef.id);
      
      // Reset form
      setNewMenuItem({
        name: '',
        category: 'breakfast',
        nutritionPer100g: {
          calories: 0,
          carbs: 0,
          protein: 0,
          sugar: 0,
          fat: 0
        },
        price: 0,
        imageUrl: ''
      });
      setIsAddingMenuItem(false);
      
      // Reload menu items
      await loadMenuItems();
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await deleteDoc(doc(db, 'foods', itemId));
      await loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const handleEditMenuItem = (item: Food) => {
    setEditingItem(item.id);
    setNewMenuItem({
      name: item.name,
      category: item.category,
      nutritionPer100g: item.nutritionPer100g,
      price: item.price || 0,
      imageUrl: item.imageUrl || '',
      description: ''
    });
  };

  const handleUpdateMenuItem = async () => {
    if (!editingItem || !newMenuItem.name.trim()) return;

    try {
      await updateDoc(doc(db, 'foods', editingItem), {
        name: newMenuItem.name,
        category: newMenuItem.category,
        nutritionPer100g: newMenuItem.nutritionPer100g,
        price: newMenuItem.price,
        imageUrl: newMenuItem.imageUrl,
        updatedAt: serverTimestamp()
      });
      
      setEditingItem(null);
      setNewMenuItem({
        name: '',
        category: 'breakfast',
        nutritionPer100g: { calories: 0, carbs: 0, protein: 0, sugar: 0, fat: 0 },
        price: 0,
        imageUrl: '',
        description: ''
      });
      await loadMenuItems();
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || categories.includes(newCategory.toLowerCase())) return;

    try {
      const category = newCategory.toLowerCase().trim();
      setCategories(prev => [...prev, category]);
      setNewCategory('');
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = (category: string) => {
    if (categories.length <= 1) {
      alert('You must have at least one category');
      return;
    }
    
    if (menuItems.some(item => item.category === category)) {
      alert('Cannot delete category that has menu items. Please move or delete items first.');
      return;
    }
    
    setCategories(prev => prev.filter(cat => cat !== category));
  };

  const handleEditCategory = (oldCategory: string, newCategory: string) => {
    if (newCategory.trim() && !categories.includes(newCategory.toLowerCase())) {
      setCategories(prev => prev.map(cat => cat === oldCategory ? newCategory.toLowerCase() : cat));
      setEditingCategory(null);
    }
  };

  const handleAddSampleData = async () => {
    if (!existingRestaurant) return;
    
    try {
      const success = await addSampleMenuItems(existingRestaurant.id);
      if (success) {
        alert('Sample menu items added successfully!');
        await loadMenuItems(existingRestaurant.id);
      } else {
        alert('Failed to add sample menu items.');
      }
    } catch (error) {
      console.error('Error adding sample data:', error);
      alert('Error adding sample menu items.');
    }
  };

  if (!user || profile?.role !== 'restaurant_owner') {
    return null;
  }

  if (checkingRestaurant) {
    return (
      <div className="form-container bg-gradient-primary">
        <Card className="form-card">
          <CardContent className="pt-6 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Checking your restaurant status...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Created!</h2>
            <p className="text-gray-600 mb-4">
              Your restaurant has been submitted for admin approval. You'll be notified once it's approved.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user already has a restaurant, show restaurant management
  if (existingRestaurant) {
    return (
      <div className="page-container bg-gradient-primary">
        <div className="page-content">
          <div className="page-header text-center">
            <h1 className="page-title">Restaurant Dashboard</h1>
            <p className="page-subtitle">Manage your restaurant details and menu</p>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Restaurant Details</TabsTrigger>
              <TabsTrigger value="menu">Menu Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Restaurant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="form-label">Restaurant Name</Label>
                  <div className="text-lg font-semibold">{existingRestaurant.name}</div>
                </div>
                <div className="space-y-2">
                  <Label className="form-label">Status</Label>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      existingRestaurant.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {existingRestaurant.isActive ? 'Active' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="form-label">Description</Label>
                <div className="text-gray-700">{existingRestaurant.description}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="form-label">Address</Label>
                  <div className="text-gray-700">{existingRestaurant.address}</div>
                </div>
                <div className="space-y-2">
                  <Label className="form-label">Phone</Label>
                  <div className="text-gray-700">{existingRestaurant.phone}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="form-label">Email</Label>
                <div className="text-gray-700">{existingRestaurant.email}</div>
              </div>

              <div className="space-y-2">
                <Label className="form-label">Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {existingRestaurant.specialties.map((specialty) => (
                    <span key={specialty} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="form-label">Delivery Radius</Label>
                  <div className="text-gray-700">{existingRestaurant.deliveryRadius} km</div>
                </div>
                <div className="space-y-2">
                  <Label className="form-label">Delivery Fee</Label>
                  <div className="text-gray-700">₹{existingRestaurant.deliveryFee}</div>
                </div>
                <div className="space-y-2">
                  <Label className="form-label">Minimum Order</Label>
                  <div className="text-gray-700">₹{existingRestaurant.minimumOrder}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="form-label">Operating Hours</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(existingRestaurant.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="capitalize font-medium">{day}</span>
                      <span className="text-sm text-gray-600">
                        {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => router.push('/food-ordering')} 
                  className="flex-1"
                >
                  Manage Orders
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
            
            <TabsContent value="menu" className="space-y-6">
              {/* Category Management */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Menu Categories
                    </CardTitle>
                    <Button onClick={() => setIsAddingCategory(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                        {editingCategory === category ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={category}
                              onChange={(e) => setNewCategory(e.target.value)}
                              className="h-8 w-24"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleEditCategory(category, newCategory)}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCategory(null)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="capitalize font-medium">{category}</span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setNewCategory(category);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCategory(category)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Menu Items */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      Menu Items
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button onClick={() => setIsAddingMenuItem(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Menu Item
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleAddSampleData}
                        className="text-sm"
                      >
                        Add Sample Data
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {menuItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items yet</h3>
                      <p className="text-gray-600 mb-4">Start building your menu by adding your first item</p>
                      <Button onClick={() => setIsAddingMenuItem(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Menu Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories.map((category) => {
                        const categoryItems = menuItems.filter(item => item.category === category);
                        if (categoryItems.length === 0) return null;
                        
                        return (
                          <div key={category} className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800 capitalize border-b pb-2">
                              {category} ({categoryItems.length} items)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {categoryItems.map((item) => (
                                <Card key={item.id} className="relative group hover:shadow-lg transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-semibold text-lg">{item.name}</h4>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleEditMenuItem(item)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteMenuItem(item.id)}
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                                      <div className="flex justify-between">
                                        <span>Calories:</span>
                                        <span>{item.nutritionPer100g.calories} cal/100g</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Carbs:</span>
                                        <span>{item.nutritionPer100g.carbs}g</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Protein:</span>
                                        <span>{item.nutritionPer100g.protein}g</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Sugar:</span>
                                        <span>{item.nutritionPer100g.sugar}g</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-3 border-t">
                                      <span className="text-lg font-bold text-green-600">
                                        ₹{item.price}
                                      </span>
                                      <Badge variant="outline" className="capitalize">
                                        {item.category}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add/Edit Menu Item Dialog */}
              {(isAddingMenuItem || editingItem) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                    <CardHeader>
                      <CardTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="itemName">Item Name</Label>
                          <Input
                            id="itemName"
                            value={newMenuItem.name}
                            onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Grilled Chicken Salad"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newMenuItem.category}
                            onValueChange={(value: string) => 
                              setNewMenuItem(prev => ({ ...prev, category: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          value={newMenuItem.description}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of the dish..."
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newMenuItem.price}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <Label>Nutrition per 100g</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          <div>
                            <Label className="text-xs">Calories</Label>
                            <Input
                              type="number"
                              value={newMenuItem.nutritionPer100g.calories}
                              onChange={(e) => setNewMenuItem(prev => ({
                                ...prev,
                                nutritionPer100g: { ...prev.nutritionPer100g, calories: parseInt(e.target.value) || 0 }
                              }))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Carbs (g)</Label>
                            <Input
                              type="number"
                              value={newMenuItem.nutritionPer100g.carbs}
                              onChange={(e) => setNewMenuItem(prev => ({
                                ...prev,
                                nutritionPer100g: { ...prev.nutritionPer100g, carbs: parseInt(e.target.value) || 0 }
                              }))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Protein (g)</Label>
                            <Input
                              type="number"
                              value={newMenuItem.nutritionPer100g.protein}
                              onChange={(e) => setNewMenuItem(prev => ({
                                ...prev,
                                nutritionPer100g: { ...prev.nutritionPer100g, protein: parseInt(e.target.value) || 0 }
                              }))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Sugar (g)</Label>
                            <Input
                              type="number"
                              value={newMenuItem.nutritionPer100g.sugar}
                              onChange={(e) => setNewMenuItem(prev => ({
                                ...prev,
                                nutritionPer100g: { ...prev.nutritionPer100g, sugar: parseInt(e.target.value) || 0 }
                              }))}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                        <Input
                          id="imageUrl"
                          value={newMenuItem.imageUrl}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingMenuItem(false);
                            setEditingItem(null);
                            setNewMenuItem({
                              name: '',
                              category: 'breakfast',
                              nutritionPer100g: { calories: 0, carbs: 0, protein: 0, sugar: 0, fat: 0 },
                              price: 0,
                              imageUrl: '',
                              description: ''
                            });
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={editingItem ? handleUpdateMenuItem : handleAddMenuItem}
                          disabled={!newMenuItem.name.trim()}
                          className="flex-1"
                        >
                          {editingItem ? 'Update Menu Item' : 'Add Menu Item'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Add Category Dialog */}
              {isAddingCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <Card className="w-full max-w-md mx-4">
                    <CardHeader>
                      <CardTitle>Add New Category</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="categoryName">Category Name</Label>
                        <Input
                          id="categoryName"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="e.g., appetizers, desserts"
                          autoFocus
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setNewCategory('');
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddCategory}
                          disabled={!newCategory.trim() || categories.includes(newCategory.toLowerCase())}
                          className="flex-1"
                        >
                          Add Category
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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
          <h1 className="page-title">Restaurant Setup</h1>
          <p className="page-subtitle">Set up your restaurant details to start serving healthy meals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Restaurant Information
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
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter restaurant name"
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
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your restaurant and what makes it special for health-conscious customers"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter full address"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter restaurant email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Specialties *</Label>
                <p className="text-sm text-gray-600">Select the types of healthy food you specialize in</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specialtyOptions.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={formData.specialties.includes(specialty)}
                        onCheckedChange={(checked) => handleSpecialtyChange(specialty, checked as boolean)}
                      />
                      <Label htmlFor={specialty} className="text-sm">
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="deliveryRadius">Delivery Radius (km) *</Label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="deliveryRadius"
                      name="deliveryRadius"
                      type="number"
                      step="0.1"
                      value={formData.deliveryRadius}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="5"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryFee">Delivery Fee (₹) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="deliveryFee"
                      name="deliveryFee"
                      type="number"
                      step="0.01"
                      value={formData.deliveryFee}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="2.99"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumOrder">Minimum Order (₹) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="minimumOrder"
                      name="minimumOrder"
                      type="number"
                      step="0.01"
                      value={formData.minimumOrder}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="15.00"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Operating Hours *</Label>
                <div className="space-y-3">
                  {days.map((day) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20">
                        <Checkbox
                          id={`${day}-open`}
                          checked={formData.operatingHours[day as keyof typeof formData.operatingHours].isOpen}
                          onCheckedChange={(checked) => handleOperatingHoursChange(day, 'isOpen', checked as boolean)}
                        />
                        <Label htmlFor={`${day}-open`} className="ml-2 capitalize">
                          {day}
                        </Label>
                      </div>
                      {formData.operatingHours[day as keyof typeof formData.operatingHours].isOpen && (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <Input
                              type="time"
                              value={formData.operatingHours[day as keyof typeof formData.operatingHours].open}
                              onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                              className="w-32"
                            />
                          </div>
                          <span>to</span>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <Input
                              type="time"
                              value={formData.operatingHours[day as keyof typeof formData.operatingHours].close}
                              onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Restaurant...' : 'Create Restaurant'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
