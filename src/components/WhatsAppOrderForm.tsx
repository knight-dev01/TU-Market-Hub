import React, { useState } from 'react';
import { User, Home, Phone, ArrowLeft, MessageSquare } from 'lucide-react';

interface WhatsAppOrderFormProps {
  vendorName: string;
  itemsCount: number;
  totalPrice: number;
  onClose: () => void;
  onSubmit: (data: { name: string; hostel: string; phone: string }) => void;
}

export default function WhatsAppOrderForm({
  vendorName,
  itemsCount,
  totalPrice,
  onClose,
  onSubmit,
}: WhatsAppOrderFormProps) {
  // Input states prefilled from localStorage
  const [name, setName] = useState(() => localStorage.getItem('tu_buyer_name') || '');
  const [hostel, setHostel] = useState(() => localStorage.getItem('tu_buyer_hostel') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('tu_buyer_phone') || '');
  
  // Validation state
  const [errors, setErrors] = useState<{ name?: string; hostel?: string; phone?: string }>({});

  const validate = (showErrors = true) => {
    const newErrors: { name?: string; hostel?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = 'Please enter your name';
    if (!hostel.trim()) newErrors.hostel = 'Please enter your hostel location';
    if (!phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (phone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid phone number';
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

    onSubmit({
      name: name.trim(),
      hostel: hostel.trim(),
      phone: phone.trim(),
    });
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
          <p className="text-[10px] text-slate-brand/50 dark:text-slate-400 font-medium font-sans">
            Connect directly with <span className="text-emerald-brand font-bold">{vendorName}</span> to finalize your order!
          </p>
        </div>

        {/* Short Order Info Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-gray-150 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-brand/50 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Ordering</span>
            <span className="font-bold text-slate-brand dark:text-slate-200 font-sans">{itemsCount} item(s)</span>
          </div>
          <div className="text-right">
            <span className="text-slate-brand/50 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">Total Est.</span>
            <span className="font-bold text-emerald-brand font-mono tracking-tight text-sm">&#8358;{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-2 text-left">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-brand/70 dark:text-slate-300 uppercase tracking-wider font-sans">
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
                placeholder="Ex: John Doe"
                className={`w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border ${
                  errors.name ? 'border-red-500' : 'border-gray-250 dark:border-slate-800'
                } rounded-xl shadow-3xs outline-none focus:ring-1 focus:ring-emerald-brand/20 transition-all font-sans`}
              />
            </div>
            {errors.name && <p className="text-[10px] text-red-500 font-bold font-sans">{errors.name}</p>}
          </div>

          {/* Hostel & Room Location */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-brand/70 dark:text-slate-300 uppercase tracking-wider font-sans">
              Hostel/Lodge & Room No.
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
                placeholder="Ex: Maranatha, Rm 14"
                className={`w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border ${
                  errors.hostel ? 'border-red-500' : 'border-gray-250 dark:border-slate-800'
                } rounded-xl shadow-3xs outline-none focus:ring-1 focus:ring-emerald-brand/20 transition-all font-sans`}
              />
            </div>
            {errors.hostel && <p className="text-[10px] text-red-500 font-bold font-sans">{errors.hostel}</p>}
          </div>

          {/* Phone / WhatsApp Number */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-brand/70 dark:text-slate-300 uppercase tracking-wider font-sans">
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
                placeholder="090..."
                className={`w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border ${
                  errors.phone ? 'border-red-500' : 'border-gray-250 dark:border-slate-800'
                } rounded-xl shadow-3xs outline-none focus:ring-1 focus:ring-emerald-brand/20 transition-all font-sans`}
              />
            </div>
            {errors.phone && <p className="text-[10px] text-red-500 font-bold font-sans">{errors.phone}</p>}
          </div>
        </form>
      </div>

      {/* Buttons */}
      <div className="pt-5 border-t border-gray-150 dark:border-slate-800">
        <button
          onClick={handleFormSubmit}
          className="w-full bg-emerald-brand hover:bg-emerald-700 text-white font-bold text-[13px] py-4 rounded-xl uppercase flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition-all active:scale-[0.98] relative overflow-hidden"
        >
          <MessageSquare className="w-4 h-4 fill-white stroke-none" />
          <span className="tracking-tight">Confirm & Send Order via Chat</span>
        </button>
        <p className="text-[9px] text-center text-slate-brand/40 dark:text-slate-500 mt-3 font-bold uppercase tracking-widest px-4 leading-relaxed font-sans">
          Finalize payment and delivery details with vendor in the next screen
        </p>
      </div>
    </div>
  );
}
