import api from "../lib/api";

// Define types
export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  products: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "paystack" | "card" | "bank_transfer";
  paymentDetails: {
    transactionId?: string;
    paymentDate?: string;
    authorizationUrl?: string;
    reference?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  status: string;
  data: {
    orders: Order[];
    results: number;
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface OrderResponse {
  status: string;
  data: {
    order: Order;
  };
}

export interface CreateOrderData {
  products: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
}

export interface PaymentResponse {
  status: string;
  data: {
    order: Order;
    paymentUrl: string;
  };
}

const orderService = {
  getAllOrders: async (page = 1, limit = 10) => {
    const response = await api.get<OrdersResponse>("/orders", {
      params: { page, limit },
    });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id: string) => {
    const response = await api.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: CreateOrderData) => {
    const response = await api.post<PaymentResponse>("/orders", orderData);
    return response.data;
  },

  cancelOrder: async (id: string) => {
    const response = await api.post<OrderResponse>(`/orders/${id}/cancel`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: Order["status"]) => {
    const response = await api.patch<OrderResponse>(`/orders/${id}/status`, {
      status,
    });
    return response.data;
  },

  getOrderStats: async () => {
    const response = await api.get("/orders/stats/all");
    return response.data;
  },

  // Verify payment (after redirect from payment gateway)
  verifyPayment: async (reference: string) => {
    const response = await api.get<OrderResponse>(
      `/orders/verify-payment?reference=${reference}`
    );
    return response.data;
  },
};

export default orderService;
