import api from "../lib/api";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
  featured: boolean;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  status: string;
  data: {
    products: Product[];
    results: number;
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ProductResponse {
  status: string;
  data: {
    product: Product;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
  featured?: boolean;
}

const productService = {
  getAllProducts: async (
    params: ProductQueryParams = {}
  ): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>("/products", { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>(`/products/${id}`);
    return response.data;
  },

  // Create new product => admin only
  createProduct: async (
    productData: CreateProductData
  ): Promise<ProductResponse> => {
    const response = await api.post<ProductResponse>("/products", productData);
    return response.data;
  },

  // Update product => admin only
  updateProduct: async (
    id: string,
    productData: Partial<CreateProductData>
  ): Promise<ProductResponse> => {
    const response = await api.patch<ProductResponse>(
      `/products/${id}`,
      productData
    );
    return response.data;
  },

  // Delete product => admin only
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Check product stock
  checkProductStock: async (productId: string, quantity: number) => {
    const response = await api.post("/products/check-stock", {
      productId,
      quantity,
    });
    return response.data;
  },

  // Get product statistics => admin only
  getProductStats: async () => {
    const response = await api.get("/products/stats/categories");
    return response.data;
  },

  uploadProductImages: async (formData: FormData) => {
    const response = await api.post("/products/upload-images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },
};

export default productService;
