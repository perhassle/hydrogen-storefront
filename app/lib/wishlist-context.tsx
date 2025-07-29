import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export interface WishlistItem {
  productId: string;
  productHandle: string;
  productTitle: string;
  productImage?: string;
  price?: {
    amount: string;
    currencyCode: string;
  };
  addedDate: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'addedDate'>) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const WISHLIST_STORAGE_KEY = 'hydrogen-wishlist';

export function WishlistProvider({children}: {children: ReactNode}) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(Array.isArray(parsed) ? parsed as WishlistItem[] : []);
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save wishlist to localStorage whenever items change (but only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save wishlist to localStorage:', error);
    }
  }, [items, isHydrated]);

  const addToWishlist = (item: Omit<WishlistItem, 'addedDate'>) => {
    const newItem: WishlistItem = {
      ...item,
      addedDate: new Date().toISOString(),
    };
    
    setItems((prev) => {
      // Check if item already exists
      if (prev.some((existing) => existing.productId === item.productId)) {
        return prev;
      }
      return [...prev, newItem];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const value: WishlistContextValue = {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    itemCount: items.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}