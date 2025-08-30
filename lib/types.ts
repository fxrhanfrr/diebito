import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  age: number;
  weight: number;
  diabetesType?: string; // Optional for non-patients
  degreeUrl?: string; // For doctors - URL to uploaded degree certificate
  degreeVerified?: boolean; // For doctors - verification status
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
  items: FoodItem[];
  totalPrice: number;
  status: 'pending' | 'delivered';
  deliveryInfo: string;
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
}
