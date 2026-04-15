'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, Consultation, User } from '@/lib/types';
import { Banknote, Wallet, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const DOCTOR_CONSULTATION_RATE = 500; // Rs. 500 per consultation

export default function PayoutsDashboard() {
  const { profile } = useAuth();
  
  // States for self view
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingPayout, setPendingPayout] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for admin view
  const [adminPayoutGroups, setAdminPayoutGroups] = useState<any[]>([]);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    
    if (profile.role === 'admin') {
      loadAdminData();
    } else if (profile.role === 'restaurant_owner') {
      loadRestaurantData();
    } else if (profile.role === 'doctor') {
      loadDoctorData();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const loadRestaurantData = async () => {
    if (!profile) return;
    try {
      const restaurantId = profile.restaurantId || profile.id; // fallback
      const q = query(
        collection(db, 'orders'),
        where('restaurantId', '==', restaurantId),
        where('status', '==', 'delivered')
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      
      let total = 0;
      let pending = 0;
      const trans: any[] = [];

      orders.forEach(o => {
        total += o.total;
        if (!o.isPaid) {
          pending += o.total;
        }
        trans.push({
          id: o.id,
          date: o.createdAt?.toDate().toLocaleDateString() || 'N/A',
          amount: o.total,
          isPaid: !!o.isPaid,
          type: 'Order',
          description: `Order #${o.id.substring(0,6)}`
        });
      });

      setTotalEarned(total);
      setPendingPayout(pending);
      setTransactions(trans.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorData = async () => {
    if (!profile) return;
    try {
      const q = query(
        collection(db, 'consultations'),
        where('doctorId', '==', profile.id),
        where('status', '==', 'completed')
      );
      const snapshot = await getDocs(q);
      const consultations = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Consultation));
      
      let total = 0;
      let pending = 0;
      const trans: any[] = [];

      consultations.forEach(c => {
        total += DOCTOR_CONSULTATION_RATE;
        if (!c.isPaid) {
          pending += DOCTOR_CONSULTATION_RATE;
        }
        trans.push({
          id: c.id,
          date: c.timeSlot?.toDate().toLocaleDateString() || 'N/A',
          amount: DOCTOR_CONSULTATION_RATE,
          isPaid: !!c.isPaid,
          type: 'Consultation',
          description: `Consultation #${c.id.substring(0,6)}`
        });
      });

      setTotalEarned(total);
      setPendingPayout(pending);
      setTransactions(trans.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      // Load Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const users: Record<string, any> = {};
      usersSnap.docs.forEach(d => {
        users[d.id] = { id: d.id, ...d.data() };
      });

      // Load Orders
      const ordersQ = query(collection(db, 'orders'), where('status', '==', 'delivered'));
      const ordersSnap = await getDocs(ordersQ);
      
      // Load Consultations
      const consultsQ = query(collection(db, 'consultations'), where('status', '==', 'completed'));
      const consultsSnap = await getDocs(consultsQ);

      const grouped: Record<string, any> = {};

      // Group Orders
      ordersSnap.docs.forEach(doc => {
        const order = { id: doc.id, ...doc.data() } as Order;
        // In this architecture, restaurantId is usually the ownerId
        const ownerId = order.restaurantId; 
        if (!grouped[ownerId]) {
          grouped[ownerId] = { userId: ownerId, user: users[ownerId], pendingAmount: 0, totalAmount: 0, unpaidDocs: [] };
        }
        
        grouped[ownerId].totalAmount += order.total;
        if (!order.isPaid) {
          grouped[ownerId].pendingAmount += order.total;
          grouped[ownerId].unpaidDocs.push({ collection: 'orders', id: order.id });
        }
      });

      // Group Consultations
      consultsSnap.docs.forEach(doc => {
        const c = { id: doc.id, ...doc.data() } as Consultation;
        const ownerId = c.doctorId;
        if (!grouped[ownerId]) {
          grouped[ownerId] = { userId: ownerId, user: users[ownerId], pendingAmount: 0, totalAmount: 0, unpaidDocs: [] };
        }
        
        grouped[ownerId].totalAmount += DOCTOR_CONSULTATION_RATE;
        if (!c.isPaid) {
          grouped[ownerId].pendingAmount += DOCTOR_CONSULTATION_RATE;
          grouped[ownerId].unpaidDocs.push({ collection: 'consultations', id: c.id });
        }
      });

      setAdminPayoutGroups(Object.values(grouped).filter(g => g.user));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSettlePayout = async (userId: string, unpaidDocs: any[]) => {
    if (!confirm(`Are you sure you want to mark these transactions as paid?`)) return;
    setProcessingPayoutId(userId);

    try {
      // Use chunks to batch update since max batch size is 500
      const batch = writeBatch(db);
      unpaidDocs.forEach(docRef => {
        const ref = doc(db, docRef.collection, docRef.id);
        batch.update(ref, { isPaid: true });
      });
      await batch.commit();

      // Optimistically update
      setAdminPayoutGroups(prev => prev.map(g => {
        if (g.userId === userId) {
          return { ...g, pendingAmount: 0, unpaidDocs: [] };
        }
        return g;
      }));
      alert('Payout recorded successfully!');
    } catch(e) {
      console.error(e);
      alert('Failed to process payout.');
    } finally {
      setProcessingPayoutId(null);
    }
  };

  if (!profile || profile.role === 'patient') {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
        You do not have permission to view this page.
      </div>
    );
  }

  if (loading) {
    return (
       <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
       </div>
    );
  }

  // ==== ADMIN VIEW ==== //
  if (profile.role === 'admin') {
    return (
      <AuthGuard>
        <div className="page-container bg-page">
          <div className="max-w-[1200px] mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Payout Management System</h1>
            <p className="text-gray-600 mb-8">Settle outstanding balances for doctors and restaurant owners.</p>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Banknote className="mr-2 h-5 w-5"/> Partner Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Total Earned</TableHead>
                        <TableHead>Pending Payout</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminPayoutGroups.map((group) => (
                        <TableRow key={group.userId}>
                          <TableCell className="font-semibold">{group.user.name}</TableCell>
                          <TableCell className="capitalize">
                            <Badge variant="outline">{group.user.role.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>₹{group.totalAmount.toFixed(2)}</TableCell>
                          <TableCell className={group.pendingAmount > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                            ₹{group.pendingAmount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              onClick={() => handleSettlePayout(group.userId, group.unpaidDocs)}
                              disabled={group.pendingAmount === 0 || processingPayoutId === group.userId}
                              className={group.pendingAmount > 0 ? "bg-green-600 hover:bg-green-700" : "bg-gray-300"}
                            >
                              {processingPayoutId === group.userId ? "Processing..." : "Settle Payout"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {adminPayoutGroups.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            No data available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // ==== OWNER & DOCTOR VIEW ==== //
  return (
    <AuthGuard>
      <div className="page-container bg-page">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Earnings Dashboard</h1>
          <p className="text-gray-600 mb-8">Track your completed {profile.role === 'doctor' ? 'consultations' : 'orders'} and payouts.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <Wallet className="w-5 h-5 mr-3"/>
                    Total Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-blue-900">₹{totalEarned.toFixed(2)}</div>
                  <p className="text-sm mt-3 text-blue-700 font-medium">Lifetime cumulative earnings</p>
                </CardContent>
             </Card>

             <Card className="bg-gradient-to-br from-red-50 to-orange-100 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-800">
                    <Clock className="w-5 h-5 mr-3"/>
                    Pending Payout
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-red-600">₹{pendingPayout.toFixed(2)}</div>
                  <p className="text-sm mt-3 text-red-800 font-medium">Waiting to be settled by Admin</p>
                </CardContent>
             </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Records of your completed services and their payout status.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{t.date}</TableCell>
                      <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                      <TableCell className="text-gray-600">{t.description}</TableCell>
                      <TableCell className="font-semibold">₹{t.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {t.isPaid ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 shadow-none"><CheckCircle className="w-3 h-3 mr-1"/> Paid</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 shadow-none"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                        No completed transactions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
