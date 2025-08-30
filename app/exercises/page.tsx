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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createExercise, getExercises } from '@/lib/firestore';
import { Exercise } from '@/lib/types';
import { Plus, Activity, Clock, Target, Zap } from 'lucide-react';

export default function ExercisesPage() {
  const { user } = useUser();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    type: 'cardio' as Exercise['type'],
    duration: 0,
    difficulty: 'beginner' as Exercise['difficulty'],
    imageUrl: ''
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const exercisesData = await getExercises();
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async () => {
    try {
      await createExercise(newExercise);
      
      setNewExercise({
        name: '',
        description: '',
        type: 'cardio',
        duration: 0,
        difficulty: 'beginner',
        imageUrl: ''
      });
      
      setIsDialogOpen(false);
      loadExercises();
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('Failed to create exercise');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cardio': return 'bg-blue-100 text-blue-800';
      case 'strength': return 'bg-purple-100 text-purple-800';
      case 'flexibility': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Exercise Programs</h1>
            <p className="mt-2 text-gray-600">
              Discover and track exercise routines designed for diabetes management
            </p>
          </div>
          
          {user?.role === 'doctor' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Exercise</DialogTitle>
                  <DialogDescription>
                    Create a new exercise routine for patients
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Exercise Name</Label>
                    <Input
                      id="name"
                      value={newExercise.name}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Morning Walk"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newExercise.description}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the exercise routine..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Exercise Type</Label>
                      <Select
                        value={newExercise.type}
                        onValueChange={(value) => setNewExercise(prev => ({ ...prev, type: value as Exercise['type'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardio">Cardio</SelectItem>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="flexibility">Flexibility</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={newExercise.difficulty}
                        onValueChange={(value) => setNewExercise(prev => ({ ...prev, difficulty: value as Exercise['difficulty'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newExercise.duration}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      placeholder="30"
                      min="5"
                      max="180"
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      value={newExercise.imageUrl}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateExercise}>
                      Add Exercise
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Exercises Grid */}
        {exercises.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises available</h3>
              <p className="text-gray-600 mb-4">
                {user?.role === 'doctor' 
                  ? 'Start by adding some exercise routines for your patients'
                  : 'Check back later for exercise programs'
                }
              </p>
              {user?.role === 'doctor' && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Exercise
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <div className="flex space-x-2 mt-1">
                          <Badge className={getTypeColor(exercise.type)}>
                            {exercise.type}
                          </Badge>
                          <Badge className={getDifficultyColor(exercise.difficulty)}>
                            {exercise.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {exercise.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Exercise Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{exercise.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-gray-500" />
                      <span>{exercise.type}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    {user?.role === 'patient' && (
                      <Button className="flex-1">
                        Start Exercise
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
  );
}