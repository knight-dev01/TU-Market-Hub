import { Heart, Compass, Target, ShieldCheck } from 'lucide-react';

export default function AboutView() {
  const values = [
    {
      title: 'Peer Trust & Verifiability',
      desc: 'All student vendors undergo educational profile verification. We promote designated, secure campus physical meetups to inspect items before exchanging funds.',
      icon: ShieldCheck
    },
    {
      title: 'Active Deal Protocol',
      desc: 'Inspired by student life optimization. We are pioneers in enabling direct sales, making it simple to trade matching values.',
      icon: Compass
    },
    {
      title: 'Zero Commissions',
      desc: 'Built specifically as a student utility. Every listing, contact, chat connection, and trade is free of third-party transaction tolls and service charges.',
      icon: Heart
    }
  ];

  return (
    <div id="about-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
      
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-emerald-brand font-mono font-bold text-xs uppercase tracking-[0.25em] block">
          THE VISION BEHIND TU MARKET HUB
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-brand">
          Unifying Campus Commerce & Value Exchange
        </h1>
        <p className="text-sm sm:text-base text-slate-brand/60 font-light leading-relaxed">
          How we turned a traditional e-commerce template into Nigeria's premiere peer-to-peer student marketplace. Connecting buyers and sellers with zero commission fees.
        </p>
        <div className="w-16 h-1 bg-emerald-brand mx-auto rounded-sm mt-4" />
      </section>

      {/* Story Column */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-brand">
            Our Campus Story
          </h2>
          <div className="space-y-4 text-sm text-slate-brand/70 leading-relaxed font-sans">
            <p>
              In hostels and learning plazas, students constantly find themselves in possession of previous semester gadgets, unused electronics, and extra room appliances. Meanwhile, incoming freshmen struggle to find affordable essentials.
            </p>
            <p>
              We realized that the easiest way to solve this was not a monolithic shop owned by one entity, but an open, decentralized marketplace where **any authenticated student** can instantly set up their own digital stall.
            </p>
            <p>
              By combining instant Google OAuth sign-in, peer-to-peer WhatsApp chat linking, custom exchange categories, and clean physical campus plaza meetups, we created **TU Market Hub**. It is secure, responsive, tailored to student pocket budgets, and entirely student-owned.
            </p>
          </div>
        </div>
        <div className="relative h-96 rounded-3xl overflow-hidden border border-gray-150 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"
            alt="Students on campus study desk"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-emerald-brand/5 mix-blend-overlay" />
        </div>
      </section>

      {/* Mission & Vision Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-brand text-white p-8 sm:p-12 rounded-3xl space-y-4 select-none shadow-md">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-display font-bold text-2xl">
            Our Mission Statement
          </h3>
          <p className="text-sm text-emerald-100 font-light leading-relaxed">
            To foster a thriving campus circular economy by delivering a polished, zero-friction peer exchange applet. We empower student vendors to list their utility listings, study guides, or services, and trade matching value safely and commission-free.
          </p>
        </div>

        <div className="bg-slate-brand text-white p-8 sm:p-12 rounded-3xl space-y-4 select-none shadow-md">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-display font-bold text-2xl">
            Our Vision Statement
          </h3>
          <p className="text-sm text-gray-300 font-light leading-relaxed">
            To be recognized as Nigeria’s most secure, innovative, and popular student-focused platform, uniting high interface craft standards with standard decentralized local trading guidelines.
          </p>
        </div>
      </section>

      {/* Brand Values */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-brand">
            Our Peer Trading Values
          </h2>
          <p className="text-xs sm:text-sm text-slate-brand/60 font-medium">
            The values guiding every peer exchange we facilitate online.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 border border-gray-150 dark:border-slate-800 p-8 rounded-2xl text-center space-y-4 shadow-3xs">
              <div className="w-12 h-12 bg-emerald-brand/10 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <v.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg text-slate-brand dark:text-slate-100">
                {v.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-brand/60 dark:text-slate-400 leading-relaxed font-sans font-medium">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
