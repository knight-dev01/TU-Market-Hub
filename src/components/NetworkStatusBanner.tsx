import React from 'react';
import { WifiOff } from 'lucide-react';

interface NetworkStatusBannerProps {
  isOffline: boolean;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ isOffline }) => {
  return (
    <div className={`${isOffline ? 'h-auto opacity-100' : 'h-0 opacity-0'} transition-all duration-300 overflow-hidden bg-amber-100 text-amber-800 p-2 text-center text-xs font-medium flex items-center justify-center space-x-2 border-b border-amber-200`}>
      <WifiOff className="w-4 h-4" />
      <span>You are currently viewing offline/cached data.</span>
    </div>
  );
};
