import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Lock, 
  Trash2, 
  Loader2, 
  ShieldCheck,
  User 
} from 'lucide-react';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/employees', newEmployee);
      setNewEmployee({ name: '', email: '', password: '', phone: '' });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove employee "${name}"?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove employee');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Employee Management</h2>
          <p className="text-slate-500 mt-1.5">Manage your shop staff and their access levels.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm font-semibold">Owner Controls</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Employee Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 border-brand-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Add New Employee</CardTitle>
              <CardDescription>Create a separate login for your staff.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="emp-name"
                      placeholder="e.g. Rahul Kumar" 
                      required 
                      className="pl-10"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="emp-email"
                      type="email"
                      placeholder="employee@shop.com" 
                      required 
                      className="pl-10"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="emp-phone"
                      placeholder="e.g. 9876543210" 
                      required 
                      className="pl-10"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-pass">Initial Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="emp-pass"
                      type="password"
                      placeholder="Min. 6 characters" 
                      required 
                      className="pl-10"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2 mt-2" disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            Your Staff ({employees.length})
          </h3>

          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              <p>Loading staff records...</p>
            </div>
          ) : employees.length === 0 ? (
            <Card className="border-dashed border-2 py-20 text-center bg-slate-50/50">
              <CardContent>
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No employees added yet.</p>
                <p className="text-sm text-slate-400 mt-1">Add staff members to let them help with billing.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map(emp => (
                <Card key={emp.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-brand-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-5 flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl ring-4 ring-white">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg leading-tight">{emp.name}</p>
                          <div className="flex flex-col gap-1 mt-1.5">
                             <div className="flex items-center gap-1.5 text-xs text-slate-500">
                               <Mail className="w-3.5 h-3.5" />
                               {emp.email}
                             </div>
                             <div className="flex items-center gap-1.5 text-xs text-slate-500">
                               <Phone className="w-3.5 h-3.5" />
                               {emp.phone}
                             </div>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                       <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Default Access</span>
                       <div className="flex items-center gap-1 text-[10px] bg-white px-2 py-0.5 rounded-full shadow-sm text-emerald-600 font-bold border border-emerald-100">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          Employee Role
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
