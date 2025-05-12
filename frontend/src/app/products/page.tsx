"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import ProductList from "@/components/products/ProductList";

const ProductsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
        <p className="text-gray-600 mt-2">
          Browse our collection of high-quality products.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Product grid */}
        <div className="md:col-span-3">
          <ProductList />
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductsPage;
