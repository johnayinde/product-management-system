"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

const CartSummary: React.FC = () => {
  const { items, totalItems, totalAmount } = useCart();
  const router = useRouter();

  // Calculate shipping cost (free over $50)
  const shippingCost = totalAmount > 50 ? 0 : 10;

  // Calculate tax (10%)
  const taxAmount = totalAmount * 0.1;

  // Calculate final amount
  const finalAmount = totalAmount + shippingCost + taxAmount;

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <Card title="Cart Summary">
        <div className="text-center py-4">
          <p className="text-gray-500">Your cart is empty.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Cart Summary">
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Items ({totalItems})</span>
          <span className="text-gray-900 font-medium">
            ${totalAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900 font-medium">
            {shippingCost === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `$${shippingCost.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Tax (10%)</span>
          <span className="text-gray-900 font-medium">
            ${taxAmount.toFixed(2)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">${finalAmount.toFixed(2)}</span>
          </div>
        </div>

        <Button fullWidth onClick={handleCheckout}>
          Proceed to Checkout
        </Button>

        <div className="text-xs text-gray-500 mt-4">
          {totalAmount < 50 && (
            <p>
              Add ${(50 - totalAmount).toFixed(2)} more to get free shipping!
            </p>
          )}
          <p className="mt-1">
            Taxes and shipping calculated at checkout. Payment processed
            securely via Paystack.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CartSummary;
