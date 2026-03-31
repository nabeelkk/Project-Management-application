"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, LogOut, Package, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function Header() {
  const { data: session } = useSession();

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data;
    },
    enabled: !!session,
  });

  const cartItemCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  return (
    <header className="border-b shadow-sm sticky top-0 bg-background z-50">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold flex items-center space-x-2">
          <Package className="w-6 h-6 text-primary" />
          <span className="hidden sm:inline">PInetFlow</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/products" className="text-sm font-medium hover:text-primary transition">
            Store
          </Link>
          {session ? (
            <>
              <Link href="/products/dashboard" className="text-sm font-medium hover:text-primary transition">
                Dashboard
              </Link>
              <Link href="/cart">
                <Button variant="outline" size="icon" className="relative group">
                  <ShoppingCart className="w-5 h-5 group-hover:text-primary transition" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Button variant="ghost" className="flex items-center space-x-2" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button className="flex items-center space-x-2">
                <UserCircle className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
