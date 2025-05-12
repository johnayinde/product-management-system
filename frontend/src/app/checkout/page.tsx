"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import CheckoutForm from "@/components/forms/CheckoutForm";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const CheckoutPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const { items } = useCart();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login?redirect=/checkout");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      <CheckoutForm />
    </MainLayout>
  );
};

export default CheckoutPage;
