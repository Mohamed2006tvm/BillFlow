import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LifeBuoy, Send, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { isAdmin } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [isAdmin]);

  const fetchTickets = async () => {
    try {
      const endpoint = isAdmin ? '/support/admin/all' : '/support/my-tickets';
      const res = await api.get(endpoint);
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) return;

    setLoading(true);
    try {
      await api.post('/support', { subject, message });
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err) {
      console.error('Failed to submit ticket', err);
    } finally {
      setLoading(false);
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
      console.error('Failed to send reply', err);
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
      console.error('Failed to reset user password', err);
      alert("Failed to reset password");
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-brand-50 text-brand-600">
          <LifeBuoy className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isAdmin ? 'Admin Support Dashboard' : 'Support Center'}</h1>
          <p className="text-slate-500 text-sm">{isAdmin ? 'Manage all customer queries and provide assistance.' : 'Have a question or need help? Send us a message.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {!isAdmin && (
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Submit a Query</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields stay the same */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                    placeholder="e.g. Invoice problem"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none resize-none"
                    placeholder="Describe your issue..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Query
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className={isAdmin ? 'md:col-span-3' : 'md:col-span-2'}>
          <CardHeader>
            <CardTitle className="text-lg">{isAdmin ? 'All Customer Queries' : 'My Recent Queries'}</CardTitle>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="text-center py-12 text-slate-400">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                No tickets found.
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className={`p-4 rounded-xl border border-slate-100 hover:border-brand-100 hover:bg-slate-50/50 transition-all ${isAdmin ? 'cursor-pointer' : ''}`}
                    onClick={() => isAdmin && setSelectedTicket(ticket)}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                          {isAdmin && (
                            <p className="text-xs text-brand-600 font-medium">{ticket.user?.shopName} ({ticket.user?.name})</p>
                          )}
                       </div>
                       <Badge variant={ticket.status === 'open' ? 'secondary' : 'success'} className="capitalize">
                          {ticket.status === 'open' ? (
                            <Clock className="w-3 h-3 mr-1" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          {ticket.status}
                       </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{ticket.message}</p>
                    {ticket.adminReply && (
                      <div className="mt-3 p-3 bg-brand-50 rounded-lg border border-brand-100">
                         <p className="text-xs font-bold text-brand-700 uppercase mb-1">Reply from Support</p>
                         <p className="text-sm text-slate-700 italic">"{ticket.adminReply}"</p>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium">{formatDate(ticket.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdmin && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
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
                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none resize-none"
                       rows={4}
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

export default SupportPage;
