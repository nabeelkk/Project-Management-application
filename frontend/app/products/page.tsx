"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Grid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/products/ProductGrid";
import ProductTable from "@/components/products/ProductTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<"grid" | "table">("grid");

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data;
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-xl border-2 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm">Manage and view your product inventory.</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex items-center space-x-1 border rounded-lg p-1 bg-muted/50">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
              className="rounded-md"
            >
              <Grid className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("table")}
              className="rounded-md"
            >
              <List className="w-4 h-4 mr-2" />
              Table
            </Button>
          </div>
          {session && (
            <Link href="/products/add">
              <Button size="sm" className="font-semibold shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : view === "grid" ? (
        <ProductGrid products={products || []} refetch={refetch} />
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <ProductTable products={products || []} refetch={refetch} />
        </div>
      )}
    </div>
  );
}
