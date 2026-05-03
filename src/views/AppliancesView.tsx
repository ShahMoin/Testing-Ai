import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Appliance } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Smartphone, Monitor, Tv, Laptop, WashingMachine as WashIcon, Refrigerator, Wind, Music, MoreVertical } from 'lucide-react';

const ApplianceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'AC': return <Wind />;
    case 'Refrigerator': return <Refrigerator />;
    case 'Washing Machine': return <WashIcon />;
    case 'TV': return <Tv />;
    case 'Other': return <Monitor />;
    default: return <Smartphone />;
  }
};

const AppliancesView: React.FC = () => {
  const { profile } = useAuth();
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    type: 'AC',
    brand: '',
    model: '',
    purchaseDate: ''
  });

  useEffect(() => {
    if (!profile) return;
    fetchAppliances();
  }, [profile]);

  const fetchAppliances = async () => {
    try {
      const q = query(collection(db, 'appliances'), where('ownerId', '==', profile?.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appliance));
      setAppliances(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await addDoc(collection(db, 'appliances'), {
        ...formData,
        ownerId: profile.uid,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({ type: 'AC', brand: '', model: '', purchaseDate: '' });
      fetchAppliances();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this device?')) {
      await deleteDoc(doc(db, 'appliances', id));
      fetchAppliances();
    }
  };

  if (loading) return <div className="p-8 text-center">Loading devices...</div>;

  return (
    <div className="space-y-6 pb-32">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm hover:scale-105 transition-transform"
          id="btn-add-device"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="grid gap-4">
        {appliances.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">
            No devices registered yet.
          </div>
        ) : (
          appliances.map((item) => (
            <motion.div 
              layout
              key={item.id}
              className="card p-6 flex items-center justify-between"
              id={`device-${item.id}`}
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-900">
                  <ApplianceIcon type={item.type} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.brand || 'No Name'}</h3>
                  <p className="text-sm text-slate-500">{item.type} • {item.model || 'Unknown Model'}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                id={`btn-delete-${item.id}`}
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
              id="modal-add-device"
            >
              <h2 className="text-2xl font-bold">Add Appliance</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Appliance Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-slate-900"
                    id="input-type"
                  >
                    <option>AC</option>
                    <option>Refrigerator</option>
                    <option>Washing Machine</option>
                    <option>Dishwasher</option>
                    <option>Microwave</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand</label>
                    <input 
                      required
                      placeholder="e.g. LG"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-slate-900"
                      id="input-brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Model</label>
                    <input 
                      placeholder="e.g. ThinQ V2"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-slate-900"
                      id="input-model"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1" id="btn-save-device">Save Device</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppliancesView;
