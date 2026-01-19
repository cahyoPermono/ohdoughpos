export interface Product {
    id: string;
    name: string;
    price: number;
    category?: string; // Optional/Nullable from DB
    image_url?: string;
}
  
export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
}
