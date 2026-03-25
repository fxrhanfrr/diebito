import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
    const restaurants = restaurantsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      ownerId: doc.data().ownerId,
    }));

    const foodsSnapshot = await getDocs(collection(db, 'foods'));
    const foods = foodsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      restaurantId: doc.data().restaurantId,
      ownerId: doc.data().ownerId,
    }));

    return NextResponse.json({ restaurants, foods });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
