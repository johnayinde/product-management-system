"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import ProductList from "@/components/products/ProductList";
import ProductFilter from "@/components/products/ProductFilter";

const ProductsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    // category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    featured: searchParams.get("featured") === "true",
  });

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
        <p className="text-gray-600 mt-2">
          Browse our collection of high-quality products.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar with filters */}
        <div className="md:col-span-1">
          <ProductFilter onFilter={handleFilter} initialFilters={filters} />
        </div>

        {/* Product grid */}
        <div className="md:col-span-3">
          <ProductList
            // category={filters.category}
            featured={filters.featured}
            searchQuery={filters.search}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductsPage;
