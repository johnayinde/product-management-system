"use client";

import React from "react";
import Link from "next/link";
import { FiShoppingBag, FiUser, FiTruck, FiCreditCard } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white rounded-lg overflow-hidden mb-12">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold mb-4">
              Manage Your Inventory with Ease
            </h1>
            <p className="text-xl mb-8">
              Streamlined product management, simplified ordering, and secure
              payments all in one place.
            </p>
            <div className="flex space-x-4">
              <Button as={Link} href="/products" size="lg">
                Browse Products
              </Button>
              <Button
                as={Link}
                href="/auth/signup"
                variant="outline"
                size="lg"
                className="bg-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <svg
            width="400"
            height="400"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#FFFFFF"
              d="M38.4,-66.2C51.2,-60.1,64.1,-52.3,71.7,-40.3C79.3,-28.2,81.6,-12,79.1,2.9C76.6,17.7,69.3,31.3,60.1,43.8C50.9,56.4,39.8,68,26.2,74.2C12.7,80.5,-3.3,81.4,-18.7,77.8C-34.1,74.2,-48.9,65.9,-57.9,53.5C-66.9,41,-70.1,24.3,-71.2,8.3C-72.3,-7.8,-71.3,-23.1,-65.2,-36.8C-59.1,-50.4,-47.9,-62.3,-35,-67.7C-22,-73.1,-7.4,-72,3.9,-78.4C15.2,-84.7,25.7,-72.3,38.4,-66.2Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <Card className="text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <FiShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">
                Browse through our extensive catalog of quality products.
              </p>
            </div>
          </Card>

          {/* Feature 2 */}
          <Card className="text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <FiUser className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">User-Friendly</h3>
              <p className="text-gray-600">
                Easy navigation and a smooth shopping experience.
              </p>
            </div>
          </Card>

          {/* Feature 3 */}
          <Card className="text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <FiTruck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick processing and efficient shipping of your orders.
              </p>
            </div>
          </Card>

          {/* Feature 4 */}
          <Card className="text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <FiCreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Safe and reliable payment processing via Paystack.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/products" className="text-blue-600 hover:text-blue-800">
            View all products →
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 rounded-lg p-8 text-center mb-16">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Create an account today and experience the simplicity of our inventory
          management system.
        </p>
        <Button as={Link} href="/auth/signup" size="lg">
          Sign Up Now
        </Button>
      </section>
    </MainLayout>
  );
};

export default HomePage;
