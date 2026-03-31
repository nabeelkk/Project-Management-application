"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Package, DollarSign, TrendingUp, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/products/ProductTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: session } = useSession();

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data;
    },
  });

  const totalProducts = products?.length || 0;
  const totalValue =
    products?.reduce((acc: number, p: any) => acc + parseFloat(p.price || 0), 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-2xl border-2 shadow-sm">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your product inventory and metrics.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {session && (
            <Link href="/products/add">
              <Button size="lg" className="font-semibold shadow-md">
                <Plus className="w-5 h-5 mr-2" />
                Add New Product
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl border-2 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <h3 className="text-3xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : totalProducts}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-6 rounded-2xl border-2 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-blue-500/10 rounded-full">
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
            <h3 className="text-3xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : `$${totalValue.toFixed(2)}`}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-6 rounded-2xl border-2 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-green-500/10 rounded-full">
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Status</p>
            <h3 className="text-3xl font-bold">Live</h3>
          </div>
        </div>
      </div>

      <div className="bg-card border-2 rounded-2xl overflow-hidden shadow-sm p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Recent Products</h2>
          <p className="text-sm text-muted-foreground">Manage your latest inventory additions.</p>
        </div>
        {isLoading ? (
          <div className="space-y-4">
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ProductTable products={products || []} refetch={refetch} />
        )}
      </div>
    </div>
  );
}
