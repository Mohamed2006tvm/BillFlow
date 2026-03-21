import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Label } from '../components/ui/Label';
import { AlertCircle, ArrowRight, Loader2, ShieldCheck, Users, Lock, Plus } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

const AuthPage = () => {
  const [step, setStep] = useState('login'); // 'login', 'profiles', 'verify-owner'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [shopUser, setShopUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  
  useEffect(() => {
    const token = localStorage.getItem('billflow_token');
    const existingUser = localStorage.getItem('billflow_user');
    
    // If we have a token but no selected user, try to load profiles
    if (token && !existingUser && step === 'login') {
      const loadProfiles = async () => {
        setLoading(true);
        try {
          const res = await api.get('/employees', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEmployees(res.data);
          setTempToken(token);
          setStep('profiles');
        } catch (err) {
          console.error("Failed to load profiles:", err);
          localStorage.removeItem('billflow_token');
        } finally {
          setLoading(false);
        }
      };
      loadProfiles();
    }
  }, [step]);
  
  const { login, completeLogin, switchProfile } = useAuth();

  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [showReset, setShowReset] = useState(false);

  const handleMasterLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Email and password are required');
    
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      // data: { token, user, employees }
      if (data.user.role === 'admin') {
         // Special case for system admin
         completeLogin(data.token, data.user);
      } else {
         setTempToken(data.token);
         setShopUser(data.user);
         setEmployees(data.employees || []);
         setStep('profiles');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid shop credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = async (profile) => {
    if (profile.role === 'user') {
       setStep('verify-owner');
    } else {
       // Employee - direct login as requested
       setLoading(true);
       try {
         const data = await switchProfile(tempToken, profile.id);
         completeLogin(data.token, data.user);
       } catch (err) {
         setError('Failed to switch to employee profile');
       } finally {
         setLoading(false);
       }
    }
  };

  const handleOwnerVerify = async (e) => {
    e.preventDefault();
    if (!ownerPassword) return setError('Password is required');
    
    setLoading(true);
    setError('');
    try {
      const data = await switchProfile(tempToken, null, ownerPassword);
      completeLogin(data.token, data.user);
    } catch (err) {
      setError('Incorrect master password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return setResetError('Email is required');
    setResetError('');
    setResetMessage('');
    setResetLoading(true);
    try {
      const res = await api.post('/reset-password', { email: resetEmail });
      setResetMessage(res.data.message);
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 1: Shop Login
  if (step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-200">
            <span className="text-white font-black italic text-xl">B</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">BillFlow</span>
        </div>

        <div className="w-full max-w-md animate-in zoom-in-95 fade-in duration-500">
          <Card className="shadow-2xl shadow-slate-200/50 border-slate-100 overflow-hidden">
            <div className="h-2 w-full bg-brand-600" />
            <CardHeader className="space-y-1 pb-4 text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">Shop Login</CardTitle>
              <CardDescription className="text-base text-slate-500">
                Enter your master credentials to access your shop.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleMasterLogin} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" type="email" placeholder="admin@shop.com" required 
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" onClick={() => setShowReset(true)} className="text-xs font-semibold text-brand-600 hover:underline">Forgot password?</button>
                  </div>
                  <Input 
                    id="password" type="password" required 
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold transition-all group" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Access Shop <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {showReset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
               <Card className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                  <CardHeader>
                     <CardTitle className="text-xl">Request Reset</CardTitle>
                     <CardDescription>Enter your email address.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {resetError && <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">{resetError}</div>}
                     {resetMessage && <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-xs">{resetMessage}</div>}
                     <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input id="reset-email" type="email" placeholder="your@email.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                     </div>
                     <div className="flex gap-3">
                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowReset(false)}>Cancel</Button>
                        <Button type="button" className="flex-1" disabled={resetLoading} onClick={handleResetPassword}>{resetLoading ? '...' : 'Reset'}</Button>
                     </div>
                  </CardContent>
               </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Profile Selection
  if (step === 'profiles') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 animate-in fade-in duration-700">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight">Who's using BillFlow?</h1>
        
        <div className="flex flex-wrap justify-center gap-10 max-w-5xl">
          {/* Owner Profile */}
          <div className="flex flex-col items-center gap-4 group cursor-pointer" onClick={() => handleProfileSelect({ role: 'user' })}>
            <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-xl overflow-hidden bg-brand-600 border-4 border-transparent group-hover:border-white transition-all transform group-hover:scale-105 shadow-xl">
               <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-16 h-16 md:w-24 md:h-24 text-white opacity-80" />
               </div>
               <div className="absolute top-2 right-2 bg-slate-900/60 p-1.5 rounded-lg backdrop-blur-sm">
                  <Lock className="w-4 h-4 text-white/80" />
               </div>
            </div>
            <span className="text-xl md:text-2xl text-slate-400 group-hover:text-white transition-colors">Owner / Admin</span>
          </div>

          {/* Employee Profiles */}
          {employees.map(emp => (
            <div key={emp.id} className="flex flex-col items-center gap-4 group cursor-pointer" onClick={() => handleProfileSelect(emp)}>
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-xl overflow-hidden bg-emerald-600 border-4 border-transparent group-hover:border-white transition-all transform group-hover:scale-105 shadow-xl">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="w-16 h-16 md:w-24 md:h-24 text-white opacity-80" />
                 </div>
              </div>
              <span className="text-xl md:text-2xl text-slate-400 group-hover:text-white transition-colors">{emp.name}</span>
            </div>
          ))}

          {/* If no employees, show a placeholder */}
          {employees.length === 0 && (
             <div className="flex flex-col items-center gap-4 opacity-40">
               <div className="w-32 h-32 md:w-44 md:h-44 rounded-xl border-4 border-dashed border-white/20 flex items-center justify-center">
                  <Plus className="w-12 h-12" />
               </div>
               <span className="text-xl text-slate-500 italic">No Staff Profiles</span>
             </div>
          )}
        </div>

        <button 
          onClick={() => { setStep('login'); setTempToken(null); }}
          className="mt-20 text-slate-500 hover:text-white border border-slate-700 hover:border-white px-6 py-2 rounded-lg transition-all"
        >
          Logout of Shop
        </button>

        {loading && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50">
             <div className="text-center">
                <Loader2 className="w-16 h-16 animate-spin text-brand-500 mx-auto" />
                <p className="mt-4 text-xl font-medium tracking-widest uppercase">Opening Dashboard...</p>
             </div>
          </div>
        )}
      </div>
    );
  }

  // Step 3: Owner Verification
  if (step === 'verify-owner') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
        <div className="w-full max-w-md">
           <div className="text-center mb-10">
              <div className="inline-flex w-20 h-20 rounded-full bg-slate-800 border border-slate-700 items-center justify-center mb-6">
                 <Lock className="w-10 h-10 text-brand-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 underline decoration-brand-500 underline-offset-8">Verify as Owner</h1>
              <p className="text-slate-400">Please enter your master password to continue.</p>
           </div>

           <form onSubmit={handleOwnerVerify} className="space-y-6">
              {error && <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">{error}</div>}
              <Input 
                type="password" autoFocus required placeholder="••••••••" 
                value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white h-14 text-center text-3xl tracking-[0.5em] focus:ring-brand-500 focus:border-brand-500"
              />
              <div className="flex gap-4">
                 <Button type="button" variant="ghost" className="flex-1 text-slate-400 hover:text-white" onClick={() => { setStep('profiles'); setOwnerPassword(''); setError(''); }}>Cancel</Button>
                 <Button type="submit" className="flex-1 bg-brand-600 hover:bg-brand-700" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Confirm'}
                 </Button>
              </div>
           </form>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthPage;
