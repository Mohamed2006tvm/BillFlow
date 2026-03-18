import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  Plus, 
  MoreHorizontal,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';

const InvoiceListPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invoices', { params: { status: statusFilter === 'all' ? undefined : statusFilter } });
      setInvoices(res.data);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter(inv => 
    inv.customer.name.toLowerCase().includes(search.toLowerCase()) || 
    inv.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
            <p className="text-slate-500">Track and manage all your customer billings.</p>
         </div>
         <Link to="/create-invoice">
            <Button className="w-full sm:w-auto gap-2 rounded-xl h-11">
               <Plus className="w-5 h-5" />
               New Invoice
            </Button>
         </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
         <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by customer or invoice ID..." 
              className="pl-10 h-11 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         
         <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Button 
              variant={statusFilter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="rounded-full h-9 px-4"
            >
              All
            </Button>
            <Button 
              variant={statusFilter === 'pending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('pending')}
              className="rounded-full h-9 px-4 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Pending
            </Button>
            <Button 
              variant={statusFilter === 'paid' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('paid')}
              className="rounded-full h-9 px-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Paid
            </Button>
         </div>
      </div>

      <Card className="border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Invoice Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px] text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">Created</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                       <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                       <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-slate-300" />
                       </div>
                       <p className="font-medium">No invoices found.</p>
                       <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(inv => (
                    <tr 
                      key={inv.id} 
                      className="hover:bg-brand-50/30 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/invoice/${inv.id}`)}
                    >
                      <td className="px-6 py-5">
                         <div className="font-mono text-xs font-bold text-brand-600">#{inv.id.slice(0, 8).toUpperCase()}</div>
                         <div className="text-[10px] text-slate-400 mt-0.5">{inv.items.length} items</div>
                      </td>
                      <td className="px-6 py-5 font-semibold text-slate-900 group-hover:text-brand-700">
                        {inv.customer.name}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-900">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge variant={inv.status === 'paid' ? 'success' : 'warning'} className="capitalize">
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right text-xs text-slate-500">
                        {formatDate(inv.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-right">
                         <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-all group-hover:translate-x-1" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
           </table>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceListPage;
