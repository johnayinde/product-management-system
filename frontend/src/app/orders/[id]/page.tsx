"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiClock,
  FiPackage,
  FiTruck,
  FiCheck,
  FiX,
} from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import orderService, { Order } from "@/services/orderService";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id as string);
      setOrder(response.data.order);
    } catch (err) {
      setError("Failed to load order details");
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleCancelOrder = async () => {
    try {
      setCancelLoading(true);
      await orderService.cancelOrder(id as string);
      fetchOrderDetails(); // Refresh order details
    } catch (err) {
      console.error("Error cancelling order:", err);
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <FiClock className="text-yellow-500" />;
      case "processing":
        return <FiPackage className="text-blue-500" />;
      case "shipped":
        return <FiTruck className="text-purple-500" />;
      case "delivered":
        return <FiCheck className="text-green-500" />;
      case "cancelled":
        return <FiX className="text-red-500" />;
      default:
        return <FiClock className="text-yellow-500" />;
    }
  };

  const getStatusClass = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (error || !order) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <FiArrowLeft className="mr-2" />
            Back to Orders
          </button>
          <Card>
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error || "Order not found"}</p>
              <Button onClick={handleGoBack}>Go Back</Button>
            </div>
          </Card>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Order #{order._id.substring(order._id.length - 8)}
          </h1>
          <p className="text-gray-600">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Status */}
          <div className="md:col-span-3">
            <Card>
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-2">
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    Payment:{" "}
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                </div>

                {(order.status === "pending" ||
                  order.status === "processing") && (
                  <Button
                    variant="danger"
                    onClick={handleCancelOrder}
                    isLoading={cancelLoading}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Order Details */}
          <div className="md:col-span-2">
            <Card title="Order Items">
              <div className="space-y-4">
                {order.products.map((item) => (
                  <div
                    key={item.product}
                    className="flex justify-between items-center border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start">
                      <div className="ml-4">
                        <h3 className="text-base font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-base font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Shipping and Payment Info */}
          <div className="md:col-span-1">
            <div className="space-y-6">
              <Card title="Shipping Address">
                <address className="not-italic text-gray-700">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </address>
              </Card>

              <Card title="Payment Details">
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Method:</span>{" "}
                    {order.paymentMethod.replace("_", " ").toUpperCase()}
                  </p>
                  {order.paymentDetails?.transactionId && (
                    <p>
                      <span className="font-medium">Transaction ID:</span>{" "}
                      {order.paymentDetails.transactionId}
                    </p>
                  )}
                  {order.paymentDetails?.paymentDate && (
                    <p>
                      <span className="font-medium">Payment Date:</span>{" "}
                      {formatDate(order.paymentDetails.paymentDate)}
                    </p>
                  )}
                  {order.paymentDetails?.reference && (
                    <p>
                      <span className="font-medium">Reference:</span>{" "}
                      {order.paymentDetails.reference}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default OrderDetailPage;
