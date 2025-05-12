"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/services/productService";
import ProductCard from "./ProductCard";
import productService from "@/services/productService";
import Button from "@/components/common/Button";

interface ProductListProps {
  initialProducts?: Product[];
  category?: string;
  featured?: boolean;
  searchQuery?: string;
}

const ProductList: React.FC<ProductListProps> = ({
  initialProducts,
  category,
  featured,
  searchQuery,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialProducts) {
      fetchProducts();
    }
  }, [category, featured, searchQuery, page, initialProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = { page, limit: 8 };

      if (category) params.category = category;
      if (featured !== undefined) params.featured = featured;
      if (searchQuery) params.search = searchQuery;

      const response = await productService.getAllProducts(params);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchProducts} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <nav className="flex items-center space-x-2">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              variant="secondary"
              size="sm"
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  variant={page === i + 1 ? "primary" : "outline"}
                  size="sm"
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              variant="secondary"
              size="sm"
            >
              Next
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProductList;
