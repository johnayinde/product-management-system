"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import SignupForm from "@/components/forms/SignupForm";
import Card from "@/components/common/Card";

const SignupPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-8">
        <Card>
          <SignupForm />
        </Card>
      </div>
    </MainLayout>
  );
};

export default SignupPage;
