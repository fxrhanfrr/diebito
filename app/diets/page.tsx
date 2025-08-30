'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createDiet, getDiets, getDietsByUser } from '@/lib/firestore';
import { Diet } from '@/lib/types';
import { Plus, Utensils, Calendar, Target } from 'lucide-react';

export default function DietsPage() {
  const { user } = useUser();
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDiet, setNewDiet] = useState({
    meals: [''],
    nutritionStats: {
      calories: 0,
      carbs: 0,
      protein: 0,
      sugar: 0
    }
  });

  useEffect(() => {
    loadDiets();
  }, []);

  const loadDiets = async () => {
    try {
      if (user) {
        const dietsData = await getDietsByUser(user.id);
        setDiets(dietsData);
      }
    } catch (error) {
      console.error('Error loading diets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiet = async () => {
    if (!user) return;

    try {
      await createDiet({
        ...newDiet,
        userId: user.id
      });
      
      setNewDiet({
        meals: [''],
        nutritionStats: {
          calories: 0,
          carbs: 0,
          protein: 0,
          sugar: 0
        }
      });
      
      setIsDialogOpen(false);
      loadDiets();
    } catch (error) {
      console.error('Error creating diet:', error);
      alert('Failed to create diet plan');
    }
  };

  const addMeal = () => {
    setNewDiet(prev => ({
      ...prev,
      meals: [...prev.meals, '']
    }));
  };

  const removeMeal = (index: number) => {
    setNewDiet(prev => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index)
    }));
  };

  const updateMeal = (index: number, value: string) => {
    setNewDiet(prev => ({
      ...prev,
      meals: prev.meals.map((meal, i) => i === index ? value : meal)
    }));
  };

  const updateNutrition = (field: string, value: string) => {
    setNewDiet(prev => ({
      ...prev,
      nutritionStats: {
        ...prev.nutritionStats,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Diet Plans</h1>
            <p className="mt-2 text-gray-600">
              Manage your personalized diet plans and nutrition goals
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Diet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Diet Plan</DialogTitle>
                <DialogDescription>
                  Add meals and set nutrition targets for your new diet plan
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Meals */}
                <div>
                  <Label className="text-base font-medium">Meals</Label>
                  <div className="space-y-3 mt-2">
                    {newDiet.meals.map((meal, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          placeholder={`Meal ${index + 1}`}
                          value={meal}
                          onChange={(e) => updateMeal(index, e.target.value)}
                        />
                        {newDiet.meals.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMeal(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addMeal}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Meal
                    </Button>
                  </div>
                </div>

                {/* Nutrition Stats */}
                <div>
                  <Label className="text-base font-medium">Nutrition Targets (per day)</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={newDiet.nutritionStats.calories}
                        onChange={(e) => updateNutrition('calories', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={newDiet.nutritionStats.carbs}
                        onChange={(e) => updateNutrition('carbs', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={newDiet.nutritionStats.protein}
                        onChange={(e) => updateNutrition('protein', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sugar">Sugar (g)</Label>
                      <Input
                        id="sugar"
                        type="number"
                        value={newDiet.nutritionStats.sugar}
                        onChange={(e) => updateNutrition('sugar', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDiet}>
                    Create Diet Plan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Diets Grid */}
        {diets.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Utensils className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No diet plans yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first diet plan to get started with healthy eating
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Diet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diets.map((diet) => (
              <Card key={diet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Diet Plan</CardTitle>
                    <Badge variant="secondary">
                      {diet.meals.length} meals
                    </Badge>
                  </div>
                  <CardDescription>
                    Created on {diet.createdAt.toDate().toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Meals */}
                  <div>
                    <h4 className="font-medium mb-2">Meals</h4>
                    <div className="space-y-1">
                      {diet.meals.map((meal, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{meal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition Stats */}
                  <div>
                    <h4 className="font-medium mb-2">Daily Targets</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-red-500" />
                        <span>{diet.nutritionStats.calories} cal</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>{diet.nutritionStats.carbs}g carbs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-green-500" />
                        <span>{diet.nutritionStats.protein}g protein</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-yellow-500" />
                        <span>{diet.nutritionStats.sugar}g sugar</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}