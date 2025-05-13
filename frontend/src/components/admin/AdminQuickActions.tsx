"use client";

import React from "react";
import Link from "next/link";
import { FiShoppingBag, FiPackage } from "react-icons/fi";
import Button from "../common/Button";
import Card from "../common/Card";

const AdminQuickActions: React.FC = () => {
  return (
    <Card title="Quick Actions" className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/admin/products/new">
          <Button fullWidth className="flex items-center justify-center">
            <FiShoppingBag className="mr-2" />
            Add New Product
          </Button>
        </Link>
        <Link href="/admin/products">
          <Button
            fullWidth
            variant="secondary"
            className="flex items-center justify-center"
          >
            <FiShoppingBag className="mr-2" />
            Manage Products
          </Button>
        </Link>

        <Link href="/orders">
          <Button
            fullWidth
            variant="outline"
            className="flex items-center justify-center"
          >
            <FiPackage className="mr-2" />
            View All Orders
          </Button>
        </Link>
      </div>
    </Card>
  );
};
export default AdminQuickActions;
