"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiUpload, FiPlus, FiX, FiArrowLeft } from "react-icons/fi";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import productService, { CreateProductData } from "@/services/productService";
import Textarea from "@/components/common/Textarea";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity must be a non-negative number"),
  featured: z.boolean().optional(),
  images: z.array(z.instanceof(File)).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductForm: React.FC = () => {
  const router = useRouter();

  const [serverError, setServerError] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      featured: false,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setSelectedImages((prevImages) => [...prevImages, ...newFiles]);
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

      setValue("images", [...selectedImages, ...newFiles]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, index) => index !== indexToRemove)
    );
    setSelectedImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );

    setValue(
      "images",
      selectedImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setServerError("");

      const productData: CreateProductData = {
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        category: data.category,
        featured: data.featured || false,
      };

      let imageUrl: string | undefined;
      if (data.images && data.images.length > 0) {
        // Create form data for image upload
        const imageFormData = new FormData();
        data.images.forEach((image) => {
          imageFormData.append("images", image);
        });

        // Upload images and get the first image URL
        const uploadResponse = await productService.uploadProductImages(
          imageFormData
        );
        imageUrl = uploadResponse.imageUrls[0];
      }
      if (imageUrl) {
        productData.imageUrl = imageUrl;
      }
      const response = await productService.createProduct(productData);
      reset();
      setImagePreviews([]);
      setSelectedImages([]);

      toast.success("Product created successfully!");
    } catch (error: any) {
      toast.success("Failed to create product");
      setServerError(
        error.response?.data?.message ||
          "Failed to create product. Please try again."
      );
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Create New Product
          </h1>

          {serverError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Product Name"
                {...register("name")}
                error={errors.name?.message}
              />

              <Input
                label="Category"
                {...register("category")}
                error={errors.category?.message}
              />
            </div>

            <Textarea
              label="Description"
              placeholder="Enter product description..."
              {...register("description")}
              error={errors.description?.message}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Price"
                type="number"
                step="0.01"
                {...register("price")}
                error={errors.price?.message}
              />

              <Input
                label="Stock Quantity"
                type="number"
                {...register("quantity")}
                error={errors.quantity?.message}
              />
            </div>

            {/* Featured Product Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                {...register("featured")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="text-sm text-gray-700">
                Mark as Featured Product
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition"
                >
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div className="flex items-center">
                    <FiUpload className="mr-2" />
                    Upload Images
                  </div>
                </label>

                {/* Image Previews */}
                <div className="flex space-x-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              className="mt-6"
            >
              <FiPlus className="mr-2" /> Create Product
            </Button>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default ProductForm;
