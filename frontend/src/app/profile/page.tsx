"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/authService";

const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    passwordConfirm: z.string().min(8, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  });

type PasswordUpdateData = z.infer<typeof passwordUpdateSchema>;

const ProfilePage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordUpdateData>({
    resolver: zodResolver(passwordUpdateSchema),
  });

  const onSubmit = async (data: PasswordUpdateData) => {
    try {
      setIsUpdating(true);
      setServerError("");
      await authService.updatePassword(
        data.currentPassword,
        data.newPassword,
        data.passwordConfirm
      );
      toast.success("Password updated successfully");
      reset();
      await checkAuth();
    } catch (error: any) {
      setServerError(
        error.response?.data?.message ||
          "Failed to update password. Please try again."
      );
      toast.error("Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Information */}
          <div className="md:col-span-1">
            <Card title="Account Information">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Role</h3>
                  <p className="mt-1 text-gray-900 capitalize">{user?.role}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Account Status
                  </h3>
                  <p className="mt-1 text-green-600">Active</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Update Password */}
          <div className="md:col-span-2">
            <Card title="Change Password">
              {serverError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  {...register("currentPassword")}
                  error={errors.currentPassword?.message}
                />

                <Input
                  label="New Password"
                  type="password"
                  {...register("newPassword")}
                  error={errors.newPassword?.message}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  {...register("passwordConfirm")}
                  error={errors.passwordConfirm?.message}
                />

                <div className="pt-4">
                  <Button type="submit" isLoading={isUpdating}>
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default ProfilePage;
