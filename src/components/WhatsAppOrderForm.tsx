import React, { useState } from 'react';
import { User, Home, Phone, ArrowLeft, MessageSquare, CreditCard } from 'lucide-react';
import { PaystackButton } from 'react-paystack';

interface WhatsAppOrderFormProps {
  vendorName: string;
  itemsCount: number;
  totalPrice: number;
  onClose: () => void;
  onSubmit: (data: { name: string; hostel: string; phone: string; paymentRef?: string }) => void;
  customerEmail?: string;
}

export default function WhatsAppOrderForm({
  vendorName,
  itemsCount,
  totalPrice,
  onClose,
  onSubmit,
  customerEmail = ''
}: WhatsAppOrderFormProps) {
  // Input states prefilled from localStorage
  const [name, setName] = useState(() => localStorage.getItem('tu_buyer_name') || '');
  const [hostel, setHostel] = useState(() => localStorage.getItem('tu_buyer_hostel') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('tu_buyer_phone') || '');
  const [email, setEmail] = useState(() => customerEmail || localStorage.getItem('tu_buyer_email') || '');
  
  // Validation state
  const [errors, setErrors] = useState<{ name?: string; hostel?: string; phone?: string; email?: string }>({});

  const validate = (showErrors = true) => {
    const newErrors: { name?: string; hostel?: string; phone?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = 'Please enter your name';
    if (!hostel.trim()) newErrors.hostel = 'Please enter your hostel location';
    if (!phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (phone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email for payment receipt';
    }

    if (showErrors && Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate(true)) return;

    // Persist details for future easy transactions
    localStorage.setItem('tu_buyer_name', name.trim());
    localStorage.setItem('tu_buyer_hostel', hostel.trim());
    localStorage.setItem('tu_buyer_phone', phone.trim());
    localStorage.setItem('tu_buyer_email', email.trim());

    onSubmit({
      name: name.trim(),
      hostel: hostel.trim(),
      phone: phone.trim(),
    });
  };

  const paystackPublicKey = (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY;
  const isKeyMissing = !paystackPublicKey || paystackPublicKey === 'pk_test_placeholder_key';
  
  const componentProps = {
    email: email || 'customer@example.com',
    amount: totalPrice * 100, // Paystack takes amount in kobo
    metadata: {
      custom_fields: [
        { display_name: "Name", variable_name: "name", value: name },
        { display_name: "Hostel", variable_name: "hostel", value: hostel },
        { display_name: "Phone", variable_name: "phone", value: phone },
      ],
    },
    publicKey: paystackPublicKey || 'pk_test_placeholder_key',
    text: "Pay Online Now",
    onSuccess: (reference: any) => {
      console.log("Payment successful:", reference);
      onSubmit({
        name: name.trim(),
        hostel: hostel.trim(),
        phone: phone.trim(),
        paymentRef: reference.reference
      });
    },
    onClose: () => console.log("Payment cancelled"),
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 p-5 sm:p-6 justify-between text-slate-brand dark:text-slate-100 transition-colors">
      {/* Header with back button */}
      <div className="space-y-4 overflow-y-auto pr-1 scrollbar-none">
        <button
          onClick={onClose}
          className="flex items-center space-x-1.5 text-slate-brand/60 dark:text-slate-300 hover:text-emerald-brand text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-brand dark:text-white font-display">Checkout Details</h3>
          <p className="text-[10px] text-slate-brand/50 dark:text-slate-400 font-medium">
            Include details for <span className="text-emerald-brand font-bold">{vendorName}</span> to process your order!
          </p>
        </div>

        {isKeyMissing && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-3 rounded-xl">
            <p className="text-[10px] text-orange-700 dark:text-orange-400 font-bold leading-tight flex items-start gap-2">
              <CreditCard className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                Paystack Key Not Configured. Please add <strong>VITE_PAYSTACK_PUBLIC_KEY</strong> in the App Settings Secrets menu to enable online payments.
              </span>
            </p>
          </div>
        )}

        {/* Short Order Info Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-gray-150 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-brand/50 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Ordering</span>
            <span className="font-bold text-slate-brand dark:text-slate-200">{itemsCount} item(s)</span>
          </div>
          <div className="text-right">
            <span className="text-slate-brand/50 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total</span>
            <span className="font-bold text-emerald-brand font-mono">&#8358; {totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-2 text-left">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-brand/70 dark:text-slate-300 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-brand/35 dark:text-slate-500">
                <User className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Name"
                className={`w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border ${
                  errors.name ? 'border-red-500' : 'border-gray-250 dark:border-slate-800'
                } rounded-xl shadow-3xs outline-none focus:ring-1 focus:ring-emerald-brand/20 transition-all`}
              />
            </div>
            {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-brand/70 dark:text-slate-300 uppercase tracking-wider">
              Email Address (For Receipt)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-brand/35 dark:text-slate-500">
                <MessageSquare className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="Email"
                className={`w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border ${
                  errors.email ? 'border-red-500' : 'border-gray-250 dark:border-slate-800'
                } rounded-xl shadow-3xs outline-none focus:ring-1 focus:ring-emerald-brand/20 transition-all`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email}</p>}
          </div>

          {/* Hostel & Room Location */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-brand/70 dark:text-slate-300 uppercase tracking-wider">
              Hostel & Room Location
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-brand/35 dark:text-slate-500">
                <Home className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={hostel}
                onChange={(e) => {
                  setHostel(e.target.value);
                  if (errors.hostel) setErrors((prev) => ({ ...prev, hostel: undefined }));
                }}
                placeholder="Hostel"
                className={`w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border ${
                  errors.hostel ? 'border-red-500' : 'border-gray-250 dark:border-slate-800'
                } rounded-xl shadow-3xs outline-none focus:ring-1 focus:ring-emerald-brand/20 transition-all`}
              />
            </div>
          </div>

          {/* Phone / WhatsApp Number */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-brand/70 dark:text-slate-300 uppercase tracking-wider">
              WhatsApp Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-brand/35 dark:text-slate-500">
                <Phone className="w-3.5 h-3.5" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="Phone"
                className={`w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border ${
                  errors.phone ? 'border-red-500' : 'border-gray-250 dark:border-slate-800'
                } rounded-xl shadow-3xs outline-none focus:ring-1 focus:ring-emerald-brand/20 transition-all`}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Payment Buttons */}
      <div className="pt-5 border-t border-gray-150 dark:border-slate-800 space-y-3">
        {validate(false) ? (
          <PaystackButton
            {...componentProps}
            className="w-full bg-slate-900 border border-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs py-3.5 rounded-xl uppercase flex items-center justify-center space-x-2 cursor-pointer transition-all hover:opacity-90"
          />
        ) : (
          <button 
            onClick={() => validate(true)}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs py-3.5 rounded-xl uppercase flex items-center justify-center space-x-2 cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Online (Fields Required)</span>
          </button>
        )}

        <button
          onClick={handleFormSubmit}
          className="w-full bg-emerald-brand hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition-colors alive-blink"
        >
          <MessageSquare className="w-4 h-4 fill-white stroke-none" />
          <span>Pay via WhatsApp Chat</span>
        </button>
      </div>
    </div>
  );
}
