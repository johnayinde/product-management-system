"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import { Product } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import Button from "@/components/common/Button";
import sampleImg from "../../../public/images/product.png";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addItem(product, quantity);
      setIsAdding(false);
      setQuantity(1);
    }, 500);
  };

  const imageUrl =
    product.imageUrl && product.imageUrl.startsWith("http")
      ? product.imageUrl
      : sampleImg;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img
          src={imageUrl as string}
          alt={product.name}
          width={100}
          height={100}
          className="w-full h-full object-cover"
        />
        {product.featured && (
          <span className="absolute top-0 right-0 bg-yellow-500 text-white px-2 py-1 text-xs font-semibold">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <Link
            href={`/products/${product._id}`}
            className="hover:text-blue-600"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-600">
            {product.quantity > 0
              ? `${product.quantity} in stock`
              : "Out of stock"}
          </span>
        </div>
        <div className="mt-4">
          {product.quantity > 0 ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3 py-1">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.quantity, quantity + 1))
                  }
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                isLoading={isAdding}
                disabled={product.quantity === 0}
                className="flex items-center justify-center"
              >
                <FiShoppingCart className="mr-2" />
                Add to Cart
              </Button>
            </div>
          ) : (
            <Button variant="secondary" disabled>
              Out of Stock
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
