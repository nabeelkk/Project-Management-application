"use client";

import { motion } from "framer-motion";
import { Eye, Edit, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProductGrid({ products, refetch }: { products: any[]; refetch: () => void }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const cartMutation = useMutation({
    mutationFn: (id: string) => api.post("/cart/add", { productId: id, quantity: 1 }),
    onSuccess: () => {
      toast.success("Added to cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => {
      toast.error("You need to login first");
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {products.map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -5 }}
        >
          <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-colors shadow-sm group">
            <div className="relative aspect-video bg-muted overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/60">
                  No Image
                </div>
              )}
              <div className="absolute top-2 right-2 bg-background/90 text-foreground px-2 py-1 rounded-md text-sm font-bold shadow-sm backdrop-blur-md">
                ${product.price}
              </div>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                {product.description}
              </p>
              <div className="flex items-center justify-between gap-2 mt-auto">
                <Button
                  size="sm"
                  className="flex-1 font-semibold"
                  onClick={() => cartMutation.mutate(product._id)}
                  disabled={cartMutation.isPending}
                >
                  {cartMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                  Buy
                </Button>
                {session && (
                  <div className="flex space-x-1">
                    <Link href={`/products/${product._id}`}>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/products/edit/${product._id}`}>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => deleteMutation.mutate(product._id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
