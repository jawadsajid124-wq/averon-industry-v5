import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Package, 
  Heart, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  LogOut, 
  ExternalLink,
  ShoppingBag,
  Sparkles,
  Calendar,
  Truck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Order, Product, User } from '../types/index.ts';
import { formatCurrencyPrice } from '../lib/currency.ts';

interface AccountDashboardProps {
  isOpen: boolean;
  user: User | null;
  currency: string;
  exchangeRates?: Record<string, number>;
  wishlistProducts: Product[];
  onClose: () => void;
  onLogout: () => void;
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (productId: string) => void;
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({
  isOpen,
  user,
  currency,
  exchangeRates,
  wishlistProducts,
  onClose,
  onLogout,
  onAddToCart,
  onRemoveFromWishlist,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isOpen && user?.email) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    if (!user?.email) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isOpen || !user) return null;

  const formatPrice = (amount: number) => {
    return formatCurrencyPrice(amount, currency, exchangeRates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090b10] border border-slate-700/80 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800 bg-[#07080c] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-lg font-bold text-white tracking-wide">
                  {user.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-tech uppercase tracking-wider bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {user.membershipTier}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-tech">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-950/30 text-xs font-tech flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 flex gap-6 text-xs font-tech uppercase tracking-wider bg-[#06070a]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Vault Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'wishlist'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Curated Wishlist ({wishlistProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Client Dossier & Security</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {loadingOrders ? (
                <div className="py-12 text-center text-slate-400 text-xs font-tech animate-pulse">
                  Querying AVERON Vault records...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-white font-cinzel text-sm">No Acquisitions on Record</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Orders placed with this account will appear here with live tracking numbers and courier updates.
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs font-tech">
                      <div>
                        <span className="text-slate-400 uppercase">Order Ref: </span>
                        <span className="text-cyan-400 font-bold">{order.orderNumber}</span>
                        <span className="text-slate-600 mx-2">|</span>
                        <span className="text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          order.status === 'Approved'
                            ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                            : order.status === 'Delivered'
                            ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                            : order.status === 'Shipped'
                            ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-400'
                            : order.status === 'Rejected'
                            ? 'bg-red-950/80 border border-red-500/50 text-red-300'
                            : 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
                        }`}>
                          {order.status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                          {order.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {order.status === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                          <span>
                            {order.status === 'Pending' ? 'Pending Review' : order.status === 'Approved' ? 'Order Approved' : order.status === 'Rejected' ? 'Order Rejected' : order.status}
                          </span>
                        </span>

                        <span className="text-white font-bold">{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    {/* Order Status Feedback Banner */}
                    {order.status === 'Approved' && (
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-1.5 text-xs font-tech">
                        <div className="flex items-center justify-between text-emerald-300 font-bold uppercase text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Approved & White-Glove Transit Scheduled</span>
                          </span>
                          <span className="text-[10px] text-slate-400">Payment: Cash on Delivery</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200 pt-1">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Scheduled Delivery Date:</span>
                            <span className="text-white font-bold flex items-center gap-1 font-mono text-xs">
                              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                              {order.estimatedDelivery || 'Confirmed by Concierge'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Assigned Courier:</span>
                            <span className="text-white font-bold flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-cyan-400" />
                              {order.courierPartner || 'TCS White-Glove VIP Courier'}
                            </span>
                          </div>
                        </div>
                        {order.deliveryNotes && (
                          <p className="text-[11px] text-slate-300 font-sans pt-1 border-t border-emerald-500/20">
                            <strong className="text-emerald-300 font-tech uppercase text-[10px]">Delivery Instructions: </strong>
                            {order.deliveryNotes}
                          </p>
                        )}
                      </div>
                    )}

                    {order.status === 'Pending' && (
                      <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-xs font-tech text-amber-200 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                        <span>Your order is awaiting executive white-glove review. Delivery date and courier tracking will be assigned upon approval.</span>
                      </div>
                    )}

                    {order.status === 'Rejected' && (
                      <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs font-tech space-y-1">
                        <div className="flex items-center gap-1.5 text-red-300 font-bold uppercase text-[11px]">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span>Order Notice: Acquisition Rejected</span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs">
                          {order.rejectionReason || 'We regret to inform you that this order could not be approved for white-glove fulfillment at this time. Please contact our concierge for bespoke inquiries.'}
                        </p>
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover border border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">{item.name}</p>
                            <p className="text-slate-400 text-[11px] font-tech">
                              Qty: {item.quantity} · {formatPrice(item.price)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Tracking */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap justify-between items-center text-xs font-tech text-slate-400">
                      <div>
                        <span className="uppercase text-[10px]">Courier Tracking: </span>
                        <span className="text-white font-mono">{order.trackingNumber || 'Assigned upon approval'}</span>
                      </div>
                      <div>
                        <span className="uppercase text-[10px]">Destination: </span>
                        <span className="text-slate-300">{order.customer.city}, {order.customer.country}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlistProducts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Heart className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-white font-cinzel text-sm">Your Wishlist is Empty</p>
                  <p className="text-xs text-slate-400">
                    Click the heart icon on any timepiece or leather good to curate your collection.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex gap-4 items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-cinzel font-bold text-white truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs font-tech text-cyan-400 mt-0.5">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => onAddToCart(product)}
                          className="px-3 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-tech text-xs uppercase font-bold flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                        <button
                          onClick={() => onRemoveFromWishlist(product.id)}
                          className="text-[10px] text-slate-500 hover:text-red-400 font-tech uppercase text-center"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl">
              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                <h4 className="font-cinzel text-sm font-bold text-white">Privilege Credentials</h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-tech">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Account ID</span>
                    <span className="text-white font-mono">{user.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Sign-in Provider</span>
                    <span className="text-cyan-400 uppercase">{user.provider}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Role Authorization</span>
                    <span className="text-white uppercase font-bold">{user.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">VIP Club Status</span>
                    <span className="text-emerald-400 uppercase">Active (Lifetime)</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-cinzel text-sm font-bold text-white">Primary Flagship Concierge</h4>
                <p className="text-slate-300">
                  Assigned Private Client Advisor: <span className="text-cyan-400 font-semibold">Henri de Valois</span>
                </p>
                <p className="text-slate-400">
                  Direct Line: <span className="text-white font-mono">+1 (800) 845-AVERON</span>
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
