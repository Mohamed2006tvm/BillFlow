import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Label } from '../components/ui/Label';
import { AlertCircle, ArrowRight, Loader2, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

const AuthPage = () => {
  const [mode, setMode] = useState('select'); // 'select', 'owner', 'employee'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Email and password are required');
    
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
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

  if (mode === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-200">
            <span className="text-white font-black italic text-xl">B</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">BillFlow</span>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col justify-center space-y-6 text-center md:text-left">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                Choose your <br />
                <span className="text-brand-600">Identity</span>
              </h1>
              <p className="mt-4 text-lg text-slate-500 max-w-sm mx-auto md:mx-0">
                Are you managing the store or helping customers as a staff member? Select your role to continue.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-slate-400 text-sm">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
              </div>
              <span>Trusted by 500+ local businesses</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => setMode('owner')}
              className="group relative overflow-hidden bg-white p-8 rounded-3xl border-2 border-transparent hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-100 transition-all duration-500 text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 group-hover:bg-brand-100 transition-colors" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-brand-200">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Store Owner / Admin</h3>
                <p className="mt-2 text-slate-500">Full access to reports, settings, staff, and billing controls.</p>
                <div className="mt-6 flex items-center gap-2 text-brand-600 font-bold group-hover:gap-3 transition-all">
                  Owner Dashboard <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>

            <button 
              onClick={() => setMode('employee')}
              className="group relative overflow-hidden bg-white p-8 rounded-3xl border-2 border-transparent hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-100 transition-colors" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Shop Staff / Employee</h3>
                <p className="mt-2 text-slate-500">Access to generating invoices, managing customers, and inventory.</p>
                <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-3 transition-all">
                  Staff Desktop <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className={`h-2 w-full ${mode === 'owner' ? 'bg-brand-600' : 'bg-emerald-600'}`} />
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => setMode('select')}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                 ← Back to roles
              </button>
              <Badge variant="outline" className={mode === 'owner' ? 'text-brand-600 border-brand-100' : 'text-emerald-600 border-emerald-100'}>
                {mode === 'owner' ? 'Owner Access' : 'Employee Access'}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Login</CardTitle>
            <CardDescription className="text-base">
              {mode === 'owner' 
                ? 'Managing your shop? Sign in to your dashboard.' 
                : 'Helping at the counter? Enter your staff credentials.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={mode === 'owner' ? 'admin@shop.com' : 'staff@shop.com'} 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button 
                    type="button" 
                    onClick={() => setShowReset(true)}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                />
              </div>
              <Button 
                type="submit" 
                className={`w-full h-12 text-base font-semibold transition-all group ${mode === 'employee' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`} 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-slate-50 bg-slate-50/50 p-6">
             <p className="text-center text-sm text-slate-500">
               {mode === 'owner' 
                 ? 'Register your shop via the admin portal.' 
                 : 'Staff accounts must be created by the store owner.'}
             </p>
          </CardFooter>
        </Card>
        
        {showReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
             <Card className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                <CardHeader>
                   <CardTitle className="text-xl">Reset Password Request</CardTitle>
                   <CardDescription>Enter your email to request a reset.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   {resetError && (
                     <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
                       {resetError}
                     </div>
                   )}
                   {resetMessage && (
                     <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-xs">
                       {resetMessage}
                     </div>
                   )}
                   <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input 
                        id="reset-email" 
                        type="email" 
                        placeholder="your@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                   </div>
                   <div className="flex gap-3">
                      <Button type="button" variant="ghost" className="flex-1" onClick={() => { setShowReset(false); setResetError(''); setResetMessage(''); }}>Cancel</Button>
                      <Button type="button" className="flex-1" disabled={resetLoading} onClick={handleResetPassword}>
                         {resetLoading ? 'Resetting...' : 'Reset Now'}
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        )}
        
        <p className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          BillFlow Enterprise Edition
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
