import { apiRequest, queryClient } from "@/lib/queryClient";
import ProductForm from "@/components/products/ProductForm";
import type { InsertProduct } from "@shared/schema";

export default function CreateProduct() {
  const handleSubmit = async (data: InsertProduct) => {
    await apiRequest("POST", "/api/products", data);
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create Product</h1>
      <ProductForm onSubmit={handleSubmit} submitText="Create Product" />
    </div>
  );
}
