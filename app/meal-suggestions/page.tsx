'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthGuard from '@/components/AuthGuard';
import { Heart, Clock, Zap, Star, ShoppingCart } from 'lucide-react';

interface MealItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  prepTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  isHealthy: boolean;
  ingredients: string[];
  nutritionFacts: {
    carbs: number;
    protein: number;
    fats: number;
    fiber: number;
  };
  imageUrl: string;
}

export default function MealSuggestions() {
  const [selectedCategory, setSelectedCategory] = useState('breakfast');
  
  const meals: MealItem[] = [
    // Breakfast
    {
      id: '1',
      name: 'Diabetic-Friendly Oatmeal Bowl',
      category: 'breakfast',
      calories: 320,
      prepTime: 10,
      difficulty: 'Easy',
      rating: 4.8,
      isHealthy: true,
      ingredients: ['Steel-cut oats', 'Almond milk', 'Chia seeds', 'Fresh berries', 'Cinnamon', 'Chopped walnuts'],
      nutritionFacts: { carbs: 45, protein: 12, fats: 8, fiber: 10 },
      imageUrl: 'https://images.pexels.com/photos/704971/pexels-photo-704971.jpeg'
    },
    {
      id: '2',
      name: 'Vegetable Scrambled Eggs',
      category: 'breakfast',
      calories: 280,
      prepTime: 15,
      difficulty: 'Easy',
      rating: 4.6,
      isHealthy: true,
      ingredients: ['Eggs', 'Spinach', 'Bell peppers', 'Onions', 'Olive oil', 'Herbs'],
      nutritionFacts: { carbs: 8, protein: 18, fats: 14, fiber: 3 },
      imageUrl: 'https://images.pexels.com/photos/1109197/pexels-photo-1109197.jpeg'
    },
    // Lunch
    {
      id: '3',
      name: 'Grilled Chicken Quinoa Bowl',
      category: 'lunch',
      calories: 450,
      prepTime: 25,
      difficulty: 'Medium',
      rating: 4.7,
      isHealthy: true,
      ingredients: ['Quinoa', 'Grilled chicken breast', 'Mixed vegetables', 'Avocado', 'Lemon dressing'],
      nutritionFacts: { carbs: 35, protein: 35, fats: 12, fiber: 8 },
      imageUrl: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg'
    },
    {
      id: '4',
      name: 'Mediterranean Lentil Salad',
      category: 'lunch',
      calories: 380,
      prepTime: 20,
      difficulty: 'Easy',
      rating: 4.5,
      isHealthy: true,
      ingredients: ['Green lentils', 'Cherry tomatoes', 'Cucumber', 'Feta cheese', 'Olive oil', 'Herbs'],
      nutritionFacts: { carbs: 42, protein: 18, fats: 10, fiber: 16 },
      imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
    },
    // Dinner
    {
      id: '5',
      name: 'Baked Salmon with Vegetables',
      category: 'dinner',
      calories: 420,
      prepTime: 30,
      difficulty: 'Medium',
      rating: 4.9,
      isHealthy: true,
      ingredients: ['Salmon fillet', 'Broccoli', 'Asparagus', 'Sweet potato', 'Lemon', 'Herbs'],
      nutritionFacts: { carbs: 25, protein: 35, fats: 18, fiber: 6 },
      imageUrl: 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg'
    },
    {
      id: '6',
      name: 'Turkey Meatballs with Zucchini Noodles',
      category: 'dinner',
      calories: 350,
      prepTime: 35,
      difficulty: 'Medium',
      rating: 4.4,
      isHealthy: true,
      ingredients: ['Ground turkey', 'Zucchini', 'Marinara sauce', 'Herbs', 'Parmesan cheese'],
      nutritionFacts: { carbs: 15, protein: 28, fats: 12, fiber: 4 },
      imageUrl: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg'
    },
    // Snacks
    {
      id: '7',
      name: 'Greek Yogurt Berry Parfait',
      category: 'snacks',
      calories: 180,
      prepTime: 5,
      difficulty: 'Easy',
      rating: 4.6,
      isHealthy: true,
      ingredients: ['Greek yogurt', 'Mixed berries', 'Almonds', 'Honey', 'Chia seeds'],
      nutritionFacts: { carbs: 18, protein: 15, fats: 6, fiber: 5 },
      imageUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg'
    },
    {
      id: '8',
      name: 'Avocado & Hummus Toast',
      category: 'snacks',
      calories: 220,
      prepTime: 8,
      difficulty: 'Easy',
      rating: 4.3,
      isHealthy: true,
      ingredients: ['Whole grain bread', 'Avocado', 'Hummus', 'Cherry tomatoes', 'Seeds'],
      nutritionFacts: { carbs: 25, protein: 8, fats: 12, fiber: 8 },
      imageUrl: 'https://images.pexels.com/photos/1209029/pexels-photo-1209029.jpeg'
    }
  ];

  const getMealsByCategory = (category: string) => {
    return meals.filter(meal => meal.category === category);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Suggestions</h1>
            <p className="text-gray-600">
              Diabetic-friendly meal ideas organized by meal type to help you plan your day
            </p>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="breakfast" className="flex items-center gap-2">
                🌅 Breakfast
              </TabsTrigger>
              <TabsTrigger value="lunch" className="flex items-center gap-2">
                ☀️ Lunch
              </TabsTrigger>
              <TabsTrigger value="dinner" className="flex items-center gap-2">
                🌙 Dinner
              </TabsTrigger>
              <TabsTrigger value="snacks" className="flex items-center gap-2">
                🍎 Snacks
              </TabsTrigger>
            </TabsList>

            {['breakfast', 'lunch', 'dinner', 'snacks'].map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getMealsByCategory(category).map((meal) => (
                    <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video relative">
                        <img
                          src={meal.imageUrl}
                          alt={meal.name}
                          className="w-full h-full object-cover"
                        />
                        {meal.isHealthy && (
                          <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                            <Heart className="h-3 w-3 mr-1" />
                            Healthy
                          </Badge>
                        )}
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{meal.name}</CardTitle>
                          <Badge className={getDifficultyColor(meal.difficulty)} variant="secondary">
                            {meal.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            {meal.calories} cal
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {meal.prepTime} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {meal.rating}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Nutrition Facts */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-sm mb-2">Nutrition per serving</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Carbs: {meal.nutritionFacts.carbs}g</div>
                            <div>Protein: {meal.nutritionFacts.protein}g</div>
                            <div>Fats: {meal.nutritionFacts.fats}g</div>
                            <div>Fiber: {meal.nutritionFacts.fiber}g</div>
                          </div>
                        </div>

                        {/* Ingredients */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Key Ingredients</h4>
                          <div className="flex flex-wrap gap-1">
                            {meal.ingredients.slice(0, 4).map((ingredient, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {ingredient}
                              </Badge>
                            ))}
                            {meal.ingredients.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{meal.ingredients.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1">
                            View Recipe
                          </Button>
                          <Button variant="outline" size="icon">
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}