"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { FiSave, FiArrowLeft, FiUpload, FiX } from "react-icons/fi";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import productService, { CreateProductData } from "@/services/productService";
import Textarea from "@/components/common/Textarea";
import toast from "react-hot-toast";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  category: z.string().min(1),
  quantity: z.coerce.number().int().min(0),
  featured: z.boolean().optional(),
  images: z.array(z.instanceof(File)).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const EditProductPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [serverError, setServerError] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [, setSelectedImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      featured: false,
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const {
          data: { product: data },
        } = await productService.getProductById(productId);

        reset({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          quantity: data.quantity,
          featured: data.featured,
        });
        if (data.imageUrl) {
          setImagePreviews([data.imageUrl]);
        }
      } catch (err) {
        toast.error("Failed to fetch product details");
      }
    };
    fetchProduct();
  }, [productId, reset]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setSelectedImages([...newFiles]);
      setImagePreviews([...newPreviews]);
      setValue("images", newFiles);
    }
  };

  const removeImage = () => {
    setImagePreviews([]);
    setSelectedImages([]);
    setValue("images", []);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setServerError("");

      let imageUrl: string | undefined;
      if (data.images && data.images.length > 0) {
        const imageFormData = new FormData();
        data.images.forEach((image) => imageFormData.append("images", image));
        const uploadResponse = await productService.uploadProductImages(
          imageFormData
        );
        imageUrl = uploadResponse.imageUrls[0];
      }

      const updatedProduct: CreateProductData = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        quantity: data.quantity,
        featured: data.featured || false,
        imageUrl: imageUrl || undefined,
      };

      await productService.updateProduct(productId, updatedProduct);
      toast.success("Product updated successfully!");
      router.back();
    } catch (error: any) {
      toast.error("Failed to update product");
      setServerError(error?.response?.data?.message || "Something went wrong.");
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
          Back
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

          {serverError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                {...register("featured")}
                className="h-4 w-4"
              />
              <label htmlFor="featured">Mark as Featured</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition"
                >
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div className="flex items-center">
                    <FiUpload className="mr-2" />
                    Upload Image
                  </div>
                </label>

                <div className="flex mt-4 space-x-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        crossOrigin="anonymous"
                        src={preview}
                        alt={`Preview ${index}`}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage()}
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
              <FiSave className="mr-2" /> Save Changes
            </Button>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default EditProductPage;
