import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  User, 
  ChevronRight, 
  History,
  AlertCircle,
  Search,
  Check,
  Package,
  Sparkles
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [items, setItems] = useState([{ name: '', price: '', quantity: '1' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Product catalog state
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false);
  const productPanelRef = useRef(null);

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

  const addItem = () => {
    setItems([...items, { name: '', price: '', quantity: '1' }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addProductToItems = (product) => {
    // Check if item with this name already exists and increment qty
    const existingIndex = items.findIndex(i => i.name === product.name);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity = String(parseInt(newItems[existingIndex].quantity || '1') + 1);
      setItems(newItems);
    } else {
      // If the last item row is empty, fill it in
      const lastItem = items[items.length - 1];
      if (!lastItem.name && !lastItem.price) {
        const newItems = [...items];
        newItems[items.length - 1] = { name: product.name, price: String(product.price), quantity: '1' };
        setItems(newItems);
      } else {
        setItems([...items, { name: product.name, price: String(product.price), quantity: '1' }]);
      }
    }
    setProductSearch('');
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      return sum + (price * qty);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) return setError('Please select a customer');
    if (items.some(i => !i.name || !i.price)) return setError('Please fill all item details');

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/invoice', { customerId, items });
      navigate(`/invoice/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice. Your subscription might be expired.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">New Bill</h1>
            <p className="text-slate-500">Create a professional invoice for your customer.</p>
         </div>
         <Button variant="outline" onClick={() => navigate('/invoices')} className="gap-2">
            <History className="w-4 h-4" />
            History
         </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-600">
             <AlertCircle className="w-5 h-5" />
             <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Customer select */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
               <User className="w-5 h-5 text-brand-600" />
               Select Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="relative">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <Input 
                      className="pl-11 h-12 text-lg rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500"
                      placeholder="Identify the buyer (name or phone)..."
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
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                         {customers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-400">
                               No customers found. Add them first.
                            </div>
                         ) : (() => {
                            const filtered = customers.filter(c => 
                               c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                               c.phone.includes(customerSearch)
                            );
                            
                            if (filtered.length === 0) return (
                               <div className="p-4 text-center text-sm text-slate-400 italic">
                                  No matches for "{customerSearch}"
                               </div>
                            );

                            return filtered.map(c => (
                               <div 
                                  key={c.id}
                                  className={cn(
                                     "flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-none",
                                     customerId === c.id && "bg-brand-50"
                                  )}
                                  onClick={() => {
                                     setCustomerId(c.id);
                                     setCustomerSearch(`${c.name} (${c.phone})`);
                                     setIsCustomerDropdownOpen(false);
                                  }}
                               >
                                  <div className="flex flex-col">
                                     <span className="font-semibold text-slate-900">{c.name}</span>
                                     <span className="text-xs text-slate-500">{c.phone}</span>
                                  </div>
                                  {customerId === c.id && <Check className="w-5 h-5 text-brand-600" />}
                               </div>
                            ));
                         })()}
                      </div>
                   </>
                )}
             </div>
          </CardContent>
        </Card>

        {/* Product Catalog Quick-Add */}
        {products.length > 0 && (
          <Card className="border-brand-100 bg-brand-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-brand-700">
                  <Sparkles className="w-4 h-4" />
                  Quick Add from Catalog
                </CardTitle>
                <button 
                  type="button"
                  onClick={() => setIsProductPanelOpen(!isProductPanelOpen)}
                  className="text-xs font-semibold text-brand-600 hover:underline"
                >
                  {isProductPanelOpen ? 'Hide' : 'Browse ↓'}
                </button>
              </div>
            </CardHeader>
            {isProductPanelOpen && (
              <CardContent className="pt-0">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    className="pl-9 bg-white"
                    placeholder="Search your products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto py-1">
                  {filteredProducts.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No products found.</p>
                  ) : filteredProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProductToItems(p)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-brand-100 hover:border-brand-400 hover:bg-brand-50 hover:shadow-sm text-sm font-medium text-slate-700 transition-all group"
                    >
                      <Package className="w-3.5 h-3.5 text-brand-500 group-hover:scale-110 transition-transform" />
                      <span>{p.name}</span>
                      <span className="text-brand-600 font-bold">{formatCurrency(p.price)}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Items */}
        <Card>
           <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 mb-6">
              <CardTitle className="text-lg">Items &amp; Services</CardTitle>
              <Button type="button" variant="secondary" size="sm" onClick={addItem} className="gap-1.5 h-9 rounded-lg">
                 <Plus className="w-4 h-4" />
                 Add Line
              </Button>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-4 px-2 mb-2">
                 <div className="col-span-6 text-xs font-bold text-slate-400 uppercase">Item Name</div>
                 <div className="col-span-3 text-xs font-bold text-slate-400 uppercase">Price (₹)</div>
                 <div className="col-span-2 text-xs font-bold text-slate-400 uppercase">Qty</div>
                 <div className="col-span-1"></div>
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border-b md:border-none pb-4 md:pb-0">
                  <div className="col-span-6 space-y-1.5">
                    <Label className="md:hidden">Item Name</Label>
                    <Input 
                      placeholder="e.g. Graphic Design" 
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 space-y-1.5">
                    <Label className="md:hidden">Price</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="md:hidden">Quantity</Label>
                    <Input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 pt-0 md:pt-1">
                     <Button 
                       type="button" 
                       variant="ghost" 
                       size="icon" 
                       className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-10 w-10 sm:h-9 sm:w-9"
                       onClick={() => removeItem(index)}
                       disabled={items.length === 1}
                     >
                       <Trash2 className="w-4 h-4" />
                     </Button>
                  </div>
                </div>
              ))}
           </CardContent>
           <CardFooter className="bg-slate-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 italic">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <Calculator className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-xs text-slate-500 font-bold uppercase py-1">Grand Total</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{formatCurrency(calculateTotal())}</p>
                 </div>
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[200px] gap-2 rounded-xl text-lg h-14" disabled={loading}>
                 {loading ? 'Creating...' : 'Generate Invoice'}
                 <ChevronRight className="w-5 h-5" />
              </Button>
           </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default CreateInvoicePage;
