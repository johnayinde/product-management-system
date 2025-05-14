"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import authService, {
  User,
  LoginData,
  SignupData,
} from "../services/authService";
import { useCart } from "./CartContext";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { clearCart } = useCart();
  const pathname = usePathname();

  const publicPaths = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password/",
  ];

  const isPublicPage =
    publicPaths.includes(pathname || "") ||
    pathname?.startsWith("/auth/reset-password") ||
    pathname?.startsWith("/products");

  // Check if user is authenticated
  const checkAuth = async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      setUser(response.data.user);
      toast.success("Login successful!");
      router.push("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    try {
      const response = await authService.signup(data);
      setUser(response.data.user);
      toast.success("Registration successful!");
      router.push("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      clearCart();
      await authService.logout();
      setUser(null);
      router.push("/auth/login");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (isPublicPage) {
      setLoading(false);
      return;
    }

    checkAuth();
  }, [pathname]);

  // Memoized value to avoid unnecessary re-renders
  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loading,
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
