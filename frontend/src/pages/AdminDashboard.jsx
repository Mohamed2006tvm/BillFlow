import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger 
} from '../components/ui/Dialog';
import { 
  Users, 
  UserPlus, 
  RefreshCw, 
  Power, 
  Search, 
  FileCheck, 
  Clock,
  CalendarDays,
  Store,
  Phone
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New user form state
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '', shopName: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/create-user', newUser);
      await fetchUsers();
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', password: '', phone: '', shopName: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (userId) => {
    try {
      await api.put(`/admin/toggle/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle status');
    }
  };

  const renewSubscription = async (userId) => {
    if (!window.confirm('Renew subscription for 30 days?')) return;
    try {
      await api.put(`/admin/renew/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to renew subscription');
    }
  };

  const filteredUsers = users.filter(u => 
    u.shopName.toLowerCase().includes(search.toLowerCase()) || 
    u.phone.includes(search)
  );

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-brand-100">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Shops</p>
                   <p className="text-3xl font-bold mt-1">{users.length}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                   <Users className="w-6 h-6 text-brand-600" />
                </div>
             </div>
           </CardContent>
        </Card>
        <Card className="bg-white border-emerald-100">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Accounts</p>
                   <p className="text-3xl font-bold mt-1 text-emerald-600">{users.filter(u => u.isActive).length}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                   <FileCheck className="w-6 h-6 text-emerald-600" />
                </div>
             </div>
           </CardContent>
        </Card>
        <Card className="bg-white border-red-100">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Subscriptions Expiring</p>
                   <p className="text-3xl font-bold mt-1 text-red-600">
                     {users.filter(u => new Date(u.subscriptionEnd) < new Date()).length}
                   </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                   <Clock className="w-6 h-6 text-red-600" />
                </div>
             </div>
           </CardContent>
        </Card>
      </div>

      {/* User Table Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search shops or phone..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2">
               <UserPlus className="w-4 h-4" />
               Add New Shop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Shop Account</DialogTitle>
              <DialogDescription>
                Add a new small business account. They will get a 30-day trial automatically.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input 
                    required 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    required 
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Shop Name</Label>
                <Input 
                  required 
                  value={newUser.shopName}
                  onChange={(e) => setNewUser({...newUser, shopName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  required 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Initial Password</Label>
                <Input 
                  type="password" 
                  required 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Account'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* User List */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Shop Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subscription</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Invoices</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading shops...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No shops found matching your search.</td></tr>
              ) : filteredUsers.map((u) => {
                const isExpired = new Date(u.subscriptionEnd) < new Date();
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                           <Store className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{u.shopName}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-0.5"><Phone className="w-3 h-3"/> {u.phone}</span>
                            <span className="text-slate-300">•</span>
                            <span>{u.name}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full inline-block w-fit mb-1", isExpired ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                           {isExpired ? 'Expired' : 'Active'}
                        </span>
                        <span className="text-sm text-slate-600 flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(u.subscriptionEnd)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="font-mono text-sm leading-none py-1">
                        {u._count.invoices}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant={u.isActive ? "success" : "warning"}>
                         {u.isActive ? 'Live' : 'Inactive'}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="h-8 gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
                         onClick={() => renewSubscription(u.id)}
                       >
                         <RefreshCw className="w-3.5 h-3.5" />
                         Renew
                       </Button>
                       <Button 
                         variant={u.isActive ? "ghost" : "default"} 
                         size="sm" 
                         className={cn("h-8 gap-1.5", u.isActive ? "text-slate-500 hover:text-red-600" : "")}
                         onClick={() => toggleStatus(u.id)}
                       >
                         <Power className="w-3.5 h-3.5" />
                         {u.isActive ? 'Disable' : 'Enable'}
                       </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
