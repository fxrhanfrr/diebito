import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'restaurant_owner';
  age?: number;
  weight?: number;
  diabetesType?: string; // Optional for non-patients
  degreeUrl?: string; // For doctors - URL to uploaded degree certificate
  degreeVerified?: boolean; // For doctors - verification status
  restaurantId?: string; // For restaurant owners - reference to their restaurant
  createdAt: Timestamp;
}

export interface Diet {
  id: string;
  userId: string;
  meals: string[];
  nutritionStats: {
    calories: number;
    carbs: number;
    protein: number;
    sugar: number;
  };
  createdAt: Timestamp;
}

export interface Consultation {
  id: string;
  doctorId: string;
  patientId: string;
  timeSlot: Timestamp;
  status: 'pending' | 'confirmed' | 'completed';
  prescriptionLink: string;
  createdAt: Timestamp;
}

export interface Progress {
  id: string;
  userId: string;
  exerciseId: string;
  date: Timestamp;
  status: 'completed' | 'skipped';
}

export interface FoodItem {
  foodId: string;
  qty: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: FoodItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryInfo: string;
  contactName?: string;
  contactPhone?: string;
  createdAt: Timestamp;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  comment: string;
  createdAt: Timestamp;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  type: 'cardio' | 'strength' | 'flexibility';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
}

export interface Food {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  nutritionPer100g: {
    calories: number;
    carbs: number;
    protein: number;
    sugar: number;
    fat: number;
  };
  imageUrl?: string;
  price?: number;
  restaurantId?: string; // Reference to the restaurant that serves this food
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  ownerId: string; // Reference to the restaurant owner user
  imageUrl?: string;
  rating?: number;
  isActive: boolean; // Admin can activate/deactivate restaurants
  specialties: string[]; // e.g., ["diabetic-friendly", "low-carb", "organic"]
  deliveryRadius: number; // in kilometers
  deliveryFee: number;
  minimumOrder: number;
  operatingHours: {
    [key: string]: { // day of week
      open: string; // "09:00"
      close: string; // "22:00"
      isOpen: boolean;
    };
  };
  createdAt: Timestamp;
}
