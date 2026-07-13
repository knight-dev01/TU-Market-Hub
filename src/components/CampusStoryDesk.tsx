import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Sparkles, ShoppingBag, Home, ArrowRight, ArrowLeft, Send, Search, Check, Shield } from 'lucide-react';

interface CampusStoryDeskProps {
  onViewChange: (view: 'home' | 'shop' | 'about' | 'contact' | 'admin') => void;
}

export default function CampusStoryDesk({ onViewChange }: CampusStoryDeskProps) {
  const [activeTab, setActiveTab] = useState<'challenge' | 'workflow' | 'advantages'>('challenge');

  // Workflow steps sub-state
  const [currentStep, setCurrentStep] = useState(0);

  // Advantages sub-state
  const [activeAdvantageGroup, setActiveAdvantageGroup] = useState<'sellers' | 'buyers' | 'community'>('sellers');

  const steps = [
    {
      title: "1. List Item Once",
      subtitle: "Secure & Instant",
      desc: "Sellers list their item details, upload photos, set pricing, and link their WhatsApp contact line in under a minute.",
      icon: <Send className="w-6 h-6 text-emerald-500" />,
      badge: "Sellers"
    },
    {
      title: "2. Browse Marketplace",
      subtitle: "Segmented & Searchable",
      desc: "Buyers search listings easily and sift through campus items using category, price range, and condition filters.",
      icon: <Search className="w-6 h-6 text-emerald-500" />,
      badge: "Buyers"
    },
    {
      title: "3. Find Your Match",
      subtitle: "Transparent Specs",
      desc: "View high-resolution product photos and read notes directly provided by student peers.",
      icon: <ShoppingBag className="w-6 h-6 text-emerald-500" />,
      badge: "Transparency"
    },
    {
      title: "4. Open WhatsApp",
      subtitle: "Ready-Made Draft",
      desc: "No awkward introductions. Our engine pre-fills an instant, polite negotiation draft addressed directly to the seller.",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      badge: "Zero Friction"
    },
    {
      title: "5. Complete Deal",
      subtitle: "Safe physical exchange",
      desc: "Meet on campus in open daylight spots to inspect the item first-hand, then complete your deal securely.",
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      badge: "Safety"
    }
  ];

  const advantageGroups = {
    sellers: {
      title: "For Student Sellers",
      tagline: "Stay visible without the daily spam.",
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      items: [
        { label: "List Once, Stay Live", text: "No need to repeatedly repost screenshots in noisy chat channels." },
        { label: "Multi-Photo Showcase", text: "Present items with clear, zoomable, high-resolution imagery." },
        { label: "External Off-Campus Discovery", text: "Widen your audience base beyond active group chat members." },
        { label: "Keep 100% Value", text: "Absolutely zero commissions or transaction listing costs." }
      ]
    },
    buyers: {
      title: "For Smart Buyers",
      tagline: "Find exactly what you need in seconds.",
      icon: <ShoppingBag className="w-5 h-5 text-emerald-500" />,
      items: [
        { label: "Instant Search Queries", text: "Type keywords to locate textbooks, kettles, or appliances immediately." },
        { label: "Dynamic Category Filters", text: "Organize listings by academic segments, hostels, or price tags." },
        { label: "Condition Status Grades", text: "Check accurate condition grades (New, Like New, Fair) beforehand." },
        { label: "Pre-filled Chat Scripts", text: "Skip awkward greetings with fully prepared WhatsApp drafts." }
      ]
    },
    community: {
      title: "For the TU Community",
      tagline: "Fostering a cleaner, smarter campus economy.",
      icon: <Home className="w-5 h-5 text-blue-500" />,
      items: [
        { label: "Uncluttered Chat Groups", text: "Keep academic announcement groups focused on actual academic alerts." },
        { label: "Sustainable Peer Circulation", text: "Reduce waste by keeping campus textbooks and electronics in active reuse." },
        { label: "Academic Focus Preservation", text: "Minimize continuous commercial spam in communal spaces." },
        { label: "Safe In-Person Exchanges", text: "Encourage transparent transactions inside official campus spaces." }
      ]
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8" id="campus-story-section">
      {/* Tab Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl max-w-md mx-auto border border-gray-150 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('challenge')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'challenge'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          The Challenge
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'workflow'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          How it Works
        </button>
        <button
          onClick={() => setActiveTab('advantages')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'advantages'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Benefits
        </button>
      </div>

      {/* Main Board Canvas */}
      <div className="bg-white dark:bg-slate-900/45 rounded-3xl border border-gray-150 dark:border-slate-850 p-6 sm:p-10 shadow-3xs overflow-hidden relative min-h-[360px] flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          {activeTab === 'challenge' && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              {/* Left Side: Dynamic contrast block */}
              <div className="space-y-4">
                <span className="text-emerald-brand font-mono font-bold text-[10px] uppercase tracking-[0.2em] block">THE EVERYDAY EXPERIENCE</span>
                <h3 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white leading-snug">
                  Relieving Campus Chats from Endless Marketplace Clutter
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans font-light">
                  At Trinity University, hostel groups are vital channels for class schedules and student info. But relying on random screenshots of textbooks, drawing boards, or study kettles creates chaos for everyone.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans font-light">
                  By providing a beautiful, permanent catalog, we keep your academic chat spaces organized while expanding your listings to peer peers and off-campus buyers.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onViewChange('about')}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-brand hover:underline uppercase tracking-widest cursor-pointer"
                  >
                    <span>Read Our Vision Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Side: Red-vs-Green Interactive comparison */}
              <div className="space-y-4">
                <div className="bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/10 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>The Chat Group Clutter (Before)</span>
                  </span>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex gap-2">
                      <span className="text-rose-500">✕</span>
                      <p><strong>Buried Instantly:</strong> Listings get lost in minutes under group conversation.</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-rose-500">✕</span>
                      <p><strong>Screenshots Spam:</strong> Forced to repeatedly post the same photos daily to stay visible.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/15 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>TU Market Hub (After)</span>
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans font-medium">
                    List once, stay visible forever. Search with lightning speed, filter by campus hostels, and initiate direct WhatsApp deals with polite auto-written text.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'workflow' && (
            <motion.div
              key="workflow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <span className="text-emerald-brand font-mono font-bold text-[10px] uppercase tracking-[0.2em] block">SIMPLE & LINEAR</span>
                <h3 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
                  The Streamlined Workspace Flow
                </h3>
              </div>

              {/* Step Slider Panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-gray-150 dark:border-slate-800">
                {/* Step indicators left side */}
                <div className="md:col-span-4 flex md:flex-col justify-between md:justify-center md:space-y-3 gap-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-3 md:pb-0 md:pr-4">
                  {steps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`flex items-center gap-3 w-full p-2 rounded-xl text-left transition-all text-xs font-semibold cursor-pointer ${
                        currentStep === idx
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 scale-[1.02]'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        currentStep === idx
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-650'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="hidden md:inline line-clamp-1">{step.title}</span>
                    </button>
                  ))}
                </div>

                {/* Step details right side */}
                <div className="md:col-span-8 flex flex-col justify-center min-h-[160px] pl-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                          {steps[currentStep].icon}
                        </div>
                        <div>
                          <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 py-0.5 px-2 rounded-full">
                            {steps[currentStep].badge}
                          </span>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-1">
                            {steps[currentStep].title} — <span className="text-slate-500 dark:text-slate-400 font-medium">{steps[currentStep].subtitle}</span>
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-sans font-light">
                        {steps[currentStep].desc}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-250/40 dark:border-slate-800">
                    <button
                      disabled={currentStep === 0}
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer text-slate-650 dark:text-slate-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={currentStep === steps.length - 1}
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer text-slate-650 dark:text-slate-300"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'advantages' && (
            <motion.div
              key="advantages"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <span className="text-emerald-brand font-mono font-bold text-[10px] uppercase tracking-[0.2em] block">TAILORED ADVANTAGES</span>
                <h3 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
                  Designed Specially for Trinity Campus Needs
                </h3>
              </div>

              {/* Toggles for Sellers, Buyers, Community */}
              <div className="flex items-center justify-center gap-1.5 max-w-sm mx-auto">
                {Object.keys(advantageGroups).map((groupKey) => (
                  <button
                    key={groupKey}
                    onClick={() => setActiveAdvantageGroup(groupKey as any)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-[10.5px] font-bold tracking-wide uppercase transition-all cursor-pointer border ${
                      activeAdvantageGroup === groupKey
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {groupKey === 'sellers' ? 'Sellers' : groupKey === 'buyers' ? 'Buyers' : 'Community'}
                  </button>
                ))}
              </div>

              {/* Active Group Advantages Grid */}
              <div className="bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-gray-150/70 dark:border-slate-800/80">
                <div className="flex items-center gap-2 mb-4">
                  {advantageGroups[activeAdvantageGroup].icon}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {advantageGroups[activeAdvantageGroup].title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {advantageGroups[activeAdvantageGroup].tagline}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {advantageGroups[activeAdvantageGroup].items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 space-y-1 flex items-start gap-2.5 hover:border-emerald-500/25 transition-all duration-200"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="block font-bold text-xs text-slate-850 dark:text-slate-200">
                          {item.label}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-sans font-light">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info line inside story board */}
        <div className="mt-6 pt-4 border-t border-slate-150/40 dark:border-slate-850/60 text-center">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-sans">
            Have questions? Feel free to visit our <button onClick={() => onViewChange('contact')} className="text-emerald-brand hover:underline font-bold">Contact View</button> anytime.
          </span>
        </div>
      </div>
    </div>
  );
}
