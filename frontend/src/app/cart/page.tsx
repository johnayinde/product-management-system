"use client";

import React from "react";
import Link from "next/link";
import { FiArrowRight, FiShoppingBag } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { useCart } from "@/context/CartContext";

const CartPage: React.FC = () => {
  const { items, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <MainLayout>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
        <Card>
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <FiShoppingBag className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Items ({items.length})
              </h2>
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>

            <div className="mt-6">
              <Link href="/products">
                <Button variant="outline" className="flex items-center">
                  <FiArrowRight className="mr-2 rotate-180" />
                  Continue Shopping
                </Button>{" "}
              </Link>
            </div>
          </Card>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
