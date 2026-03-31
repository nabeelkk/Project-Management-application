"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, UploadCloud, X, Film, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(3, "Name is required (min 3 chars)"),
  price: z.preprocess((val) => Number(val), z.number().min(0.01, "Price must be greater than 0")),
  description: z.string().min(10, "Description is required (min 10 chars)"),
});

export default function AddProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideos((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const uploadToR2 = async (file: File) => {
    const { data } = await api.get(`/products/upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`);
    await fetch(data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    return data.publicUrl;
  };

  const onSubmit = async (data: any) => {
    if (images.length < 3) {
      toast.error("Please select at least 3 images.");
      return;
    }
    setIsUploading(true);
    try {
      const imageUrls = await Promise.all(images.map((img) => uploadToR2(img)));
      const videoUrls = await Promise.all(videos.map((vid) => uploadToR2(vid)));

      await api.post("/products", {
        ...data,
        images: imageUrls,
        videos: videoUrls,
      });

      toast.success("Product created successfully!");
      router.push("/products");
    } catch (error: any) {
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Add New Product</h1>
        <p className="text-muted-foreground text-sm">Create a new product with rich media.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-2 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" placeholder="Awesome Gadget" {...register("name")} className="focus:ring-2 transition-all" />
                {errors.name && <span className="text-xs text-destructive">{errors.name.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" step="0.01" placeholder="99.99" {...register("price")} className="focus:ring-2 transition-all" />
                {errors.price && <span className="text-xs text-destructive">{errors.price.message as string}</span>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="A brief description of this awesome gadget..." {...register("description")} className="min-h-[120px] focus:ring-2 transition-all" />
              {errors.description && <span className="text-xs text-destructive">{errors.description.message as string}</span>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle>Media Upload</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <Label className="flex items-center text-lg font-semibold">
                <ImageIcon className="w-5 h-5 mr-2 text-primary" />
                Images (Min 3 required)
              </Label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition cursor-pointer relative group bg-card">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Click or drag images here</p>
                </div>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  <AnimatePresence>
                    {images.map((img, i) => (
                      <motion.div key={`${img.name}-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                        <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 rounded-full" onClick={() => setImages(images.filter((_, index) => index !== i))}>
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className="flex items-center text-lg font-semibold">
                <Film className="w-5 h-5 mr-2 text-primary" />
                Videos (Optional)
              </Label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition cursor-pointer relative group bg-card">
                <input type="file" multiple accept="video/*" onChange={handleVideoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-secondary/10 rounded-full group-hover:bg-secondary/20 transition">
                    <Film className="w-8 h-8 text-secondary" />
                  </div>
                  <p className="text-sm font-medium">Click or drag videos here</p>
                </div>
              </div>
              {videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {videos.map((vid, i) => (
                      <motion.div key={`${vid.name}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} className="relative rounded-lg overflow-hidden border bg-black aspect-video flex items-center justify-center">
                        <video src={URL.createObjectURL(vid)} className="w-full h-full object-cover opacity-60" controls />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 rounded-full z-20" onClick={() => setVideos(videos.filter((_, index) => index !== i))}>
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={isUploading} className="w-32">
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading || images.length < 3} className="w-48 font-bold">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
