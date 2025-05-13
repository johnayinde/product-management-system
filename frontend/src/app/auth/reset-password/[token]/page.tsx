"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import authService from "@/services/authService";
import toast from "react-hot-toast";
import MainLayout from "@/components/layout/MainLayout";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordData) => {
    setServerError("");
    try {
      await authService.resetPassword(token as string, data.password);

      toast.success("Password reset successful! Redirecting to login...");
      router.push("/auth/login");
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || "Token is invalid or expired."
      );
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        {serverError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="New Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />
          <Input
            label="Confirm Password"
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Reset Password
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default ResetPasswordPage;
