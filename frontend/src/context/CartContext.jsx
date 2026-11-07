import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { useConfirm } from './ConfirmContext';

const CartContext = createContext(null);
const INITIAL_CART = { restaurantId: null, restaurantName: '', items: [] };

export function CartProvider({ children }) {
  const confirm = useConfirm();

  // Lazy initialization from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CART);
      return stored ? JSON.parse(stored) : INITIAL_CART;
    } catch {
      return INITIAL_CART;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      if (cart.items.length === 0) {
        localStorage.removeItem(STORAGE_KEYS.CART);
      } else {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      }
    } catch {
      // Storage unavailable fallback
    }
  }, [cart]);

  // Add item with single-restaurant cross-check
  const addItem = useCallback(
    async (dish, restaurant) => {
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
        const existingIdx = prev.items.findIndex((item) => item.menu_item_id === dish.id);
        let nextItems;

        if (existingIdx > -1) {
          nextItems = [...prev.items];
          const curQty = nextItems[existingIdx].quantity;
          if (curQty < 20) {
            nextItems[existingIdx] = { ...nextItems[existingIdx], quantity: curQty + 1 };
          }
        } else {
          nextItems = [
            ...prev.items,
            { menu_item_id: dish.id, name: dish.name, price: String(dish.price), quantity: 1 },
          ];
        }

        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          items: nextItems,
        };
      });
      return true;
    },
    [cart, confirm]
  );

  // Increase quantity (1-20)
  const increase = useCallback((menu_item_id) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.menu_item_id === menu_item_id && it.quantity < 20
          ? { ...it, quantity: it.quantity + 1 }
          : it
      ),
    }));
  }, []);

  // Decrease quantity or remove if reaching 0
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

  // Remove specific item directly
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

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart(INITIAL_CART);
    localStorage.removeItem(STORAGE_KEYS.CART);
  }, []);

  // Query item quantity
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
