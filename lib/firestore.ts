import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  CollectionReference
} from 'firebase/firestore';
import { db } from './firebase';
import {
  User,
  Diet,
  Consultation,
  Progress,
  Order,
  Post,
  Comment,
  Exercise,
  Food,
  Restaurant
} from './types';

// Generic CRUD operations
export const createDocument = async <T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getDocument = async <T>(
  collectionName: string,
  id: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
};

export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data as any);
};

export const deleteDocument = async (
  collectionName: string,
  id: string
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// User operations
export const createUser = async (
  userData: Omit<User, 'id' | 'createdAt'> & { adminCode?: string }
): Promise<string> => {
  return createDocument<User>('users', userData as any);
};

export const getUser = async (id: string): Promise<User | null> => {
  return getDocument<User>('users', id);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }
  return null;
};

export const getAllDoctors = async (): Promise<User[]> => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'doctor'),
    where('degreeVerified', '==', true),
    orderBy('name', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
};

export const getAllDoctorProfiles = async (): Promise<any[]> => {
  try {
    console.log('Querying doctorProfiles collection...');
    const q = query(
      collection(db, 'doctorProfiles'),
      where('isVerified', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    console.log('Query snapshot size:', querySnapshot.size);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Doctor profiles found:', results);
    return results;
  } catch (error) {
    console.error('Error in getAllDoctorProfiles:', error);
    throw error;
  }
};

export const getAllDoctorProfilesForAdmin = async (): Promise<any[]> => {
  try {
    console.log('Querying all doctorProfiles for admin...');
    const q = query(collection(db, 'doctorProfiles'));
    const querySnapshot = await getDocs(q);
    
    console.log('Admin query snapshot size:', querySnapshot.size);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('All doctor profiles found:', results);
    return results;
  } catch (error) {
    console.error('Error in getAllDoctorProfilesForAdmin:', error);
    throw error;
  }
};

export const getDoctorProfile = async (doctorId: string): Promise<any> => {
  const docRef = doc(db, 'doctorProfiles', doctorId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const getAllRestaurants = async (): Promise<Restaurant[]> => {
  const restaurantsQuery = query(
    collection(db, 'restaurants'),
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );
  const querySnapshot = await getDocs(restaurantsQuery);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as Restaurant[];
};

export const updateUser = async (
  id: string,
  data: Partial<User> & { adminCode?: string }
): Promise<void> => {
  return updateDocument('users', id, data as any);
};

// Diet operations
export const createDiet = async (dietData: Omit<Diet, 'id' | 'createdAt'>): Promise<string> => {
  return createDocument<Diet>('diets', dietData as any);
};

export const getDiets = async (): Promise<Diet[]> => {
  const q = query(collection(db, 'diets'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Diet[];
};

export const getDietsByUser = async (userId: string): Promise<Diet[]> => {
  const q = query(
    collection(db, 'diets'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Diet[];
};

export const updateDiet = async (id: string, data: Partial<Diet>): Promise<void> => {
  return updateDocument('diets', id, data);
};

// Consultation operations
export const createConsultation = async (
  consultationData: Omit<Consultation, 'id' | 'createdAt'>
): Promise<string> => {
  return createDocument<Consultation>('consultations', consultationData as any);
};

export const getConsultationsByUser = async (userId: string): Promise<Consultation[]> => {
  const q = query(
    collection(db, 'consultations'),
    where('patientId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  
  const items = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Consultation[];
  
  // Sort client-side to avoid composite index requirement
  return items.sort((a, b) => b.timeSlot.toMillis() - a.timeSlot.toMillis());
};

export const getConsultationsByDoctor = async (doctorId: string): Promise<Consultation[]> => {
  const q = query(
    collection(db, 'consultations'),
    where('doctorId', '==', doctorId)
  );
  const querySnapshot = await getDocs(q);
  
  const items = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Consultation[];
  
  // Sort client-side to avoid composite index requirement
  return items.sort((a, b) => b.timeSlot.toMillis() - a.timeSlot.toMillis());
};

export const updateConsultationStatus = async (
  id: string,
  status: Consultation['status']
): Promise<void> => {
  return updateDocument('consultations', id, { status });
};

// Progress operations
export const createProgress = async (progressData: Omit<Progress, 'id'>): Promise<string> => {
  return createDocument<Progress>('progress', progressData as any);
};

export const getUserProgress = async (userId: string): Promise<Progress[]> => {
  const q = query(
    collection(db, 'progress'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Progress[];
};

export const updateProgressStatus = async (
  id: string,
  status: Progress['status']
): Promise<void> => {
  return updateDocument('progress', id, { status });
};

// Order operations
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
  return createDocument<Order>('orders', orderData as any);
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Order[];
};

export const updateOrderStatus = async (
  id: string,
  status: Order['status']
): Promise<void> => {
  return updateDocument('orders', id, { status });
};

// Post operations
export const createPost = async (postData: Omit<Post, 'id' | 'createdAt'>): Promise<string> => {
  return createDocument<Post>('posts', postData as any);
};

export const getPosts = async (): Promise<Post[]> => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Post[];
};

export const getPost = async (id: string): Promise<Post | null> => {
  return getDocument<Post>('posts', id);
};

export const updatePost = async (id: string, data: Partial<Post>): Promise<void> => {
  return updateDocument('posts', id, data);
};

export const deletePost = async (id: string): Promise<void> => {
  return deleteDocument('posts', id);
};

// Comment operations
export const createComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<string> => {
  return createDocument<Comment>('comments', commentData as any);
};

export const getPostComments = async (postId: string): Promise<Comment[]> => {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comment[];
};

export const deleteComment = async (id: string): Promise<void> => {
  return deleteDocument('comments', id);
};

// Exercise operations
export const createExercise = async (exerciseData: Omit<Exercise, 'id'>): Promise<string> => {
  return createDocument<Exercise>('exercises', exerciseData as any);
};

export const getExercises = async (): Promise<Exercise[]> => {
  const q = query(collection(db, 'exercises'), orderBy('name', 'asc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Exercise[];
};

export const getExercise = async (id: string): Promise<Exercise | null> => {
  return getDocument<Exercise>('exercises', id);
};

// Food operations
export const createFood = async (foodData: Omit<Food, 'id'>): Promise<string> => {
  return createDocument<Food>('foods', foodData as any);
};

export const getFoods = async (): Promise<Food[]> => {
  const q = query(collection(db, 'foods'), orderBy('name', 'asc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Food[];
};

export const getFood = async (id: string): Promise<Food | null> => {
  return getDocument<Food>('foods', id);
};

// Real-time listeners
export const subscribeToCollection = <T>(
  collectionName: string,
  callback: (data: T[]) => void,
  constraints?: { field: string; operator: any; value: any }[]
) => {
  let q: any = collection(db, collectionName);
  
  if (constraints) {
    constraints.forEach(({ field, operator, value }) => {
      q = query(q, where(field, operator, value));
    });
  }

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as T[];
    callback(data);
  });
};

export const subscribeToDocument = <T>(
  collectionName: string,
  id: string,
  callback: (data: T | null) => void
) => {
  const docRef = doc(db, collectionName, id);
  
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = { id: snapshot.id, ...snapshot.data() } as T;
      callback(data);
    } else {
      callback(null);
    }
  });
};
