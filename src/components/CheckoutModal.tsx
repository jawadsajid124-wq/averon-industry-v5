import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Package, 
  MapPin, 
  Truck, 
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CartItem, CustomerInfo, Order, User } from '../types/index.ts';
import { formatCurrencyPrice } from '../lib/currency.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  discountPercent: number;
  currency: string;
  exchangeRates?: Record<string, number>;
  user: User | null;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  discountPercent,
  currency,
  exchangeRates,
  user,
  onClose,
  onOrderCompleted,
}) => {
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    province: 'Punjab',
    country: 'Pakistan',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Google Pay' | 'Apple Pay' | 'Credit Card'>('Cash on Delivery');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [biometricProcessing, setBiometricProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDeliveryEligible =
    customer.country.trim().toLowerCase() === 'pakistan' ||
    customer.country.trim().toLowerCase() === 'pk';

  const formatPrice = (amount: number) => {
    return formatCurrencyPrice(amount, currency, exchangeRates);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const shipping = 0;
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    // Frontend validation: ensure delivery destination is within Pakistan
    if (!isDeliveryEligible) {
      setOrderError('Orders with delivery addresses outside Pakistan are not accepted at this time. AVERON INDUSTRY offers delivery throughout Pakistan.');
      return;
    }

    setIsSubmitting(true);

    if (paymentMethod === 'Google Pay' || paymentMethod === 'Apple Pay') {
      setBiometricProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setBiometricProcessing(false);
    }

    try {
      const orderPayload = {
        customer,
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.image,
          engraving: i.engraving,
        })),
        subtotal,
        discount: discountAmount,
        shipping,
        tax,
        total,
        paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order creation failed');
      }

      setCompletedOrder(data);
      onOrderCompleted(data);
    } catch (err: any) {
      console.error(err);
      setOrderError(err.message || 'Encountered an issue placing your order. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#090b10] border border-slate-700/80 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center">
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-white tracking-wider">
                {completedOrder ? 'Order Confirmed' : 'AVERON Vault Checkout'}
              </h3>
              <p className="text-[10px] font-tech text-slate-400 uppercase tracking-widest">
                {completedOrder ? `Transaction Ref: ${completedOrder.orderNumber}` : 'End-to-End Encrypted Concierge Checkout'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Biometric Verification overlay (Google Pay / Apple Pay) */}
        {biometricProcessing && (
          <div className="absolute inset-0 bg-black/90 z-30 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center" />
            <p className="font-tech text-cyan-300 text-sm uppercase tracking-widest animate-pulse">
              Authenticating {paymentMethod}...
            </p>
          </div>
        )}

        {/* Order Completed Confirmation View */}
        {completedOrder ? (
          <div className="p-6 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/50 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="font-tech text-xs uppercase tracking-[0.3em] text-cyan-400">
                ACQUISITION SECURED
              </span>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white mt-1">
                Welcome to AVERON Elite
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Your order <span className="text-cyan-400 font-mono font-bold">{completedOrder.orderNumber}</span> has been entered into the Swiss Atelier queue. A sealed tamper-evident dispatch dossier is being prepared.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left space-y-3 text-xs font-tech">
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 uppercase">Tracking Number</span>
                <span className="text-cyan-300 font-mono">{completedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 uppercase">Estimated Vault Arrival</span>
                <span className="text-white">{completedOrder.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 uppercase">Payment Authorized</span>
                <span className="text-white">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span className="text-slate-300">Total Settled</span>
                <span className="text-cyan-400">{formatPrice(completedOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-tech text-xs uppercase tracking-widest font-bold transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                Return to Boutique
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Left: Contact & Shipping */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>White-Glove Delivery Destination</span>
                  </h4>
                  <span className="text-[10px] font-tech uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                    Pakistan Delivery Only
                  </span>
                </div>

                {/* Delivery Policy Banner */}
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-tech text-cyan-200 flex items-start gap-2">
                  <Truck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-white text-[10px]">
                      DELIVERY AVAILABLE ALL OVER PAKISTAN
                    </span>
                    <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                      AVERON INDUSTRY offers delivery throughout Pakistan. Orders with delivery addresses outside Pakistan are not accepted at this time.
                    </p>
                  </div>
                </div>

                {orderError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-tech flex items-start gap-2 animate-in fade-in duration-200">
                    <span className="text-red-400 font-bold shrink-0">✕</span>
                    <span>{orderError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="e.g. Jawad Sajid"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                      VIP Contact Email
                    </label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="client@averonindustry.com"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                      <span>Contact Phone / WhatsApp</span>
                      <span className="text-slate-500 font-normal lowercase text-[9px]">(worldwide numbers accepted)</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="+92 305 6674374"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                      Destination Country
                    </label>
                    <select
                      value={customer.country}
                      onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-tech uppercase font-bold text-cyan-300"
                    >
                      <option value="Pakistan">Pakistan (Nationwide Fulfillment)</option>
                      <option value="International">Outside Pakistan (Not Accepted)</option>
                    </select>
                  </div>
                </div>

                {!isDeliveryEligible && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs font-tech">
                    ⚠️ Orders with delivery addresses outside Pakistan are not accepted at this time. Please specify a delivery destination within Pakistan.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                      Province / Territory
                    </label>
                    <select
                      value={customer.province || 'Punjab'}
                      onChange={(e) => setCustomer({ ...customer, province: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-tech"
                    >
                      <option value="Punjab">Punjab</option>
                      <option value="Sindh">Sindh</option>
                      <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                      <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                      <option value="Azad Jammu and Kashmir">Azad Jammu and Kashmir</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                    Street Address & Suite / House Number
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="House / Apartment, Street, Sector / Area"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                    Postal Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={customer.postalCode}
                    onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                    placeholder="e.g. 54000"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Payment Selection - Temporary Cash on Delivery Active */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-cinzel text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      <span>Payment Method</span>
                    </h4>
                    <span className="text-[10px] font-tech uppercase text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded">
                      COD Active
                    </span>
                  </div>

                  {/* Active Cash on Delivery Card */}
                  <div 
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-cyan-400 bg-cyan-950/30 text-white shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel font-bold text-xs sm:text-sm text-white">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[9px] font-tech uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                            Available in Pakistan
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-300 font-sans mt-0.5">
                          Pay securely upon white-glove delivery at your doorstep across Pakistan.
                        </p>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    </div>
                  </div>

                  {/* Exact Required Notice for Other Payment Methods */}
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-tech text-slate-400 flex items-center gap-2">
                    <span className="text-cyan-400 text-xs">✦</span>
                    <span className="text-slate-300 font-medium">
                      Other payment methods are available after sometime.
                    </span>
                  </div>

                  {/* Preserved Payment Options (Temporarily Disabled Architecture) */}
                  <div className="grid grid-cols-3 gap-2 opacity-60">
                    <div
                      title="Other payment methods are available after sometime."
                      className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-500 text-[10px] font-tech font-bold uppercase flex flex-col items-center justify-center gap-1 cursor-not-allowed select-none"
                    >
                      <span className="font-sans font-black text-xs">G Pay</span>
                      <span className="text-[8px] text-slate-500">Temporarily Paused</span>
                    </div>

                    <div
                      title="Other payment methods are available after sometime."
                      className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-500 text-[10px] font-tech font-bold uppercase flex flex-col items-center justify-center gap-1 cursor-not-allowed select-none"
                    >
                      <span className="font-sans font-black text-xs"> Pay</span>
                      <span className="text-[8px] text-slate-500">Temporarily Paused</span>
                    </div>

                    <div
                      title="Other payment methods are available after sometime."
                      className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-500 text-[10px] font-tech font-bold uppercase flex flex-col items-center justify-center gap-1 cursor-not-allowed select-none"
                    >
                      <span>Credit Card</span>
                      <span className="text-[8px] text-slate-500">Temporarily Paused</span>
                    </div>
                  </div>

                  {paymentMethod === 'Credit Card' && (
                    <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
                      <div>
                        <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">Expiry</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">CVC Security</label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="md:col-span-5 bg-[#07080c] p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-white mb-3 pb-2 border-b border-slate-800">
                    Acquisition Summary
                  </h4>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-2.5 items-center text-xs">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 rounded object-cover border border-slate-800"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white truncate font-medium">{item.product.name}</p>
                          <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-tech text-white font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs font-tech text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white">{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-cyan-400">
                        <span>VIP Privilege Discount</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>White-Glove Shipping</span>
                      <span className="text-emerald-400 uppercase">Complimentary</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duties & Vault VAT (8%)</span>
                      <span className="text-white">{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white text-sm">
                      <span className="font-cinzel">Total Acquisition</span>
                      <span className="text-cyan-400 font-tech text-base">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isDeliveryEligible}
                    className={`w-full py-4 rounded-lg font-tech text-xs uppercase tracking-[0.2em] font-extrabold transition-all flex items-center justify-center gap-2 ${
                      !isDeliveryEligible
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-[0_0_25px_rgba(0,240,255,0.4)]'
                    }`}
                  >
                    {!isDeliveryEligible ? (
                      <span>Delivery Only Within Pakistan</span>
                    ) : isSubmitting ? (
                      <span>Authorizing Vault Transaction...</span>
                    ) : (
                      <>
                        <span>AUTHORIZE ORDER · {formatPrice(total)}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[9px] font-tech text-slate-500 uppercase">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Protected by AVERON Escrow Guarantee</span>
                  </div>
                </div>
              </div>

            </div>
          </form>
        )}

      </div>
    </div>
  );
};
