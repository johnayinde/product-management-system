"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiPackage, FiClock, FiCheck, FiTruck, FiX } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import orderService, { Order } from "@/services/orderService";
import { useAuth } from "@/context/AuthContext";

const OrdersPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders(currentPage, 5);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to load orders");
      console.error("Error:", err);
    } finally {
      setLoading(false);
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

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId);
      fetchOrders();
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {isAdmin ? "All Orders" : "Your Orders"}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchOrders}>Try Again</Button>
            </div>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No orders found
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet.
              </p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id}>
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Order #{order._id.substring(order._id.length - 8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <span
                        className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1">
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Order items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Items
                    </h3>
                    <div className="space-y-2">
                      {order.products.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-gray-600 ml-2">
                              x{item.quantity}
                            </div>
                          </div>
                          <div className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order total */}
                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => handleViewOrder(order._id)}
                    >
                      View Details
                    </Button>
                    {(order.status === "pending" ||
                      order.status === "processing") && (
                      <Button
                        variant="danger"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="primary"
                        onClick={() => router.push(`/orders/${order._id}`)}
                      >
                        Manage Order
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </MainLayout>
    </ProtectedRoute>
  );
};

export default OrdersPage;
