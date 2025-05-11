"use client";

import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Inventory App
              </h3>
              <p className="text-gray-600 mb-4">
                The ultimate solution for managing your product inventory,
                orders, and payments.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-blue-600">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/signup"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Us
              </h3>
              <ul className="space-y-2">
                <li className="text-gray-600">
                  <span className="font-medium">Email:</span>{" "}
                  support@inventoryapp.com
                </li>
                <li className="text-gray-600">
                  <span className="font-medium">Phone:</span> +23480808088
                </li>
                <li className="text-gray-600">
                  <span className="font-medium">Address:</span> 123 ABC St,
                  LAgos
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              &copy; {currentYear} Inventory App. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
