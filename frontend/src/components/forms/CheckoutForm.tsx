"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { useCart } from "@/context/CartContext";
import orderService from "@/services/orderService";

const checkoutSchema = z.object({
  street: z.string().min(3, "Please enter a valid street address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().min(2, "Please enter a valid state/province"),
  zipCode: z.string().min(3, "Please enter a valid postal code"),
  country: z.string().min(2, "Please enter a valid country"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const CheckoutForm: React.FC = () => {
  const { items, totalAmount, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "Nigeria",
    },
  });

  const shippingCost = totalAmount > 50 ? 0 : 10;
  const taxAmount = totalAmount * 0.1;
  const finalAmount = totalAmount + shippingCost + taxAmount;

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    setServerError("");

    try {
      const orderData = {
        products: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          totalPrice: finalAmount.toFixed(2),
        })),
        shippingAddress: data,
      };

      const response = await orderService.createOrder(orderData);

      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
        clearCart();
      } else {
        throw new Error("Payment URL not provided");
      }
    } catch (error: any) {
      setServerError(
        error.response?.data?.message ||
          "Failed to process your order. Please try again."
      );
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to your cart before checkout.
          </p>
          <Button onClick={() => router.push("/products")}>
            Continue Shopping
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <Card title="Shipping Information">
          {serverError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Street Address"
              {...register("street")}
              error={errors.street?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                {...register("city")}
                error={errors.city?.message}
              />

              <Input
                label="State/Province"
                {...register("state")}
                error={errors.state?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Postal/Zip Code"
                {...register("zipCode")}
                error={errors.zipCode?.message}
              />

              <Input
                label="Country"
                {...register("country")}
                error={errors.country?.message}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isProcessing}
              className="mt-6"
            >
              Proceed to Payment
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              By proceeding, you agree to our Terms of Service and Privacy
              Policy. Your payment will be processed securely via Paystack.
            </p>
          </form>
        </Card>
      </div>

      <div>
        <Card title="Order Summary">
          <div className="space-y-4">
            {/* Order Items */}
            <div className="border-b border-gray-200 pb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between py-2">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutForm;
