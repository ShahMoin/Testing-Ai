import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, Zap, Headphones, Clock } from 'lucide-react';

const LoginView: React.FC = () => {
  const { signIn } = useAuth();

  const features = [
    { icon: Zap, text: 'Fast repair booking' },
    { icon: Headphones, text: '24/7 expert support' },
    { icon: Clock, text: 'Track real-time status' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col justify-between overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[80%] aspect-square bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[80%] aspect-square bg-slate-400/10 blur-[120px] rounded-full pointer-events-none" />

      <header className="relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">FixIt Support</span>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold leading-[1.1] tracking-tighter"
        >
          Tech Help <br/> 
          <span className="text-slate-500">Is Near.</span>
        </motion.h1>
      </header>

      <div className="relative z-10 space-y-12">
        <div className="space-y-6">
          {features.map((f, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              key={i} 
              className="flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                <f.icon size={20} />
              </div>
              <span className="text-lg font-medium text-slate-300">{f.text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.8 }}
        >
          <button 
            onClick={signIn}
            className="w-full bg-white text-slate-900 p-6 rounded-[2rem] font-bold text-xl flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
            id="btn-google-signin"
          >
            <span>Sign in with Google</span>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <ArrowRight size={20} />
            </div>
          </button>
          <p className="text-center mt-6 text-slate-500 text-sm">
            By signing in, you agree to our <span className="underline">Terms of Service</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginView;
