import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  PlusCircle, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const Layout = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const userNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Create Invoice', href: '/create-invoice', icon: PlusCircle },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheck },
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Desktop */}
      {user && (
        <aside className="hidden md:flex flex-col w-64 bg-sidebar-bg text-sidebar-text shrink-0">
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <Link to="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-lg font-black italic">B</span>
              </div>
              BillFlow
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? "bg-brand-600 text-white" 
                      : "hover:bg-sidebar-hover hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-sidebar-text group-hover:text-white")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="px-3 py-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Signed in as</p>
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.shopName || 'Administrator'}</p>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-sidebar-text hover:text-white hover:bg-red-500/10 hover:text-red-400"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        {user && (
          <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold text-slate-900 hidden md:block">
                {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <Badge variant="secondary" className="bg-brand-50 text-brand-600 border-brand-100 hidden sm:flex">
                  Admin Panel
                </Badge>
              )}
              {!isAdmin && user?.subscriptionEnd && (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Subscription End</span>
                  <span className="text-xs font-semibold">
                    {new Date(user.subscriptionEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <section className={cn("flex-1 overflow-y-auto p-4 md:p-8", !user && "bg-white")}>
          <Outlet />
        </section>
      </main>

      {/* Mobile Side Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end md:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-72 h-full bg-sidebar-bg flex flex-col animate-in slide-in-from-left duration-300">
             <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                <span className="text-xl font-bold text-white tracking-tight">BillFlow</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-slate-300">
                  <X className="w-6 h-6" />
                </button>
             </div>
             <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      location.pathname === item.href ? "bg-brand-600 text-white" : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
             </nav>
             <div className="p-4 border-t border-white/10">
                <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-text hover:text-white" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
