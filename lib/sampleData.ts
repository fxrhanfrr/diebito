import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const addSampleMenuItems = async (restaurantId: string) => {
  const sampleItems = [
    {
      name: 'Grilled Chicken Salad',
      category: 'lunch',
      price: 150,
      nutritionPer100g: {
        calories: 120,
        carbs: 8,
        protein: 15,
        sugar: 3,
        fat: 4
      },
      description: 'Fresh mixed greens with grilled chicken breast, cherry tomatoes, and olive oil dressing',
      restaurantId,
      isActive: true,
      createdAt: serverTimestamp()
    },
    {
      name: 'Quinoa Power Bowl',
      category: 'lunch',
      price: 120,
      nutritionPer100g: {
        calories: 180,
        carbs: 25,
        protein: 8,
        sugar: 5,
        fat: 6
      },
      description: 'Nutrient-rich quinoa with roasted vegetables and tahini dressing',
      restaurantId,
      isActive: true,
      createdAt: serverTimestamp()
    },
    {
      name: 'Diabetic-Friendly Soup',
      category: 'dinner',
      price: 80,
      nutritionPer100g: {
        calories: 60,
        carbs: 8,
        protein: 4,
        sugar: 2,
        fat: 1
      },
      description: 'Low-sodium vegetable soup perfect for diabetes management',
      restaurantId,
      isActive: true,
      createdAt: serverTimestamp()
    },
    {
      name: 'Oatmeal with Berries',
      category: 'breakfast',
      price: 90,
      nutritionPer100g: {
        calories: 140,
        carbs: 22,
        protein: 6,
        sugar: 8,
        fat: 3
      },
      description: 'Steel-cut oats with fresh berries and a touch of honey',
      restaurantId,
      isActive: true,
      createdAt: serverTimestamp()
    },
    {
      name: 'Greek Yogurt Parfait',
      category: 'breakfast',
      price: 70,
      nutritionPer100g: {
        calories: 100,
        carbs: 12,
        protein: 8,
        sugar: 6,
        fat: 2
      },
      description: 'Low-fat Greek yogurt with nuts and seeds',
      restaurantId,
      isActive: true,
      createdAt: serverTimestamp()
    }
  ];

  try {
    const promises = sampleItems.map(item => 
      addDoc(collection(db, 'foods'), item)
    );
    await Promise.all(promises);
    console.log('Sample menu items added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample menu items:', error);
    return false;
  }
};
