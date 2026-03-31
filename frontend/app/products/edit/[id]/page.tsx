"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, X, ImageIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  name: z.string().min(3),
  price: z.preprocess((val) => Number(val), z.number().min(0.01)),
  description: z.string().min(10),
});

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: product.price,
        description: product.description,
      });
      setExistingImages(product.images || []);
      setExistingVideos(product.videos || []);
    }
  }, [product, reset]);

  const removeMedia = (url: string, type: "image" | "video") => {
    if (type === "image") setExistingImages((prev) => prev.filter((u) => u !== url));
    else setExistingVideos((prev) => prev.filter((u) => u !== url));
  };

  const onSubmit = async (data: any) => {
    if (existingImages.length < 3) {
      toast.error("A product must have at least 3 images.");
      return;
    }
    
    setIsSaving(true);
    try {
      await api.put(`/products/${id}`, {
        ...data,
        images: existingImages,
        videos: existingVideos,
      });
      
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push(`/products/${id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to edit product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground text-sm">Update the details and media of your product.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-2 shadow-sm rounded-xl">
          <CardHeader className="bg-muted/30 border-b">
             <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} className="focus:ring-2" />
                {errors.name && <span className="text-xs text-destructive">{errors.name.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" step="0.01" {...register("price")} className="focus:ring-2" />
                {errors.price && <span className="text-xs text-destructive">{errors.price.message as string}</span>}
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} className="min-h-[120px] focus:ring-2" />
                {errors.description && <span className="text-xs text-destructive">{errors.description.message as string}</span>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm rounded-xl">
          <CardHeader className="bg-muted/30 border-b">
             <CardTitle>Existing Media Management</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <Label className="flex items-center text-lg font-semibold"><ImageIcon className="w-5 h-5 mr-2 text-primary" />Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                <AnimatePresence>
                  {existingImages.map((url, i) => (
                    <motion.div key={url} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                      <img src={url} alt="img" className="w-full h-full object-cover" />
                      <Button variant="destructive" size="icon" type="button" className="absolute top-1 right-1 h-6 w-6 rounded-full" onClick={() => removeMedia(url, "image")}>
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center text-lg font-semibold"><Film className="w-5 h-5 mr-2 text-secondary" />Videos</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AnimatePresence>
                  {existingVideos.map((url, i) => (
                    <motion.div key={url} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative aspect-video rounded-lg overflow-hidden border bg-black">
                      <video src={url} className="w-full h-full object-cover opacity-60" controls />
                     <Button variant="destructive" size="icon" type="button" className="absolute top-1 right-1 h-6 w-6 rounded-full z-10" onClick={() => removeMedia(url, "video")}>
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving || existingImages.length < 3} className="w-48 h-12 text-lg font-bold shadow-lg">
             {isSaving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving</> : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
