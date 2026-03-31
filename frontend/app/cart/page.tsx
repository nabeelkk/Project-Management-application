"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data;
    },
    enabled: !!session,
  });

  const updateQuantity = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.put("/cart/update", { productId, quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => api.post("/cart/remove", { productId }),
    onSuccess: () => {
      toast.success("Item removed from cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
        <h2 className="text-2xl font-bold tracking-tight">Your Cart is Empty</h2>
        <p className="text-muted-foreground">You must log in to view and manage your cart.</p>
        <Link href="/login">
          <Button className="mt-4">Login to continue</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 pt-8">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="max-w-6xl mx-auto py-8 lg:py-12 animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed">
          <ShoppingBag className="w-16 h-16 text-muted-foreground opacity-30 mb-6" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
          <Link href="/products">
            <Button size="lg" className="rounded-full shadow-md font-bold group">
              Start Shopping <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item: any, index: number) => (
                <motion.div
                  key={item.product._id}
                  initial={{ opacity: 0, x: -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  transition={{ duration: 1.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow border-2 overflow-hidden rounded-2xl group">
                    <CardContent className="p-4 flex items-center gap-6">
                      <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden shrink-0 border relative">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <span className="flex items-center justify-center h-full text-xs text-muted-foreground">No img</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product._id}`} className="hover:underline hover:text-primary transition">
                          <h3 className="font-bold text-lg truncate mb-1">{item.product.name}</h3>
                        </Link>
                        <p className="text-xl font-extrabold text-primary mb-2">${Number(item.product.price).toFixed(2)}</p>
                      </div>

                      <div className="flex flex-col items-end justify-between h-full gap-4 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2"
                          onClick={() => removeItem.mutate(item.product._id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>

                        <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-lg border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-background"
                            onClick={() => updateQuantity.mutate({ productId: item.product._id, quantity: item.quantity - 1 })}
                            disabled={item.quantity <= 1 || updateQuantity.isPending}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-background"
                            onClick={() => updateQuantity.mutate({ productId: item.product._id, quantity: item.quantity + 1 })}
                            disabled={updateQuantity.isPending}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 rounded-2xl shadow-sm bg-card/50 backdrop-blur-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Tax (8%)</span>
                    <span className="text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-500">Free</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-center text-lg">
                    <span className="font-bold tracking-tight">Total</span>
                    <span className="font-extrabold text-primary text-2xl">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button className="w-full mt-8 h-14 text-base font-bold shadow-lg shadow-primary/20 group rounded-xl">
                  <CreditCard className="w-5 h-5 mr-3" /> Checkout
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-2 transition-all" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
