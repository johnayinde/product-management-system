// pages/orders/payment-callback.tsx
"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import orderService from "@/services/orderService";

const PaymentCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await orderService.verifyPayment(`${reference}`);
        toast.success("Payment successful! Redirecting...");
        router.replace("/cart");
      } catch (error) {
        toast.error("Payment verification failed");
        router.replace("/cart");
      }
    };

    if (reference) {
      verifyPayment();
    }
  }, [reference]);

  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-medium">Verifying your payment...</h2>
    </div>
  );
};

export default PaymentCallback;
