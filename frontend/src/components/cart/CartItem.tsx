"use client";

import React from "react";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import { CartItem as CartItemType } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateItem, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.stock) {
      return;
    }
    updateItem(item.productId, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.productId);
  };

  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{item.name}</h3>
            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            ${item.price.toFixed(2)} each
          </p>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Decrease quantity"
            >
              <FiMinus size={16} />
            </button>
            <span className="px-3 py-1 text-gray-800">{item.quantity}</span>
            <button
              //   disabled={item.quantity >= item.stock}
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              <FiPlus size={16} />
            </button>
          </div>

          <div className="flex">
            <button
              type="button"
              className="text-red-600 hover:text-red-800 flex items-center"
              onClick={handleRemove}
            >
              <FiTrash2 className="mr-1" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
