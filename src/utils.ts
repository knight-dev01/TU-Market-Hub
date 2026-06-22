export const getRelativeTime = (timestamp: any): string => {
  if (!timestamp) return '';
  
  let date: Date;
  // Handle Firestore Timestamp object (both class instance and plain JSON object)
  if (typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
    date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return '';
  }

  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString();
};

export const calculateDiscount = (price: number, discountPercentage?: number | null) => {
  if (!discountPercentage || discountPercentage <= 0) {
    return {
      hasDiscount: false,
      originalPrice: price,
      discountedPrice: price,
      discountPercentage: 0
    };
  }

  // Ensure discount isn't > 100% or < 0%
  const validDiscount = Math.max(0, Math.min(100, discountPercentage));
  
  const discounted = Math.round(price - (price * validDiscount / 100));
  
  return {
    hasDiscount: validDiscount > 0,
    originalPrice: price,
    discountedPrice: Math.min(price, Math.max(0, discounted)),
    discountPercentage: validDiscount
  };
};
