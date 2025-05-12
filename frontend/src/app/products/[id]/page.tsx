"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { useCart } from "@/context/CartContext";
import productService, { Product } from "@/services/productService";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await productService.getProductById(id as string);
        setProduct(response.data.product);
      } catch (err) {
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  const handleAddToCart = () => {
    if (!product) return;

    setIsAdding(true);
    setTimeout(() => {
      addItem(product, quantity);
      setIsAdding(false);
    }, 500);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {error || "Product not found"}
            </h2>
            <Button onClick={handleGoBack}>Go Back</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <button
        onClick={handleGoBack}
        className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <Card>
            <div className="space-y-6">
              {product.featured && (
                <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
              )}

              <h1 className="text-3xl font-bold text-gray-800">
                {product.name}
              </h1>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span
                  className={`text-sm font-medium ${
                    product.quantity > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.quantity > 0
                    ? `${product.quantity} in stock`
                    : "Out of stock"}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quantity
                    </label>
                    <div className="flex items-center">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 border border-gray-300 rounded-l-md text-gray-600 hover:bg-gray-100"
                        disabled={product.quantity === 0}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-t border-b border-gray-300 text-center min-w-[60px]">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.quantity, quantity + 1))
                        }
                        className="px-3 py-1 border border-gray-300 rounded-r-md text-gray-600 hover:bg-gray-100"
                        disabled={
                          product.quantity === 0 || quantity >= product.quantity
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    isLoading={isAdding}
                    disabled={product.quantity === 0}
                    className="flex items-center justify-center"
                    fullWidth
                  >
                    <FiShoppingCart className="mr-2" />
                    {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
                <p>Category: {product.category}</p>
                <p>Added by: {product.createdBy.name}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
