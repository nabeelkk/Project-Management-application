"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeMedia, setActiveMedia] = useState<{ type: "image" | "video"; url: string } | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const cartMutation = useMutation({
    mutationFn: () => api.post("/cart/add", { productId: id, quantity: 1 }),
    onSuccess: () => {
      toast.success("Added to cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => {
      toast.error("You need to login first");
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <Skeleton className="h-[500px] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  const handleMediaClick = (url: string, type: "image" | "video") => setActiveMedia({ url, type });

  const allMedia = [
    ...(product.images || []).map((url: string) => ({ type: "image" as const, url })),
    ...(product.videos || []).map((url: string) => ({ type: "video" as const, url })),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-8 duration-700">
      <Button variant="ghost" className="mb-6 -ml-4" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> back to products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <motion.div layoutId={`product-image-${product._id}`} className="aspect-square bg-muted rounded-3xl overflow-hidden border-2 shadow-sm relative group flex items-center justify-center">
            {activeMedia ? (
              activeMedia.type === "image" ? (
                <img src={activeMedia.url} alt="Main Media" className="w-full h-full object-cover" />
              ) : (
                <video src={activeMedia.url} controls autoPlay className="w-full h-full object-cover bg-black" />
              )
            ) : product.images?.[0] ? (
              <img src={product.images[0]} alt="Main Media" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">No Media</div>
            )}
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {allMedia.map((media, i) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={i}
                onClick={() => handleMediaClick(media.url, media.type)}
                className={`relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeMedia?.url === media.url ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border"}`}
              >
                {media.type === "image" ? (
                  <img src={media.url} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <video src={media.url} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <Badge variant="secondary" className="w-max mb-4">New Arrival</Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
            {product.name}
          </h1>
          <div className="text-3xl font-bold text-primary mb-8">${Number(product.price).toFixed(2)}</div>
          
          <div className="prose prose-sm sm:prose-base dark:prose-invert text-muted-foreground mb-10 leading-relaxed max-w-none break-words">
            {product.description}
          </div>

          <div className="mt-auto pt-8 border-t space-y-4">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95"
              onClick={() => cartMutation.mutate()}
              disabled={cartMutation.isPending}
            >
              {cartMutation.isPending ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <ShoppingCart className="w-5 h-5 mr-3" />}
              {cartMutation.isPending ? "Adding..." : "Add to Cart"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">Free shipping on orders over $50</p>
          </div>
        </div>
      </div>
    </div>
  );
}
