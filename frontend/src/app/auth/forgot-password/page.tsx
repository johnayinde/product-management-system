"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import authService from "@/services/authService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setServerError("");
    setMessage("");

    try {
      const {
        data: { resetToken: token },
      } = await authService.forgetPassword(data.email);

      toast.success("Password Reset Request sent");
      router.push(`/auth/reset-password/${token}`);
    } catch (error: any) {
      toast.error("Password Reset not sent");
      setServerError(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        {serverError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />

          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Send
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
