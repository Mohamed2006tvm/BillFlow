import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
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
  Phone,
  LifeBuoy,
  MessageSquare,
  BadgeCheck,
  Mail,
  IndianRupee,
  Pencil,
  Trash2,
  Archive
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    subscriptionStart: new Date().toISOString().split('T')[0],
    monthlyAmount: ''
  });
  const [creating, setCreating] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'support'

  // Monthly amount edit state
  const [editingAmountId, setEditingAmountId] = useState(null);
  const [editingAmount, setEditingAmount] = useState('');
  
  // Support reply state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

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

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/admin/all');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'support') fetchTickets();
  }, [activeTab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/create-user', newUser);
      await fetchUsers();
      setIsModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        shopName: '',
        subscriptionStart: new Date().toISOString().split('T')[0],
        monthlyAmount: ''
      });
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
    if (!window.confirm('Renew subscription for 30 days from today?')) return;
    try {
      await api.put(`/admin/renew/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to renew subscription');
    }
  };

  const handleArchiveUser = async (userId, shopName) => {
    if (!window.confirm(`Are you sure you want to archive "${shopName}"? They will no longer appear in this list but their data will be preserved.`)) return;
    try {
      // For now, we use the same delete endpoint which is actually a soft-delete if we implement it that way.
      // But according to the earlier logic, the admin delete was a REAL delete.
      // The user now says "Remove delete... set archive".
      // I should update the backend delete route for admins too to be a soft-delete.
      await api.delete(`/admin/user/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to archive user');
    }
  };

  const toggleTicketStatus = async (ticketId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      await api.put(`/support/admin/${ticketId}`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  const saveMonthlyAmount = async (userId) => {
    try {
      await api.put(`/admin/monthly-amount/${userId}`, { monthlyAmount: editingAmount });
      setEditingAmountId(null);
      fetchUsers();
    } catch (err) {
      alert('Failed to update monthly amount');
    }
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReply) return;

    setReplyLoading(true);
    try {
      await api.put(`/support/admin/${selectedTicket.id}/reply`, { adminReply });
      setAdminReply('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleResetUserPassword = async () => {
    if (!window.confirm("Are you sure you want to reset this user's password to 1234?")) return;

    setReplyLoading(true);
    try {
      await api.put(`/support/admin/${selectedTicket.id}/reset-password`);
      setSelectedTicket(null);
      fetchTickets();
      alert("User password has been reset to 1234");
    } catch (err) {
      alert("Failed to reset password");
    } finally {
      setReplyLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.shopName.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    u.email.toLowerCase().includes(search.toLowerCase())
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
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Open Support</p>
                <p className="text-3xl font-bold mt-1 text-red-600">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <LifeBuoy className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={cn("px-4 py-2 text-sm font-bold rounded-lg transition-all", activeTab === 'users' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Manage Shops
          </div>
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={cn("px-4 py-2 text-sm font-bold rounded-lg transition-all", activeTab === 'support' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Support Queries
            {tickets.filter(t => t.status === 'open').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* User Table Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by shop, phone, or email..."
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
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        required
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Shop Name</Label>
                    <Input
                      required
                      value={newUser.shopName}
                      onChange={(e) => setNewUser({ ...newUser, shopName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Starting Date</Label>
                      <Input
                        type="date"
                        required
                        value={newUser.subscriptionStart}
                        onChange={(e) => setNewUser({ ...newUser, subscriptionStart: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Amount (₹)</Label>
                      <Input
                        type="number"
                        required
                        placeholder="e.g. 500"
                        value={newUser.monthlyAmount}
                        onChange={(e) => setNewUser({ ...newUser, monthlyAmount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Initial Password</Label>
                    <Input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Start Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount/Month</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subscription</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Bills</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">Loading shops...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No shops found.</td></tr>
                  ) : filteredUsers.map((u) => {
                    const isExpired = new Date(u.subscriptionEnd) < new Date();
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Shop Name + Phone */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              <Store className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">{u.shopName}</p>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                <Phone className="w-3 h-3" />
                                <span>{u.phone}</span>
                                <span className="text-slate-300 mx-1">•</span>
                                <span className="text-slate-400">{u.name}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Email */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{u.email}</span>
                          </div>
                        </td>
                        {/* Start Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.subscriptionStart ? formatDate(u.subscriptionStart) : '—'}</span>
                          </div>
                        </td>
                        {/* Monthly Amount */}
                        <td className="px-6 py-4">
                          {editingAmountId === u.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={editingAmount}
                                onChange={(e) => setEditingAmount(e.target.value)}
                                className="h-8 w-24 text-sm"
                                placeholder="0"
                                autoFocus
                              />
                              <Button size="sm" className="h-8 px-3 text-xs" onClick={() => saveMonthlyAmount(u.id)}>Save</Button>
                              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditingAmountId(null)}>✕</Button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center gap-1.5 group cursor-pointer hover:text-brand-600 transition-colors"
                              onClick={() => { setEditingAmountId(u.id); setEditingAmount(u.monthlyAmount || ''); }}
                            >
                              <IndianRupee className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500" />
                              <span className="text-sm font-semibold text-slate-700">
                                {u.monthlyAmount ? u.monthlyAmount.toLocaleString('en-IN') : <span className="text-slate-400 font-normal">Set</span>}
                              </span>
                              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity" />
                            </div>
                          )}
                        </td>
                        {/* Subscription */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full inline-block w-fit mb-1", isExpired ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                              {isExpired ? 'Expired' : 'Active'}
                            </span>
                            <span className="text-sm text-slate-600 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {formatDate(u.subscriptionEnd)}
                            </span>
                          </div>
                        </td>
                        {/* Invoice Count */}
                        <td className="px-6 py-4 text-center">
                          <Badge variant="secondary" className="font-mono text-sm leading-none py-1">
                            {u._count.invoices}
                          </Badge>
                        </td>
                        {/* Actions */}
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
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-8 w-8 p-0 text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                             onClick={() => handleArchiveUser(u.id, u.shopName)}
                           >
                             <Archive className="w-4 h-4" />
                           </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Shop / User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Message</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No support queries yet.</td></tr>
                ) : tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{t.user.shopName}</div>
                      <div className="text-xs text-slate-500 uppercase font-bold mt-0.5 tracking-tight">{t.user.name}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{t.subject}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-md line-clamp-2">{t.message}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{formatDate(t.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={t.status === 'open' ? 'secondary' : 'success'} className="px-3">
                        {t.status === 'open' ? 'Open' : 'Resolved'}
                      </Badge>
                    </td>
                       <td className="px-6 py-4 text-right space-x-2">
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2 hover:bg-brand-50 hover:text-brand-600"
                            onClick={() => setSelectedTicket(t)}
                          >
                             <MessageSquare className="w-4 h-4" />
                             Reply
                          </Button>
                          <Button 
                            variant={t.status === 'open' ? 'outline' : 'outline'}
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => toggleTicketStatus(t.id, t.status)}
                          >
                             {t.status === 'open' ? (
                               <>
                                 <BadgeCheck className="w-4 h-4" />
                                 Resolve
                               </>
                             ) : 'Reopen'}
                          </Button>
                       </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <Card className="w-full max-w-lg shadow-2xl">
              <CardHeader>
                 <CardTitle>Reply to Query</CardTitle>
                 <p className="text-sm text-slate-500">Subject: {selectedTicket.subject}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Customer Message</p>
                    <p className="text-sm text-slate-700">{selectedTicket.message}</p>
                 </div>
                 <form onSubmit={handleAdminReply} className="space-y-4">
                    <textarea
                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none resize-none h-32"
                       placeholder="Type your reply here..."
                       value={adminReply}
                       onChange={(e) => setAdminReply(e.target.value)}
                       required
                    />
                    <div className="flex gap-3">
                       <Button type="button" variant="ghost" className="flex-1" onClick={() => setSelectedTicket(null)}>Cancel</Button>
                       <Button type="submit" className="flex-[2]" disabled={replyLoading}>
                          {replyLoading ? 'Sending...' : 'Send Reply & Close'}
                       </Button>
                    </div>
                 </form>
                 
                 <div className="pt-4 border-t border-slate-100">
                    <Button 
                       type="button" 
                       variant="outline" 
                       className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                       onClick={handleResetUserPassword}
                       disabled={replyLoading}
                    >
                       Reset User Password to "1234"
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
