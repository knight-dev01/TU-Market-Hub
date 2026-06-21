import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../firebase';
import { ChatThread, ChatMessage, Product } from '../types';
import { Send, MessageSquare, Bell, Mail, Compass, HelpCircle, Check, ShieldCheck, Volume2, UserCheck, LogIn, Sparkles } from 'lucide-react';

interface MarketplaceChatProps {
  currentUser: FirebaseUser | null;
  onLoginClick: () => void;
  // If activeProduct is provided, we are in Shopper Mode (specific to a product chat)
  activeProduct?: Product | null;
  // If in Vendor Mode (dashboard), we show a thread inbox of all chats targeting the vendor
  isVendorDashboard?: boolean;
}

export default function MarketplaceChat({
  currentUser,
  onLoginClick,
  activeProduct,
  isVendorDashboard = false
}: MarketplaceChatProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  // Notifications Settings
  const [browserNotificationsGranted, setBrowserNotificationsGranted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [emailAlertsDispatched, setEmailAlertsDispatched] = useState<string[]>([]);
  const [showStatusAlert, setShowStatusAlert] = useState<string | null>(null);

  // Audio Beep generator utilizing standard browser Web Audio API (no external asset needed)
  const playBeep = () => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 523.25; // High C pitch
      gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio feedback context not allowed yet:', e);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Check Browser Desktop Notification Permissions
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserNotificationsGranted(Notification.permission === 'granted');
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Desktop system notifications are not supported in this browser version.');
      return;
    }
    const permission = await Notification.requestPermission();
    setBrowserNotificationsGranted(permission === 'granted');
    if (permission === 'granted') {
      setShowStatusAlert('🔔 Awesome! Real-time background system notifications enabled.');
      new Notification('TU Market Hub', {
        body: 'Real-time alert engine activated! You will receive system popups for incoming student offers even when minimized.',
        icon: activeProduct?.images[0] || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&q=80&w=120'
      });
      setTimeout(() => setShowStatusAlert(null), 5000);
    } else {
      alert('Background screen alerts were declined. You can enable them anytime from your browser site settings bar!');
    }
  };

  // 2. Fetch/Listen logic for threads depending on Mode (Shopper vs Vendor)
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let threadsQuery;

    if (isVendorDashboard) {
      // In Vendor Mode: listen for chats targeting this vendor (or admins, if currentUser is admin)
      threadsQuery = query(
        collection(db, 'chats'),
        where('vendorId', '==', currentUser.uid),
        orderBy('lastMessageAt', 'desc')
      );
    } else if (activeProduct) {
      // In Shopper Mode: seek active single thread specific to this shopper + product
      threadsQuery = query(
        collection(db, 'chats'),
        where('shopperId', '==', currentUser.uid),
        where('productId', '==', activeProduct.id)
      );
    } else {
      // General threads where currentUser is Shopper
      threadsQuery = query(
        collection(db, 'chats'),
        where('shopperId', '==', currentUser.uid),
        orderBy('lastMessageAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(threadsQuery, (snapshot) => {
      const list: ChatThread[] = [];
      snapshot.forEach((snapshotDoc) => {
        list.push({ id: snapshotDoc.id, ...snapshotDoc.data() } as ChatThread);
      });
      setThreads(list);
      setLoading(false);

      // In Shopper mode with single listing, auto select or construct state
      if (!isVendorDashboard && activeProduct) {
        if (list.length > 0) {
          setActiveThread(list[0]);
        } else {
          // Setup a temporary structural thread to display blank dialog
          setActiveThread({
            id: `${currentUser.uid}_${activeProduct.id}`,
            productId: activeProduct.id,
            productName: activeProduct.name,
            productImage: activeProduct.images[0] || '',
            shopperId: currentUser.uid,
            shopperName: currentUser.displayName || currentUser.email || 'Shopper',
            shopperEmail: currentUser.email || '',
            vendorId: activeProduct.vendorId || 'admin',
            vendorName: activeProduct.vendorName || 'TU MARKET HUB Seller',
            lastMessage: '(Start conversation with verification message below)',
            lastMessageAt: null,
            unreadByVendor: false,
            unreadByShopper: false,
            createdAt: null
          });
        }
      } else if (isVendorDashboard && list.length > 0 && !activeThread) {
        // Auto select first thread in dashboard
        setActiveThread(list[0]);
      }
    }, (error) => {
      console.warn('Firestore active chat sync failed:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, activeProduct, isVendorDashboard]);

  // 3. Listen to messages for the active selected chat thread
  useEffect(() => {
    if (!activeThread?.id) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', activeThread.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const list: ChatMessage[] = [];
      let hasNewMessage = false;

      snapshot.forEach((snapshotDoc) => {
        const msg = { id: snapshotDoc.id, ...snapshotDoc.data() } as ChatMessage;
        list.push(msg);
        
        // Audio notification rule: if a new message is received from other party
        if (msg.senderId !== currentUser?.uid && snapshot.metadata.hasPendingWrites === false) {
          hasNewMessage = true;
        }
      });

      setMessages(list);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      if (hasNewMessage) {
        playBeep();
        
        // Dispatch background/foreground browser-level notification alert if allowed
        const lastMsg = list[list.length - 1];
        if (Notification.permission === 'granted' && document.hidden) {
          new Notification(`TU Chat Alert from ${lastMsg.senderName}`, {
            body: lastMsg.text,
            icon: activeThread.productImage || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&q=80&w=120'
          });
        }
      }

      // Automatically reset unread badging status on view
      if (activeThread.id && currentUser) {
        const chatDocRef = doc(db, 'chats', activeThread.id);
        if (isVendorDashboard && activeThread.unreadByVendor) {
          setDoc(chatDocRef, { unreadByVendor: false }, { merge: true });
        } else if (!isVendorDashboard && activeThread.unreadByShopper) {
          setDoc(chatDocRef, { unreadByShopper: false }, { merge: true });
        }
      }
    }, (error) => {
      console.warn('Syncing thread messages failed gracefully:', error);
    });

    return () => unsubscribe();
  }, [activeThread?.id, currentUser, isVendorDashboard]);

  // 4. Send Message and Trigger simulated Mail alerting mechanism
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeThread || !newMessageText.trim()) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');

    const threadId = activeThread.id;
    const isVendor = isVendorDashboard;

    try {
      // Add message document
      await addDoc(collection(db, 'messages'), {
        chatId: threadId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        text: textToSend,
        createdAt: serverTimestamp()
      });

      // Update parent Chat Thread meta
      const threadRef = doc(db, 'chats', threadId);
      await setDoc(threadRef, {
        id: threadId,
        productId: activeThread.productId,
        productName: activeThread.productName,
        productImage: activeThread.productImage,
        shopperId: activeThread.shopperId,
        shopperName: activeThread.shopperName,
        shopperEmail: activeThread.shopperEmail,
        vendorId: activeThread.vendorId,
        vendorName: activeThread.vendorName,
        lastMessage: textToSend,
        lastMessageAt: serverTimestamp(),
        unreadByVendor: !isVendor, // set to unread by vendor if shopper is typing
        unreadByShopper: isVendor, // set to unread by shopper if vendor is typing
        updatedAt: serverTimestamp(),
        ...(activeThread.createdAt ? {} : { createdAt: serverTimestamp() })
      }, { merge: true });

      // TRIGGER MOCK/SIMULATED OFFLINE DISPATCH: "maybe through their mails"
      // If the shopper was the sender, alert the offline student vendor email
      if (!isVendor) {
        const destEmail = activeThread.shopperEmail === currentUser.email ? 'vendor@trinityuniversity.edu' : activeThread.shopperEmail;
        const msgId = `${threadId}_${Date.now()}`;
        
        setEmailAlertsDispatched(prev => [...prev, msgId]);
        setShowStatusAlert(`📬 Live Notice: Email alert transmitted to ${activeThread.vendorName || 'Vendor'} via peer notify queue!`);
        setTimeout(() => setShowStatusAlert(null), 5000);
      } else {
        // If the vendor was the sender, notify the shopper on their private Google mail too
        const destEmail = activeThread.shopperEmail || 'buyer@trinityuniversity.edu';
        const msgId = `${threadId}_${Date.now()}`;
        
        setEmailAlertsDispatched(prev => [...prev, msgId]);
        setShowStatusAlert(`📬 Live Notice: Off-app response alert dispatch dispatched to shopper's inbox: ${destEmail}!`);
        setTimeout(() => setShowStatusAlert(null), 5000);
      }

    } catch (err) {
      console.error('Failure saving message:', err);
    }
  };

  if (!currentUser) {
    return (
      <div id="unauthorized-chat-pane" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-3xs max-w-md mx-auto">
        <div className="w-16 h-16 bg-emerald-brand/10 text-emerald-brand rounded-full flex items-center justify-center mx-auto">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-slate-brand dark:text-slate-100 uppercase tracking-widest leading-none font-display">TU Marketplace Peer Chats</h4>
          <p className="text-xs text-slate-brand/60 dark:text-slate-400">Join academic peer discussions. Securely verify items or match meetup hours inside Trinity University hostels.</p>
        </div>
        <button
          onClick={onLoginClick}
          className="bg-emerald-brand hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3.5 rounded-full flex items-center justify-center space-x-2 cursor-pointer shadow-md mx-auto tracking-widest uppercase transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span>Authorize With Student Google Mail</span>
        </button>
      </div>
    );
  }

  return (
    <div id="active-chat-wrapper" className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 rounded-3xl overflow-hidden flex flex-col h-[520px] md:h-[580px] shadow-3xs animate-fade-in text-left">
      
      {/* Dynamic notifications helper bar */}
      <div className="bg-slate-950 text-slate-200 px-4 py-2.5 flex items-center justify-between text-[11px] font-medium tracking-wide">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-brand animate-pulse" />
          <span>Trinity Uni Instant Alerts Enabled</span>
        </div>
        <div className="flex items-center space-x-3.5">
          <button 
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center space-x-1.5 opacity-90 hover:opacity-100 cursor-pointer"
            title="Toggle notification chime sound effects"
          >
            <Volume2 className={`w-3.5 h-3.5 ${audioEnabled ? 'text-emerald-400' : 'text-slate-500 line-through'}`} />
            <span>{audioEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>
          
          {!browserNotificationsGranted && (
            <button
              onClick={requestNotificationPermission}
              className="bg-emerald-brand hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center space-x-1 transition-all cursor-pointer"
            >
              <Bell className="w-3 h-3" />
              <span>Enable Background Push Alerts</span>
            </button>
          )}
          {browserNotificationsGranted && (
            <span className="text-emerald-400 flex items-center space-x-1 font-mono text-[9.5px]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>PUSH STANDBY</span>
            </span>
          )}
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        
        {/* Left Side: Threads panel (only shown if multi-threads is active, or if in dashboard mode) */}
        {(isVendorDashboard || threads.length > 1) && (
          <div className="w-[180px] sm:w-[220px] border-r border-gray-150 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/40 shrink-0">
            <div className="p-3 border-b border-gray-150 dark:border-slate-800 font-mono text-[9px] font-bold text-slate-brand/50 uppercase tracking-widest flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>Ongoing Inquiries ({threads.length})</span>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-gray-150/40 dark:divide-slate-800/40">
              {threads.length === 0 ? (
                <div className="p-4 text-center text-slate-brand/40 text-[10.5px]">No discussions active yet</div>
              ) : (
                threads.map((thread) => {
                  const isActive = activeThread?.id === thread.id;
                  const hasUnread = isVendorDashboard ? thread.unreadByVendor : thread.unreadByShopper;

                  return (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThread(thread)}
                      className={`w-full text-left p-3.5 flex items-start space-x-3 transition-colors outline-none cursor-pointer border-l-4 ${
                        isActive 
                          ? 'bg-white dark:bg-slate-800/60 border-l-emerald-brand' 
                          : 'hover:bg-white/50 dark:hover:bg-slate-800/30 border-l-transparent'
                      }`}
                    >
                      <img 
                        src={thread.productImage || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&q=80&w=120'} 
                        alt="Product visual representation"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-xl border border-gray-150 shrink-0" 
                      />
                      <div className="flex-1 min-w-0 pr-1 select-none">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-slate-brand dark:text-slate-100' : 'text-slate-brand/85 dark:text-slate-200'}`}>
                            {isVendorDashboard ? thread.shopperName : thread.productName}
                          </p>
                          {hasUnread && (
                            <span className="w-2 h-2 rounded-full bg-emerald-brand animate-pulse block shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-brand/40 dark:text-slate-400 truncate mt-0.5 leading-none">
                          {isVendorDashboard ? thread.productName : thread.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Side: Active Messages Dialogue */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          
          {activeThread ? (
            <>
              {/* Converastion Header details */}
              <div className="p-4 border-b border-gray-150 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex items-center space-x-3 min-w-0">
                  <img 
                    src={activeThread.productImage || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&q=80&w=120'} 
                    alt="Active listing model"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 object-cover rounded-xl border border-gray-150 shrink-0 shadow-3xs" 
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-brand dark:text-slate-100 leading-tight truncate">
                      {isVendorDashboard ? `Shopper: ${activeThread.shopperName}` : activeThread.productName}
                    </h4>
                    <span className="text-[10.5px] text-slate-brand/50 dark:text-slate-400 mt-0.5 leading-none font-medium flex items-center space-x-1.5 truncate">
                      <span>Listing Segment inquiry</span>
                      <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                      <span className="font-semibold text-emerald-brand">{isVendorDashboard ? activeThread.productName : `Seller: ${activeThread.vendorName}`}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold shrink-0">
                    Hostel Meetup Chat
                  </span>
                </div>
              </div>

              {/* Status banner */}
              {showStatusAlert && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 px-4 py-2 border-b border-emerald-100 dark:border-emerald-950 text-[10.5px] font-semibold tracking-wide flex items-center space-x-1.5 animate-bounce shadow-3xs">
                  <Mail className="w-3.5 h-3.5 shrink-0 animate-pulse text-emerald-600 dark:text-emerald-400" />
                  <span>{showStatusAlert}</span>
                </div>
              )}

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 msg-scroller">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 px-6">
                    <div className="w-12 h-12 rounded-full border border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-brand dark:text-emerald-400">
                      <HelpCircle className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="font-bold text-slate-brand/70 text-xs mt-3 leading-none">Safe Student Escrow Inquiry</p>
                    <p className="text-[10.5px] text-slate-brand/45 mt-1 leading-relaxed max-w-[280px]">
                      Offer and inquire details directly. Negotiate hostel meetup times and pick up dates peer-to-peer!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.senderId === currentUser.uid;

                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col max-w-[75%] ${isSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <span className="text-[8.5px] font-bold text-slate-brand/40 dark:text-slate-500 uppercase tracking-widest mb-1 font-mono">
                          {isSelf ? 'ME' : msg.senderName}
                        </span>
                        <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed leading-[1.4] transition-all shadow-3xs ${
                          isSelf 
                            ? 'bg-emerald-brand text-white rounded-tr-none font-semibold' 
                            : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-150 dark:border-slate-800/60 text-slate-brand dark:text-slate-200 rounded-tl-none font-medium'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-150 dark:border-slate-800 flex gap-3">
                <input
                  type="text"
                  required
                  placeholder={
                    isVendorDashboard 
                      ? "Respond to shopper's peer inquiry..." 
                      : `Ask ${activeThread.vendorName || 'Vendor'} if available, verify specs, hostel...`
                  }
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-grow bg-slate-50 dark:bg-slate-800/40 border border-gray-250 dark:border-slate-750 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-3 px-4 text-xs font-semibold outline-none transition-all text-slate-brand dark:text-slate-100 placeholder-slate-brand/35"
                />
                <button
                  type="submit"
                  className="bg-emerald-brand hover:bg-emerald-700 text-white p-3 px-5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 fill-white stroke-none" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/20 dark:bg-slate-900/10">
              <Compass className="w-12 h-12 text-slate-brand/30 dark:text-slate-600 animate-spin" />
              <p className="font-bold text-slate-brand/70 text-xs mt-3">Ready to Discuss hostel deals?</p>
              <p className="text-[10px] text-slate-brand/45 dark:text-slate-400 mt-1 max-w-sm">
                {isVendorDashboard 
                  ? 'Select one of the peer shopper conversation threads in your left inbox tray to respond!' 
                  : 'Start chatting with a verified vendor directly from any active product detail window.'}
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
