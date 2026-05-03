import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Booking, Appliance } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar as CalIcon, ChevronRight, Clock, MapPin, Wrench } from 'lucide-react';

const BookingsView: React.FC = () => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [formData, setFormData] = useState({
    applianceId: '',
    serviceType: 'Repair',
    scheduledAt: '',
    description: ''
  });

  useEffect(() => {
    if (!profile) return;
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      const bQuery = query(collection(db, 'bookings'), where('userId', '==', profile?.uid), orderBy('createdAt', 'desc'));
      const bSnap = await getDocs(bQuery);
      setBookings(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));

      const aQuery = query(collection(db, 'appliances'), where('ownerId', '==', profile?.uid));
      const aSnap = await getDocs(aQuery);
      const aList = aSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appliance));
      setAppliances(aList);
      if (aList.length > 0) setFormData(prev => ({ ...prev, applianceId: aList[0].id }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await addDoc(collection(db, 'bookings'), {
        userId: profile.uid,
        applianceId: formData.applianceId,
        serviceType: formData.serviceType,
        description: formData.description,
        scheduledAt: Timestamp.fromDate(new Date(formData.scheduledAt)),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsBooking(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Error booking service. Please ensure you have registered the appliance first.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading bookings...</div>;

  return (
    <div className="space-y-6 pb-32">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <button 
          onClick={() => setIsBooking(true)}
          className="btn-primary"
          id="btn-new-booking"
        >
          Book Now
        </button>
      </header>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">
            No service history yet.
          </div>
        ) : (
          bookings.map((booking) => (
            <motion.div 
              layout
              key={booking.id}
              className="card p-5 space-y-4"
              id={`booking-${booking.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-xl text-slate-900">
                    <CalIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{booking.serviceType}</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reference: #{booking.id.slice(0, 8)}</p>
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

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50/50 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={16} />
                  <span>{booking.scheduledAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Wrench size={16} />
                  <span className="truncate">{appliances.find(a => a.id === booking.applianceId)?.brand || 'Device'}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isBooking && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              id="modal-booking"
            >
              <h2 className="text-2xl font-bold">Schedule Service</h2>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Appliance</label>
                  <select 
                    required
                    value={formData.applianceId}
                    onChange={(e) => setFormData({ ...formData, applianceId: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-slate-900"
                    id="select-appliance"
                  >
                    {appliances.map(a => (
                      <option key={a.id} value={a.id}>{a.brand} - {a.type}</option>
                    ))}
                    {appliances.length === 0 && <option disabled>Register an appliance first</option>}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Service Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Repair', 'Maintenance', 'Installation', 'Consultation'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, serviceType: type as any })}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.serviceType === type ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Date & Time</label>
                  <input 
                    required
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-slate-900"
                    id="input-datetime"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Briefly describe the problem..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-slate-900 resize-none"
                    id="input-description"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsBooking(false)} className="btn-secondary flex-1">Cancel</button>
                  <button 
                    type="submit" 
                    className="btn-primary flex-1" 
                    disabled={appliances.length === 0}
                    id="btn-confirm-booking"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingsView;
