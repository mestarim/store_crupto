import React, { createContext, useContext, useState } from 'react';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

const initialProducts = [
  { id: 1, title: 'USDT (Tether)', price: 101.50, image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'Crypto', type: 'crypto', options: [ { label: '100 USDT', price: 101.50 }, { label: '500 USDT', price: 505.00 }, { label: '1000 USDT', price: 1008.00 } ] },
  { id: 2, title: 'PUBG Mobile UC', price: 9.99, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'Games', type: 'game', options: [ { label: '60 UC', price: 0.99 }, { label: '325 UC', price: 4.99 }, { label: '660 UC', price: 9.99 }, { label: '1800 UC', price: 24.99 } ] },
  { id: 3, title: 'PlayStation Store', price: 49.00, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'Cards', type: 'gift', options: [ { label: '$10', price: 9.90 }, { label: '$20', price: 19.50 }, { label: '$50', price: 49.00 } ] },
  { id: 4, title: 'Bitcoin (BTC)', price: 650.00, image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'Crypto', type: 'crypto' },
  { id: 5, title: 'Free Fire Diamonds', price: 10.50, image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'Games', type: 'game', options: [ { label: '100 Diamonds', price: 1.00 }, { label: '1080 Diamonds', price: 10.50 } ] },
  { id: 6, title: 'iTunes Gift Card', price: 24.50, image: 'https://images.unsplash.com/photo-1620189507195-68309c04c4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'Cards', type: 'gift', options: [ { label: '$10', price: 9.99 }, { label: '$25', price: 24.50 }, { label: '$50', price: 49.00 } ] },
];

const mockOrders = [
  { id: '#ORD-001', customer: 'أحمد محمد', date: '2026-08-13', total: 101.50, status: 'completed' },
  { id: '#ORD-002', customer: 'سارة خالد', date: '2026-08-13', total: 24.99, status: 'pending' },
];

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(mockOrders);

  const addToCart = (product, quantity = 1, selectedOption = null) => {
    setCart((prevCart) => {
      // Create a unique id for the cart item based on product and selected option
      const cartItemId = selectedOption ? `${product.id}-${selectedOption.label}` : `${product.id}`;
      const existingItem = prevCart.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        return prevCart.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const price = selectedOption ? selectedOption.price : product.price;
      const title = selectedOption ? `${product.title} - ${selectedOption.label}` : product.title;

      return [...prevCart, { ...product, cartItemId, title, price, quantity }];
    });
  };

  const updateCartQuantity = (cartItemId, amount) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = item.quantity + amount;
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      });
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const addOrder = (orderData) => {
    const newOrder = {
      id: `#ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      ...orderData
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <StoreContext.Provider value={{
      products,
      setProducts,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      orders,
      addOrder
    }}>
      {children}
    </StoreContext.Provider>
  );
}
