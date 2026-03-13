"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [wishlist, setWishlist] = useState([]);

  const refreshCart = async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  };

  const refreshWishlist = async () => {
    try {
      const data = await api.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshCart();
    refreshWishlist();
  }, []);

  return (
    <AppContext.Provider value={{ cart, refreshCart, wishlist, refreshWishlist }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);