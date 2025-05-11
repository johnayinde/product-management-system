"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import LoginForm from "@/components/forms/LoginForm";
import Card from "@/components/common/Card";

const LoginPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-8">
        <Card>
          <LoginForm />
        </Card>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
