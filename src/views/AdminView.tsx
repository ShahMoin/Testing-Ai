import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, updateDoc, doc, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Booking, Conversation } from '../types';
import { motion } from 'motion/react';
import { Shield, Clock, CheckCircle, XCircle, User, MessageSquare } from 'lucide-react';

const AdminView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'chats'>('bookings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for all bookings
    const bQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubB = onSnapshot(bQuery, (s) => {
      setBookings(s.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
      setLoading(false);
    });

    // Listen for all active conversations
    const cQuery = query(collection(db, 'conversations'), where('status', '==', 'active'));
    const unsubC = onSnapshot(cQuery, (s) => {
      setConversations(s.docs.map(d => ({ id: d.id, ...d.data() } as Conversation)));
    });

    return () => {
      unsubB();
      unsubC();
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status, updatedAt: new Date() });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading admin panel...</div>;

  return (
    <div className="space-y-6 pb-32">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <Shield size={20} />
        </div>
        <h1 className="text-2xl font-bold">Admin Console</h1>
      </header>

      <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-100">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Bookings ({bookings.length})
        </button>
        <button 
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'chats' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Active Chats ({conversations.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'bookings' && (
          bookings.map((booking) => (
            <div key={booking.id} className="card p-5 space-y-4 shadow-sm border-l-4 border-l-slate-900" id={`admin-booking-${booking.id}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{booking.serviceType}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <User size={12} />
                    <span>UID: {booking.userId.slice(0, 8)}...</span>
                  </div>
                </div>
                <div className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${
                  booking.status === 'completed' ? 'bg-green-100 text-green-700' : 
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {booking.status}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">{booking.description || 'No description provided.'}</p>

              <div className="flex gap-2 pt-2">
                {booking.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(booking.id, 'confirmed')}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} /> Confirm
                  </button>
                )}
                {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                  <button 
                    onClick={() => updateStatus(booking.id, 'completed')}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} /> Complete
                  </button>
                )}
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <button 
                    onClick={() => updateStatus(booking.id, 'cancelled')}
                    className="flex-1 py-3 bg-white text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {activeTab === 'chats' && (
          conversations.map((conv) => (
            <div key={conv.id} className="card p-5 flex items-center justify-between card-hover" id={`admin-chat-${conv.id}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-bold">User #{conv.userId.slice(0, 5)}...</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[150px]">{conv.lastMessage || 'Starting conversation...'}</p>
                </div>
              </div>
              <button className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                <Shield size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminView;
