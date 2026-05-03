import React from 'react';
import { Home, Calendar, Monitor, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
  isAdmin: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isAdmin }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'appliances', icon: Monitor, label: 'Devices' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'chat', icon: MessageSquare, label: 'Support' },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 pb-8 z-50">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className="relative flex flex-col items-center gap-1 group"
              id={`nav-tab-${tab.id}`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-1 h-1 bg-slate-900 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
