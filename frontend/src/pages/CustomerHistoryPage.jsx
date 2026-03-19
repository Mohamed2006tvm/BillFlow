import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Phone, Users, Loader2, RotateCcw, History } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const CustomerHistoryPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/customers/archive');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customer history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id, name) => {
    if (!window.confirm(`Restore customer "${name}" to active list?`)) return;
    setRestoringId(id);
    try {
      await api.put(`/customers/${id}/restore`);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to restore customer');
    } finally {
      setRestoringId(null);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-slate-400" />
            Customer History
          </h2>
          <p className="text-slate-500">View and restore archived customers.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search history..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <p>Loading history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2 py-20 text-center bg-slate-50/50">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No archived customers.</p>
            <p className="text-sm text-slate-400">Customers you move from the active list will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow group bg-slate-50/50">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 opacity-75">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xl">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">{c.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      {c.phone}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-brand-200 text-brand-600 hover:bg-brand-50"
                  onClick={() => handleRestore(c.id, c.name)}
                  disabled={restoringId === c.id}
                >
                  {restoringId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  Restore
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerHistoryPage;
