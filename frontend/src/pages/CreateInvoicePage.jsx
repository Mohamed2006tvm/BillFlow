import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Plus, 
  Minus,
  Trash2, 
  Search,
  Check,
  Package,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  XCircle,
  ChevronRight,
  User
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category || 'General'))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || (p.category || 'General') === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotal = calculateSubtotal();
  const gst = subtotal * 0.05; // 5% GST as per concept
  const total = subtotal + gst - discount;

  const handleCreateInvoice = async () => {
    if (!customerId) return setError('Please select a customer');
    if (cart.length === 0) return setError('Cart is empty');

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/invoice', { 
        customerId, 
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });
      navigate(`/invoice/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerId('');
    setCustomerSearch('');
    setError('');
  };

  return (
    <div className="flex h-[calc(100vh-100px)] -m-8 bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50">
        
        {/* Top Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">New Order</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
             <div className="flex items-center gap-2">
                <span>Table:</span>
                <span className="bg-slate-800 text-slate-100 px-2 py-0.5 rounded border border-slate-700">—</span>
             </div>
             <div className="flex items-center gap-2">
                <span>Items:</span>
                <span className="bg-brand-600 text-white px-2 py-0.5 rounded">{cart.length}</span>
             </div>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-11 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                  activeCategory === cat 
                    ? "bg-brand-600 border-brand-500 text-white" 
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative flex flex-col bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden cursor-pointer hover:border-brand-500/50 hover:bg-slate-800/80 transition-all hover:shadow-lg hover:shadow-brand-500/5 active:scale-95"
              >
                <div className="aspect-[4/5] w-full bg-slate-700/30 flex items-center justify-center p-4">
                   <Package className="w-12 h-12 text-slate-600 group-hover:scale-110 group-hover:text-brand-500 transition-all duration-300" />
                </div>
                <div className="p-3 border-t border-slate-700/50">
                  <h3 className="text-sm font-bold text-slate-100 truncate mb-0.5">{product.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{product.category || 'General'}</p>
                  <p className="mt-2 text-md font-black text-brand-400">₹{product.price}</p>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
                 <Search className="w-12 h-12" />
                 <p className="font-bold tracking-tight">No products found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Current Order */}
      <div className="w-[380px] border-l border-slate-800 flex flex-col bg-slate-900">
        <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <h2 className="text-md font-bold text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand-500" />
            Current Order
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Table</span>
            <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs font-bold">—</span>
          </div>
        </div>

        {/* Customer Selector */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/20 shrink-0">
          <div className="relative">
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                  className="w-full bg-slate-800/40 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500/50 transition-all"
                  placeholder="Select Customer..."
                  value={customerSearch}
                  onChange={(e) => {
                     setCustomerSearch(e.target.value);
                     setIsCustomerDropdownOpen(true);
                  }}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
               />
            </div>
            {isCustomerDropdownOpen && (
               <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCustomerDropdownOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-800 border border-slate-700 shadow-2xl rounded-xl max-h-60 overflow-y-auto">
                     {customers.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 italic">No customers found</div>
                     ) : (() => {
                        const filtered = customers.filter(c => 
                           c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                           c.phone.includes(customerSearch)
                        );
                        if (filtered.length === 0) return <div className="p-4 text-center text-xs text-slate-500 italic">No matches</div>;
                        return filtered.map(c => (
                           <div 
                              key={c.id}
                              className={cn(
                                 "p-3 cursor-pointer hover:bg-slate-700 border-b border-slate-700/50 last:border-none transition-colors flex items-center justify-between",
                                 customerId === c.id && "bg-brand-600/20"
                              )}
                              onClick={() => {
                                 setCustomerId(c.id);
                                 setCustomerSearch(c.name);
                                 setIsCustomerDropdownOpen(false);
                              }}
                           >
                              <div>
                                 <p className="font-bold text-sm text-slate-200">{c.name}</p>
                                 <p className="text-[10px] text-slate-500">{c.phone}</p>
                              </div>
                              {customerId === c.id && <Check className="w-4 h-4 text-brand-500" />}
                           </div>
                        ));
                     })()}
                  </div>
               </>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4 py-20">
               <ShoppingCart className="w-16 h-16 stroke-[1]" />
               <p className="text-sm font-bold uppercase tracking-widest text-center">No items added</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="group animate-in slide-in-from-right-2 duration-200">
                <div className="flex items-center gap-3">
                   <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-200 truncate">{item.name}</p>
                      <p className="text-xs text-brand-400 font-black">₹{item.price}</p>
                   </div>
                   <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      >
                         <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-black text-slate-100">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      >
                         <Plus className="w-3.5 h-3.5" />
                      </button>
                   </div>
                   <div className="w-20 text-right">
                      <p className="text-sm font-black text-slate-100">₹{item.price * item.quantity}</p>
                   </div>
                   <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-600 hover:text-red-400 rounded transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 space-y-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="space-y-1 text-sm">
             <div className="flex justify-between items-center text-slate-400">
                <span>Subtotal</span>
                <span className="font-black text-slate-200">₹{subtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center text-slate-400 group">
                <span>Discount</span>
                <input 
                  type="number"
                  className="bg-transparent text-right w-20 outline-none font-black text-slate-200 border-b border-transparent group-hover:border-slate-700 focus:border-brand-500 transition-all"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
             </div>
             <div className="flex justify-between items-center text-slate-400">
                <span>GST (5%)</span>
                <span className="font-black text-slate-200">₹{gst.toFixed(2)}</span>
             </div>
          </div>

          <div className="pt-2 border-t border-dashed border-slate-700">
            <div className="flex justify-between items-center">
               <span className="text-md font-bold text-slate-300">Total</span>
               <span className="text-2xl font-black text-brand-400">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Mode */}
          <div className="space-y-2">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Mode</p>
             <div className="grid grid-cols-3 gap-2">
                {[
                   { id: 'Cash', icon: Banknote },
                   { id: 'Card', icon: CreditCard },
                   { id: 'UPI', icon: Smartphone }
                ].map(mode => (
                   <button
                     key={mode.id}
                     onClick={() => setPaymentMode(mode.id)}
                     className={cn(
                        "flex flex-col items-center gap-1.5 py-2 rounded-lg border text-[10px] font-bold transition-all",
                        paymentMode === mode.id 
                          ? "bg-brand-600/20 border-brand-500 text-brand-400" 
                          : "bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                     )}
                   >
                      <mode.icon className="w-4 h-4" />
                      {mode.id}
                   </button>
                ))}
             </div>
          </div>

          {error && <p className="text-[10px] font-bold text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20">{error}</p>}

          <div className="grid grid-cols-5 gap-2">
             <button 
               onClick={clearCart}
               className="col-span-1 flex items-center justify-center p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all active:scale-95"
               title="Clear All"
             >
                <XCircle className="w-5 h-5" />
             </button>
             <button 
               onClick={handleCreateInvoice}
               disabled={loading || cart.length === 0}
               className="col-span-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white font-black text-lg shadow-lg shadow-brand-600/20 hover:bg-brand-500 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
             >
                {loading ? 'Processing...' : (
                  <>
                    <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Generate Bill
                  </>
                )}
             </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CreateInvoicePage;
