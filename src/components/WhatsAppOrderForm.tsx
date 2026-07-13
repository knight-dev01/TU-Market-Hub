import React, { useState, useEffect } from 'react';
import { User, Home, Phone, ArrowLeft, MessageSquare, Globe, School, Edit3, HelpCircle } from 'lucide-react';
import { Product } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface WhatsAppOrderFormProps {
  vendorName: string;
  itemsCount: number;
  totalPrice: number;
  items: CartItem[];
  onClose: () => void;
  onSubmit: (data: { name: string; hostel: string; phone: string; customMessage: string; isOutsider: boolean }) => void;
}

export default function WhatsAppOrderForm({
  vendorName,
  itemsCount,
  totalPrice,
  items,
  onClose,
  onSubmit,
}: WhatsAppOrderFormProps) {
  // Input states prefilled from localStorage
  const [name, setName] = useState(() => localStorage.getItem('tu_buyer_name') || '');
  const [hostel, setHostel] = useState(() => localStorage.getItem('tu_buyer_hostel') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('tu_buyer_phone') || '');
  const [isOutsider, setIsOutsider] = useState<boolean>(() => localStorage.getItem('tu_buyer_is_outsider') === 'true');
  
  // Custom Message state
  const [customMessage, setCustomMessage] = useState('');
  const [hasManuallyEdited, setHasManuallyEdited] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<{ name?: string; hostel?: string; phone?: string }>({});

  // Generate Default Message Draft dynamically
  useEffect(() => {
    if (hasManuallyEdited) return;

    let orderDetailLines = '';
    let totalVal = 0;
    
    items.forEach((item) => {
      const rowSum = item.product.price * item.quantity;
      totalVal += rowSum;
      const sizeStr = item.size ? ` (Variation: ${item.size})` : '';
      const conditionStr = item.product.condition ? ` (${item.product.condition.toUpperCase().replace('_', ' ')})` : '';
      const dealStr = item.product.dealType ? ` [Mode: ${item.product.dealType.toUpperCase()}]` : '';
      orderDetailLines += `- ${item.product.name}${sizeStr}${conditionStr}${dealStr}\n  Qty: ${item.quantity} x ₦${item.product.price.toLocaleString()} = ₦${rowSum.toLocaleString()}\n\n`;
    });

    const classification = isOutsider ? 'External Buyer (Outsider/Off-Campus)' : 'On-Campus Student/Staff';
    const locationLabel = isOutsider ? 'Off-Campus Address' : 'Hostel/Room';

    const buyerSection = `*Buyer Contact Information:*\n- *Name:* ${name || '[Enter Name]'}\n- *${locationLabel}:* ${hostel || '[Enter Location]'}\n- *Phone/WhatsApp:* ${phone || '[Enter Phone]'}\n- *Classification:* ${classification}\n\n`;

    const bodyText = `Hello vendor ${vendorName},

I saw your listing on the TU MARKET HUB and would like to order:

${orderDetailLines}*Total Est. Value:* ₦${totalVal.toLocaleString()}

${buyerSection}Please confirm availability and delivery meetup details!`;

    setCustomMessage(bodyText);
  }, [name, hostel, phone, isOutsider, items, vendorName, hasManuallyEdited]);

  const validate = (showErrors = true) => {
    const newErrors: { name?: string; hostel?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = 'Please enter your name';
    if (!hostel.trim()) {
      newErrors.hostel = isOutsider 
        ? 'Please enter your off-campus delivery address / location' 
        : 'Please enter your hostel location / room number';
    }
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
    localStorage.setItem('tu_buyer_is_outsider', String(isOutsider));

    onSubmit({
      name: name.trim(),
      hostel: hostel.trim(),
      phone: phone.trim(),
      customMessage: customMessage.trim(),
      isOutsider,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 justify-between text-slate-brand dark:text-slate-100 transition-colors">
      
      {/* Scrollable Content Container */}
      <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
        
        {/* Back navigation */}
        <button
          onClick={onClose}
          type="button"
          className="flex items-center space-x-1.5 text-slate-brand/60 dark:text-slate-300 hover:text-emerald-brand text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        {/* Title */}
        <div>
          <h3 className="font-bold text-base sm:text-lg text-slate-brand dark:text-white font-display">Checkout Details</h3>
          <p className="text-[11px] text-slate-brand/60 dark:text-slate-400 font-sans mt-0.5">
            Connect directly with <span className="text-emerald-brand font-bold">{vendorName}</span> to complete your order.
          </p>
        </div>



        {/* Toggle Switch between On-Campus and Off-Campus / Outsider */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-brand/60 dark:text-slate-400 uppercase tracking-widest font-sans">
            Are you ordering from inside or outside campus?
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsOutsider(false);
                if (errors.hostel) setErrors(prev => ({ ...prev, hostel: undefined }));
              }}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                !isOutsider 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>On-Campus (Student/Staff)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOutsider(true);
                if (errors.hostel) setErrors(prev => ({ ...prev, hostel: undefined }));
              }}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                isOutsider 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Off-Campus / Outsider</span>
            </button>
          </div>
        </div>

        {/* Input Form Fields */}
        <div className="space-y-3 pt-1">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-brand/70 dark:text-slate-300 uppercase tracking-wider font-sans">
              Buyer Full Name
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
                placeholder={isOutsider ? "Ex: Adebayo Johnson (External)" : "Ex: John Doe"}
                className={`w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border ${
                  errors.name ? 'border-red-500' : 'border-gray-250 dark:border-slate-800'
                } rounded-xl shadow-3xs outline-none focus:ring-1 focus:ring-emerald-brand/20 transition-all font-sans`}
              />
            </div>
            {errors.name && <p className="text-[10px] text-red-500 font-bold font-sans">{errors.name}</p>}
          </div>

          {/* Location details tailored per category */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-brand/70 dark:text-slate-300 uppercase tracking-wider font-sans">
              {isOutsider ? 'Off-Campus Address / Delivery City' : 'Hostel/Lodge Name & Room No.'}
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
                placeholder={isOutsider ? "Ex: No 10 Trinity Avenue, Lagos Gate" : "Ex: Maranatha, Rm 14"}
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
              WhatsApp Contact Number
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
                placeholder="Ex: 09012345678"
                className={`w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border ${
                  errors.phone ? 'border-red-500' : 'border-gray-250 dark:border-slate-800'
                } rounded-xl shadow-3xs outline-none focus:ring-1 focus:ring-emerald-brand/20 transition-all font-sans`}
              />
            </div>
            {errors.phone && <p className="text-[10px] text-red-500 font-bold font-sans">{errors.phone}</p>}
          </div>

          {/* Custom Editable Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[10.5px] font-bold text-slate-brand/70 dark:text-slate-300 uppercase tracking-wider font-sans">
                Customize Order Chat Text
              </label>
              {hasManuallyEdited && (
                <button
                  type="button"
                  onClick={() => {
                    setHasManuallyEdited(false);
                  }}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Reset Draft
                </button>
              )}
            </div>
            <div className="relative">
              <textarea
                value={customMessage}
                rows={5}
                onChange={(e) => {
                  setCustomMessage(e.target.value);
                  setHasManuallyEdited(true);
                }}
                className="w-full text-[11px] font-mono leading-relaxed p-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-gray-250 dark:border-slate-800 rounded-xl shadow-3xs outline-none focus:ring-1 focus:ring-emerald-brand/20 focus:bg-white dark:focus:bg-slate-950 transition-all"
                placeholder="Edit message..."
              />
              <span className="absolute bottom-2.5 right-2.5 flex items-center space-x-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded border border-gray-200/50 dark:border-slate-800/50">
                <Edit3 className="w-2.5 h-2.5" />
                <span>Editable</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Submit block */}
      <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-gray-150 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <span className="text-[9px] uppercase tracking-wider text-slate-brand/40 dark:text-slate-500 font-bold font-sans">
            Order Estimation
          </span>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="font-mono text-lg font-bold text-emerald-brand">
              ₦{totalPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-brand/50 dark:text-slate-400 font-medium">
              ({itemsCount} Item{itemsCount > 1 ? 's' : ''})
            </span>
          </div>
        </div>

        <button
          onClick={handleFormSubmit}
          className="bg-emerald-brand hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl uppercase flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition-all active:scale-[0.98] shrink-0 sm:w-auto w-full"
        >
          <MessageSquare className="w-4 h-4 fill-white stroke-none" />
          <span className="tracking-wide">Send Custom Chat</span>
        </button>
      </div>
    </div>
  );
}
