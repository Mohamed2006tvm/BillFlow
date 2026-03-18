import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Search, UserPlus, Phone, User, Users, Loader2 } from 'lucide-react';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // New customer form state
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;
    
    setAdding(true);
    try {
      await api.post('/customers', newCustomer);
      setNewCustomer({ name: '', phone: '' });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add customer');
    } finally {
      setAdding(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Left: Add Customer Form */}
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Add New Customer</CardTitle>
            <CardDescription>Save customer details for quick billing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cust-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="cust-name"
                    placeholder="e.g. John Doe" 
                    required 
                    className="pl-10"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cust-phone">Phone Number (WhatsApp)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="cust-phone"
                    placeholder="e.g. 9876543210" 
                    required 
                    className="pl-10"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={adding}>
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Add Customer
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right: Customer List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
              <h2 className="text-2xl font-bold tracking-tight">Customer Database</h2>
              <p className="text-slate-500">Manage all your shop's users here.</p>
           </div>
           <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p>Loading customers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-2 py-20 text-center bg-slate-50/50">
             <CardContent>
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                   <Users className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No customers found.</p>
                <p className="text-sm text-slate-400">Start by adding your first customer on the left.</p>
             </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(c => (
              <Card key={c.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl">
                       {c.name.charAt(0)}
                    </div>
                    <div>
                       <p className="font-bold text-slate-950 group-hover:text-brand-600 transition-colors">{c.name}</p>
                       <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                         <Phone className="w-3.5 h-3.5" />
                         {c.phone}
                       </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
