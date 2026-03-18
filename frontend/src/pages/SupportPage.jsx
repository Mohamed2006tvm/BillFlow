import React, { useState, useEffect } from 'react';
import api from '../services/api';
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

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/my-tickets');
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
      setLoading(true); // Wait, this should be false!
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-brand-50 text-brand-600">
          <LifeBuoy className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Center</h1>
          <p className="text-slate-500 text-sm">Have a question or need help? Send us a message.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* New Ticket Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Submit a Query</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Previous Tickets */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">My Recent Queries</CardTitle>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="text-center py-12 text-slate-400">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                No tickets submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="p-4 rounded-xl border border-slate-100 hover:border-brand-100 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                       <Badge variant={ticket.status === 'open' ? 'secondary' : 'success'} className="capitalize">
                          {ticket.status === 'open' ? (
                            <Clock className="w-3 h-3 mr-1" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          {ticket.status}
                       </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{ticket.message}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{formatDate(ticket.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
