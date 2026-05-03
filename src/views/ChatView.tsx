import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, doc, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Message, Conversation } from '../types';
import { Send, Image as ImageIcon, CheckCircle2, User, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ChatView: React.FC = () => {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;

    // Get or create conversation
    const setupChat = async () => {
      try {
        const q = query(collection(db, 'conversations'), where('userId', '==', profile.uid));
        const snap = await getDocs(q);
        
        let convId: string;
        if (snap.empty) {
          const newConv = await addDoc(collection(db, 'conversations'), {
            userId: profile.uid,
            participants: [profile.uid, 'support-agent'], // Mock agent ID for now
            status: 'active',
            lastMessageAt: serverTimestamp()
          });
          convId = newConv.id;
        } else {
          convId = snap.docs[0].id;
          setConversation({ id: convId, ...snap.docs[0].data() } as Conversation);
        }

        // Listen for messages
        const msgQuery = query(
          collection(db, `conversations/${convId}/messages`),
          orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(msgQuery, (s) => {
          setMessages(s.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
          setLoading(false);
          // Scroll to bottom
          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, (err) => handleFirestoreError(err, OperationType.GET, `conversations/${convId}/messages`));

        return () => unsubscribe();
      } catch (e) {
        console.error(e);
      }
    };

    setupChat();
  }, [profile]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversation) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, `conversations/${conversation.id}/messages`), {
        senderId: profile?.uid,
        text: text,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'conversations', conversation.id), {
        lastMessage: text,
        lastMessageAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `conversations/${conversation.id}/messages`);
    }
  };

  if (loading) return <div className="p-8 text-center">Connecting to support...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] pb-32">
      <header className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
          <Headset size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Live Support</h1>
          <p className="text-xs text-green-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Online
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === profile?.uid;
          const showAvatar = idx === 0 || messages[idx-1].senderId !== msg.senderId;
          
          return (
            <motion.div 
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={msg.id} 
              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-3xl ${
                isMe ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-100'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                  {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="fixed bottom-24 left-4 right-4 sm:relative sm:bottom-0 sm:left-0 sm:right-0">
        <form onSubmit={handleSend} className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-lg flex items-center gap-2">
          <button type="button" className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
            <ImageIcon size={20} />
          </button>
          <input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your issue..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
            id="input-chat"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="p-3 bg-slate-900 text-white rounded-2xl disabled:bg-slate-200 transition-colors shadow-sm"
            id="btn-send-chat"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
