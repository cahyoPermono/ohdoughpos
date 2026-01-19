import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { supabase } from './lib/supabase';
import { Plus, Edit, Trash, History, Search, Package, ShoppingCart, X, Calendar, Receipt, ChevronRight } from 'lucide-react';
import type { Product, CartItem } from './types';
import logo from './assets/logo.png';

// ==========================================
// TYPES
// ==========================================
interface Order {
  id: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  products: Product;
}

// ==========================================
// PRINTABLE RECEIPT - 58mm Thermal Format
// ==========================================
const PrintableReceipt = React.forwardRef<HTMLDivElement, { 
  orderId: string, 
  items: CartItem[], 
  total: number, 
  date: Date 
}>((props, ref) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div ref={ref} className="print-receipt">
      <div className="receipt-header">
        <img src={logo} alt="OH! DOUGH" className="receipt-logo" />
        <div>Fresh Bakery & Pastry</div>
        <div style={{ fontSize: '8pt', marginTop: '1mm' }}>Jl. Contoh No. 123, Jakarta</div>
        <div style={{ fontSize: '8pt' }}>Tel: (021) 123-4567</div>
      </div>
      
      <hr className="receipt-divider-solid" />
      
      <div style={{ marginBottom: '2mm' }}>
        <div className="receipt-item">
          <span>Tanggal</span>
          <span>{formatDate(props.date)}</span>
        </div>
        <div className="receipt-item">
          <span>Waktu</span>
          <span>{formatTime(props.date)}</span>
        </div>
        <div className="receipt-item">
          <span>No. Order</span>
          <span>#{props.orderId.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="receipt-item">
          <span>Kasir</span>
          <span>Cashier</span>
        </div>
      </div>

      <hr className="receipt-divider" />

      <div style={{ marginBottom: '2mm' }}>
        {props.items.map((item) => (
          <div key={item.id} style={{ marginBottom: '1.5mm' }}>
            <div style={{ fontWeight: 'bold' }}>
              {item.product.name}
            </div>
            <div className="receipt-item" style={{ paddingLeft: '2mm' }}>
              <span>{item.quantity} x Rp{formatCurrency(item.product.price)}</span>
              <span>Rp{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <hr className="receipt-divider" />

      <div style={{ marginBottom: '2mm' }}>
        <div className="receipt-item">
          <span>Subtotal</span>
          <span>Rp{formatCurrency(props.total)}</span>
        </div>
        <div className="receipt-item">
          <span>Pajak (0%)</span>
          <span>Rp0</span>
        </div>
      </div>
      
      <hr className="receipt-divider-solid" />
      
      <div className="receipt-item receipt-total">
        <span>TOTAL</span>
        <span>Rp{formatCurrency(props.total)}</span>
      </div>
      
      <hr className="receipt-divider-solid" />

      <div style={{ marginTop: '2mm', marginBottom: '2mm' }}>
        <div className="receipt-item">
          <span>Bayar (Tunai)</span>
          <span>Rp{formatCurrency(props.total)}</span>
        </div>
        <div className="receipt-item">
          <span>Kembali</span>
          <span>Rp0</span>
        </div>
      </div>

      <hr className="receipt-divider" />

      <div className="receipt-footer">
        <div style={{ marginBottom: '2mm' }}>
          *** Terima Kasih ***
        </div>
        <div>Barang yang sudah dibeli</div>
        <div>tidak dapat ditukar/dikembalikan</div>
        <div style={{ marginTop: '2mm', fontWeight: 'bold' }}>
          @ohdough.bakery
        </div>
      </div>
    </div>
  );
});

// ==========================================
// MAIN APP COMPONENT
// ==========================================
function App() {
  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'history'>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<{orderId: string, items: CartItem[], total: number, date: Date} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  // Products Management State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Transaction History State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  // Delete Confirmation State
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (receiptData) {
      setTimeout(() => {
        window.print();
        setReceiptData(null);
      }, 100);
    }
  }, [receiptData]);

  async function fetchProducts() {
    setIsLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      setProducts(data);
    }
    setIsLoading(false);
  }

  async function fetchOrders() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price_at_time,
          products (*)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (!error && data) {
      setOrders(data);
    }
    setIsLoading(false);
  }

  const filteredProducts = products.filter(product => 
    product.category !== 'ARCHIVED' && (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Cart Actions
  const addToCart = (product: Product) => {
    setCart(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        return current.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { id: crypto.randomUUID(), product, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(current => current.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(current => current.filter(item => item.id !== itemId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsLoading(true);

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        total_amount: totalAmount,
        payment_method: 'cash',
        status: 'completed'
      })
      .select()
      .single();

    if (orderError || !orderData) {
      alert('Error creating order');
      setIsLoading(false);
      return;
    }

    const orderItems = cart.map(item => ({
      order_id: orderData.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_time: item.product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      alert('Error creating order items');
    } else {
      setReceiptData({
        orderId: orderData.id,
        items: [...cart],
        total: totalAmount,
        date: new Date()
      });
      
      setCart([]);
      setIsMobileCartOpen(false);
    }
    
    setIsLoading(false);
  };

  // Product Management Actions
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const product = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      image_url: formData.get('image_url') as string,
    };

    setIsLoading(true);
    if (editingProduct) {
       await supabase.from('products').update(product).eq('id', editingProduct.id);
    } else {
       await supabase.from('products').insert(product);
    }
    setIsLoading(false);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const openDeleteModal = (id: string) => {
    setDeleteProductId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return;
    setIsLoading(true);
    setIsDeleteModalOpen(false);
    try {
      const { error } = await supabase.from('products').delete().eq('id', deleteProductId);
      if (error) {
        if (error.code === '23503') {
          setIsArchiveModalOpen(true);
        } else {
          alert('Error deleting product: ' + error.message);
          setDeleteProductId(null);
        }
      } else {
        await fetchProducts();
        setDeleteProductId(null);
      }
    } catch {
      alert('Error deleting product');
      setDeleteProductId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const archiveProduct = async () => {
    if (!deleteProductId) return;
    setIsLoading(true);
    setIsArchiveModalOpen(false);
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ category: 'ARCHIVED' })
        .eq('id', deleteProductId);

      if (error) {
        alert('Error archiving product: ' + error.message);
      } else {
        await fetchProducts();
      }
    } catch {
      alert('Error archiving product');
    } finally {
      setIsLoading(false);
      setDeleteProductId(null);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <>
      <div className="print:hidden h-screen bg-gradient-warm">
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {/* ==================== POS TAB ==================== */}
          {activeTab === 'pos' && (
            <div className="flex h-full w-full">
              {/* Product Grid - Main Area */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="px-4 md:px-8 py-4 md:py-6 bg-white/80 backdrop-blur-md border-b border-earth-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-0 z-10">
                  <div>
                    <h1 className="font-serif text-xl md:text-2xl font-bold text-earth-900">Products</h1>
                    <p className="text-earth-500 text-xs md:text-sm mt-0.5">Select items to add to order</p>
                  </div>
                  
                  {/* Search */}
                  <div className="relative w-full sm:w-auto">
                    <input 
                      type="search" 
                      placeholder="Search products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-earth-50 border border-earth-100 hover:border-earth-200 focus:bg-white focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 rounded-xl pl-11 pr-4 py-3 w-full sm:w-72 text-sm transition-all outline-none"
                    />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" />
                  </div>
                </header>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-10 h-10 border-3 border-earth-200 border-t-accent-gold rounded-full animate-spin" />
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
                      {filteredProducts.map(product => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          onAddToCart={addToCart} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-earth-400">
                      <div className="w-20 h-20 rounded-2xl bg-earth-100 flex items-center justify-center mb-4">
                        <Package size={32} className="text-earth-300" />
                      </div>
                      <p className="font-medium text-earth-500">No products found</p>
                      <p className="text-sm text-earth-400 mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Cart Sidebar */}
              <div className="w-[380px] shrink-0 h-full hidden md:block border-l border-earth-100">
                <Cart 
                  items={cart} 
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeFromCart}
                  onCheckout={handleCheckout}
                  isProcessing={isLoading}
                />
              </div>

              {/* Mobile Cart Button */}
              {cart.length > 0 && (
                <button
                  onClick={() => setIsMobileCartOpen(true)}
                  className="md:hidden fixed bottom-20 right-4 z-20 bg-gradient-button text-white w-14 h-14 rounded-full shadow-button flex items-center justify-center animate-scale-in"
                >
                  <ShoppingCart size={24} />
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-accent-gold text-earth-900 text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                </button>
              )}

              {/* Mobile Cart Drawer */}
              {isMobileCartOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)} />
                  <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-earth-100">
                      <h3 className="font-serif text-xl font-bold text-earth-900">Your Order</h3>
                      <button onClick={() => setIsMobileCartOpen(false)} className="p-2 hover:bg-earth-100 rounded-xl transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="max-h-[calc(85vh-60px)] overflow-y-auto">
                      <Cart 
                        items={cart} 
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeFromCart}
                        onCheckout={handleCheckout}
                        isProcessing={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== INVENTORY TAB ==================== */}
          {activeTab === 'products' && (
            <div className="p-4 md:p-8 h-full overflow-y-auto w-full pb-24 md:pb-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-8">
                  <div>
                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-earth-900 mb-1">Inventory</h1>
                    <p className="text-earth-500 text-sm">Manage your bakery products</p>
                  </div>
                  <button 
                    onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                    className="bg-gradient-button text-white px-5 py-3 rounded-xl font-bold shadow-button hover:shadow-button-hover transition-all flex items-center gap-2 text-sm active:scale-95 w-full sm:w-auto justify-center"
                  >
                    <Plus size={18} />
                    Add New Product
                  </button>
                </div>

                {/* Mobile: Card Layout | Desktop: Table Layout */}
                <div className="md:hidden space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl p-4 shadow-card border border-earth-100">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl bg-earth-100 flex items-center justify-center overflow-hidden shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-2xl">🥐</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-earth-900 truncate">{product.name}</h4>
                          <span className="inline-block px-2 py-0.5 mt-1 rounded-md bg-earth-100 text-[10px] font-bold text-earth-600 uppercase">
                            {product.category}
                          </span>
                          <p className="text-lg font-bold text-earth-700 mt-2">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setIsProductModalOpen(true); }}
                            className="w-9 h-9 flex items-center justify-center text-earth-400 hover:text-earth-800 hover:bg-earth-100 rounded-lg transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openDeleteModal(product.id); }}
                            className="w-9 h-9 flex items-center justify-center text-earth-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block bg-white rounded-2xl shadow-card border border-earth-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-earth-50 text-earth-500 text-xs font-bold uppercase tracking-wider border-b border-earth-100">
                      <tr>
                        <th className="p-5 font-semibold">Product</th>
                        <th className="p-5 font-semibold">Category</th>
                        <th className="p-5 font-semibold">Price</th>
                        <th className="p-5 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-earth-100">
                      {products.map(product => (
                        <tr key={product.id} className="hover:bg-earth-50/50 transition-colors">
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-earth-100 flex items-center justify-center overflow-hidden shrink-0">
                                {product.image_url ? (
                                  <img src={product.image_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <span className="text-xl">🥐</span>
                                )}
                              </div>
                              <span className="font-semibold text-earth-900">{product.name}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className="px-3 py-1.5 rounded-lg bg-gradient-warm text-xs font-bold text-earth-600 uppercase tracking-wide border border-earth-100">
                              {product.category}
                            </span>
                          </td>
                          <td className="p-5 font-bold text-earth-700">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="p-5">
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setIsProductModalOpen(true); }}
                                className="w-9 h-9 flex items-center justify-center text-earth-400 hover:text-earth-800 hover:bg-earth-100 rounded-lg transition-all"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); openDeleteModal(product.id); }}
                                className="w-9 h-9 flex items-center justify-center text-earth-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {products.length === 0 && (
                    <div className="p-12 text-center text-earth-400">
                      <Package size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="font-medium">No products yet</p>
                      <p className="text-sm mt-1">Add your first product to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== HISTORY TAB ==================== */}
          {activeTab === 'history' && (
            <div className="p-4 md:p-8 h-full overflow-y-auto w-full pb-24 md:pb-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6 md:mb-8">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-earth-900 mb-1">Transaction History</h1>
                  <p className="text-earth-500 text-sm">View all your past orders</p>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-3 border-earth-200 border-t-accent-gold rounded-full animate-spin" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div 
                        key={order.id}
                        onClick={() => { setSelectedOrder(order); setIsOrderDetailOpen(true); }}
                        className="bg-white rounded-2xl p-4 md:p-5 shadow-card border border-earth-100 hover:shadow-card-hover hover:border-accent-gold/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center shrink-0">
                            <Receipt size={20} className="text-accent-copper" />
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-earth-900">Order #{order.id.slice(0, 8).toUpperCase()}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                order.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-earth-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(order.created_at)}
                              </span>
                              <span>•</span>
                              <span>{order.order_items?.length || 0} items</span>
                            </div>
                          </div>
                          
                          {/* Amount & Arrow */}
                          <div className="text-right">
                            <p className="font-bold text-lg text-earth-900">{formatCurrency(order.total_amount)}</p>
                            <p className="text-xs text-earth-400 capitalize">{order.payment_method}</p>
                          </div>
                          <ChevronRight size={20} className="text-earth-300 group-hover:text-earth-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 rounded-2xl bg-earth-100 flex items-center justify-center mb-6">
                      <History size={40} className="text-earth-300" />
                    </div>
                    <h3 className="text-xl font-bold text-earth-700 mb-2">No transactions yet</h3>
                    <p className="text-earth-400">Your order history will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Layout>

        {/* ==================== PRODUCT MODAL ==================== */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
              <h2 className="font-serif text-xl md:text-2xl font-bold text-earth-900 mb-6">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h2>
              
              <form onSubmit={handleSaveProduct} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-earth-600 mb-2">Product Name</label>
                  <input 
                    name="name" 
                    defaultValue={editingProduct?.name} 
                    required 
                    className="w-full border border-earth-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold outline-none transition-all" 
                    placeholder="e.g. Croissant"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-earth-600 mb-2">Price (Rp)</label>
                    <input 
                      name="price" 
                      type="number" 
                      defaultValue={editingProduct?.price} 
                      required 
                      className="w-full border border-earth-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold outline-none transition-all" 
                      placeholder="25000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-earth-600 mb-2">Category</label>
                    <select 
                      name="category" 
                      defaultValue={editingProduct?.category || 'Bread'} 
                      className="w-full border border-earth-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold outline-none transition-all bg-white"
                    >
                      <option value="Bread">Bread</option>
                      <option value="Pastry">Pastry</option>
                      <option value="Cake">Cake</option>
                      <option value="Drink">Drink</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-earth-600 mb-2">Image URL</label>
                  <input 
                    name="image_url" 
                    defaultValue={editingProduct?.image_url} 
                    placeholder="https://example.com/image.jpg" 
                    className="w-full border border-earth-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold outline-none transition-all" 
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsProductModalOpen(false)} 
                    className="flex-1 px-4 py-3 border border-earth-200 rounded-xl hover:bg-earth-50 font-semibold text-earth-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-3 bg-gradient-button text-white rounded-xl hover:shadow-button font-bold transition-all"
                  >
                    {editingProduct ? 'Update' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash size={32} className="text-red-500" />
                </div>
                <h3 className="font-serif text-xl font-bold text-earth-900 mb-2">
                  Hapus Produk?
                </h3>
                <p className="text-earth-500 text-sm mb-6">
                  Produk akan dihapus secara permanen dan tidak dapat dikembalikan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsDeleteModalOpen(false); setDeleteProductId(null); }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold border-2 border-earth-200 text-earth-600 hover:bg-earth-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDeleteProduct}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Menghapus...' : 'Hapus'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ARCHIVE CONFIRMATION MODAL ==================== */}
        {isArchiveModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Package size={32} className="text-yellow-600" />
                </div>
                <h3 className="font-serif text-xl font-bold text-earth-900 mb-2">
                  Arsipkan Produk?
                </h3>
                <p className="text-earth-500 text-sm mb-6">
                  Produk ini memiliki riwayat transaksi dan tidak dapat dihapus permanen. Apakah Anda ingin mengarsipkannya saja? (Produk akan disembunyikan).
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsArchiveModalOpen(false); setDeleteProductId(null); }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold border-2 border-earth-200 text-earth-600 hover:bg-earth-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={archiveProduct}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Mengarsipkan...' : 'Arsipkan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ORDER DETAIL MODAL ==================== */}
        {isOrderDetailOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-earth-100 bg-gradient-warm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-serif text-xl font-bold text-earth-900">
                    Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <button 
                    onClick={() => setIsOrderDetailOpen(false)} 
                    className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm text-earth-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(selectedOrder.created_at)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedOrder.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              
              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-xs font-bold text-earth-400 uppercase tracking-wider mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-earth-50 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 border border-earth-100">
                        {item.products?.image_url ? (
                          <img src={item.products.image_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-xl">🥐</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-earth-900 truncate">{item.products?.name || 'Unknown Product'}</h4>
                        <p className="text-xs text-earth-500">{formatCurrency(item.price_at_time)} × {item.quantity}</p>
                      </div>
                      <p className="font-bold text-earth-700">{formatCurrency(item.price_at_time * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-earth-100 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-earth-500">Payment Method</span>
                  <span className="font-semibold text-earth-700 capitalize">{selectedOrder.payment_method}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-earth-100">
                  <span className="font-serif text-lg text-earth-900">Total</span>
                  <span className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                    {formatCurrency(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Receipt for Printing */}
      {receiptData && (
        <PrintableReceipt 
          orderId={receiptData.orderId}
          items={receiptData.items}
          total={receiptData.total}
          date={receiptData.date}
        />
      )}
    </>
  );
}

export default App;
