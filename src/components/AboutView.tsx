import { ShieldCheck, MessageSquareOff, Users, ArrowUpRight, CheckCircle, Smartphone } from 'lucide-react';

export default function AboutView() {
  const narrativePillars = [
    {
      title: 'Eliminating Chat Chaos',
      desc: 'No more spamming chaotic, unorganized screenshots across countless hostel WhatsApp groups where listings get buried in seconds. We replace group chat noise with a beautifully structured marketplace.',
      icon: MessageSquareOff,
      color: 'text-rose-500 bg-rose-500/10'
    },
    {
      title: 'Outsider & Student Integration',
      desc: 'Perfectly tailored to support both on-campus student vendors and external buyers (outsiders) looking to safely purchase high-value campus items under secure meetup conditions.',
      icon: Users,
      color: 'text-sky-500 bg-sky-500/10'
    },
    {
      title: 'Zero Commissions & Fee-Free',
      desc: 'We are a non-profit campus utility. There are zero transaction fees, middleman cuts, or listing costs. Trade freely and directly with the seller.',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-500/10'
    }
  ];

  return (
    <div id="about-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
      
      {/* Narrative Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-emerald-brand font-mono font-bold text-xs uppercase tracking-[0.25em] block">
          THE VISION BEHIND TU MARKET HUB
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-brand dark:text-white leading-tight">
          Decluttering Campus Commerce, One Sale at a Time.
        </h1>
        <p className="text-sm sm:text-base text-slate-brand/60 dark:text-slate-400 font-light leading-relaxed">
          How we turned a traditional peer-to-peer commerce concept into Trinity University's organized student marketplace—eliminating chaotic WhatsApp group spam and introducing secure, unified campus listings.
        </p>
        <div className="w-16 h-1 bg-emerald-brand mx-auto rounded-sm mt-4 animate-pulse" />
      </section>

      {/* Core Concept Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <span>The WhatsApp Problem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-brand dark:text-white">
            Relieving Students of the Chat Burden
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-slate-brand/70 dark:text-slate-300 leading-relaxed font-sans">
            <p>
              In hostels and learning plazas, students constantly sell previous semester items, unused electronics, and appliances. Until now, the only way to advertise was by spamming WhatsApp group chats, uploading hundreds of un-searchable screenshots, and annoying group members.
            </p>
            <p>
              This created absolute <strong>Chat Chaos</strong>. Listings were lost within minutes, image qualities were compressed, and pricing negotiations were repetitive and messy.
            </p>
            <p>
              <strong>TU Market Hub</strong> was designed to replace this mess. By establishing a central, persistent, searchable index of available campus listings, students keep their group chats clean while reaching both on-campus residents and external off-campus buyers with direct, structured, one-click WhatsApp checkouts.
            </p>
          </div>
        </div>

        <div className="relative h-96 rounded-3xl overflow-hidden border border-gray-150 dark:border-slate-800 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"
            alt="Students on campus study desk"
            className="w-full h-full object-cover object-center filter saturate-[0.85]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-emerald-brand/5 mix-blend-overlay" />
          {/* Overlay card */}
          <div className="absolute bottom-5 left-5 right-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-slate-850 p-4 rounded-2xl shadow-xl flex items-center justify-between select-none">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Core Mission</span>
              <span className="text-xs font-bold text-slate-800 dark:text-white">Eliminate WhatsApp group spam & chat clutter</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* The Pillars of Decluttering */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-brand dark:text-white">
            Our Peer Trading Pillars
          </h2>
          <p className="text-xs sm:text-sm text-slate-brand/60 dark:text-slate-400 font-medium">
            How we redefine peer-to-peer campus trade for the modern student.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {narrativePillars.map((pillar, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 border border-gray-150 dark:border-slate-800/80 p-8 rounded-3xl text-center space-y-4 shadow-3xs transition-transform hover:scale-[1.01]">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${pillar.color}`}>
                <pillar.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg text-slate-brand dark:text-slate-100">
                {pillar.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-brand/60 dark:text-slate-400 leading-relaxed font-sans font-medium">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Structured Solution vs WhatsApp Groups */}
      <section className="bg-slate-550/5 dark:bg-slate-900/40 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-brand dark:text-white">
            Structured Commerce vs. Chat Chaos
          </h3>
          <p className="text-xs sm:text-sm text-slate-brand/70 dark:text-slate-400 leading-relaxed font-sans">
            Traditional WhatsApp groups compress images, fragment catalogs, limit visibility, and inundate users with alerts. TU Market Hub provides dedicated web space with categorized, searchable listings, pricing transparency, condition grades, and seamless customized checkout links.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20">
              Structured Listings
            </span>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20">
              External Buyer Ready
            </span>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20">
              No Group Spam
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            HOW IT WORKS AT A GLANCE
          </span>
          <div className="space-y-3.5">
            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Student lists item with accurate pricing, specifications, and images on the Hub.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Buyer (Student or Off-Campus Outsider) filters, finds, and previews the item.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Clicking checkout opens a fully pre-filled, editable order draft direct to the vendor's WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
