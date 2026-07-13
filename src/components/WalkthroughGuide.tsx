import { 
  Sparkles, Search, Sliders, ShoppingBag, MessageSquare, 
  ArrowRight, ShieldCheck 
} from 'lucide-react';

interface WalkthroughProps {
  onFinish?: () => void;
}

export default function WalkthroughGuide({ onFinish }: WalkthroughProps) {
  const steps = [
    {
      title: "1. Find Listings",
      description: "Browse peer-to-peer textbooks, study guides, drawing boards, and hostal items easily.",
      icon: Search,
      color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20"
    },
    {
      title: "2. Check Specs",
      description: "Review photos, prices, and clear conditions ('Like New', 'Fair') described by student sellers.",
      icon: Sliders,
      color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20"
    },
    {
      title: "3. Direct Drafts",
      description: "Formulate your custom offer details. The Hub builds a tailored message ready for WhatsApp.",
      icon: ShoppingBag,
      color: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20"
    },
    {
      title: "4. Open WhatsApp",
      description: "Open the pre-filled message inside WhatsApp directly to the student seller's inbox.",
      icon: MessageSquare,
      color: "text-green-500 bg-green-500/10 dark:bg-green-500/20"
    },
    {
      title: "5. Safe Meetup",
      description: "Meet up safely on campus in broad daylight to inspect the items before trading.",
      icon: ShieldCheck,
      color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20"
    }
  ];

  return (
    <div id="interactive-walkthrough" className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6 text-center animate-fade-in select-none">
      
      {/* Header */}
      <div className="space-y-1.5">
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] uppercase rounded-full tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
          <span>Frictionless Student Commerce</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
          How to Use TU Market Hub
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
          Five simple steps to secure, commission-free peer transactions across the campus.
        </p>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={idx}
              className="bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-between space-y-3 hover:scale-[1.01] transition-transform text-center shadow-3xs"
            >
              <div className={`p-2.5 rounded-xl ${step.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-200 tracking-wide font-display">
                  {step.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button Footer */}
      <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-center">
        <button
          onClick={onFinish}
          className="bg-emerald-brand hover:bg-emerald-600 text-white font-bold text-xs tracking-wider uppercase py-3.5 px-8 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 focus:ring-2 focus:ring-emerald-brand/35 shadow-sm hover:scale-[1.025]"
        >
          <span>Enter Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
