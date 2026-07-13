import { Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  onViewChange: (view: 'home' | 'shop' | 'about' | 'contact' | 'admin') => void;
  whatsappNumber: string;
  contactEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  onInstallClick?: () => void;
}

export default function Footer({
  onViewChange,
  whatsappNumber,
  contactEmail,
  instagramUrl,
  facebookUrl,
  onInstallClick
}: FooterProps) {
  return (
    <footer id="app-footer" className="bg-[#111111] text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-brand flex items-center justify-center">
                <span className="text-white font-bold text-base font-display">TU</span>
              </div>
              <span className="font-display font-black text-lg tracking-wider text-white">
                TU <span className="text-emerald-brand">MARKET</span> HUB
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Trinity University's organized campus marketplace. Keeping hostel and department WhatsApp chats clean by hosting searchable peer listings in one permanent, searchable hub.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 hover:bg-emerald-brand rounded-full text-white transition-colors alive-blink">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 hover:bg-emerald-brand rounded-full text-white transition-colors alive-blink">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm tracking-widest uppercase mb-4">
              Explore Segments
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <button onClick={() => onViewChange('shop')} className="hover:text-emerald-brand transition-colors text-left cursor-pointer text-gray-400 hover:text-white">
                  Academics & Study Tools
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('shop')} className="hover:text-emerald-brand transition-colors text-left cursor-pointer text-gray-400 hover:text-white">
                  Hostel Essentials
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('shop')} className="hover:text-emerald-brand transition-colors text-left cursor-pointer text-gray-400 hover:text-white">
                  Electronics & Gadgets
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('shop')} className="hover:text-emerald-brand transition-colors text-left cursor-pointer text-gray-400 hover:text-white">
                  Campus Food & Snacks
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm tracking-widest uppercase mb-4">
              Community Hub
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <button onClick={() => onViewChange('home')} className="hover:text-emerald-brand transition-colors text-left cursor-pointer text-gray-400 hover:text-white">
                  Home Board
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('about')} className="hover:text-emerald-brand transition-colors text-left cursor-pointer text-gray-400 hover:text-white">
                  Our Story
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('contact')} className="hover:text-emerald-brand transition-colors text-left cursor-pointer text-gray-400 hover:text-white">
                  Safety & Support
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('admin')} className="hover:text-emerald-brand transition-colors text-left cursor-pointer text-gray-400 hover:text-white">
                  Seller Stall Console
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-white text-sm tracking-widest uppercase mb-4">
              Platform Support
            </h3>
            <ul className="space-y-3.5 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-emerald-brand mt-0.5 shrink-0" />
                <span className="leading-snug">
                  Trinity University City Campus, Off Alara Street, (Near Queens College) Yaba, Lagos.
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-emerald-brand shrink-0" />
                <span>greatifet12@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-emerald-brand shrink-0" />
                <span>{whatsappNumber}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Disclaimer Area */}
        <div className="mt-12 text-xs text-gray-500 font-light leading-relaxed max-w-4xl border-t border-gray-800 pt-8">
          <p className="mb-2"><strong className="text-gray-400 font-semibold">Disclaimer & Responsibility:</strong> This platform is provided strictly as a peer-to-peer connection board. We do not independently verify listings or process payments. All buying and selling must be done securely between students on campus. Please use this platform responsibly and exercise caution when making financial commitments.</p>
          <p>By using TU MARKET HUB, you agree to comply with our academic and community guidelines.</p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-xs text-gray-500 font-medium">
          <div>
            &copy; {new Date().getFullYear()} TU MARKET HUB. Built with ❤️ for the Trinity University student community.
          </div>
          <div className="flex space-x-5">
            {onInstallClick && (
              <>
                <button 
                  onClick={onInstallClick} 
                  className="text-emerald-brand hover:text-emerald-400 font-bold cursor-pointer flex items-center space-x-1 alive-blink"
                >
                  <span>📲 Install App</span>
                </button>
                <span>&bull;</span>
              </>
            )}
            <button onClick={() => onViewChange('admin')} className="hover:text-emerald-brand cursor-pointer alive-blink">
              Seller Console
            </button>
            <span>&bull;</span>
            <span>Zero Platform Commissions, Forever</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
