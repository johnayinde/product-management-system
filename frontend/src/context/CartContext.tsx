"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import toast from "react-hot-toast";
import { Product } from "../services/productService";
import { useAuth } from "./AuthContext";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (product: Product, quantity: number) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  totalAmount: 0,
  addItem: () => {},
  updateItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Calculate totals whenever cart items change
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  useEffect(() => {
    console.log(user);

    const savedCart = localStorage.getItem(`cart_${user?.id}`);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error(error);
      }
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`cart_${user?.id}`, JSON.stringify(items));
  }, [items, user]);

  // Add item to cart
  const addItem = (product: Product, quantity: number) => {
    let message = "";
    let shouldToast = false;

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === product._id
      );

      if (existingItemIndex >= 0) {
        const existingItem = prevItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.quantity) {
          message = `Only ${product.quantity} items in stock`;
          return prevItems;
        }

        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity = newQuantity;
        message = `Updated quantity for ${product.name}`;
        shouldToast = true;
        return updatedItems;
      } else {
        if (quantity > product.quantity) {
          message = `Only ${product.quantity} items in stock`;
          return prevItems;
        }

        message = `Added ${product.name} to cart`;
        shouldToast = true;
        return [
          ...prevItems,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity,
            imageUrl: product.imageUrl,
            stock: product.quantity,
          },
        ];
      }
    });

    if (shouldToast && message) {
      toast.success(message);
    } else if (message) {
      toast.error(message);
    }
  };

  // Update item quantity
  const updateItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (productId: string) => {
    let removedItemName = "";

    setItems((prevItems) => {
      const itemToRemove = prevItems.find(
        (item) => item.productId === productId
      );
      if (itemToRemove) removedItemName = itemToRemove.name;

      return prevItems.filter((item) => item.productId !== productId);
    });

    if (removedItemName) toast.success(`Removed ${removedItemName} from cart`);
  };

  const clearCart = () => {
    setItems([]);
    toast.success("Cart cleared");
  };

  const value = {
    items,
    totalItems,
    totalAmount,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
