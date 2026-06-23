import { useState } from 'react';
import { 
  Sparkles, Search, Sliders, ShoppingBag, MessageSquare, 
  ShieldAlert, ArrowRight, ArrowLeft, Check, Star, CheckSquare
} from 'lucide-react';

interface GuideStep {
  title: string;
  badge: string;
  icon: any;
  description: string;
  instructions: string[];
  tips: string;
  mockupRenderer: () => any;
}

interface WalkthroughProps {
  onFinish?: () => void;
}

export default function WalkthroughGuide({ onFinish }: WalkthroughProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('Like New');
  const [whatsappSent, setWhatsappSent] = useState<boolean>(false);

  // Conditions list
  const conditions = ['New / Packed', 'Like New', 'Gently Used', 'Fairly Used'];

  const steps: GuideStep[] = [
    {
      title: "Discover Campus Catalog",
      badge: "STEP 1: EXPLORATION",
      icon: Search,
      description: "Explore previous semester study guides, laptops, hoodies, rooms heaters, or hostel items, right in your local university network.",
      instructions: [
        "Select category segments (e.g., Academics, Electronics, Hostel) in the Browse Shop view.",
        "Use active filters to narrow down student sellers inside your close hostel neighborhood.",
        "Check recently posted items on the main terminal board for immediate trade offers."
      ],
      tips: "All listed items are zero-commission and listed directly by authenticated university student peers.",
      mockupRenderer: () => (
        <div className="bg-slate-900 rounded-2xl p-5 text-white font-sans space-y-4 border border-white/10 shadow-2xl relative overflow-hidden h-full min-h-[300px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-brand/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-3">
            {/* Catalog Mockup Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
              <span className="text-[10px] font-bold tracking-widest text-emerald-200 uppercase">Campus Catalog</span>
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>

            {/* Category selection */}
            <div className="flex gap-2">
              <span className="text-[9px] bg-emerald-brand text-white font-semibold py-1 px-2 rounded-full">All Items</span>
              <span className="text-[9px] bg-slate-800 text-slate-300 font-medium py-1 px-2 rounded-full">Academics</span>
              <span className="text-[9px] bg-slate-800 text-slate-300 font-medium py-1 px-2 rounded-full">electronics</span>
            </div>

            {/* Simulated Grid of item */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex space-x-3 items-center">
              <img 
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80" 
                alt="Product" 
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1 space-y-0.5">
                <span className="text-[8px] uppercase tracking-wider font-bold text-emerald-400 font-mono">Academics</span>
                <h4 className="text-[11px] font-bold text-gray-100 truncate">Engineering Study Guide</h4>
                <p className="text-[10px] text-gray-400 font-semibold font-mono">&#8358; 4,500</p>
              </div>
              <span className="bg-green-500/10 text-green-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-green-500/20">Available</span>
            </div>
          </div>

          <div className="text-[9px] bg-slate-800/40 p-2 rounded border border-slate-700/55 text-slate-300 flex items-center space-x-2">
            <span className="text-orange-brand dark:text-orange-500 font-bold">💡 Pro-Tip:</span>
            <span>Refine using the condition labels if searching for brand-new items!</span>
          </div>
        </div>
      )
    },
    {
      title: "Evaluate & Choose Condition",
      badge: "STEP 2: ITEM CONDITION & MODE",
      icon: Sliders,
      description: "Student items come in various state categories. Compare listings based on condition.",
      instructions: [
        "Click on any campus listing card to inspect the high-resolution upload shots.",
        "Check the 'Item Condition' label (e.g., Like New, Fairly Used, brand-new)."
      ],
      tips: "Always verify the condition during the physical meetup.",
      mockupRenderer: () => (
        <div className="bg-slate-900 rounded-2xl p-5 text-white font-sans space-y-4 border border-white/10 shadow-2xl relative overflow-hidden h-full min-h-[300px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-center border-b border-gray-800 pb-2">
              <span className="text-[10px] font-bold text-emerald-250 uppercase tracking-widest">Select Condition Filter</span>
            </div>

            <div className="space-y-1 text-left">
              <span className="text-[9px] text-emerald-300 font-mono font-bold uppercase block">Condition Grades</span>
              <p className="text-[11px] text-gray-300 leading-tight">Filter items matching criteria:</p>
            </div>

            {/* Conditions simulation */}
            <div className="grid grid-cols-2 gap-1.5">
              {conditions.map((cond) => (
                <button
                  key={cond}
                  onClick={() => setSelectedSize(cond)}
                  className={`text-[9px] font-semibold py-1 rounded border text-center transition-all ${
                    selectedSize === cond 
                      ? 'bg-emerald-brand text-white border-emerald-brand shadow-md' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>

            <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/60 flex justify-between items-center text-[10px]">
              <span className="text-gray-400">Trading Mode:</span>
              <strong className="text-emerald-300 font-mono font-bold uppercase animate-pulse">SALE APPROVED</strong>
            </div>
          </div>

          <div className="text-[9px] text-emerald-200 italic text-center font-medium">
            Try clicking the condition tags above to simulate filtering parameters!
          </div>
        </div>
      )
    },
    {
      title: "Draft Consolidated Offers",
      badge: "STEP 3: NO-COMMISSION DRAWERS",
      icon: ShoppingBag,
      description: "Unlike slow retail websites, we use a lightweight local 'Draft' list, allowing you to stack peer products together.",
      instructions: [
        "Click 'Add to Order Draft' to register individual campus listings.",
        "Your draft list stores selections in safe local cache storage for direct comparison.",
        "Add multiple items from separate students to bundle your requests easily."
      ],
      tips: "You can modify item quantities or safely remove listings from your drawer instantly.",
      mockupRenderer: () => (
        <div className="bg-slate-900 rounded-2xl p-5 text-white font-sans space-y-4 border border-white/10 shadow-2xl relative overflow-hidden h-full min-h-[300px] flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-gray-100 uppercase tracking-widest">Active Trade Draft</span>
              </div>
              <span className="text-[9px] bg-emerald-brand/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full font-mono">1 Item</span>
            </div>

            {/* Cart item mock */}
            <div className="bg-slate-800/50 rounded-lg p-2.5 space-y-2 border border-slate-700/50 text-left">
              <div className="flex justify-between items-start">
                <h5 className="text-[11px] font-bold text-gray-200 truncate max-w-[120px]">Engineering Study Guide</h5>
                <span className="text-[9px] font-mono text-emerald-300 font-semibold">&#8358; 4,500</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>Grade: <strong className="text-gray-200 font-mono">{selectedSize}</strong></span>
                <span className="font-mono">Qty: 1</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-400">Draft Total:</span>
              <strong className="text-emerald-300 font-mono font-bold text-sm">&#8358; 4,500</strong>
            </div>
          </div>

          <button className="w-full bg-emerald-brand hover:bg-emerald-700 text-white font-bold text-[10px] uppercase py-2 tracking-widest rounded-lg transition-transform hover:-translate-y-0.5 shadow-md flex items-center justify-center space-x-1.5">
            <span>Next Step: Checkout</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )
    },
    {
      title: "Meet, Inspect & Finalize on WhatsApp",
      badge: "STEP 4: PEER CHAT CHECKOUT",
      icon: MessageSquare,
      description: "University trading is built on verbal trust and physical campus safety. Tap 'WhatsApp' to open instant Chat templates.",
      instructions: [
        "In your details page or shopping drawer, tap the green WhatsApp trigger.",
        "The website reads the student seller's registered number and pre-formats your deal proposal.",
        "Your WhatsApp opens with standard campus template notes outlining item names, condition preferences, and price listings."
      ],
      tips: "Arrange to meet safely in broad daylight at popular campus spots like the Student Union Plaza.",
      mockupRenderer: () => (
        <div className="bg-slate-900 rounded-2xl p-5 text-white font-sans space-y-4 border border-white/10 shadow-2xl relative overflow-hidden h-full min-h-[300px] flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-1.5 border-b border-gray-800 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs font-bold text-green-400 uppercase tracking-widest">WhatsApp Simulator</span>
            </div>

            {/* WhatsApp message bubble */}
            <div className="space-y-2 text-left">
              <p className="text-[10px] text-gray-400 italic">Pre-loaded student meetup request:</p>
              <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-100 rounded-xl rounded-tr-none p-3 text-[9.5px] font-mono leading-relaxed space-y-1">
                <p className="font-bold text-emerald-400">Deal from TU Market Hub:</p>
                <p>========================</p>
                <p>• 1x Engineering Study Guide ({selectedSize})</p>
                <p>========================</p>
                <p className="font-bold">Total: &#8358; 4,500</p>
                <p className="text-[8.5px] text-emerald-300/80">Can we coordinate an exchange meetup near the Main Library today?</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setWhatsappSent(true);
              setTimeout(() => setWhatsappSent(false), 3000);
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase py-2 px-3 tracking-wider rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {whatsappSent ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Simulated Order Dispatched!</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Simulate Click Order</span>
              </>
            )}
          </button>
        </div>
      )
    },
    {
      title: "Activate Your Own Student Stall",
      badge: "STEP 5: SELF-SERVICE SELLER CONSOLE",
      icon: Sparkles,
      description: "Any university peer can instantly become a seller! Register your stall details in seconds with Google Authorization.",
      instructions: [
        "Click 'Login' at the header and authorize with Google.",
        "Set up your store name, personal description, and active school WhatsApp phone number.",
        "Upload high-resolution shots of items, gadgets or meals directly from your browser.",
        "Maintain absolute control over your stock, prices, condition, and exchange mode."
      ],
      tips: "You can toggle visibility or archive sold-out items to keep your hostel stall clean and tidy.",
      mockupRenderer: () => (
        <div className="bg-slate-900 rounded-2xl p-5 text-white font-sans space-y-4 border border-white/10 shadow-2xl relative overflow-hidden h-full min-h-[300px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-brand dark:text-orange-500 animate-spin" />
                <span className="text-xs font-bold text-gray-100 uppercase tracking-widest">My Student Stall</span>
              </div>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">Live Seller Sync</span>
            </div>

            {/* Quick Admin Action metrics */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-800 p-2 rounded border border-slate-700/60">
                <p className="text-[8px] text-gray-400 font-bold uppercase">Active Listings</p>
                <p className="text-xs font-black text-emerald-300 font-mono">8 Items</p>
              </div>
              <div className="bg-slate-800 p-2 rounded border border-slate-700/60">
                <p className="text-[8px] text-gray-400 font-bold uppercase">Stall Status</p>
                <p className="text-xs font-black text-orange-400 font-mono">OPEN</p>
              </div>
            </div>

            {/* Form control mockup */}
            <div className="space-y-1.5 text-left bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/40">
              <p className="text-[9px] text-gray-400 font-bold">Stall WhatsApp Sync:</p>
              <div className="flex space-x-1">
                <span className="bg-slate-800 font-mono px-2 py-1 text-[9px] rounded border border-slate-700 flex-1 truncate">+234 812-000-1111</span>
                <span className="bg-emerald-brand text-white text-[9.5px] font-bold px-2.5 rounded flex items-center justify-center border border-emerald-brand">Sync</span>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-slate-400 flex items-center space-x-1 justify-center">
            <ShieldAlert className="w-3 h-3 text-emerald-400" />
            <span>Authenticated students strictly maintain their own stalls.</span>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const ActiveIcon = steps[activeStep].icon;

  return (
    <div id="interactive-walkthrough" className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-md space-y-8 max-w-6xl mx-auto">
      
      {/* Walkthrough Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div className="space-y-1 text-left">
          <span className="inline-flex items-center space-x-1.5 text-emerald-brand dark:text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-emerald-brand dark:text-emerald-400 animate-pulse" />
            <span>Interactive Protocol Guide</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-brand">
            How to Use TU Market Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-brand/60 font-medium font-sans">
            Learn the peer exchange workflow from discovering student stalls, dropping local drafts, to physical meetups.
          </p>
        </div>

        {/* Progress Tracker Dots */}
        <div className="flex items-center space-x-1 bg-gray-50 dark:bg-slate-800 p-2 rounded-full border border-gray-155 dark:border-slate-700">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`w-8 h-2.5 rounded-full transition-all text-[8px] font-mono font-bold flex items-center justify-center leading-none ${
                idx === activeStep 
                  ? 'bg-emerald-brand text-white w-10 shadow-xs' 
                  : 'bg-gray-250 text-slate-400 hover:bg-gray-300'
              }`}
              title={`Skip to Step ${idx+1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Work area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch">
        
        {/* Left Side: Instructions and Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6 text-left">
          <div className="space-y-4">
            {/* Step Badge */}
            <span className="inline-block bg-emerald-brand/15 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 font-mono font-black text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
              {steps[activeStep].badge}
            </span>
            
            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-brand dark:text-slate-100 flex items-center space-x-2">
              <div className="p-2 bg-emerald-brand/10 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 rounded-xl shrink-0">
                <ActiveIcon className="w-5 h-5" />
              </div>
              <span>{steps[activeStep].title}</span>
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-brand/85 dark:text-slate-300 leading-relaxed font-sans font-medium">
              {steps[activeStep].description}
            </p>

            {/* Sub-instructions list */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 space-y-3.5">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-slate-brand/80 dark:text-slate-300 font-mono flex items-center space-x-1.5 mb-1">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-brand dark:text-emerald-400" />
                <span>Step Actions & Goals</span>
              </h4>
              <ul className="space-y-2.5">
                {steps[activeStep].instructions.map((ins, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-slate-brand/70 dark:text-slate-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-brand/15 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[9px]">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{ins}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Micro Pro Tip Panel */}
            <div className="border-l-2 border-orange-brand dark:border-orange-500 pl-3 py-1">
              <p className="text-[10px] font-bold text-orange-brand dark:text-orange-500 tracking-widest uppercase mb-0.5">ℹ️ Protocol Tip</p>
              <p className="text-[11px] text-slate-brand/65 font-medium leading-normal">{steps[activeStep].tips}</p>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex items-center justify-between border-t border-gray-150 dark:border-slate-800 pt-6">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${
                activeStep === 0
                  ? 'opacity-40 cursor-not-allowed border-gray-250 text-gray-300'
                  : 'bg-white hover:bg-gray-50 border-gray-300 text-slate-brand cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={activeStep === steps.length - 1}
              className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-full font-bold uppercase tracking-widest transition-all text-xs ${
                activeStep === steps.length - 1
                  ? 'hidden'
                  : 'bg-emerald-brand hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {activeStep === steps.length - 1 && (
              <button
                onClick={onFinish}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-full font-bold uppercase tracking-widest transition-all text-xs bg-emerald-brand hover:bg-emerald-700 text-white shadow-lg cursor-pointer animate-bounce"
              >
                <span>Enter Marketplace</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Mockup Visual Canvas */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col justify-center min-h-[340px] shadow-inner select-none relative">
          <div className="absolute top-2.5 left-2.5 text-[8px] font-mono text-slate-brand/45 tracking-widest font-bold uppercase">
            Interactive Simulator
          </div>
          <div className="w-full h-full max-w-sm mx-auto flex flex-col justify-center">
            {steps[activeStep].mockupRenderer()}
          </div>
        </div>

      </div>
    </div>
  );
}
