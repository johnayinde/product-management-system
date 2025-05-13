import api from "../lib/api";

export interface SignupData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  status: string;
  data: {
    token: string;
    user: User;
  };
}

const authService = {
  signup: async (userData: SignupData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/signup", userData);

    if (response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }

    return response.data;
  },

  login: async (userData: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", userData);

    if (response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }

    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    localStorage.removeItem("token");
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<AuthResponse>("/auth/me");
      return response.data.data.user;
    } catch (error) {
      return null;
    }
  },

  updatePassword: async (
    currentPassword: string,
    newPassword: string,
    passwordConfirm: string
  ) => {
    const response = await api.patch("/auth/update-password", {
      currentPassword,
      newPassword,
      passwordConfirm,
    });

    return response.data;
  },

  forgetPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.patch(`/auth/reset-password/${token}`, {
      password,
    });

    return response.data;
  },

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  },
};

export default authService;
