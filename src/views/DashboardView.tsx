import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Booking, Appliance } from '../types';
import { motion } from 'motion/react';
import { Plus, Settings, ChevronRight, AlertCircle, CheckCircle2, Clock, Calendar, MessageSquare } from 'lucide-react';

const DashboardView: React.FC<{ setView: (v: string) => void }> = ({ setView }) => {
  const { profile } = useAuth();
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [appliancesCount, setAppliancesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch recent bookings
        const bQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', profile.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const bSnap = await getDocs(bQuery);
        const bList = bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setActiveBookings(bList);

        // Fetch appliances count
        const aQuery = query(
          collection(db, 'appliances'),
          where('ownerId', '==', profile.uid)
        );
        const aSnap = await getDocs(aQuery);
        setAppliancesCount(aSnap.size);
      } catch (error) {
        console.error("Dashboard data load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-8 pb-32">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FixIt</h1>
          <p className="text-slate-500">Welcome back, {profile?.displayName?.split(' ')[0]}</p>
        </div>
        <button className="p-3 bg-white rounded-full border border-slate-100 shadow-sm" id="btn-settings">
          <Settings size={20} className="text-slate-600" />
        </button>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
          id="stat-bookings"
        >
          <div className="text-3xl font-bold">{activeBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length}</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Active Bookings</div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
          id="stat-appliances"
        >
          <div className="text-3xl font-bold">{appliancesCount}</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">My Devices</div>
        </motion.div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Updates</h2>
          <button onClick={() => setView('bookings')} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">See all</button>
        </div>
        
        {activeBookings.length === 0 ? (
          <div className="card p-8 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Calendar className="text-slate-300" size={32} />
            </div>
            <div>
              <p className="font-medium">No recent bookings</p>
              <p className="text-sm text-slate-400">Need help with an appliance?</p>
            </div>
            <button 
              onClick={() => setView('bookings')}
              className="btn-primary w-full"
              id="btn-book-now"
            >
              Book Service
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBookings.map((booking) => (
              <div key={booking.id} className="card p-4 flex items-center justify-between card-hover" id={`booking-item-${booking.id}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${
                    booking.status === 'completed' ? 'bg-green-50 text-green-600' : 
                    booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {booking.status === 'completed' ? <CheckCircle2 size={24} /> : 
                     booking.status === 'cancelled' ? <AlertCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <div className="font-bold">{booking.serviceType}</div>
                    <div className="text-xs text-slate-400">
                      {booking.scheduledAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {booking.status}
                  </div>
                  <ChevronRight size={16} className="mt-2 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-[200px]">Our technicians are available 24/7 to assist you.</p>
          <button 
            onClick={() => setView('chat')}
            className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm"
            id="btn-chat-support"
          >
            Start Live Chat
          </button>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <MessageSquare size={160} />
        </div>
      </section>
    </div>
  );
};

export default DashboardView;
