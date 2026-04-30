/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ScamAnalyzer } from './components/ScamAnalyzer';
import { auth, signInWithGoogle, logOut } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { syncUserProfile } from './services/dbService';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) syncUserProfile();
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0a11.92 11.92 0 00-1.017 4.016c0 5.823-3.15 10.938-7.844 13.62a11.952 11.952 0 01-7.844-13.62c0-1.428.243-2.787.718-4.047M12 11a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">
            VERISENTRY <span className="text-brand-accent">AI</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <UserIcon className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">{user.displayName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-brand-danger transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}
          
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200">
            <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network Secure</span>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-brand-bg">
        <ScamAnalyzer user={user} />
      </main>

      <footer className="h-12 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex gap-8">
          <span>Last Sync: 2 mins ago</span>
          <span className="hidden md:inline">Global Threat Intel: Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse"></div>
          <span>VeriSentry Node Status: Active</span>
        </div>
      </footer>
    </div>
  );
}


