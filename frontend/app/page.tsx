import Link from "next/link";
import { ArrowRight, PackageOpen, LayoutGrid, Database, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 py-12">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          Supercharge Your Product Management
        </h1>
        <p className="text-xl text-muted-foreground">
          A full-stack, enterprise-ready application to manage products, categories, media, and your entire cart flow. Designed for speed, aesthetics, and reliability.
        </p>
        <div className="flex justify-center items-center space-x-4">
          <Link href="/products">
            <Button size="lg" className="h-14 px-8 text-lg font-bold group">
              Browse Store
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-5xl mt-12">
        <div className="flex flex-col items-center p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md transition">
          <Database className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-lg font-bold">Performant DB</h3>
          <p className="text-sm text-muted-foreground text-center">Robust MongoDB integration with Express backend.</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md transition">
          <LayoutGrid className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-lg font-bold">Dynamic UI</h3>
          <p className="text-sm text-muted-foreground text-center">Stunning grid and table layouts using Framer Motion and ShadCN.</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md transition">
          <Cloud className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-lg font-bold">Cloudflare R2</h3>
          <p className="text-sm text-muted-foreground text-center">Fast and secure object storage directly to CDN edge.</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md transition">
          <PackageOpen className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-lg font-bold">Cart Flow</h3>
          <p className="text-sm text-muted-foreground text-center">Complete user cart state handling with React Query.</p>
        </div>
      </div>
    </div>
  );
}
