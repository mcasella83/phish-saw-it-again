import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ProductForm from "@/components/products/ProductForm";
import type { Product, InsertProduct } from "@shared/schema";
import { useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProduct() {
  const { id } = useParams();
  const productId = parseInt(id);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: () => 
      fetch(`/api/products/${productId}`, { credentials: "include" }).then(r => {
        if (!r.ok) throw new Error("Product not found");
        return r.json();
      }),
  });

  const handleSubmit = async (data: InsertProduct) => {
    await apiRequest("PUT", `/api/products/${productId}`, data);
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <ProductForm
        defaultValues={product}
        onSubmit={handleSubmit}
        submitText="Update Product"
      />
    </div>
  );
}
