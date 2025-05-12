"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
} from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import productService from "@/services/productService";
import orderService from "@/services/orderService";

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderStats, setOrderStats] = useState<any>(null);
  const [productStats, setProductStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const orderResponse = await orderService.getOrderStats();
      setOrderStats(orderResponse.data);

      // Fetch product statistics
      const productResponse = await productService.getProductStats();
      setProductStats(productResponse.data);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary metrics
  const calculateSummary = () => {
    if (!orderStats || !productStats) return null;

    const totalOrders = orderStats.stats.reduce(
      (sum: number, stat: any) => sum + stat.count,
      0
    );

    const totalRevenue = orderStats.stats
      .filter((stat: any) => stat._id.paymentStatus === "paid")
      .reduce((sum: number, stat: any) => sum + stat.totalAmount, 0);

    const totalProducts = productStats.stats.reduce(
      (sum: number, stat: any) => sum + stat.numProducts,
      0
    );

    const lowStockProducts = productStats.stats.reduce(
      (sum: number, stat: any) => sum + (stat.numProductsLowStock || 0),
      0
    );

    return {
      totalOrders,
      totalRevenue,
      totalProducts,
      lowStockProducts,
    };
  };

  const summary = calculateSummary();

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <MainLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute adminOnly>
        <MainLayout>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <Card className="bg-blue-50 border-blue-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiPackage className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-blue-600">
                  Total Orders
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.totalOrders || 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Total Revenue */}
          <Card className="bg-green-50 border-green-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FiDollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-green-600">
                  Total Revenue
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  ${(summary?.totalRevenue || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Total Products */}
          <Card className="bg-purple-50 border-purple-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <FiShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-purple-600">
                  Total Products
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.totalProducts || 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Active Users */}
          <Card className="bg-yellow-50 border-yellow-100">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiUsers className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-yellow-600">
                  Low Stock Products
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.lowStockProducts || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions" className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/products/new">
              <Button fullWidth className="flex items-center justify-center">
                <FiShoppingBag className="mr-2" />
                Add New Product
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button
                fullWidth
                variant="secondary"
                className="flex items-center justify-center"
              >
                <FiShoppingBag className="mr-2" />
                Manage Products
              </Button>
            </Link>

            <Link href="/admin/orders">
              <Button
                fullWidth
                variant="outline"
                className="flex items-center justify-center"
              >
                <FiPackage className="mr-2" />
                View All Orders
              </Button>
            </Link>

            <Link href="/admin/users">
              <Button
                fullWidth
                variant="outline"
                className="flex items-center justify-center"
              >
                <FiPackage className="mr-2" />
                Manage Users
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Orders */}
        <Card title="Order Statistics" className="mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Count
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderStats &&
                  orderStats.stats.map((stat: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize">
                          {stat._id.status || "All"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            stat._id.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : stat._id.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {stat._id.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stat.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        ${stat.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
