import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  FileText, 
  IndianRupee, 
  Clock, 
  ArrowUpRight, 
  Plus,
  AlertTriangle,
  Calendar,
  LifeBuoy
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your performance metrics...</div>;

  const expiryDate = new Date(stats.subscriptionEnd);
  const isExpired = expiryDate < new Date();
  const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
  const showWarning = !isExpired && daysRemaining <= 3;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Expiry Alert */}
      {isExpired ? (
        <div className="p-4 rounded-xl bg-red-100 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <AlertTriangle className="w-6 h-6 text-red-600" />
             <div>
               <p className="font-bold text-red-900">Subscription Expired</p>
               <p className="text-sm text-red-700">Billing features are currently disabled. Please contact admin to renew.</p>
             </div>
          </div>
          <Button variant="destructive" className="shrink-0" onClick={() => window.open('mailto:support@billflow.com')}>
             Contact Support
          </Button>
        </div>
      ) : showWarning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
           <AlertTriangle className="w-6 h-6 text-amber-600" />
           <div>
             <p className="font-bold text-amber-900">Renewal Upcoming</p>
             <p className="text-sm text-amber-700">Your subscription ends in {daysRemaining} days. Contact admin for uninterrupted access.</p>
           </div>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-brand-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                  <FileText className="w-6 h-6" />
               </div>
               <Badge variant="secondary" className="bg-brand-50 text-brand-600 border-brand-100">Total</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">Invoices Created</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalInvoices}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <ArrowUpRight className="w-6 h-6" />
               </div>
               <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100">Paid</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">Collected Revenue</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <IndianRupee className="w-6 h-6" />
               </div>
               <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100">Awaiting</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">Pending Payments</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 text-amber-600">{formatCurrency(stats.pendingAmount)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-brand-100">
           <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                   <LifeBuoy className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-orange-500 border-orange-200">Support</Badge>
             </div>
             <p className="text-sm font-medium text-slate-500">Active Queries</p>
             <p className="text-3xl font-bold text-slate-900 mt-1">{stats.activeTickets || 0}</p>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
           <CardHeader>
             <CardTitle className="text-base font-semibold">Monthly Revenue Trend</CardTitle>
           </CardHeader>
           <CardContent className="h-80 pt-0">
             {stats.monthly.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.monthly} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                     dataKey="month" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fontSize: 12, fill: '#94a3b8'}}
                     dy={10}
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fontSize: 12, fill: '#94a3b8'}}
                     tickFormatter={(val) => `₹${val}`}
                   />
                   <Tooltip 
                     cursor={{fill: '#f8fafc'}}
                     contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                     formatter={(val) => [formatCurrency(val), 'Revenue']}
                   />
                   <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                     {stats.monthly.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={index === stats.monthly.length - 1 ? '#2878ff' : '#cbd5e1'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                 No revenue data available yet.
               </div>
             )}
           </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
           <Card className="bg-brand-600 text-white border-none shadow-xl shadow-brand-200">
              <CardContent className="p-6">
                 <h3 className="text-lg font-bold mb-2">Grow your business</h3>
                 <p className="text-brand-100 text-sm mb-6">Create professional GST-ready invoices and share them instantly via WhatsApp.</p>
                 <Link to="/create-invoice">
                    <Button variant="secondary" className="w-full bg-white text-brand-600 hover:bg-brand-50 border-none">
                       <Plus className="w-4 h-4 mr-2" />
                       New Invoice
                    </Button>
                 </Link>
              </CardContent>
           </Card>

           <Card>
              <CardHeader>
                 <CardTitle className="text-base">Recent Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Account Status</span>
                    <Badge variant={stats.isActive ? "success" : "destructive"}>
                       {stats.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Payment Health</span>
                    <span className="text-sm font-semibold text-emerald-600">Healthy</span>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
