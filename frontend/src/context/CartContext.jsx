import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { STORAGE_KEYS } from '../utils/constants';
import { useAuth } from './AuthContext';
import { useConfirm } from './ConfirmContext';

const CartContext = createContext(null);
const INITIAL_CART = { restaurantId: null, restaurantName: '', items: [] };

try {
  localStorage.removeItem('campusbite_cart');
} catch {
  // Ignore legacy storage cleanup error
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const confirm = useConfirm();

  // Lazy load initial cart for current user
  const [cart, setCart] = useState(() => {
    if (!user?.id) return INITIAL_CART;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.CART_PREFIX}${user.id}`);
      return stored ? JSON.parse(stored) : INITIAL_CART;
    } catch {
      return INITIAL_CART;
    }
  });

  // Track user change during render: reset/load immediately without cascading renders
  const [prevUserId, setPrevUserId] = useState(user?.id);
  if (prevUserId !== user?.id) {
    setPrevUserId(user?.id);
    let userCart = INITIAL_CART;
    if (user?.id) {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEYS.CART_PREFIX}${user.id}`);
        if (stored) userCart = JSON.parse(stored);
      } catch {
        userCart = INITIAL_CART;
      }
    }
    setCart(userCart);
  }

  // Sync to localStorage only when user matches loaded user
  useEffect(() => {
    if (!user?.id || prevUserId !== user.id) return;
    const key = `${STORAGE_KEYS.CART_PREFIX}${user.id}`;
    try {
      if (cart.items.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(cart));
      }
    } catch {
      // Storage unavailable fallback
    }
  }, [cart, user?.id, prevUserId]);

  const notifyMaxQuantity = () => {
    toast('You can order up to 20 of one dish', { id: 'max-dish-quantity' });
  };

  const addItem = useCallback(
    async (dish, restaurant) => {
      const existing = cart.items.find((it) => it.menu_item_id === dish.id);
      if (existing && existing.quantity >= 20) {
        notifyMaxQuantity();
        return false;
      }

      if (cart.restaurantId && cart.restaurantId !== restaurant.id && cart.items.length > 0) {
        const ok = await confirm({
          title: 'Replace cart items?',
          message: `Your cart contains items from ${cart.restaurantName}. Would you like to clear it and add dishes from ${restaurant.name}?`,
          confirmText: 'Yes, replace cart',
          cancelText: 'Keep existing items',
          variant: 'danger',
        });
        if (!ok) return false;

        setCart({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          items: [{ menu_item_id: dish.id, name: dish.name, price: String(dish.price), quantity: 1 }],
        });
        return true;
      }

      setCart((prev) => {
        const idx = prev.items.findIndex((it) => it.menu_item_id === dish.id);
        if (idx > -1) {
          const nextItems = [...prev.items];
          nextItems[idx] = { ...nextItems[idx], quantity: Math.min(20, nextItems[idx].quantity + 1) };
          return { ...prev, items: nextItems };
        }
        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          items: [
            ...prev.items,
            { menu_item_id: dish.id, name: dish.name, price: String(dish.price), quantity: 1 },
          ],
        };
      });
      return true;
    },
    [cart, confirm]
  );

  const increase = useCallback(
    (menu_item_id) => {
      const existing = cart.items.find((it) => it.menu_item_id === menu_item_id);
      if (existing && existing.quantity >= 20) {
        notifyMaxQuantity();
        return;
      }
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.menu_item_id === menu_item_id ? { ...it, quantity: Math.min(20, it.quantity + 1) } : it
        ),
      }));
    },
    [cart.items]
  );

  const decrease = useCallback((menu_item_id) => {
    setCart((prev) => {
      const existing = prev.items.find((it) => it.menu_item_id === menu_item_id);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const remaining = prev.items.filter((it) => it.menu_item_id !== menu_item_id);
        return {
          restaurantId: remaining.length === 0 ? null : prev.restaurantId,
          restaurantName: remaining.length === 0 ? '' : prev.restaurantName,
          items: remaining,
        };
      }
      return {
        ...prev,
        items: prev.items.map((it) =>
          it.menu_item_id === menu_item_id ? { ...it, quantity: it.quantity - 1 } : it
        ),
      };
    });
  }, []);

  const removeItem = useCallback((menu_item_id) => {
    setCart((prev) => {
      const remaining = prev.items.filter((it) => it.menu_item_id !== menu_item_id);
      return {
        restaurantId: remaining.length === 0 ? null : prev.restaurantId,
        restaurantName: remaining.length === 0 ? '' : prev.restaurantName,
        items: remaining,
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart(INITIAL_CART);
    if (user?.id) {
      try {
        localStorage.removeItem(`${STORAGE_KEYS.CART_PREFIX}${user.id}`);
      } catch {
        // Fallback
      }
    }
  }, [user]);

  const getItemQuantity = useCallback(
    (menu_item_id) => {
      const it = cart.items.find((item) => item.menu_item_id === menu_item_id);
      return it ? it.quantity : 0;
    },
    [cart.items]
  );

  const totalItems = useMemo(
    () => cart.items.reduce((sum, it) => sum + it.quantity, 0),
    [cart.items]
  );

  const subtotal = useMemo(
    () => cart.items.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0),
    [cart.items]
  );

  const value = {
    cart,
    restaurantId: cart.restaurantId,
    restaurantName: cart.restaurantName,
    items: cart.items,
    totalItems,
    subtotal,
    addItem,
    increase,
    decrease,
    removeItem,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
