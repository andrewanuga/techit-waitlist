"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Rocket, Users, ShieldCheck, Lock, ArrowRight, 
  CheckCircle2, Loader2, Search, LogOut, Calendar, Database
} from 'lucide-react';

// --- DATABASE CONFIG ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TechITMegaSystem() {
  // Navigation State
  const [view, setView] = useState<'form' | 'admin'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Admin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Founder'
  });

  // --- HANDLERS ---

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('waitlist')
      .insert([formData]);

    setIsSubmitting(false);
    if (error) {
      alert(error.message);
    } else {
      setIsSuccess(true);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === 'techit123Survey') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert("Unauthorized: Invalid Admin Password");
    }
  };

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setWaitlistEntries(data);
  };

  const filteredEntries = waitlistEntries.filter(entry => 
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- UI: ADMIN DASHBOARD ---
  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Admin Portal</h2>
              <p className="text-slate-500 text-center mb-8 text-sm">Enter password to view waitlist</p>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input 
                  type="password" 
                  placeholder="Admin Password"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setAdminPass(e.target.value)}
                />
                <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                  Access Dashboard
                </button>
                <button type="button" onClick={() => setView('form')} className="w-full text-slate-400 text-sm hover:underline">Back to Survey</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                  <div className="bg-blue-600 text-white p-1.5 rounded-lg"><ShieldCheck size={20}/></div>
                  TechIT <span className="text-blue-600">Admin</span>
                </div>
                <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition font-medium text-sm">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 lg:p-10">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-8">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Waitlist Overview</h1>
                  <p className="text-slate-500">You have {waitlistEntries.length} total subscribers.</p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search leads..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Subscriber</th>
                      <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Role</th>
                      <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Joined On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEntries.map((user) => (
                      <tr key={user.id} className="hover:bg-blue-50/50 transition duration-150">
                        <td className="p-5">
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${
                            user.role === 'Founder' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-5 text-slate-400 text-sm italic">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        )}
      </div>
    );
  }

  // --- UI: PUBLIC SURVEY FORM ---
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-4xl shadow-2xl shadow-blue-200 mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Rocket size={40} />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 italic">
            TECHIT <span className="text-blue-600">WAITLIST</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
            The AI-powered incubation hub for the next generation of Nigerian startups.
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
          {!isSuccess ? (
            <form onSubmit={handleJoinWaitlist} className="p-8 md:p-12 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
                  <input 
                    required
                    placeholder="Andrew Oche"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all outline-none font-medium"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input 
                    required
                    type="email"
                    placeholder="ceo@thecla.com"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all outline-none font-medium"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Role</label>
                <select 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all outline-none font-medium appearance-none"
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option>Founder</option>
                  <option>Collaborator</option>
                  <option>Investor</option>
                  <option>Organization</option>
                </select>
              </div>
              <button 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-blue-100"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <>RESERVE MY SPOT <ArrowRight size={24} /></>}
              </button>
            </form>
          ) : (
            <div className="p-16 text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black mb-4">YOU'RE IN!</h2>
              <p className="text-slate-500 mb-8">We've added <span className="font-bold text-slate-900">{formData.email}</span> to the priority list. Watch your inbox.</p>
              <button onClick={() => setIsSuccess(false)} className="text-blue-600 font-black text-sm uppercase tracking-widest hover:underline">Add another</button>
            </div>
          )}
        </div>

        <footer className="mt-12 flex flex-col items-center gap-4">
          <div className="flex gap-4 text-slate-300">
            <Users size={20} />
            <Database size={20} />
            <ShieldCheck size={20} />
          </div>
          <button 
            onClick={() => setView('admin')}
            className="text-slate-300 hover:text-slate-500 transition text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            Terminal Access
          </button>
        </footer>
      </div>
    </div>
  );
}