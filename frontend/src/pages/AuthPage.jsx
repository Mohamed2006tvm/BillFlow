import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Label } from '../components/ui/Label';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

const AuthPage = () => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-200">
          <span className="text-white font-black italic text-xl">B</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">BillFlow</span>
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-xl shadow-slate-200/50 border-slate-100">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your shop dashboard.
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
                  placeholder="name@company.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
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
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold transition-all group" disabled={loading}>
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
          <CardFooter className="flex flex-col border-t border-slate-50 bg-slate-50/50 p-6 rounded-b-xl">
             <p className="text-center text-sm text-slate-500">
               Need an account? Contact the administrator at
               <br />
               <span className="font-semibold text-brand-600">support@billflow.com</span>
             </p>
          </CardFooter>
        </Card>
        
        {showReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
             <Card className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                <CardHeader>
                   <CardTitle className="text-xl">Reset Password Request</CardTitle>
                   <CardDescription>Enter your email to reset your password. Admins will reset directly, while users will send a request to the administrator.</CardDescription>
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
                      <Label htmlFor="reset-email">Admin Email</Label>
                      <Input 
                        id="reset-email" 
                        type="email" 
                        placeholder="admin@example.com"
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
        
        <p className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} BillFlow Technologies. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
