"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";

interface ProductFilterProps {
  onFilter: (filters: FilterParams) => void;
  initialFilters?: FilterParams;
}

interface FilterParams {
  search?: string;
  // category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  onFilter,
  initialFilters = {},
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterParams>({
    search: searchParams.get("search") || initialFilters.search || "",
    // category: searchParams.get("category") || initialFilters.category || "",
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : initialFilters.minPrice,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : initialFilters.maxPrice,
    featured:
      searchParams.get("featured") === "true" ||
      initialFilters.featured ||
      false,
  });

  useEffect(() => {
    onFilter(filters);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFilters((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);

    // Update URL with filters for shareable links
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, String(value));
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, "", newUrl);
  };

  const handleClear = () => {
    const clearedFilters = {
      search: "",
      // category: "",
      minPrice: undefined,
      maxPrice: undefined,
      featured: false,
    };

    setFilters(clearedFilters);
    onFilter(clearedFilters);

    router.push(window.location.pathname);
  };

  return (
    <Card title="Filter Products">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Search"
          name="search"
          value={filters.search}
          onChange={handleInputChange}
          placeholder="Search products..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Min Price"
            name="minPrice"
            type="number"
            min="0"
            value={filters.minPrice?.toString() || ""}
            onChange={handleInputChange}
            placeholder="Min"
          />

          <Input
            label="Max Price"
            name="maxPrice"
            type="number"
            min="0"
            value={filters.maxPrice?.toString() || ""}
            onChange={handleInputChange}
            placeholder="Max"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={filters.featured}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="featured"
            className="ml-2 block text-sm text-gray-700"
          >
            Featured Products Only
          </label>
        </div>

        <div className="flex space-x-2">
          <Button type="submit" fullWidth>
            Apply Filters
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClear}
            fullWidth
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProductFilter;
